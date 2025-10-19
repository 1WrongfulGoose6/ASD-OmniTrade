#!/usr/bin/env node
// scripts/build-db-url.js
// Builds a properly URL-encoded PostgreSQL connection string

const user = process.env.AZURE_POSTGRESQL_USER;
const password = process.env.AZURE_POSTGRESQL_PASSWORD;
const host = process.env.AZURE_POSTGRESQL_HOST;
const port = process.env.AZURE_POSTGRESQL_PORT || '5432';
const database = process.env.AZURE_POSTGRESQL_DATABASE;

if (!user || !password || !host || !database) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// URL encode the password to handle special characters
const encodedPassword = encodeURIComponent(password);

// Build the connection string with proper encoding and timeouts
const connectionString = `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}?sslmode=require&connect_timeout=30&pool_timeout=30`;

console.log(connectionString);
