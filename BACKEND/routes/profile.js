// routes/profile.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});


// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = process.env.SUPABASE_BUCKET;
const storage = multer.memoryStorage(); // gunakan memoryStorage
const upload = multer({ storage: storage });

// Auth middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = decoded;
        next();
    });
}

// GET /api/auth/profile
router.get("/check-profile", verifyToken, async (req, res) => {
    const role = req.user.role; // dari payload JWT
    const id = req.user.id;

    try {
        let result;
        let sectorResult;

        if (role === "buyer") {
            result = await pool.query(
                `SELECT CustomerID AS id, CustomerName AS username, CustomerEmail AS email,
                        CustomerCountry AS country, CustomerDescription AS description,
                        CustomerPhotoURL AS photoURL
                FROM Customer WHERE CustomerID = $1`,
                [id]
            );
            sectorResult = await pool.query(
                `SELECT s.name FROM buyer_sectors bs 
                JOIN sectors s ON bs.sector_id = s.id 
                WHERE bs.buyer_id = $1`,
                [id]
            );
        } else if (role === "seller") {
            result = await pool.query(
                `SELECT CompanyID AS id, CompanyName AS username, CompanyEmail AS email,
                        CompanyAddress AS country, CompanyDescription AS description,
                        CompanyPhotoURL AS photoURL
                FROM Company WHERE CompanyID = $1`,
                [id]
            );
            sectorResult = await pool.query(
                `SELECT s.name FROM seller_sectors ss 
                JOIN sectors s ON ss.sector_id = s.id 
                WHERE ss.seller_id = $1`,
                [id]
            );
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }

        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];
        const sectors = sectorResult.rows.map(row => row.name);
        return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            country: user.country,
            description: user.description,
            photoURL: user.photoURL || null,
            sectors: sectors || [],
        });

    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/profile/:id - update description and sectors
router.put("/:id", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { customerdescription, customersector } = req.body;
    const role = req.user.role;

    try {
        // Update deskripsi
        if (role === "buyer") {
            await pool.query(
                `UPDATE Customer SET CustomerDescription = $1 WHERE CustomerID = $2`,
                [customerdescription, userId]
            );

            // Delete existing buyer_sectors
            await pool.query(`DELETE FROM buyer_sectors WHERE buyer_id = $1`, [userId]);

            // Get sector IDs
            const sectorRes = await pool.query(
                `SELECT id FROM sectors WHERE name = ANY($1)`,
                [customersector]
            );

            const sectorIds = sectorRes.rows.map(row => row.id);

            for (let sectorId of sectorIds) {
                await pool.query(
                    `INSERT INTO buyer_sectors (buyer_id, sector_id) VALUES ($1, $2)`,
                    [userId, sectorId]
                );
            }

        } else if (role === "seller") {
            await pool.query(
                `UPDATE Company SET CompanyDescription = $1 WHERE CompanyID = $2`,
                [customerdescription, userId]
            );

            // Delete existing seller_sectors
            await pool.query(`DELETE FROM seller_sectors WHERE seller_id = $1`, [userId]);

            // Get sector IDs
            const sectorRes = await pool.query(
                `SELECT id FROM sectors WHERE name = ANY($1)`,
                [customersector]
            );

            const sectorIds = sectorRes.rows.map(row => row.id);

            for (let sectorId of sectorIds) {
                await pool.query(
                    `INSERT INTO seller_sectors (seller_id, sector_id) VALUES ($1, $2)`,
                    [userId, sectorId]
                );
            }
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/profile/photo/:id - update profile photo
router.post("/photo/:id", verifyToken, upload.single("photo"), async (req, res) => {
    const id = req.user.id;
    const role = req.user.role;
    const file = req.file;

    // ✅ Gunakan nama tabel dan kolom ID yang sesuai dengan struktur Supabase
    const table = role === "buyer" ? "customer" : "company";
    const idColumn = role === "buyer" ? "customerid" : "companyid";

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const filename = `${table.toLowerCase()}_${id}_${Date.now()}`;
    const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return res.status(500).json({ error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
    const imageUrl = publicUrlData.publicUrl;
    const photoColumn = role === "buyer" ? "customerphotourl" : "companyphotourl";

    const { error: dbError } = await supabase
        .from(table)
        .update({ [photoColumn]: imageUrl })
        .eq(idColumn, id);

    if (dbError) {
        console.error("Database update error:", dbError.message);
        return res.status(500).json({ error: dbError.message });
    }

    return res.json({ imageUrl });
});


module.exports = router;
