const getHeroes = (req, res) => {
  res.json({ message: 'Liste des Heros :' });
};

const addHeroes = (req, res) => {
  const {name} = req.body;
  res.json({ message: `Hero ${name} ajouté avec succès !`});
};

module.exports = { getHeroes, addHeroes };
