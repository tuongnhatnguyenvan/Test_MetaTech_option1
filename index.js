const express = require('express');
const categoriesRouter = require('./routes/categories');
const postsRouter = require('./routes/post');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/categories', categoriesRouter);
app.use('/posts', postsRouter);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
