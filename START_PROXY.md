# Starting the Proxy Server

The Browse Papers feature requires the proxy server to be running to fetch papers from KTU DSpace.

## Start the Proxy Server

1. Navigate to the server directory:
```bash
cd src/server
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the proxy server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on port 3001.

## Verify it's Running

Open your browser and visit:
- http://localhost:3001/test - Should show "Proxy server is running!"
- http://localhost:3001/api/proxy/test - Should test the KTU connection

## Troubleshooting

If you get "EADDRINUSE" error (port already in use):
```bash
# Kill the process on port 3001
lsof -ti:3001 | xargs kill -9
```

Then start the server again.

## Note

The proxy server must be running for the Browse Papers feature to work in development mode.

