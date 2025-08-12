const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

router.get('/', async (req, res) => {
  const routes = await Route.find();
  res.json(routes);
});

router.get('/:id', async (req, res) => {
  const route = await Route.findById(req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json(route);
});

router.post('/', async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const route = await Route.findByIdAndDelete(req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json({ message: 'Route deleted' });
});

module.exports = router;
