const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();
const verifyToken = require("../middleware/authenticate");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});


// GET /api/customer - Get all buyers with sector list
router.get("/",verifyToken, async (req, res) => {
    const role = req.user.role;
    let result;
    let sectorResult;
    try {
        if (role==="seller") {
            result = await pool.query(`
                SELECT 
                    c.customerid, 
                    c.customername, 
                    c.customercountry, 
                    c.customerphotourl
                FROM customer c
            `);
    
            const buyers = result.rows;
            sectorResult = await pool.query(`
                SELECT 
                    bs.buyer_id, 
                    s.name AS sector_name
                FROM buyer_sectors bs
                JOIN sectors s ON bs.sector_id = s.id
            `);
    
            const sectorMap = {};
            sectorResult.rows.forEach(row => {
                if (!sectorMap[row.buyer_id]) {
                    sectorMap[row.buyer_id] = [];
                }
                sectorMap[row.buyer_id].push(row.sector_name);
            });
    
            const resultFinal = buyers.map(buyer => ({
                CustomerID: buyer.customerid,
                CustomerName: buyer.customername,
                CustomerCountry: buyer.customercountry,
                CustomerPhotoURL: buyer.customerphotourl,
                CustomerSector: sectorMap[buyer.customerid] || [],
            }));
    
            res.json(resultFinal);
        }else if(role==="buyer"){
            result = await pool.query(`
                SELECT 
                    c.companyid, 
                    c.companyname, 
                    c.companyaddress, 
                    c.companyphotourl
                FROM company c
            `);
    
            const sellers = result.rows;
            sectorResult = await pool.query(`
                SELECT 
                    ss.seller_id, 
                    s.name AS sector_name
                FROM seller_sectors ss
                JOIN sectors s ON ss.sector_id = s.id
            `);
    
            const sectorMap = {};
            sectorResult.rows.forEach(row => {
                if (!sectorMap[row.seller_id]) {
                    sectorMap[row.seller_id] = [];
                }
                sectorMap[row.seller_id].push(row.sector_name);
            });
    
            const resultFinal = sellers.map(seller => ({
                CompanyID: seller.companyid,
                CompanyName: seller.companyname,
                CompanyAddress: seller.companyaddress,
                CompanyPhotoURL: seller.companyphotourl,
                CompanySector: sectorMap[seller.companyid] || [],
            }));
            console.log(resultFinal)
    
            res.json(resultFinal);
        }
    } catch (err) {
        console.error("Error fetching buyers:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:id",verifyToken,async (req, res)=>{
    const role = req.user.role;
    const id = req.params.id;


    try{
        let result;
        let sectoreResult;

        if (role === "buyer") {
            result = await pool.query(
                `SELECT companyid AS id, companyname AS username,
                        companyaddress AS address, companydescription AS description,
                        companyphotourl AS "photoURL"
                FROM company WHERE companyid = $1`,
                [id]
            );
            sectorResult = await pool.query(
                `SELECT s.name FROM seller_sectors ss 
                JOIN sectors s ON ss.sector_id = s.id 
                WHERE ss.seller_id = $1`,
                [id]
            );
            console.log("Fetched profile row:", result.rows[0]);
        } else if (role === "seller") {
            result = await pool.query(
                `SELECT customerid AS id, customername AS username,
                        customercountry AS country, customerdescription AS description,
                        customerphotourl AS "photoURL"
                FROM customer WHERE customerid = $1`,
                [id]
            );
            sectorResult = await pool.query(
                `SELECT s.name FROM buyer_sectors bs 
                JOIN sectors s ON bs.sector_id = s.id 
                WHERE bs.buyer_id = $1`,
                [id]
            );
        }else {
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
    }catch(err){
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



module.exports = router;
