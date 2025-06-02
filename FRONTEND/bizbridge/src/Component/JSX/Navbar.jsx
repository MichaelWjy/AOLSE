import React, { useState, useEffect } from "react";
import styles from "../Css/Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const role = localStorage.getItem("role");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim() === "") {
                setResults([]);
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("https://aolse-production.up.railway.app/api/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ query, role }),
                });

                const data = await res.json();
                setResults(data);
                setShowResults(true);
            } catch (err) {
                console.error("Search error:", err);
                setResults([]);
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchResults();
        }, 300); 

        return () => clearTimeout(delayDebounce);
    }, [query, role]); 


    const handleResultClick = (id) => {
        setQuery("");
        setShowResults(false);
        if (role === "buyer") {
            navigate(`/customer/${id}`);
        } else if (role === "seller") {
            navigate(`/customer/${id}`);
        }
    };

const renderSearchResults = () => {
    if (!showResults || query.trim() === "") {
        return null;
    }

    if (results.length === 0) {
        return (
            <ul className={styles.searchResults}>
                <li className={styles.resultItem}>No Result Found!</li>
            </ul>
        );
    }

    return (
        <ul className={styles.searchResults}>
            {results.map((item) => (
                <li key={item.id} onMouseDown={() => handleResultClick(item.id)} className={styles.resultItem}>
                    <img src={item.photo || "/default-profile.png"} alt="profile" className={styles.resultPhoto} />
                    <div className={styles.resultInfo}>
                        <div className={styles.resultName}>{item.name}</div>
                        <div className={styles.resultSector}>
                            {Array.isArray(item.sector) ? item.sector.join(", ") : item.sector}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

    return (
        <header className={styles.navbar}>
            <div className={styles.logoSection}>
                <img src="/logoPutih.png" alt="BizBridge Logo" className={styles.logo} />
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search companies or products here..."
                    className={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {renderSearchResults()}
            </div>

            <nav className={styles.navLinks}>
                <Link to="/home">Home</Link>
                {role === "buyer" ? (
                    <Link to="/company">Company</Link>
                ) : (
                    <Link to="/customer">Customer</Link>
                )}
                <Link to="/message">Message</Link>
                <Link to="/account">Account</Link>
            </nav>
        </header>
    );
}
