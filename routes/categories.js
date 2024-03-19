const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Validation middleware
const validateCategory = (req, res, next) => {
  const { name, slug, isActive } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' });
  }
  next();
};

// Get all categories with pagination and search
router.get('/', async (req, res) => {
  const { page = 1, search } = req.query;
  const pageSize = 5;
  try {
    const categories = await prisma.categories.findMany({
      where: {
        OR: [
          { name: { contains: search || '' } },
          { slug: { contains: search || '' } }
        ]
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve categories' });
  }
});

// GET category by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log("ID:", id);
  try {
    const categoryId = parseInt(id);
    const category = await prisma.categories.findUnique({ where: { id: categoryId } });
    console.log("Category:", category);

    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve category' });
  }
});

// POST new category
router.post('/', validateCategory, async (req, res) => {
  const { name, slug, isActive } = req.body;
  try {
    const category = await prisma.categories.create({
      data: { name, slug, isActive }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Could not create category' });
  }
});

// PUT update category by ID
router.put('/:id', validateCategory, async (req, res) => {
  const { id } = req.params;
  const categoryId = parseInt(id);
  const { name, slug, isActive } = req.body;
  try {
    const updatedCategory = await prisma.categories.update({
      where: { id: categoryId },
      data: { name, slug, isActive }
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Could not update category' });
  }
});

// DELETE category by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const categoryId = parseInt(id);
  try {
    await prisma.categories.delete({ where: { id: categoryId } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Could not delete category' });
  }
});

module.exports = router;
