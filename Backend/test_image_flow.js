
import fs from 'fs';

const BASE_URL = 'http://localhost:8000/api';

async function testImageFlow() {
    try {
        // 1. Start Session
        console.log("👉 Starting Session...");
        const sessionRes = await fetch(`${BASE_URL}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_name: "ImageTester",
                device_type: "script"
            })
        });
        const sessionData = await sessionRes.json();
        const sessionId = sessionData.data.session_id;
        console.log("✅ Session Started:", sessionId);

        // 2. Create Dummy "PNG" File (just text content but named .png)
        // This simulates a "corrupt" or non-standard image that might fail sharp, triggering fallback
        if (!fs.existsSync('test_image.png')) {
            fs.writeFileSync('test_image.png', 'Fake PNG Content');
        }

        // 3. Upload File
        console.log("👉 Uploading Image...");
        const fileContent = fs.readFileSync('test_image.png');
        const formData = new FormData();
        const blob = new Blob([fileContent], { type: 'image/png' });
        formData.append('files', blob, 'test_image.png');
        formData.append('session_id', sessionId);

        const uploadRes = await fetch(`${BASE_URL}/files/upload`, {
            method: 'POST',
            body: formData
        });

        const uploadData = await uploadRes.json();
        console.log("✅ Upload Response:", JSON.stringify(uploadData, null, 2));

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testImageFlow();
