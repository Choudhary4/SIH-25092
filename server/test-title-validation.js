/**
 * Test script for the updated forum validation
 * Tests various title formats to ensure they work
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testTitleValidation() {
  console.log('🧪 Testing Updated Forum Title Validation...\n');

  const testTitles = [
    {
      title: "Student Academic Stress  Let's Talk About It!",
      body: "I've been struggling with academic pressure and would love to hear from others who have experienced similar challenges.",
      shouldPass: true,
      description: "Title with apostrophe and multiple spaces"
    },
    {
      title: "How do you deal with anxiety? 🤔💭",
      body: "Looking for advice on managing anxiety during exam periods. Any tips would be appreciated!",
      shouldPass: true,
      description: "Title with emojis and question mark"
    },
    {
      title: "Self-care tips & techniques (that actually work)",
      body: "Share your favorite self-care methods that have helped you through difficult times.",
      shouldPass: true,
      description: "Title with ampersand and parentheses"
    },
    {
      title: "Hi",
      body: "Short title test",
      shouldPass: false,
      description: "Title too short (less than 5 characters)"
    },
    {
      title: "<script>alert('test')</script>",
      body: "This should be blocked for security reasons",
      shouldPass: false,
      description: "Title with dangerous script content"
    }
  ];

  let passedTests = 0;
  let totalTests = testTitles.length;

  for (const test of testTitles) {
    try {
      console.log(`📝 Testing: ${test.description}`);
      console.log(`   Title: "${test.title}"`);
      
      const response = await axios.post(`${API_BASE_URL}/v1/forum/posts`, {
        title: test.title,
        body: test.body,
        tags: ['test'],
        isAnonymous: true
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      if (test.shouldPass) {
        console.log(`   ✅ PASS - Post created successfully`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL - Expected rejection but post was created`);
      }
      
    } catch (error) {
      if (!test.shouldPass) {
        console.log(`   ✅ PASS - Post correctly rejected: ${error.response?.data?.message || error.message}`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL - Expected success but got error: ${error.response?.data?.message || error.message}`);
        if (error.response?.data?.errors) {
          console.log(`   Details:`, error.response.data.errors.map(e => e.msg).join(', '));
        }
      }
    }
    
    console.log(''); // Empty line for readability
  }

  console.log(`🏁 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All validation tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the server validation rules.');
  }
}

// Run if server is available
axios.get('http://localhost:5000/health')
  .then(() => {
    console.log('✅ Server is running, starting validation tests...\n');
    return testTitleValidation();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start with: node src/index.js');
  });