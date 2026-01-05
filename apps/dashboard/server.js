const next = require('next');
const express = require('express');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.all('*', (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Next.js running on port ${PORT}`);
  });
});