const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const cors = require('cors');
const app = express();

let indexRouter = require('../routers/index');
let postsRouter = require('../routers/posts');
let authRouter = require('../routers/auth');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/api/posts', postsRouter);
app.use('/auth', authRouter);
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message
  });
});

module.exports = app;