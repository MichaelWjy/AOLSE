const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// 🔐 Register
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
        await pool.query(
            `INSERT INTO company (username, companyemail, companypassword, companyname, companyaddress)
            VALUES ($1, $2, $3, $4, $5)`,
            [username, email, hashedPassword, companyName, companyAddress]
        );
    }else if(role === "buyer") {
            await pool.query(
            `INSERT INTO customer (customername, customeremail, customerpassword, customercountry)
            VALUES ($1, $2, $3, $4)`,
            [username, email, hashedPassword, country]
        );
        const customerId = customerResult.rows[0].customerid;
        if (selectedSectors.length > 3) {
            return res.status(400).json({ error: "You can select up to 3 sectors only." });
        }
        for (const sectorId of selectedSectors) {
            await pool.query(
                `INSERT INTO customer_sectors (customer_id, sector_id) VALUES ($1, $2)`,
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

// 🔐 Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = null;
        let role = null;

        // Cari user di tabel sellers
        const sellerResult = await pool.query(
            "SELECT * FROM company WHERE companyemail = $1",
            [email]
        );

        if (sellerResult.rows.length > 0) {
            user = sellerResult.rows[0];
            role = "seller";
        } else {
            // Jika tidak ada di sellers, cari di buyers
            const buyerResult = await pool.query(
                "SELECT * FROM customer WHERE customeremail = $1",
                [email]
            );

            if (buyerResult.rows.length > 0) {
                user = buyerResult.rows[0];
                role = "buyer";
            }
        }

        // Jika user tidak ditemukan di kedua tabel
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


        // Generate JWT dengan payload id dan role
        const token = jwt.sign(
            { id: userId, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Kirim response berisi token dan info user (termasuk role)
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


// 🔒 Middleware: protect route
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

// 🛡 Contoh route protected
router.get("/profile", verifyToken, async (req, res) => {
    const role = req.user.role; // dari payload JWT
    const id = req.user.id;

    try {
        let result;
        if (role === "buyer") {
            result = await pool.query(
            "SELECT customername AS username, customercountry AS country, customerdescription AS description, customerphotourl AS photoURL FROM Customer WHERE CustomerID = $1",
            [id]
        );
            sectorResult = await pool.query(
                `SELECT s.name FROM buyer_sectors bs JOIN sectors s ON bs.sector_id = s.id WHERE bs.buyer_id = $1`,
                [id]
            );
        } else if (role === "seller") {
            result = await pool.query(
            "SELECT companyname as username, companyaddress AS country, companydescription AS description, companyphotourl AS photoURL FROM Company WHERE CompanyID = $1",
            [id]
            );
            sectorResult = await pool.query(
            `SELECT s.name FROM seller_sectors ss JOIN sectors s ON ss.sector_id = s.id WHERE ss.seller_id = $1`,
                [id]
            );
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }
        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Token logout:", token);

  // (Opsional) blacklist token di sini jika pakai Redis atau database

    res.status(200).json({ message: "Logout successful" });
});


module.exports = router;
