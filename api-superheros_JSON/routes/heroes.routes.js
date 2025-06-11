const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

let heros = [];

// Chargement des données des super-héros depuis le fichier JSON

(async () => {
  try {
    const data = await fs.readFile('./superheros.json', 'utf8');
    const jsonData = JSON.parse(data);
    heros = jsonData.superheros || [];
    heros.forEach(hero => {
      console.log(`Chargement de l'héro : ${hero.name}`);
    });
  } catch (err) {
    console.error('Erreur de lecture du fichier superheros.json:', err);
  }
})();

router.get('/', (req, res) => {
  const { publisher } = req.query;
  if (publisher) {
    const filteredHeros = heros.filter(u => u.biography.publisher && u.biography.publisher.toLowerCase().includes(publisher.toLowerCase()));
    if (filteredHeros.length === 0) {
      return res.status(404).json({ error: 'Aucun héros trouvé pour cet éditeur' });
    }
    return res.json(filteredHeros);
  }
  res.json(heros);
});

router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Le nom est requis pour la recherche' });
  }
  const filteredHeros = heros.filter(u => u.name && u.name.toLowerCase().includes(q.toLowerCase()));
  if (filteredHeros.length === 0) {
    return res.status(404).json({ error: 'Aucun héros trouvé avec ce nom' });
  }
  res.json(filteredHeros);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const hero = heros.find(u => u.id === id);
  if (!hero) {
    return res.status(404).json({ error: 'Héros non trouvé' });
  }
  res.json(hero);
});

router.post('/', (req, res) => {
  const heroData = req.body;

  // Vérifie qu'au moins un nom est fourni, sinon tu peux retirer cette vérification si tout doit être optionnel
  if (!heroData.name) {
    return res.status(400).json({ error: 'Le nom est requis' });
  }

  // Génère un nouvel id unique
  const newHero = {
    id: heros.length ? heros[heros.length - 1].id + 1 : 1,
    ...heroData // Ajoute tous les autres attributs reçus, même optionnels
  };

  heros.push(newHero);
  res.status(201).json(newHero);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = heros.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Héros non trouvé' });
  }
  heros.splice(index, 1);
  res.json("Héros supprimé avec succès");
});

module.exports = router;
