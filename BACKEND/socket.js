module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('joinRoom', ({ chatRoomId }) => {
            socket.join(`room-${chatRoomId}`);
        });
    
        socket.on('sendMessage', (message) => {
          // Broadcast ke room
            io.to(`room-${message.chat_room_id}`).emit('newMessage', message);
        });
    
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
