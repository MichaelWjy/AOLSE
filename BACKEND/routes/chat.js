const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/authenticate");
const chatController = require('../controller/chatcontroller');

module.exports = (io) => {
    const router = express.Router();

    router.post("/start", chatController.createOrGetRoom);
    router.post("/message", (req, res) => chatController.sendMessage(req, res, io));
    router.get("/room/:roomId", chatController.getMessages);
    router.get("/info/:id", verifyToken,chatController.getInfo); // ini masih perlu diperbaiki di bawah
    
    return router;
};
