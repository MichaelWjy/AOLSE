const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authenticate")
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

router.post("/register", async (req, res) => {
const {
    username,
    email,
    password,
    role,
    companyName,
    companyAddress,
    selectedSectors,
    country,
} = req.body;

try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "seller") {
        const companyResult=await pool.query(
            `INSERT INTO company (username, companyemail, companypassword, companyname, companyaddress)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING companyid`
            ,
            [username, email, hashedPassword, companyName, companyAddress]
        );
        const companyID = companyResult.rows[0].companyid;
        if (selectedSectors.length > 3) {
            return res.status(400).json({ error: "You can select up to 3 sectors only." });
        }
        for (const sectorId of selectedSectors) {
            await pool.query(
                `INSERT INTO seller_sectors (seller_id, sector_id) VALUES ($1, $2)`,
                [companyID, sectorId]
            );
        }
    }else if(role === "buyer") {
            const customerResult=await pool.query(
            `INSERT INTO customer (customername, customeremail, customerpassword, customercountry)
            VALUES ($1, $2, $3, $4)
            RETURNING customerid`,
            
            [username, email, hashedPassword, country]
        );
        const customerId = customerResult.rows[0].customerid;
        if (selectedSectors.length > 3) {
            return res.status(400).json({ error: "You can select up to 3 sectors only." });
        }
        for (const sectorId of selectedSectors) {
            await pool.query(
                `INSERT INTO buyer_sectors (buyer_id, sector_id) VALUES ($1, $2)`,
                [customerId, sectorId]
            );
        }
    }else{
        return res.status(400).json({ error: "Invalid role" });
    }
        res.status(201).json({ message: "Account created successfully" });
    }catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = null;
        let role = null;

        const sellerResult = await pool.query(
            "SELECT * FROM company WHERE companyemail = $1",
            [email]
        );

        if (sellerResult.rows.length > 0) {
            user = sellerResult.rows[0];
            role = "seller";
        } else {
            const buyerResult = await pool.query(
                "SELECT * FROM customer WHERE customeremail = $1",
                [email]
            );

            if (buyerResult.rows.length > 0) {
                user = buyerResult.rows[0];
                role = "buyer";
            }
        }

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const hashedPassword = role === "seller" ? user.companypassword : user.customerpassword;
        const valid = await bcrypt.compare(password, hashedPassword);
        if (!valid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const userId = role === "seller" ? user.companyid : user.customerid;
        const username = role === "seller" ? user.companyname : user.customername;
        const userEmail = role === "seller" ? user.companyemail : user.customeremail;


        const token = jwt.sign(
            { id: userId, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: userId,
                username,
                email: userEmail,
                role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// function verifyToken(req, res, next) {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "No token provided" });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(403).json({ error: "Invalid token" });
//         req.user = decoded;
//         next();
//     });
// }

router.post("/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Token logout:", token);

    res.status(200).json({ message: "Logout successful" });
});


router.get("/me", verifyToken, async (req, res) => {
    const customerId = req.user.id;
    const result = await pool.query(
        "SELECT CustomerDescription, CustomerSector, CustomerPhotoURL FROM Customer WHERE CustomerID = $1",
        [customerId]
    );
    res.json(result.rows[0]);
});

router.put("/update", verifyToken, async (req, res) => {
    const customerId = req.user.id;
    const { CustomerDescription, CustomerSector, CustomerPhotoURL } = req.body;

    await pool.query(
        "UPDATE Customer SET CustomerDescription = $1, CustomerSector = $2, CustomerPhotoURL = $3 WHERE CustomerID = $4",
        [CustomerDescription, CustomerSector, CustomerPhotoURL, customerId]
    );

    res.json({ message: "Profil berhasil diperbarui" });
});


module.exports = router;
