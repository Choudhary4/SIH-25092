const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For CBC, 16 bytes is standard
const KEY_LENGTH = 32; // 256 bits key

/**
 * Generate encryption key from environment variable
 * The key should be exactly 32 bytes (256 bits) for AES-256
 */
const getEncryptionKey = () => {
  const keyString = process.env.ENCRYPTION_KEY;
  
  if (!keyString) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  // If the key is provided as hex string, convert it
  if (keyString.length === 64) {
    return Buffer.from(keyString, 'hex');
  }
  
  // Otherwise, create a hash of the provided string to ensure consistent 32-byte key
  return crypto.createHash('sha256').update(keyString).digest();
};

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns object with encrypted data, IV, and authentication tag
 * 
 * @param {string} text - Plain text to encrypt
 * @returns {object} - Object containing encrypted data, IV, and tag in base64 format
 */
const encrypt = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text to encrypt must be a non-empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return combined format: iv:encrypted
    const combined = iv.toString('hex') + ':' + encrypted;
    
    return combined;
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt encrypted text using AES-256-GCM
 * 
 * @param {string} encryptedData - Encrypted data in format "iv:tag:encrypted" (base64)
 * @returns {string} - Decrypted plain text
 */
const decrypt = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted data must be a non-empty string');
    }

    // Split the combined format for CBC (iv:encrypted)
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Alternative implementation using AES-256-CBC (simpler but less secure than GCM)
 * Use this if GCM causes issues
 */
const encryptCBC = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text to encrypt must be a non-empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // CBC uses 16-byte IV
    const cipher = crypto.createCipher('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Return combined format: iv:encrypted
    return iv.toString('base64') + ':' + encrypted;
    
  } catch (error) {
    console.error('CBC Encryption error:', error);
    throw new Error('Failed to encrypt data with CBC');
  }
};

const decryptCBC = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted data must be a non-empty string');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid CBC encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'base64');
    const encrypted = parts[1];

    const key = getEncryptionKey();
    const decipher = crypto.createDecipher('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('CBC Decryption error:', error);
    throw new Error('Failed to decrypt CBC data');
  }
};

/**
 * Generate a secure random encryption key
 * Use this to generate a new key for the ENCRYPTION_KEY environment variable
 */
const generateKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

/**
 * Validate if a string can be decrypted (useful for checking data integrity)
 */
const canDecrypt = (encryptedData) => {
  try {
    decrypt(encryptedData);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  encrypt,
  decrypt,
  encryptCBC,
  decryptCBC,
  generateKey,
  canDecrypt,
  getEncryptionKey
};