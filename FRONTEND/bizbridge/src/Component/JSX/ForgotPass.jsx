import React, { useState } from "react";
import styles from "../Css/Forgot.module.css"

export default function Forgot() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!email) {
            setError("Email harus diisi");
            return;
        }

        try {
            const response = await fetch("https://aolse-production.up.railway.app/api/forgotPass/request-reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Link reset password sudah dikirim ke email Anda");
            } else {
                setError(data.error || "Gagal mengirim link reset password");
            }
        } catch (err) {
            setError("Terjadi kesalahan pada server");
        }
    };

    return (
        <div className={styles.container}>
            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="" />
                <h1>Forgot Password</h1>
                <form onSubmit={handleSubmit}>
                    <p>Email<span style={{ color: "red" }}>*</span></p>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Input Your Email" />
                    <div className={styles.forgotButton}>
                        <button type="submit">Forgot Password</button>
                    </div>
                </form>
                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </section>
        </div>
    );
}
