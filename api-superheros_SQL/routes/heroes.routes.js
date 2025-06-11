const express = require('express');
const { getHeroes, addHeroes } = require('../controllers/heroes.controller');
const db = require('../database');
const router = express.Router();

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./superheros.json', 'utf-8'));
const insert = db.prepare(`INSERT INTO heroes (name, publisher, gender, race, power,
alignment, height_cm, weight_kg, createdAt)
VALUES (@name, @publisher, @gender, @race, @power, @alignment, @height_cm, @weight_kg,
@createdAt)`);

const count = db.prepare('SELECT COUNT(*) as total FROM heroes').get();
if (count.total === 0) {
  const now = new Date().toISOString();
  for (const hero of data) {
   insert.run({
      name: hero.name,
      publisher: hero.biography.publisher,
      gender: hero.appearance.gender,
      race: hero.appearance.race,
      power: JSON.stringify(hero.powerstats),
      alignment: hero.biography.alignment,
      height_cm: parseInt(hero.appearance.height[1].split(' ')[0]),
      weight_kg: parseInt(hero.appearance.weight[1].split(' ')[0]),
     createdAt: now
    });
  }
}

router.get('/', (req, res) => {
  const publisher =req.query.publisher;
  if(publisher) {
    const filteredHeros = db.prepare('SELECT * FROM heroes WHERE publisher = ?').all(publisher);
    if (filteredHeros.length === 0) {
      return res.status(404).json({ error: 'Aucun héros trouvé pour cet éditeur' });
    }
    return res.json(filteredHeros);
  }
  const heroes = db.prepare('SELECT * FROM heroes').all();
  res.json(heroes);
});

router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Le nom est requis pour la recherche' });
  }
  const filteredHeros = db.prepare('SELECT * FROM heroes WHERE name LIKE ?').all(`%${q}%`);
  if (filteredHeros.length === 0) {
    return res.status(404).json({ error: 'Aucun héros trouvé avec ce nom' });
  }
  res.json(filteredHeros);
});

router.get('/sorted', (req, res) => {
  const allowedFields = ['name', 'publisher', 'gender', 'race', 'power', 'alignment', 'height_cm', 'weight_kg', 'createdAt'];
  const sortBy = req.query.by;
  const sortFields = sortBy ? sortBy.split(',') : [];
  if (sortFields.length > 1) {
    for (const field of sortFields) {
      if (!sortBy || !allowedFields.includes(field)) {
        return res.status(400).json({ error: 'Champ de tri invalide' });
      }
    }
  }
  if (sortFields.length > 1) {
    const heroes = db.prepare(`SELECT * FROM heroes ORDER BY ${sortFields.join(', ')}`).all();
    return res.json(heroes);
  }
  const heroes = db.prepare(`SELECT * FROM heroes ORDER BY ${sortBy}`).all();
  res.json(heroes);
});

router.get('/export', (req, res) => {
  const publisher = req.query.publisher;
  if(publisher) {
    const filteredHeros = db.prepare('SELECT * FROM heroes WHERE publisher = ?').all(publisher);
    if (filteredHeros.length === 0) {
      return res.status(404).json({ error: 'Aucun héros trouvé pour cet éditeur' });
    }
    const csv = fs.writeFileSync("heroes.csv", filteredHeros.map(hero => { return `${hero.id},${hero.name},${hero.publisher},${hero.gender},${hero.race},${hero.power},${hero.alignment},${hero.height_cm},${hero.weight_kg},${hero.createdAt}`}).join('\n'), {flag: 'w+'}, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'écriture du fichier CSV' });
      }
    }
    );
    return res.download("heroes.csv", "heroes.csv", (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors du téléchargement du fichier CSV' });
      }
    }
    );
  }
});

router.get('/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT 
      publisher,
      COUNT(*) as total_heroes,
      AVG(height_cm) as avg_height_cm,
      AVG(weight_kg) as avg_weight_kg
    FROM heroes
    GROUP BY publisher
  `).all();
  res.json(stats);
});


router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(422).json({ error: 'ID invalide ou SQL dangereux 1' });
  }
  const hero = db.prepare('SELECT * FROM heroes WHERE id = ?').get(id);
  if (!hero) {
    return res.status(404).json({ error: 'Héros non trouvé' });
  }
  res.json(hero);
});

router.post('/', (req, res) => {
  const { name, publisher, gender, race, power, alignment, height_cm, weight_kg } = req.body;
  if (!name || !publisher || !gender || !race || !power || !alignment || !height_cm || !weight_kg) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`INSERT INTO heroes (name, publisher, gender, race, power, alignment, height_cm, weight_kg, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(name, publisher, gender, race, power, alignment, parseInt(height_cm), parseInt(weight_kg), createdAt);
  res.status(201).json({ message: 'Héros ajouté avec succès' });
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
    return res.status(422).json({ error: 'ID invalide ou SQL dangereux 2' });
  }
  const index = db.prepare('SELECT * FROM heroes WHERE id = ?').get(id);
  if (!index) {
    return res.status(404).json({ error: 'Héros non trouvé' });
  }
  const stmt = db.prepare('DELETE FROM heroes WHERE id = ?');
  stmt.run(id);
  res.status(201).json({ message: 'Héros supprimé avec succès' });
});

module.exports = router;
