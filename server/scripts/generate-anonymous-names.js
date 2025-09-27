const mongoose = require('mongoose');
const User = require('../src/models/user.model');
require('dotenv').config();

/**
 * Migration script to generate anonymous display names for existing users
 * This should be run once after implementing the anonymous display name feature
 */

const generateAnonymousNames = async () => {
  try {
    console.log('🚀 Starting anonymous display name generation...');
    
    // Connect to database
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database');
    
    // Find all users without anonymous display names
    const usersWithoutAnonymousNames = await User.find({
      $or: [
        { anonymousDisplayName: { $exists: false } },
        { anonymousDisplayName: null },
        { anonymousDisplayName: '' }
      ]
    });
    
    console.log(`📊 Found ${usersWithoutAnonymousNames.length} users without anonymous display names`);
    
    let updateCount = 0;
    
    // Generate and save anonymous display names
    for (const user of usersWithoutAnonymousNames) {
      try {
        // Generate the anonymous display name using the method defined in the model
        user.anonymousDisplayName = user.generateAnonymousDisplayName();
        
        // Save the user (this will trigger the pre-save hooks)
        await user.save();
        
        updateCount++;
        
        console.log(`✅ Updated user ${user.email} -> ${user.anonymousDisplayName}`);
      } catch (error) {
        console.error(`❌ Failed to update user ${user.email}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully generated anonymous display names for ${updateCount} users`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
};

// Run the migration
if (require.main === module) {
  generateAnonymousNames()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = generateAnonymousNames;