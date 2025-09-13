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

    fetch(`https://aolse-wheat.vercel.app/api/customer/${id}`, {
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
    const myId = localStorage.getItem("userID");

    if (!token || !myId || !user) {
      console.error("Missing required data");
      return;
    }

    const otherUserId = user.CustomerID || user.CompanyID || user.id;

    if (!otherUserId) {
      console.error("Target user ID not found.");
      return;
    }

    const payload =
      role === "seller"
        ? { seller_id: myId, buyer_id: otherUserId }
        : { buyer_id: myId, seller_id: otherUserId };

    try {
      const res = await fetch("https://aolse-wheat.vercel.app/api/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to start chat. Status: ${res.status}`);

      const chatRoom = await res.json();
      navigate(`/chat/${myId}/${otherUserId}`);
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
