export type Role = 'patient' | 'driver' | 'hospital' | 'admin';

export type EmergencyStatus = 'pending' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
export type AmbulanceStatus = 'available' | 'busy' | 'offline';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  location: LatLng;
  phone: string;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  ventilatorsTotal: number;
  ventilatorsAvailable: number;
  rating: number;
  distance: string;
  eta: string;
  estimatedCost: string;
  specialties: string[];
  isAIRecommended?: boolean;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  status: AmbulanceStatus;
  location: LatLng;
  speed: number;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientBloodGroup: string;
  patientPhone: string;
  location: LatLng;
  address: string;
  emergencyType: string;
  symptoms: string[];
  severity: Severity;
  status: EmergencyStatus;
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  createdAt: string;
  eta?: string;
  notes?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  phone: string;
  email: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  emergencyContacts: { name: string; relationship: string; phone: string }[];
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleNumber: string;
  licenseNumber: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  earningsToday: number;
  earningsWeek: number;
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'AIIMS Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    location: { lat: 28.5672, lng: 77.2100 },
    phone: '+91-11-26588500',
    totalBeds: 250,
    availableBeds: 42,
    icuTotal: 40,
    icuAvailable: 8,
    ventilatorsTotal: 20,
    ventilatorsAvailable: 5,
    rating: 4.8,
    distance: '2.3 km',
    eta: '7 min',
    estimatedCost: '₹2,500 – ₹8,000',
    specialties: ['Cardiology', 'Neurology', 'Trauma', 'Burns'],
    isAIRecommended: true,
  },
  {
    id: 'h2',
    name: 'Safdarjung Hospital',
    address: 'Ansari Nagar West, New Delhi',
    location: { lat: 28.5680, lng: 77.2050 },
    phone: '+91-11-26163574',
    totalBeds: 300,
    availableBeds: 61,
    icuTotal: 50,
    icuAvailable: 12,
    ventilatorsTotal: 25,
    ventilatorsAvailable: 6,
    rating: 4.5,
    distance: '3.1 km',
    eta: '10 min',
    estimatedCost: '₹1,500 – ₹6,000',
    specialties: ['General Medicine', 'Orthopaedics', 'Gynaecology'],
  },
  {
    id: 'h3',
    name: 'Apollo Hospital',
    address: 'Mathura Road, Sarita Vihar, New Delhi',
    location: { lat: 28.5364, lng: 77.2827 },
    phone: '+91-11-71791090',
    totalBeds: 180,
    availableBeds: 28,
    icuTotal: 35,
    icuAvailable: 4,
    ventilatorsTotal: 15,
    ventilatorsAvailable: 2,
    rating: 4.7,
    distance: '5.8 km',
    eta: '18 min',
    estimatedCost: '₹8,000 – ₹25,000',
    specialties: ['Cardiac Surgery', 'Oncology', 'Transplant'],
  },
  {
    id: 'h4',
    name: 'RML Hospital',
    address: 'Park Street, Connaught Place, New Delhi',
    location: { lat: 28.6289, lng: 77.2065 },
    phone: '+91-11-23365525',
    totalBeds: 200,
    availableBeds: 55,
    icuTotal: 30,
    icuAvailable: 9,
    ventilatorsTotal: 18,
    ventilatorsAvailable: 7,
    rating: 4.3,
    distance: '4.2 km',
    eta: '13 min',
    estimatedCost: '₹800 – ₹3,500',
    specialties: ['Emergency Medicine', 'Paediatrics', 'General Surgery'],
  },
];

