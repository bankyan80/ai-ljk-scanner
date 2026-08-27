import fetch from 'node-fetch';

async function testApi() {
  const url = 'http://localhost:3000/api/ai/analyze-ljk';
  
  // Base64 dummy image for testing
  const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  console.log("Testing /api/ai/analyze-ljk...");
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: dummyImage })
    });

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("✅ Test Passed: API is functional.");
    } else {
      console.error("❌ Test Failed: API returned unsuccessful status.");
    }
  } catch (error) {
    console.error("❌ Test Failed: Could not connect to server.", error);
  }
}

testApi();
