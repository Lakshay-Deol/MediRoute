import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mediroute-jwt-secret-key-2025';

app.use(cors());
app.use(express.json());

// Extend express Request type
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Generate JWT token
function signToken(user: { id: string; email: string; name: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Auth Middleware
async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token: User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// --- Health Check ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const validRoles = ['patient', 'driver', 'hospital', 'admin'];
    const assignedRole = validRoles.includes(role) ? role : 'patient';
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signToken(user);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const token = signToken(userProfile);
    return res.json({
      message: 'Login successful',
      token,
      user: userProfile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Current User profile (verify token)
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// --- Emergency Request APIs ---

// Create emergency request
app.post('/api/emergencies', async (req: Request, res: Response) => {
  try {
    const {
      patientName,
      patientAge,
      patientBloodGroup,
      patientPhone,
      emergencyType,
      symptoms,
      severity,
      lat,
      lng,
      address,
      assignedHospitalId,
      assignedAmbulanceId,
    } = req.body;

    const emergency = await prisma.emergencyRequest.create({
      data: {
        patientName: patientName || 'Anonymous Patient',
        patientAge: Number(patientAge) || 30,
        patientBloodGroup: patientBloodGroup || 'O+',
        patientPhone: patientPhone || '9876543210',
        emergencyType: emergencyType || 'Cardiac Arrest',
        symptoms: typeof symptoms === 'string' ? symptoms : JSON.stringify(symptoms || []),
        severity: severity || 'critical',
        lat: Number(lat) || 28.6139,
        lng: Number(lng) || 77.209,
        address: address || 'New Delhi, India',
        assignedHospitalId: assignedHospitalId || null,
        assignedAmbulanceId: assignedAmbulanceId || null,
        status: 'pending',
      },
      include: {
        hospital: true,
        ambulance: true,
      },
    });

    io.emit('emergency:new', emergency);
    res.status(201).json(emergency);
  } catch (err: any) {
    console.error('Emergency creation error:', err);
    res.status(500).json({ error: 'Failed to create emergency request' });
  }
});

// List emergencies
app.get('/api/emergencies', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter = status ? { status: String(status) } : {};
    const emergencies = await prisma.emergencyRequest.findMany({
      where: filter,
      include: { hospital: true, ambulance: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(emergencies);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch emergencies' });
  }
});

// Update emergency status
app.patch('/api/emergencies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedHospitalId, assignedAmbulanceId } = req.body;

    const updated = await prisma.emergencyRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedHospitalId && { assignedHospitalId }),
        ...(assignedAmbulanceId && { assignedAmbulanceId }),
      },
      include: { hospital: true, ambulance: true },
    });

    io.emit('emergency:updated', updated);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update emergency' });
  }
});

// Hospitals list
app.get('/api/hospitals', async (_req: Request, res: Response) => {
  try {
    const hospitals = await prisma.hospital.findMany();
    res.json(hospitals);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Ambulances fleet
app.get('/api/ambulances', async (_req: Request, res: Response) => {
  try {
    const ambulances = await prisma.ambulance.findMany();
    res.json(ambulances);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch ambulances' });
  }
});

// Socket.io real-time communication
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('driver:location', (data) => {
    io.emit('driver:location:update', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Database Seed Function
async function seedInitialData() {
  try {
    // 1. Seed Default Real Users
    const defaultUsers = [
      { name: 'Arjun Mehta', email: 'patient@mediroute.in', password: 'Password123!', role: 'patient' },
      { name: 'Rajesh Kumar', email: 'driver@mediroute.in', password: 'Password123!', role: 'driver' },
      { name: 'AIIMS Delhi Control', email: 'hospital@mediroute.in', password: 'Password123!', role: 'hospital' },
      { name: 'System Administrator', email: 'admin@mediroute.in', password: 'Password123!', role: 'admin' },
    ];

    for (const u of defaultUsers) {
      const exists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            password: hashedPassword,
            role: u.role,
          },
        });
        console.log(`[Seed] Created default user: ${u.email} (${u.role})`);
      }
    }

    // 2. Seed Initial Hospitals if empty
    const hospitalCount = await prisma.hospital.count();
    if (hospitalCount === 0) {
      await prisma.hospital.createMany({
        data: [
          { name: 'AIIMS New Delhi', address: 'Ansari Nagar, New Delhi', lat: 28.5672, lng: 77.2100, totalBeds: 120, availableBeds: 34, icuTotal: 25, icuAvailable: 7, rating: 4.9 },
          { name: 'Safdarjung Hospital', address: 'Ring Road, New Delhi', lat: 28.5714, lng: 77.2081, totalBeds: 90, availableBeds: 18, icuTotal: 15, icuAvailable: 3, rating: 4.5 },
          { name: 'Max Super Speciality Hospital', address: 'Saket, New Delhi', lat: 28.5273, lng: 77.2140, totalBeds: 70, availableBeds: 22, icuTotal: 12, icuAvailable: 5, rating: 4.8 },
          { name: 'Fortis Escorts Heart Institute', address: 'Okhla Road, New Delhi', lat: 28.5606, lng: 77.2831, totalBeds: 80, availableBeds: 15, icuTotal: 20, icuAvailable: 4, rating: 4.7 },
        ],
      });
      console.log('[Seed] Seeded default hospitals');
    }

    // 3. Seed Initial Ambulances if empty
    const ambulanceCount = await prisma.ambulance.count();
    if (ambulanceCount === 0) {
      await prisma.ambulance.createMany({
        data: [
          { vehicleNumber: 'DL-01-AB-1234', driverName: 'Rajesh Kumar', driverPhone: '+91 98765 43210', status: 'available', lat: 28.6140, lng: 77.2090, speed: 45, rating: 4.8 },
          { vehicleNumber: 'DL-02-CD-5678', driverName: 'Vikram Singh', driverPhone: '+91 98765 43211', status: 'available', lat: 28.5700, lng: 77.2150, speed: 30, rating: 4.6 },
          { vehicleNumber: 'DL-03-EF-9012', driverName: 'Amit Sharma', driverPhone: '+91 98765 43212', status: 'available', lat: 28.5300, lng: 77.2200, speed: 0, rating: 4.9 },
        ],
      });
      console.log('[Seed] Seeded default ambulances');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Start Server
server.listen(PORT, async () => {
  console.log(`🚑 MediRoute Server running on http://localhost:${PORT}`);
  await seedInitialData();
});
