const express = require('express');
const router = express.Router();

let users = [{ id: '1', name: 'user1' }, { id: '2', name: 'user2' }];

// GET /users
router.get('/', (req, res) => {
  res.json(users);
});

// POST /users
router.post('/', (req, res) => {
  const { name } = req.body;
  const id = String(users.length + 1);
  const user = { id, name };
  users.push(user);
  res.status(201).json({
    msg : `User created : ${user}`,
    details : users
  });
});

// GET /users/:id
router.get('/:id', (req, res) => {
  const u = users.find(x => x.id === req.params.id);
  if (!u) return res.status(404).send('User not found');
  res.json(u);
});

module.exports = router;
