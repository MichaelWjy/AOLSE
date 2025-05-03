import React from "react";
import styles from "./Css/Navbar.module.css"

function Navbar() {
    return (
        <header className={styles.navbar}>
            <div className={styles.logoSection}>
                <img src="/logoPutih.png" alt="BizBridge Logo" className={styles.logo} />
                <span className={styles.logoText}>BIZBRIDGE</span>
            </div>
            <input
                type="search"
                placeholder="Search companies or products here..."
                className={styles.searchInput}

            />
            <nav className={styles.navLinks}>
                <a href="#">Home</a>
                <a href="#">Company</a>
                <a href="#">Manage</a>
                <a href="#">Account</a>
            </nav>
        </header>
    );
}

export default Navbar;