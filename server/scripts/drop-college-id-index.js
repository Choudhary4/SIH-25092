const mongoose = require('mongoose');
require('dotenv').config();

const dropCollegeIdIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hireanything');
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Check if the unique index exists
    const indexes = await collection.indexes();
    const collegeIdIndex = indexes.find(index => 
      index.key && index.key.collegeId && index.unique === true
    );

    if (collegeIdIndex) {
      console.log('Found unique index on collegeId:', collegeIdIndex.name);
      
      // Drop the unique index
      await collection.dropIndex(collegeIdIndex.name);
      console.log('Successfully dropped unique index on collegeId');
    } else {
      console.log('No unique index found on collegeId field');
    }

    // List all current indexes
    const currentIndexes = await collection.indexes();
    console.log('\nCurrent indexes on users collection:');
    currentIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });

  } catch (error) {
    console.error('Error dropping index:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
dropCollegeIdIndex();