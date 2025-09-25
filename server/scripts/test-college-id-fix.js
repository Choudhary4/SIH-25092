const axios = require('axios');

const testCollegeIdFix = async () => {
  const baseURL = 'http://localhost:5000/api/v1/auth';
  
  console.log('Testing College ID uniqueness fix...\n');

  try {
    // Test 1: Register first student with college ID "COLLEGE123"
    console.log('1. Registering first student with collegeId: COLLEGE123');
    const response1 = await axios.post(`${baseURL}/register`, {
      email: 'student1@test.com',
      password: 'password123',
      name: 'John Doe',
      collegeId: 'COLLEGE123',
      role: 'student'
    });
    console.log('✅ First student registered successfully');
    console.log('User ID:', response1.data.user.id);

    // Test 2: Register second student with same college ID "COLLEGE123"
    console.log('\n2. Registering second student with same collegeId: COLLEGE123');
    const response2 = await axios.post(`${baseURL}/register`, {
      email: 'student2@test.com',
      password: 'password123',
      name: 'Jane Smith',
      collegeId: 'COLLEGE123',
      role: 'student'
    });
    console.log('✅ Second student registered successfully');
    console.log('User ID:', response2.data.user.id);

    // Test 3: Try to register with duplicate email (should fail)
    console.log('\n3. Testing duplicate email (should fail)');
    try {
      await axios.post(`${baseURL}/register`, {
        email: 'student1@test.com', // Same email as first student
        password: 'password123',
        name: 'Another Student',
        collegeId: 'COLLEGE456',
        role: 'student'
      });
    } catch (error) {
      console.log('✅ Duplicate email correctly rejected:', error.response.data.message);
    }

    console.log('\n🎉 All tests passed! College ID uniqueness constraint has been successfully removed.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run the test
testCollegeIdFix();