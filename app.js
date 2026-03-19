require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const postsRouter = require('./routers/posts');
const commentsRouter = require('./routers/comments');
const rsvpRouter = require('./routers/rsvp');
const authRouter = require('./routers/auth');

app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);

// add these later when ready
// app.use('/api/posts/:postId/comments', commentsRouter);
// app.use('/api/posts/:postId/rsvp', rsvpRouter);

app.get('/', (req, res) => {
  res.send('CampusConnect backend is running');
});

module.exports = app;