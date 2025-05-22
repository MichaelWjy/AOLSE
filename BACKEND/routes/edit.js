
const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
}); 

const upload = multer({ dest: 'uploads/' });

// ✅ Get profile
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customer WHERE customerid = $1', [id]);
    res.json(result.rows[0]);
});

// ✏️ Update profile
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { customersector, customerdescription } = req.body;

    await pool.query(
        'UPDATE customer SET customersector = $1, customerdescription = $2 WHERE customerid = $3',
        [customersector, customerdescription, id]
    );

    res.json({ message: 'Profile updated' });
});

// 🖼️ Update photo
router.post('/photo/:id', upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    const imageUrl = `/uploads/${file.filename}`;

    // Optionally: save image to cloud, not just local
    await pool.query(
        'UPDATE customer SET customerphotourl = $1 WHERE customerid = $2',
        [imageUrl, id]
    );

    res.json({ imageUrl });
});

module.exports = router;
