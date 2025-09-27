// Test script to check current user and appointments
// Run this in the browser console to debug

async function testAppointmentsAPI() {
  const token = localStorage.getItem('Mann-Mitra_token');
  console.log('Token:', token);
  
  if (!token) {
    console.error('No token found in localStorage');
    return;
  }
  
  try {
    // First, check who the current user is
    console.log('\n=== Testing /api/v1/auth/me ===');
    const userResponse = await fetch('http://localhost:5000/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    console.log('Current User:', userData);
    
    // Now test appointments endpoint
    console.log('\n=== Testing /api/v1/appointments/me ===');
    const appointmentsResponse = await fetch('http://localhost:5000/api/v1/appointments/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const appointmentsData = await appointmentsResponse.json();
    console.log('Appointments Response:', appointmentsData);
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

// Run the test
testAppointmentsAPI();