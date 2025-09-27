/**
 * Test script to verify Forum API endpoints
 * Run this with: node test-forum-api.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testForumAPI() {
  console.log('🧪 Testing Forum API Endpoints...\n');

  // Test 1: Health check
  try {
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    console.log('🚨 Server might not be running. Please start with: npm start');
    return;
  }

  // Test 2: Get forum threads
  try {
    console.log('\n2️⃣ Testing Get Forum Threads...');
    const threadsResponse = await axios.get(`${API_BASE_URL}/v1/forum/threads?page=1&limit=10`);
    console.log('✅ Forum Threads:', {
      success: threadsResponse.data.success,
      count: threadsResponse.data.count,
      total: threadsResponse.data.total
    });
  } catch (error) {
    console.log('❌ Forum Threads Failed:', error.response?.data || error.message);
  }

  // Test 3: Create a test post (anonymous)
  try {
    console.log('\n3️⃣ Testing Create Forum Post (Anonymous)...');
    const postData = {
      title: 'Test Post from API Test',
      body: 'This is a test post created from the API test script to verify the forum functionality is working correctly.',
      tags: ['general', 'test'],
      isAnonymous: true
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/v1/forum/posts`, postData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Create Post:', {
      success: createResponse.data.success,
      postId: createResponse.data.post?.id,
      status: createResponse.data.post?.status
    });
    
    // Test 4: Get the created post
    if (createResponse.data.post?.id) {
      try {
        console.log('\n4️⃣ Testing Get Specific Post...');
        const postResponse = await axios.get(`${API_BASE_URL}/v1/forum/posts/${createResponse.data.post.id}`);
        console.log('✅ Get Post:', {
          success: postResponse.data.success,
          title: postResponse.data.post?.title,
          status: postResponse.data.post?.status
        });
      } catch (error) {
        console.log('❌ Get Post Failed:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Create Post Failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Forum API Test Complete!');
}

// Run the test
testForumAPI().catch(console.error);