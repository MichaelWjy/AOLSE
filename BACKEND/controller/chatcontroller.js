const { Pool } = require("pg");
require("dotenv").config();
const verifyToken = require('../middleware/authenticate');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});


exports.createOrGetRoom = async (req, res) => {
  try {
      const { buyer_id, seller_id } = req.body;
      console.log("createOrGetRoom req.body:", req.body);
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    if (!buyer_id || !seller_id) {
      return res.status(400).json({ message: "buyer_id and seller_id are required" });
    }
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);
// if (buyer_id === seller_id) {
//   return res.status(400).json({ error: "buyer_id and seller_id cannot be the same" });
// }
    // Cek buyer_id ada di tabel customer
    const buyerCheck = await pool.query(
      `SELECT customerid FROM customer WHERE customerid = $1`,
      [buyer_id]
    );
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    if (buyerCheck.rows.length === 0) {
      return res.status(400).json({ message: `Buyer with id ${buyer_id} not found` });
    }
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    // Cek seller_id ada di tabel company (atau seller sesuai skema kamu)
    const sellerCheck = await pool.query(
      `SELECT companyid FROM company WHERE companyid = $1`,
      [seller_id]
    );
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    if (sellerCheck.rows.length === 0) {
      return res.status(400).json({ message: `Seller with id ${seller_id} not found` });
    }
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    // Cari dulu room
    const result = await pool.query(
      `SELECT * FROM chat_rooms WHERE buyer_id = $1 AND seller_id = $2`,
      [buyer_id, seller_id]
    );
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    if (result.rows.length > 0) return res.json(result.rows[0]);
      console.log("Buyer ID:", buyer_id, "Seller ID:", seller_id);

    // Insert room baru
    const insert = await pool.query(
      `INSERT INTO chat_rooms (buyer_id, seller_id) VALUES ($1, $2) RETURNING *`,
      [buyer_id, seller_id]
    );
    res.json(insert.rows[0]);
  } catch (err) {
    console.error("createOrGetRoom error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.sendMessage = async (req, res, io) => {
    const {
        chat_room_id,
        sender_role,
        sender_id,
        content,
        file_url,
        file_name,
        file_size,
    } = req.body;

    const result = await pool.query(
        `INSERT INTO messages (chat_room_id, sender_role, sender_id, content, file_url, file_name, file_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [chat_room_id, sender_role, sender_id, content, file_url, file_name, file_size]
    );

    await pool.query(
        `UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [chat_room_id]
    );

    // Emit pesan ke Socket.IO room yang sesuai
    const message = result.rows[0];
    io.to(`room_${chat_room_id}`).emit("receiveMessage", message);

    res.json(message);
};

exports.getMessages = async (req, res) => {
    const { roomId } = req.params;

    const result = await pool.query(
        `SELECT * FROM messages WHERE chat_room_id = $1 ORDER BY sent_at ASC`,
        [roomId]
    );

    res.json(result.rows);
};

exports.getInfo = async (req, res) => {
    const roomId = req.params.id;
    console.log("req.params:", req.params);
    const user = req.user; // hasil dari middleware verifyToken
    console.log("req.user:", user);
    console.log("roomId:", roomId);

    const { id: sender_id, role: sender_role, name: sender_name, photo_url: sender_photo } = user;

    try {
        const roomRes = await pool.query(`SELECT * FROM chat_rooms WHERE id = $1`, [roomId]);
        console.log("roomRes.rows:", roomRes.rows);

        if (roomRes.rows.length === 0) {
            return res.status(404).json({ message: "Chat room not found" });
        }

        const room = roomRes.rows[0];
        let receiver_id;
        let receiverQuery = "";

        if (sender_role === "buyer") {
            receiver_id = room.seller_id;
            receiverQuery = `SELECT companyname AS name, companyphotourl AS photo_url FROM company WHERE companyid = $1`;
        } else if (sender_role === "seller") {
            receiver_id = room.buyer_id;
            receiverQuery = `SELECT customername AS name, customerphotourl AS photo_url FROM customer WHERE customerid = $1`;
        } else {
            return res.status(400).json({ message: "Invalid sender role" });
        }

        console.log("receiver_id:", receiver_id);
        const receiverRes = await pool.query(receiverQuery, [receiver_id]);
        console.log("receiverRes.rows:", receiverRes.rows);

        if (receiverRes.rows.length === 0) {
            return res.status(404).json({ message: "Receiver not found" });
        }

        res.json({
            sender: {
                name: sender_name,
                photo_url: sender_photo
            },
            receiver: receiverRes.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
