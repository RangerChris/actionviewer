import http from 'http';
import { URL } from 'url';
import 'dotenv/config';

const PORT = process.env.PORT || 3001;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('❌ Missing required environment variables:');
    console.error('   - GITHUB_CLIENT_ID');
    console.error('   - GITHUB_CLIENT_SECRET');
    console.error('\nPlease create a .env file with these values.');
    process.exit(1);
}

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);

    // Health check endpoint
    if (url.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'github-oauth-proxy' }));
        return;
    }

    // OAuth authentication endpoint
    if (url.pathname === '/authenticate' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { code } = JSON.parse(body);

                if (!code) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing authorization code' }));
                    return;
                }

                // Exchange code for access token
                const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        client_id: GITHUB_CLIENT_ID,
                        client_secret: GITHUB_CLIENT_SECRET,
                        code,
                    }),
                });

                const data = await tokenResponse.json();

                if (data.error) {
                    console.error('GitHub OAuth error:', data.error_description);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: data.error_description || 'Failed to authenticate'
                    }));
                    return;
                }

                if (!data.access_token) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No access token received' }));
                    return;
                }

                // Return the access token
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ access_token: data.access_token }));

            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });

        return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`✅ GitHub OAuth Proxy running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Endpoint: http://localhost:${PORT}/authenticate`);
    console.log(`\n⚙️  Configuration:`);
    console.log(`   Client ID: ${GITHUB_CLIENT_ID}`);
    console.log(`   Client Secret: ${GITHUB_CLIENT_SECRET ? '****' + GITHUB_CLIENT_SECRET.slice(-4) : 'NOT SET'}`);
});
