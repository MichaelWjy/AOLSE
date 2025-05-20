const crypto = require("crypto");
const nodemailer = require("nodemailer");
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

router.get("/sectors", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM sectors ORDER BY name");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching sectors:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;