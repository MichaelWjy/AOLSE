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

// Fungsi untuk kirim email reset password
async function sendResetEmail(email, token) {
  // Konfigurasi transporter (gunakan email valid dari ENV)
    const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // contoh: 'sandbox.smtp.mailtrap.io'
    port: parseInt(process.env.EMAIL_PORT),  // contoh: 2525
    auth: {
        user: process.env.EMAIL_USER,     // user Mailtrap kamu
        pass: process.env.EMAIL_PASS,     // password Mailtrap kamu
    },
});
    // const transporter = nodemailer.createTransport({
    // service: "gmail",
    // auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    // },
    // });

    const resetLink = `http://localhost:3001/reset-password/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Link",
        html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetLink}">link</a> to set a new password. This link is valid for 10 minutes.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
}

// Route forgot password
router.post("/request-reset-password", async (req, res) => {
    const { email } = req.body;

    try {
        let user = null;
        let role = null;

    // Cari user di seller
        const sellerResult = await pool.query(
            "SELECT companyid AS id, companyemail AS email FROM company WHERE companyemail = $1",
            [email]
        );
        if (sellerResult.rows.length > 0) {
            user = sellerResult.rows[0];
            role = "seller";
        } else {
      // Cari di buyer
            const buyerResult = await pool.query(
            "SELECT customerid AS id, customeremail AS email FROM customer WHERE customeremail = $1",
            [email]
        );
        if (buyerResult.rows.length > 0) {
            user = buyerResult.rows[0];
            role = "buyer";
        }
    }

    if (!user) {
      // Untuk keamanan, jangan kasih tau user tidak ada
        return res
            .status(200)
            .json({
                message: "If email is registered, you will receive a reset link.",
            });
        }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
    await pool.query(
        `INSERT INTO password_reset_tokens (user_id, role, token, expires_at) VALUES ($1, $2, $3, $4)`,
        [user.id, role, token, expiresAt]
    );

    await sendResetEmail(email, token);

    res
        .status(200)
        .json({
            message: "If email is registered, you will receive a reset link.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const tokenResult = await pool.query(
            `SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const { user_id, role } = tokenResult.rows[0];

      // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password di tabel sesuai role
        if (role === "seller") {
            await pool.query(
            `UPDATE company SET companypassword = $1 WHERE companyid = $2`,
            [hashedPassword, user_id]
            );
        } else if (role === "buyer") {
            await pool.query(
            `UPDATE customer SET customerpassword = $1 WHERE customerid = $2`,
            [hashedPassword, user_id]
            );
        } else {
            return res.status(400).json({ error: "Invalid role" });
        }

      // Hapus token setelah dipakai
        await pool.query(`DELETE FROM password_reset_tokens WHERE token = $1`, [token]);

        res.json({ message: "Password has been reset successfully" });
        } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Internal Server Error" });
        }
});

module.exports = router;