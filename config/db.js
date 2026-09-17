/*
 * Finland Ice Hockey Tournament Platform
 * File: config/db.js
 * Author: Zawal (Backend Architecture, Database and DevOps)
 * Purpose: MongoDB connection setup with friendly error messages for common issues
 */

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('MongoDB connected:', mongoose.connection.host, '/', mongoose.connection.name);
  } catch (err) {
    console.error('');
    console.error('========================================');
    console.error('MongoDB connection FAILED');
    console.error('========================================');
    console.error('Reason:', err.message);
    console.error('');

    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.error('This looks like a DNS issue. Your computer cannot look up the Atlas');
      console.error('cluster hostname. Try one of these fixes (in order of easiness):');
      console.error('');
      console.error('  1. Change your DNS to Google DNS (8.8.8.8 and 8.8.4.4):');
      console.error('     - Windows Settings -> Network & internet -> click your connection');
      console.error('     - Edit DNS settings -> Manual -> enable IPv4');
      console.error('     - Preferred: 8.8.8.8     Alternate: 8.8.4.4');
      console.error('     - Save. Run `ipconfig /flushdns` in PowerShell, then try again.');
      console.error('');
      console.error('  2. Use the non-SRV connection string from Atlas:');
      console.error('     - In Atlas: Database -> Connect -> Drivers -> "Older drivers (2.2.12 or later)"');
      console.error('     - Paste that mongodb://... URL into .env instead of the mongodb+srv://... one.');
      console.error('');
      console.error('  3. Check your firewall or VPN is not blocking outbound port 27017 / DNS.');
    } else if (err.message.toLowerCase().includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('Authentication failed. Check:');
      console.error('  - Your DB user password is correct.');
      console.error('  - If your password contains @ : / # ? you must URL-encode it.');
      console.error('  - The user has "Atlas admin" or read/write access in Database Access.');
    } else if (err.message.includes('IP') || err.message.includes('whitelist') || err.message.includes('not allowed')) {
      console.error('Your IP is not whitelisted. In Atlas:');
      console.error('  Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)');
    }

    console.error('');
    process.exit(1);
  }
}

module.exports = connectDB;
