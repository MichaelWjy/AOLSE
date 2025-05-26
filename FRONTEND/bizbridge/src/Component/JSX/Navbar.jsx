import React from "react";
import styles from "../Css/Navbar.module.css"
import { Link } from "react-router-dom";

export default function Navbar() {
    const role = localStorage.getItem("role");
    if (role === "buyer") {
        return (
            <header className={styles.navbar}>
                <div className={styles.logoSection}>
                    <img src="/logoPutih.png" alt="BizBridge Logo" className={styles.logo} />
                </div>
                <input
                    type="search"
                    placeholder="Search companies or products here..."
                    className={styles.searchInput}

                />
                <nav className={styles.navLinks}>
                    <Link to="/home">Home</Link>
                    <Link to="/company">Company</Link>
                    <Link to="/message">Message</Link>
                    <Link to="/account">Account</Link>
                </nav>
            </header>
        );
    } else if (role === "seller") {
        return (
            <header className={styles.navbar}>
                <div className={styles.logoSection}>
                    <img src="/logoPutih.png" alt="BizBridge Logo" className={styles.logo} />
                </div>
                <input
                    type="search"
                    placeholder="Search companies or products here..."
                    className={styles.searchInput}

                />
                <nav className={styles.navLinks}>
                    <Link to="/home">Home</Link>
                    <Link to="/customer">Customer</Link>
                    <Link to="/message">message</Link>
                    <Link to="/account">Account</Link>
                </nav>
            </header>
        );
    }
}