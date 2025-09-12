// /app/api/registerToken/route.js
export async function POST(req) {
    try {
        const body = await req.json();

        const res = await fetch('http://192.168.171.71:5259/api/PushNotification/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        });

        // If backend returned an error or empty body
        if (!res.ok) {
            const text = await res.text();
            console.error('Backend error:', text);
            return new Response(JSON.stringify({ error: text || 'Backend error' }), { status: res.status });
        }

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = { message: 'No JSON returned' };
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (err) {
        console.error('API proxy error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
