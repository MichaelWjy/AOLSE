import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Select from "react-select";
import styles from "../Css/acc.module.css";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [sectors, setSectors] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSectors = async () => {
      try {
        const response = await fetch(
          "https://aolse-production.up.railway.app/api/sector/sectors"
        );
        const data = await response.json();
        setAllSectors(data);
      } catch (error) {
        console.error("Failed to fetch sectors:", error);
      }
    };

    fetchSectors();

    fetch("https://aolse-production.up.railway.app/api/profile/check-profile", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setDescription(data.description || "");
        setSectors(data.sectors || []);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setUser(null);
      });
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    await fetch("https://aolse-production.up.railway.app/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`https://aolse-production.up.railway.app/api/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerdescription: description,
          customersector: sectors,
        }),
      });

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Profile update failed.");
    }

    if (photoFile) {
      try {
        const formData = new FormData();
        formData.append("photo", photoFile);

        const res = await fetch(
          `https://aolse-production.up.railway.app/api/profile/photo/${user.id}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const { imageUrl } = await res.json();
        setUser((prev) => ({ ...prev, photoURL: imageUrl }));
      } catch (err) {
        console.error("Failed to upload photo:", err);
        alert("Photo upload failed.");
      }
    }

    setEditing(false);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Loading profile...</div>
      </>
    );
  }
  const role = localStorage.getItem("role");
  if (role === "buyer") {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.profileHeader}>
            <div className={styles.greenBackground}></div>
            <div className={styles.pfpWrapper}>
              <label
                className={`${styles.pfpHoverArea} ${
                  editing ? styles.editing : ""
                }`}
              >
                <img
                  src={user.photoURL || "/defaultpfp.jpg"}
                  alt="Profile"
                  className={styles.pfpImage}
                />
                {editing && (
                  <>
                    <div className={styles.editOverlay}>Edit Photo</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />
                  </>
                )}
              </label>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.profileInfo}>
              <h2>{user.username}</h2>
              <p>{user.country}</p>
            </div>

            <div className={styles.sector}>
              <span>Sector:</span>
              {editing ? (
                <Select
                  isMulti
                  options={allSectors.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  value={sectors.map((s) => ({ value: s, label: s }))}
                  onChange={(selectedOptions) => {
                    if (selectedOptions.length <= 3) {
                      setSectors(selectedOptions.map((o) => o.value));
                    }
                  }}
                  closeMenuOnSelect={false}
                  isClearable={false}
                  placeholder="Select up to 3 sectors"
                />
              ) : sectors.length > 0 ? (
                <span>{sectors.join(", ")}</span>
              ) : (
                <span>N/A</span>
              )}
            </div>

            <div className={styles.description}>
              <h3>Description:</h3>
              {editing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              ) : (
                <p>{description || "No description yet."}</p>
              )}
            </div>

            <div className={styles["editbtn"]}>
              {editing ? (
                <button onClick={handleSave}>Save</button>
              ) : (
                <button onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>

            <div className={styles.logoutbtn}>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (role === "seller") {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.profileHeaderSeller}>
            <div className={styles.pfpWrapperSeller}>
              <label
                className={`${styles.pfpHoverAreaSeller} ${
                  editing ? styles.editing : ""
                }`}
              >
                <img
                  src={user.photoURL || "/defaultpfp.jpg"}
                  alt="Profile"
                  className={styles.pfpImageSeller}
                />
                {editing && (
                  <>
                    <div className={styles.editOverlaySeller}>Edit Photo</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />
                  </>
                )}
              </label>
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.profileInfo}>
              <h2>{user.username}</h2>
              <p>{user.country}</p>
            </div>

            <div className={styles.sector}>
              <span>Sector:</span>
              {editing ? (
                <Select
                  isMulti
                  options={allSectors.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  value={sectors.map((s) => ({ value: s, label: s }))}
                  onChange={(selectedOptions) => {
                    if (selectedOptions.length <= 3) {
                      setSectors(selectedOptions.map((o) => o.value));
                    }
                  }}
                  closeMenuOnSelect={false}
                  isClearable={false}
                  placeholder="Select up to 3 sectors"
                />
              ) : sectors.length > 0 ? (
                <span>{sectors.join(", ")}</span>
              ) : (
                <span>N/A</span>
              )}
            </div>

            <div className={styles.description}>
              <h3>Description:</h3>
              {editing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              ) : (
                <p>{description || "No description yet."}</p>
              )}
            </div>

            <div className={styles["editbtn"]}>
              {editing ? (
                <button onClick={handleSave}>Save</button>
              ) : (
                <button onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>

            <div className={styles.logoutbtn}>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
