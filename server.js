#!/usr/bin/env node
// Author: Ali Bonagdaran
/**
 * Production server for Azure App Service
 * Ensures proper port and host binding for container environments
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '8080', 10);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

console.log(`Starting Next.js server...`);
console.log(`Environment: ${dev ? 'development' : 'production'}`);
console.log(`Port: ${port}`);
console.log(`Hostname: ${hostname}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Server ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
    });
});
