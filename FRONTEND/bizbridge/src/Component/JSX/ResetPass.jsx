import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../Css/Forgot.module.css"

export default function Reset() {

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // Ambil token dari url param
    const { token } = useParams();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const res = await fetch("https://aolse-production.up.railway.app/api/forgotPass/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                setTimeout(() => {
                    navigate("/");
                }, 3001); // Redirect ke login setelah 3 detik
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            setError("Server error");
        }
    };
    return (
        <div className={styles.container}>
            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="" />
                <h1>Reset Password</h1>
                <form onSubmit={handleSubmit}>
                    <p>New Password<span style={{ color: "red" }}>*</span></p>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <p>Confirm Password<span style={{ color: "red" }}>*</span></p>
                    <input type="password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} required />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}
                    <div className={styles.forgotButton}>
                        <button type="submit">Reset Password</button>
                    </div>
                </form>
            </section>
        </div>
    );
}