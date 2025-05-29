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

const supabase = new SupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const bucket = process.env.SUPABASE_BUCKET || 'default-bucket';

const upload = multer({ dest: 'uploads/' });

// ✅ Get profile
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customer WHERE customerid = $1', [id]);
    res.json(result.rows[0]);
});

// ✏ Update profile
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { customersector, customerdescription } = req.body;

    await pool.query(
        'UPDATE customer SET customersector = $1, customerdescription = $2 WHERE customerid = $3',
        [customersector, customerdescription, id]
    );

    res.json({ message: 'Profile updated' });
});

// 🖼 Update photo
router.post('/photo/:id', upload.single('photo'), async (req, res) => {
try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const filename = ${Date.now()}-${req.file.originalname};
    const objectPath = customers/${id}/${filename};
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(BUCKET)
      .upload(objectPath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw uploadError;
    }
    const { publicURL, error: urlError } = supabase
      .storage
      .from()
      .getPublicUrl(uploadData.path);

    if (urlError) {
      console.error('Error generating public URL:', urlError);
      throw urlError;
    }

    const updateQuery = `
      UPDATE customer
      SET customerphotourl = $1
      WHERE customerid = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [publicURL, id]);

    res.json({
      message: 'Upload successful',
      customer: rows[0],
      publicURL
    });

  } catch (error) {
    console.error('Error in /photo/:id:', error);
    res.status(500).json({ error: error.message || error });
  }
});

module.exports = router;
