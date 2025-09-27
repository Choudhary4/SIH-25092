const mongoose = require('mongoose');
const User = require('../src/models/user.model');
require('dotenv').config();

/**
 * Test script for the anonymous display name system
 */

const testAnonymousNames = async () => {
  try {
    console.log('🧪 Testing anonymous display name system...');
    
    // Test the name generation algorithm
    console.log('\n📝 Testing name generation algorithm:');
    
    // Create a mock user with ObjectId to test generation
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = {
      _id: mockUserId,
      generateAnonymousDisplayName: User.prototype.generateAnonymousDisplayName
    };
    
    const anonymousName1 = mockUser.generateAnonymousDisplayName();
    const anonymousName2 = mockUser.generateAnonymousDisplayName();
    
    console.log(`Generated name 1: ${anonymousName1}`);
    console.log(`Generated name 2: ${anonymousName2}`);
    console.log(`Names match (consistency check): ${anonymousName1 === anonymousName2 ? '✅' : '❌'}`);
    
    // Test with different ObjectIds
    const mockUser2 = {
      _id: new mongoose.Types.ObjectId(),
      generateAnonymousDisplayName: User.prototype.generateAnonymousDisplayName
    };
    
    const differentName = mockUser2.generateAnonymousDisplayName();
    console.log(`Different user name: ${differentName}`);
    console.log(`Names are different (uniqueness check): ${anonymousName1 !== differentName ? '✅' : '❌'}`);
    
    // Validate name format
    const namePattern = /^[A-Z][a-z]+[A-Z][a-z]+\d{3}$/;
    console.log(`Name format valid: ${namePattern.test(anonymousName1) ? '✅' : '❌'}`);
    console.log(`Name length appropriate: ${anonymousName1.length <= 30 ? '✅' : '❌'}`);
    
    console.log('\n🎉 Anonymous name system tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
if (require.main === module) {
  testAnonymousNames()
    .then(() => {
      console.log('✅ Tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Tests failed:', error);
      process.exit(1);
    });
}

module.exports = testAnonymousNames;