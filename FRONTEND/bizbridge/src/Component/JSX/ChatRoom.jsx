import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from "./Navbar";
import styles from '../Css/chatRoom.module.css';

const ChatRoom = ({ userId, receiverId }) => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [receiverInfo, setReceiverInfo] = useState({ name: '', photoURL: '' });
  const [roomId, setRoomId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole'); // contoh ambil role dari localStorage

  // 🚨 Jika token tidak tersedia
  useEffect(() => {
    if (!token) {
      alert('Token missing. Please log in again.');
      return;
    }
  }, [token]);

  // 1. Dapatkan atau buat roomId dari backend
  useEffect(() => {
    console.log("userId:", userId);
  console.log("receiverId:", receiverId);
    if (!userId || !receiverId || !token) return;
    if (!userId || !receiverId || !token || userId === receiverId) return;
    const getOrCreateRoom = async () => {
      try {
        const res = await fetch('https://aolse-production.up.railway.app/api/chat/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            buyer_id: userRole === 'buyer' ? userId : receiverId,
            seller_id: userRole === 'seller' ? userId : receiverId,
          }),
        });
        if (!res.ok) throw new Error('Failed to get or create chat room');
        const data = await res.json();
        setRoomId(data.id);
      } catch (error) {
        console.error(error);
      }
    };

    getOrCreateRoom();
  }, [userId, receiverId, token, userRole]);

  // 2. Fetch messages menggunakan roomId
  useEffect(() => {
    if (!roomId || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`https://aolse-production.up.railway.app/api/chat/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, [roomId, token]);

  // 3. Fetch info penerima chat menggunakan roomId
  useEffect(() => {
    if (!roomId || !token) return;

    const fetchReceiverInfo = async () => {
      try {
        const res = await fetch(`https://aolse-production.up.railway.app/api/chat/info/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch receiver info');
        const data = await res.json();
        setReceiverInfo(data.receiver);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReceiverInfo();
  }, [roomId, token]);

  // 4. Setup koneksi socket dan join room menggunakan roomId
  useEffect(() => {
    if (!roomId || !token) return;

    socketRef.current = io('https://aolse-production.up.railway.app', {
      auth: { token },
    });

    socketRef.current.emit('joinRoom', { roomId });

    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, token]);

  // 5. Fungsi kirim pesan
  const sendMessage = () => {
    if (input.trim() && socketRef.current && roomId) {
      const messagePayload = {
        chat_room_id: roomId,
        sender_role: userRole, // 'buyer' atau 'seller'
        sender_id: userId,
        content: input.trim(),
        file_url: null,
        file_name: null,
        file_size: null,
      };

      // Emit pesan ke socket server
      socketRef.current.emit('sendMessage', messagePayload);

      // Update UI lokal
      setMessages((prev) => [...prev, messagePayload]);
      setInput('');

      // Simpan ke database lewat API
      fetch("https://aolse-production.up.railway.app/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      }).catch((err) => {
        console.error("Failed to save message to DB:", err);
      });
    }
  };

  // Scroll otomatis ke bawah saat ada pesan baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.header}>
        <img
          src={receiverInfo.photoURL || "/default-avatar.jpg"}
          alt="avatar"
          className={styles.avatar}
        />
        <h2 className={styles.username}>{receiverInfo.name || "Loading..."}</h2>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender_id === userId;
          return (
            <div
              key={index}
              className={`${styles.messageRow} ${isOwnMessage ? styles.messageRowRight : styles.messageRowLeft}`}
            >
              {!isOwnMessage && (
                <img
                  src={msg.sender_photo || "/default-avatar.jpg"}
                  alt="sender"
                  className={styles.messageAvatar}
                />
              )}
              <div className={styles.messageBubble}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
