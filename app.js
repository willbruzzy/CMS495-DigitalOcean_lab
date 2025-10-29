// app.js
const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;

let requestCount = 0;

// Helper to format uptime
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

// Helper to create system dashboard HTML
function generatePage() {
  requestCount++;
  const uptime = formatTime(os.uptime());
  const load = os.loadavg().map(n => n.toFixed(2)).join(' | ');
  const mem = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(1);
  const platform = os.platform();
  const nodeVersion = process.version;

  const lines = [
    '🖥️  DIGITALOCEAN RETRO TERMINAL DASHBOARD',
    '------------------------------------------',
    `Requests handled: ${requestCount}`,
    `System uptime: ${uptime}`,
    `CPU load (1m | 5m | 15m): ${load}`,
    `Memory usage: ${mem}%`,
    `Platform: ${platform}`,
    `Node version: ${nodeVersion}`,
    '',
    'Tip: Refresh to see live stats 🔁'
  ];

  // build HTML with retro aesthetic
  return `
  <html>
  <head>
    <title>💾 Retro Terminal</title>
    <style>
      body {
        background-color: #000;
        color: #00FF41;
        font-family: 'Courier New', monospace;
        padding: 30px;
        white-space: pre;
        font-size: 1.2rem;
      }
      .cursor {
        display: inline-block;
        width: 10px;
        height: 1em;
        background: #00FF41;
        animation: blink 1s step-end infinite;
        vertical-align: bottom;
      }
      @keyframes blink { 50% { opacity: 0; } }
      #terminal { opacity: 0; animation: fadein 0.5s forwards; }
      @keyframes fadein { to { opacity: 1; } }
    </style>
  </head>
  <body>
    <div id="terminal"></div>
    <div class="cursor"></div>

    <script>
      const lines = ${JSON.stringify(lines)};
      let i = 0;
      const term = document.getElementById('terminal');

      function typeLine() {
        if (i < lines.length) {
          term.innerHTML += lines[i] + '\\n';
          i++;
          setTimeout(typeLine, 120);
        }
      }
      typeLine();
    </script>
  </body>
  </html>`;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(generatePage());
});

server.listen(PORT, () => {
  console.log(`💾 Retro Terminal Server running at http://localhost:${PORT}/`);
});
