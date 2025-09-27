/**
 * Test script to verify posts are published directly
 * Run this with: node test-post-status.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testPostStatus() {
  console.log('🧪 Testing Post Status - Should be "published" directly...\n');

  try {
    // Test 1: Create a clean post
    console.log('1️⃣ Creating a clean post...');
    const postData = {
      title: 'Test Post - Should be Published Immediately',
      body: 'This is a clean test post that should be published directly without moderation. It contains no harmful content and should appear immediately in the forum.',
      tags: ['general'],
      isAnonymous: true
    };

    const createResponse = await axios.post(`${API_BASE_URL}/v1/forum/posts`, postData, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (createResponse.data.success) {
      const post = createResponse.data.post;
      console.log('✅ Post created successfully');
      console.log(`   Post ID: ${post.id}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Message: ${createResponse.data.message}`);

      if (post.status === 'published') {
        console.log('🎉 SUCCESS: Post is published directly!');
      } else {
        console.log(`❌ ISSUE: Post status is "${post.status}" instead of "published"`);
      }

      // Test 2: Check if post appears in threads list
      console.log('\n2️⃣ Checking if post appears in forum threads...');
      const threadsResponse = await axios.get(`${API_BASE_URL}/v1/forum/threads?page=1&limit=10`);
      
      if (threadsResponse.data.success) {
        const threads = threadsResponse.data.posts || [];
        const foundPost = threads.find(thread => thread._id === post.id || thread.id === post.id);
        
        if (foundPost) {
          console.log('✅ Post found in threads list');
          console.log(`   Title: ${foundPost.title}`);
          console.log(`   Status: ${foundPost.status}`);
        } else {
          console.log('❌ Post NOT found in threads list');
          console.log(`   Total threads: ${threads.length}`);
          console.log(`   Looking for post ID: ${post.id}`);
        }
      } else {
        console.log('❌ Failed to fetch threads');
      }

    } else {
      console.log('❌ Failed to create post:', createResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }

  // Test 3: Test potentially flagged content
  console.log('\n3️⃣ Testing potentially flagged content...');
  try {
    const flaggedData = {
      title: 'Test - Content that might be flagged',
      body: 'This post contains some words that might trigger content filters but should still work with the new system.',
      tags: ['test'],
      isAnonymous: true
    };

    const flaggedResponse = await axios.post(`${API_BASE_URL}/v1/forum/posts`, flaggedData, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (flaggedResponse.data.success) {
      console.log('✅ Flagged content post created');
      console.log(`   Status: ${flaggedResponse.data.post.status}`);
      console.log(`   Message: ${flaggedResponse.data.message}`);
    }
  } catch (error) {
    console.log('❌ Flagged content error:', error.response?.data?.message || error.message);
  }

  console.log('\n🏁 Post Status Test Complete!');
}

// Run test if server is available
axios.get('http://localhost:5000/health')
  .then(() => {
    console.log('✅ Server is running, starting post status tests...\n');
    return testPostStatus();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start with: node src/index.js');
    console.log('   Make sure to restart the server to apply the new status changes.');
  });