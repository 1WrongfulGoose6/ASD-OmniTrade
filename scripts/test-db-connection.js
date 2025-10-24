// Test script to validate PostgreSQL connection

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    
    // Test database info
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL version:', result[0]?.version);
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    if (error.code === 'P1001') {
      console.error('Check your DATABASE_URL and network connectivity');
    } else if (error.code === 'P1017') {
      console.error('Server has closed the connection. Check your connection string.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
