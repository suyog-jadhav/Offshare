
const BASE_URL = 'http://localhost:8000/api';

async function testEndpoints() {
    const headers = { 'x-shop-token': 'local-shop-secret-123' };

    try {
        console.log("👉 Testing GET /print/jobs...");
        const jobsRes = await fetch(`${BASE_URL}/print/jobs`, { headers });
        console.log(`✅ Jobs Status: ${jobsRes.status}`);
        const jobsData = await jobsRes.json();
        console.log(`   Items: ${jobsData.data?.length}`);

        console.log("👉 Testing GET /session...");
        const sessionRes = await fetch(`${BASE_URL}/session`, { headers });
        console.log(`✅ Session Status: ${sessionRes.status}`);
        const sessionData = await sessionRes.json();
        console.log(`   Items: ${sessionData.data?.length}`);

        console.log("👉 Testing GET /customer...");
        const custRes = await fetch(`${BASE_URL}/customer`, { headers });
        console.log(`✅ Customer Status: ${custRes.status}`);
        const custData = await custRes.json();
        console.log(`   Items: ${custData.data?.length}`);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testEndpoints();
