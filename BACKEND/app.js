const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const forgotPass = require('./routes/forgotPassword')
const sector = require('./routes/sector')
const profileRoutes = require('./routes/profile')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const app = express();
const allowedOrigins = [
    "http://localhost:3001",
    "https://bizbridge-plum.vercel.app"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/api/profile", profileRoutes);
app.use("/api/sector", sector);
app.use("/api/forgotPass", forgotPass);
app.use('/api/auth',authRoutes)
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