export const AMBULANCES: Ambulance[] = [
  { id: 'a1', vehicleNumber: 'DL-01-AA-1234', driverId: 'd1', driverName: 'Rajesh Kumar', driverPhone: '+91-98765-43210', driverRating: 4.8, status: 'busy', location: { lat: 28.5560, lng: 77.2100 }, speed: 60 },
  { id: 'a2', vehicleNumber: 'DL-02-BB-5678', driverId: 'd2', driverName: 'Suresh Sharma', driverPhone: '+91-98765-43211', driverRating: 4.6, status: 'available', location: { lat: 28.5700, lng: 77.1900 }, speed: 0 },
  { id: 'a3', vehicleNumber: 'DL-03-CC-9012', driverId: 'd3', driverName: 'Amit Singh', driverPhone: '+91-98765-43212', driverRating: 4.9, status: 'available', location: { lat: 28.5800, lng: 77.2200 }, speed: 0 },
  { id: 'a4', vehicleNumber: 'DL-04-DD-3456', driverId: 'd4', driverName: 'Priya Patel', driverPhone: '+91-98765-43213', driverRating: 4.7, status: 'busy', location: { lat: 28.5450, lng: 77.1980 }, speed: 55 },
  { id: 'a5', vehicleNumber: 'DL-05-EE-7890', driverId: 'd5', driverName: 'Vikas Gupta', driverPhone: '+91-98765-43214', driverRating: 4.5, status: 'offline', location: { lat: 28.5900, lng: 77.2400 }, speed: 0 },
  { id: 'a6', vehicleNumber: 'DL-06-FF-2345', driverId: 'd6', driverName: 'Neha Verma', driverPhone: '+91-98765-43215', driverRating: 4.8, status: 'available', location: { lat: 28.5620, lng: 77.1850 }, speed: 0 },
];

export const EMERGENCY_REQUESTS: EmergencyRequest[] = [
  {
    id: 'e1', patientId: 'p1', patientName: 'Arjun Mehta', patientAge: 58, patientBloodGroup: 'O+', patientPhone: '+91-98765-11111',
    location: { lat: 28.5530, lng: 77.2050 }, address: '14, Green Park, New Delhi',
    emergencyType: 'Cardiac Arrest', symptoms: ['Chest Pain', 'Shortness of Breath', 'Sweating'],
    severity: 'critical', status: 'en_route', assignedAmbulanceId: 'a1', assignedHospitalId: 'h1',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(), eta: '4 min',
  },
  {
    id: 'e2', patientId: 'p2', patientName: 'Sunita Rao', patientAge: 34, patientBloodGroup: 'B+', patientPhone: '+91-98765-22222',
    location: { lat: 28.5750, lng: 77.2180 }, address: '7, Lajpat Nagar, New Delhi',
    emergencyType: 'Road Accident', symptoms: ['Head Injury', 'Bleeding', 'Loss of Consciousness'],
    severity: 'high', status: 'pending', createdAt: new Date(Date.now() - 2 * 60000).toISOString(), eta: '8 min',
  },
  {
    id: 'e3', patientId: 'p3', patientName: 'Rohit Jain', patientAge: 72, patientBloodGroup: 'A-', patientPhone: '+91-98765-33333',
    location: { lat: 28.5480, lng: 77.1950 }, address: '23, Hauz Khas, New Delhi',
    emergencyType: 'Stroke', symptoms: ['Sudden Numbness', 'Confusion', 'Difficulty Speaking'],
    severity: 'critical', status: 'dispatched', assignedAmbulanceId: 'a4', assignedHospitalId: 'h2',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), eta: '6 min',
  },
  {
    id: 'e4', patientId: 'p4', patientName: 'Kavita Sharma', patientAge: 28, patientBloodGroup: 'AB+', patientPhone: '+91-98765-44444',
    location: { lat: 28.5600, lng: 77.2300 }, address: '45, Defence Colony, New Delhi',
    emergencyType: 'Burns', symptoms: ['Severe Burns', 'Pain', 'Blistering'],
    severity: 'high', status: 'completed', assignedAmbulanceId: 'a2', assignedHospitalId: 'h3',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'e5', patientId: 'p5', patientName: 'Deepak Agarwal', patientAge: 45, patientBloodGroup: 'O-', patientPhone: '+91-98765-55555',
    location: { lat: 28.5660, lng: 77.2080 }, address: '8, Safdarjung Enclave, New Delhi',
    emergencyType: 'Breathing Difficulty', symptoms: ['Wheezing', 'Cyanosis', 'Rapid Breathing'],
    severity: 'medium', status: 'pending', createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
];

