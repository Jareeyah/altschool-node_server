const http = require("http");
const fs = require("fs");

const PORT = 8000;

const server = http.createServer((req, res) => {
  if (req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.end('Internal Server Error');
      } else {
        res.end(data);
      }
    });
  } else if (req.url.endsWith('.html')) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('404 Not Found');
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("Hello, This is a nodejs server";
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port     ${PORT}`);
});