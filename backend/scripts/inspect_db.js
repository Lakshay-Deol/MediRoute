const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showUsers() {
  const users = await prisma.user.findMany();
  console.log('\n=== REAL USERS IN SQLITE DATABASE (backend/dev.db) ===');
  console.table(users.map(u => ({
    name: u.name,
    email: u.email,
    role: u.role,
    bcrypt_password_hash: u.password.slice(0, 25) + '...',
    createdAt: u.createdAt.toISOString()
  })));
  process.exit(0);
}

showUsers().catch(console.error);
