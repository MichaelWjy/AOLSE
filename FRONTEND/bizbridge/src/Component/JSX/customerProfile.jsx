import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import styles from "../Css/customerProfile.module.css";

export default function CustomerProfile() {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [description, setDescription] = useState("");
  const [sectors, setSectors] = useState([]);

useEffect(() => {
  const token = localStorage.getItem("token");

  fetch(`https://aolse-production.up.railway.app/api/customer/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    })
    .then((data) => setUser(data))
    .catch((err) => {
      console.error("Failed to fetch customer profile:", err);
    });
}, [id]);

  useEffect(() => {
    if (user) {
      setDescription(user.description || "");
      setSectors(user.sectors || []);
    }
  }, [user]);

  async function handleMessage() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userID"); // pastikan ini diset saat login
    console.log("token:",token);
    console.log("role:",role);
    console.log("id:",userId);
    if (!token || !userId || !user) {
      console.error("Missing required data");
      return;
    }

    const payload = role === "seller"
      ? { seller_id: userId, buyer_id: user.id }
      : { buyer_id: userId, seller_id: user.id };

    try {
      const res = await fetch("https://aolse-production.up.railway.app/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Failed to start chat. Status: ${res.status}`);

      const room = await res.json();
      navigate(`/chat/${room.id}`); // ganti `room.id` sesuai dengan struktur response
    } catch (err) {
      console.error("Error starting chat room:", err);
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Loading profile...</div>
      </>
    );
  }

  const role = localStorage.getItem("role");

  if (role === "seller") {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.profileHeader}>
            <div className={styles.greenBackground}></div>
            <div className={styles.pfpWrapper}>
              <img
                src={user.photoURL || "/defaultpfp.jpg"}
                alt="Profile"
                className={styles.pfpImage}
              />
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.profileInfo}>
              <div className={styles.info}>
                <h2>{user.username}</h2>
                <p>{user.country}</p>
              </div>
              <div className={styles.Buyerbutton}>
                <button className={styles.BuyermessageButton} onClick={handleMessage}>
                  Message
                </button>
              </div>
            </div>

            <div className={styles.sector}>
              <span>Sector:</span>
              {sectors && sectors.length > 0 ? (
                <span>{sectors.join(", ")}</span>
              ) : (
                <span>N/A</span>
              )}
            </div>

            <div className={styles.description}>
              <h3>Description:</h3>
              <p>{description || "No description yet."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (role === "buyer") {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.profileHeaderSeller}>
            <div className={styles.pfpWrapperSeller}>
              <img
                src={user.photoURL || "/defaultpfp.jpg"}
                alt="Profile"
                className={styles.pfpImageSeller}
              />
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.profileInfo}>
              <h2>{user.username}</h2>
              <p>{user.country}</p>
              <div className={styles.button}>
                <button className={styles.messageButton} onClick={handleMessage}>
                  Message
                </button>
              </div>
            </div>

            <div className={styles.sector}>
              <span>Sector:</span>
              {sectors && sectors.length > 0 ? (
                <span>{sectors.join(", ")}</span>
              ) : (
                <span>N/A</span>
              )}
            </div>

            <div className={styles.description}>
              <h3>Description:</h3>
              <p>{description || "No description yet."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Unknown role</div>
      </>
    );
  }
}
