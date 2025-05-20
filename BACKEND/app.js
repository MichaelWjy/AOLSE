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
const allowedOrigins = [
    "http://localhost:3001",
    "https://bizbridge-plum.vercel.app",
];

app.use(cors({
    origin: function (origin, callback) {
    // Jika origin tidak ada (misal request dari Postman), izinkan saja
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
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
