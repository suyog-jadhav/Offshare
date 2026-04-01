
const BASE_URL = 'http://localhost:8000/api';

async function testDashboard() {
    try {
        console.log("👉 Fetching Recent Activity...");
        const res = await fetch(`${BASE_URL}/dashboard/recent-activity?limit=10`, {
            headers: { 'x-shop-token': 'local-shop-secret-123' }
        });
        const data = await res.json();
        console.log("✅ Status:", res.status);
        console.log("✅ Data:", JSON.stringify(data, null, 2));

        console.log("👉 Fetching Stats...");
        const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, {
            headers: { 'x-shop-token': 'local-shop-secret-123' }
        });
        const statsData = await statsRes.json();
        console.log("✅ Stats:", JSON.stringify(statsData, null, 2));

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testDashboard();
