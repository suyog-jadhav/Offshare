
import fs from 'fs';
import { blob } from 'stream/consumers';

const BASE_URL = 'http://localhost:8000/api';

async function testFlow() {
    try {
        // 1. Start Session
        console.log("👉 Starting Session...");
        const sessionRes = await fetch(`${BASE_URL}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                device_name: "TestRunner",
                device_type: "script"
            })
        });
        const sessionData = await sessionRes.json();
        const sessionId = sessionData.data.session_id;
        console.log("✅ Session Started:", sessionId);

        // 2. Create Dummy File
        if (!fs.existsSync('test_upload.txt')) {
            fs.writeFileSync('test_upload.txt', 'Test Content');
        }

        // 3. Upload File
        console.log("👉 Uploading File...");
        const fileContent = fs.readFileSync('test_upload.txt');
        const formData = new FormData();
        const blob = new Blob([fileContent], { type: 'text/plain' });
        formData.append('files', blob, 'test_upload.txt');
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

testFlow();
