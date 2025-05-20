const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const forgotPass = require('./routes/forgotPassword')
const sector = require('./routes/sector')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app = express();
app.use(cors({
    origin: 'http://localhost:3001',  // ganti dengan alamat frontend kamu
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  
}));

app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/sector", sector);
app.use("/api/forgotPass", forgotPass);
app.use('/api/auth',authRoutes)
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
