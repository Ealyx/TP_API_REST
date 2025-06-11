const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/heroes.routes');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/heroes', userRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API Node.js fonctionne !');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});