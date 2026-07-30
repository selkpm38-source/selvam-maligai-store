process.env.VERCEL = '1';
const http = require('http');
const app = require('./server');
const server = http.createServer(app);
server.listen(5001, () => {
  console.log('server listening on 5001');
  const urls = ['http://localhost:5001/api/health', 'http://localhost:5001/api/products'];
  let remaining = urls.length;
  for (const url of urls) {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        console.log(url, res.statusCode, data);
        if (--remaining === 0) {
          server.close();
        }
      });
    }).on('error', (err) => {
      console.error(url, 'ERR', err.message);
      if (--remaining === 0) {
        server.close();
      }
    });
  }
});