export const PATIENT_PROFILE: PatientProfile = {
  id: 'p1',
  name: 'Arjun Mehta',
  age: 32,
  bloodGroup: 'O+',
  phone: '+91-98765-11111',
  email: 'arjun.mehta@email.com',
  allergies: ['Penicillin', 'Sulfa drugs', 'Latex'],
  chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
  medications: ['Metformin 500mg', 'Amlodipine 5mg', 'Atorvastatin 20mg'],
  emergencyContacts: [
    { name: 'Priya Mehta', relationship: 'Spouse', phone: '+91-98765-66666' },
    { name: 'Ramesh Mehta', relationship: 'Father', phone: '+91-98765-77777' },
  ],
};

export const DRIVERS: Driver[] = [
  { id: 'd1', name: 'Rajesh Kumar', phone: '+91-98765-43210', email: 'rajesh@mediroute.in', vehicleNumber: 'DL-01-AA-1234', licenseNumber: 'DL0420110012345', rating: 4.8, totalTrips: 1247, isOnline: true, earningsToday: 1850, earningsWeek: 11200 },
];

export const SYMPTOMS = [
  'Chest Pain', 'Shortness of Breath', 'Sweating', 'Dizziness', 'Nausea',
  'Head Injury', 'Bleeding', 'Loss of Consciousness', 'Seizure', 'Stroke Symptoms',
  'Sudden Numbness', 'Confusion', 'Difficulty Speaking', 'Burns', 'Fracture',
  'Wheezing', 'High Fever', 'Severe Abdominal Pain', 'Allergic Reaction', 'Poisoning',
];

export const EMERGENCY_TYPES = [
  { label: 'Cardiac Arrest', icon: '❤️', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Road Accident', icon: '🚗', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Stroke', icon: '🧠', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Burns', icon: '🔥', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Breathing Difficulty', icon: '🫁', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Trauma/Fall', icon: '🦴', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { label: 'Poisoning', icon: '☠️', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Allergic Reaction', icon: '🤧', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'Pregnancy Emergency', icon: '🤱', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: 'Other', icon: '🏥', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const ANALYTICS_DATA = {
  emergencyTrends: [
    { month: 'Jan', total: 145, cardiac: 34, trauma: 45, stroke: 22, other: 44 },
    { month: 'Feb', total: 132, cardiac: 28, trauma: 41, stroke: 19, other: 44 },
    { month: 'Mar', total: 168, cardiac: 42, trauma: 52, stroke: 28, other: 46 },
    { month: 'Apr', total: 155, cardiac: 38, trauma: 48, stroke: 25, other: 44 },
    { month: 'May', total: 178, cardiac: 45, trauma: 56, stroke: 31, other: 46 },
    { month: 'Jun', total: 191, cardiac: 49, trauma: 61, stroke: 33, other: 48 },
  ],
  responseTime: [
    { range: '0-5 min', count: 28 }, { range: '5-10 min', count: 67 },
    { range: '10-15 min', count: 45 }, { range: '15-20 min', count: 23 },
    { range: '20+ min', count: 8 },
  ],
  bedOccupancy: [
    { day: 'Mon', general: 78, icu: 82, ventilators: 65 },
    { day: 'Tue', general: 81, icu: 79, ventilators: 70 },
    { day: 'Wed', general: 75, icu: 85, ventilators: 68 },
    { day: 'Thu', general: 83, icu: 88, ventilators: 72 },
    { day: 'Fri', general: 86, icu: 91, ventilators: 78 },
    { day: 'Sat', general: 79, icu: 84, ventilators: 71 },
    { day: 'Sun', general: 74, icu: 80, ventilators: 66 },
  ],
};
