#!/usr/bin/env node

/**
 * Encryption Key Generator
 * 
 * This script generates secure encryption keys for the appointment system.
 * Run this script to generate a new ENCRYPTION_KEY for your .env file.
 * 
 * Usage: node scripts/generate-encryption-key.js
 */

const crypto = require('crypto');

function generateEncryptionKey() {
  // Generate a 256-bit (32 byte) key
  const key = crypto.randomBytes(32);
  
  console.log('🔐 Encryption Key Generator');
  console.log('================================');
  console.log('');
  console.log('Generated 256-bit encryption key:');
  console.log(`ENCRYPTION_KEY=${key.toString('hex')}`);
  console.log('');
  console.log('📋 Copy the above line to your .env file');
  console.log('⚠️  Keep this key secure and never share it publicly');
  console.log('💡 If you lose this key, all encrypted data will be unrecoverable');
  console.log('');
  console.log('Key Details:');
  console.log(`- Length: ${key.length} bytes (${key.length * 8} bits)`);
  console.log(`- Format: Hexadecimal`);
  console.log(`- Algorithm: AES-256-GCM compatible`);
  console.log('');
}

function validateExistingKey(keyString) {
  try {
    if (!keyString) {
      console.log('❌ No key provided');
      return false;
    }
    
    if (keyString.length !== 64) {
      console.log(`❌ Invalid key length: ${keyString.length} characters (expected 64)`);
      return false;
    }
    
    // Try to parse as hex
    const buffer = Buffer.from(keyString, 'hex');
    if (buffer.length !== 32) {
      console.log(`❌ Invalid key: produces ${buffer.length} bytes (expected 32)`);
      return false;
    }
    
    console.log('✅ Key is valid');
    console.log(`- Length: ${buffer.length} bytes (${buffer.length * 8} bits)`);
    console.log(`- Format: Valid hexadecimal`);
    return true;
    
  } catch (error) {
    console.log('❌ Invalid key format:', error.message);
    return false;
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  generateEncryptionKey();
} else if (args[0] === '--validate' || args[0] === '-v') {
  if (args[1]) {
    console.log('🔍 Validating encryption key...');
    console.log('================================');
    validateExistingKey(args[1]);
  } else {
    console.log('Usage: node generate-encryption-key.js --validate <key-string>');
  }
} else if (args[0] === '--help' || args[0] === '-h') {
  console.log('Encryption Key Generator');
  console.log('========================');
  console.log('');
  console.log('Usage:');
  console.log('  node generate-encryption-key.js          Generate new key');
  console.log('  node generate-encryption-key.js -v <key> Validate existing key');
  console.log('  node generate-encryption-key.js --help   Show this help');
  console.log('');
} else {
  console.log('Unknown option. Use --help for usage information.');
}