const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validatePost = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  // Add other validation rules here
];

// Create a new post
router.post('/', validatePost, async (req, res) => {
  // Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, slug, excerpt, content, tags, author, isActive, siteId, categoryId } = req.body;
  console.log(req.body);
  try {
    const post = await prisma.posts.create({
      data: { title, slug, excerpt, content, tags, author, isActive, siteId, categoryId }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Could not create post' });
  }
});

// Get all posts with pagination and search
router.get('/', async (req, res) => {
  const { page = 1, search } = req.query;
  const pageSize = 5;
  try {
    const posts = await prisma.posts.findMany({
        where: {
          OR: [
            { title: { contains: search || '' } },
            { content: { contains: search || '' } },
            { tags: { contains: search || '' } },
          ]
        },
        skip: (page - 1) * pageSize,
        take: pageSize
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not retrieve posts' });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.posts.findUnique({ where: { id: parseInt(id) } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve post' });
  }
});

// Update a post by ID
router.put('/:id', validatePost, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, slug, excerpt, content, tags, author, isActive, siteId, categoryId } = req.body;
  try {
    const updatedPost = await prisma.posts.update({
      where: { id: parseInt(id) },
      data: { title, slug, excerpt, content, tags, author, isActive, siteId, categoryId }
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Could not update post' });
  }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.posts.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Could not delete post' });
  }
});

module.exports = router;
