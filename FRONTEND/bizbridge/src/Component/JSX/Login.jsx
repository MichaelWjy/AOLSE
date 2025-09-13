import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import carouselSettings from "../LoginCarouselSetting";
import Slider from "react-slick";
import styles from "../Css/loginPage.module.css"
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const now = Date.now() / 1000;
                if (decoded.exp > now) {
                    navigate("/home");
                } else {
                    localStorage.removeItem("token");
                }
            } catch (e) {
                localStorage.removeItem("token");
            }
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("https://aolse-wheat.vercel.app/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.user.role);
                localStorage.setItem("userID", data.user.id);
                navigate("/home");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Server error");
            console.error("Login error:", err);
        }
    };


    return (
        <div className={styles.container}>
            <section className={styles.carouselSection}>
                <Slider {...carouselSettings}>
                    <div>
                        <img src="/loginCarousel1.png" alt="Slide 1" className={styles.carouselImage} />
                    </div>
                    <div>
                        <img src="/loginCarousel2.png" alt="Slide 2" className={styles.carouselImage} />
                    </div>
                    <div>
                        <img src="/loginCarousel3.png" alt="Slide 3" className={styles.carouselImage} />
                    </div>
                </Slider>
            </section>

            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="" />
                <h1>Log in to your Account</h1>
                <p>Welcome back! Select method to log in:</p>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Username" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Login</button>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}

                <div className={styles.loginInfo}>
                    <div className={styles.remember}>
                        <input type="checkbox" />
                        <p>Remember Me</p>
                    </div>
                    <Link to="/forgot">Forgot password?</Link>
                </div>
                <div className={styles.loginButton}>
                    <div className={styles.noAcc}>
                        <p>Don’t have an account? <Link to="/register">Click Here</Link></p>
                    </div>
                </div>
            </section>
        </div>

    );
}