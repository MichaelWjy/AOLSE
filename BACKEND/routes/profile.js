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


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = process.env.SUPABASE_BUCKET;
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

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

router.get("/check-profile", verifyToken, async (req, res) => {
    const role = req.user.role;
    const id = req.user.id;

    try {
        let result;
        let sectorResult;

        if (role === "buyer") {
            result = await pool.query(
                `SELECT CustomerID AS id, CustomerName AS username, CustomerEmail AS email,
                        CustomerCountry AS country, CustomerDescription AS description,
                        CustomerPhotoURL AS "photoURL"
                FROM Customer WHERE CustomerID = $1`,
                [id]
            );
            sectorResult = await pool.query(
                `SELECT s.name FROM buyer_sectors bs 
                JOIN sectors s ON bs.sector_id = s.id 
                WHERE bs.buyer_id = $1`,
                [id]
            );
            console.log("Fetched profile row:", result.rows[0]);
        } else if (role === "seller") {
            result = await pool.query(
                `SELECT CompanyID AS id, CompanyName AS username, CompanyEmail AS email,
                        CompanyAddress AS country, CompanyDescription AS description,
                        CompanyPhotoURL AS "photoURL"
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

router.put("/:id", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { customerdescription, customersector } = req.body;
    const role = req.user.role;

    try {
        if (role === "buyer") {
            await pool.query(
                `UPDATE Customer SET CustomerDescription = $1 WHERE CustomerID = $2`,
                [customerdescription, userId]
            );

            await pool.query(`DELETE FROM buyer_sectors WHERE buyer_id = $1`, [userId]);

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

            await pool.query(`DELETE FROM seller_sectors WHERE seller_id = $1`, [userId]);

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

router.post("/photo/:id", verifyToken, upload.single("photo"), async (req, res) => {
    const id = req.user.id;
    const role = req.user.role;
    const file = req.file;

    const table = role === "buyer" ? "Customer" : "Company";
    const idColumn = role === "buyer" ? "CustomerID" : "CompanyID";
    const photoColumn = role === "buyer" ? "CustomerPhotoURL" : "CompanyPhotoURL";

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const filename = `${table.toLowerCase()}_${id}_${Date.now()}`;
        console.log("Uploading:", filename, file.mimetype, file.size);
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
    console.log("Public URL:", imageUrl);
    try {
        const {rows}=await pool.query(
            `UPDATE ${table} SET ${photoColumn} = $1 WHERE ${idColumn} = $2 RETURNING *`,
            [imageUrl, id]
        );
        console.log("Updated DB row:", rows[0]);
        return res.json({
            message: 'Upload successful',
            customer: rows[0],  
            imageUrl
        });
    } catch (dbErr) {
        console.error("Database update error:", dbErr.message);
        return res.status(500).json({ error: dbErr.message });
    }
});


module.exports = router;
