const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Point to your cert files
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    if (parsedUrl.pathname === '/firebase-messaging-sw.js') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        fs.createReadStream(path.join(__dirname, 'public', 'firebase-messaging-sw.js')).pipe(res);
        return;
    }
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> HTTPS server ready on https://localhost:3000');
  });
});
