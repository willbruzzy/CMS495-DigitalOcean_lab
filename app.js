// app.js
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

// Utility to fetch weather from wttr.in
function fetchWeather(callback) {
  https.get('https://wttr.in/?format=j1', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const area = json.nearest_area?.[0]?.areaName?.[0]?.value || 'Unknown';
        const region = json.nearest_area?.[0]?.region?.[0]?.value || '';
        const country = json.nearest_area?.[0]?.country?.[0]?.value || '';
        const tempC = json.current_condition?.[0]?.temp_C;
        const feelsLike = json.current_condition?.[0]?.FeelsLikeC;
        const desc = json.current_condition?.[0]?.weatherDesc?.[0]?.value;
        const iconUrl = json.current_condition?.[0]?.weatherIconUrl?.[0]?.value;

        callback({
          area, region, country,
          tempC, feelsLike, desc, iconUrl
        });
      } catch (err) {
        callback({ error: 'Error parsing weather data' });
      }
    });
  }).on('error', () => callback({ error: 'Failed to fetch weather data' }));
}

// Generates HTML page dynamically
function generatePage(weather) {
  if (weather.error) {
    return `<html><body style="font-family:sans-serif;text-align:center;padding-top:3rem;color:red;">
              <h2>⚠️ ${weather.error}</h2>
            </body></html>`;
  }

  return `
  <html>
  <head>
    <title>🌤️ Live Weather Server</title>
    <style>
      body {
        background: linear-gradient(120deg, #89f7fe, #66a6ff);
        font-family: 'Courier New', monospace;
        text-align: center;
        color: #fff;
        padding-top: 4rem;
      }
      img {
        width: 80px;
        margin: 10px;
      }
      .card {
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        display: inline-block;
        padding: 2rem 3rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }
      h1 { margin-bottom: 0; }
      p { margin: 0.3rem 0; font-size: 1.2rem; }
      footer { margin-top: 2rem; font-size: 0.9rem; color: #eee; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${weather.area}, ${weather.region}</h1>
      <h2>${weather.country}</h2>
      <img src="${weather.iconUrl}" alt="weather icon">
      <p>${weather.desc}</p>
      <p>🌡️ ${weather.tempC}°C (feels like ${weather.feelsLike}°C)</p>
    </div>
    <footer>Powered by <a href="https://wttr.in" style="color:white;">wttr.in</a> & DigitalOcean</footer>
  </body>
  </html>`;
}

const server = http.createServer((req, res) => {
  fetchWeather((weather) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(generatePage(weather));
  });
});

server.listen(PORT, () => {
  console.log(`🌦️  Live Weather Server running at http://localhost:${PORT}/`);
});
