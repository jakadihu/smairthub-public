const express = require('express');
const app = express();

app.use(express.json());

app.get('/status', (req, res) => {
  res.json({ ok: true, message: 'API running 🚀' });
});

app.get('/', (req, res) => { res.send('API running 🚀'); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
