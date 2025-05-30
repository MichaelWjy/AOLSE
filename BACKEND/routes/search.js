const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
router.post("/", async (req, res) => {
    const { query, role } = req.body;

    if (!query || !role) {
        return res.status(400).json({ error: "Query and role are required." });
    }

    try {
        let sql = "";
        if (role === "buyer") {
            sql = `
                SELECT
                co.companyid AS id,
                co.companyname AS name,
                co.companydescription AS description,
                co.companyphotourl AS photo,
                ARRAY_AGG(s.name) AS sectors
                FROM company co
                LEFT JOIN seller_sectors ss ON co.companyid = ss.seller_id
                LEFT JOIN sectors s ON ss.sector_id = s.id
                WHERE LOWER(co.companyname) LIKE LOWER($1)
                GROUP BY co.companyid, co.companyname, co.companydescription, co.companyphotourl
                LIMIT 10;
            `;
        } else if (role === "seller") {
            sql = `
                SELECT
                c.customerid AS id,
                c.customername AS name,
                c.customerphotourl AS photo,
                c.customerdescription AS description,
                ARRAY_AGG(s.name) AS sectors
                FROM customer c
                LEFT JOIN buyer_sectors bs ON c."customerid" = bs.buyer_id
                LEFT JOIN sectors s ON bs.sector_id = s.id
                WHERE LOWER(c."customername") LIKE LOWER($1)
                GROUP BY c."customerid", c."customername", c."customerphotourl", c."customerdescription"
                LIMIT 10
            `;
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }

        const results = await pool.query(sql, [`%${query}%`]);
        res.json(results.rows);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
