import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "../Css/companyList.module.css";

export default function CompanyList() {
const [companies, setCompany] = useState([]);
const navigate = useNavigate();
useEffect(() => {
    
    const fetchCompany = async () => {
        try {
            const token = localStorage.getItem("token"); // Ambil token dari localStorage atau sumber penyimpanan lainnya
            if (!token) {
                throw new Error("No token found! Please log in.");
            }

            const response = await fetch("http://localhost:3000/api/customer/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Tambahkan token di header Authorization
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("testestes");
            setCompany(data);
        } catch (err) {
            console.error("Error fetching company:", err);
        }
    };

    fetchCompany();
    
}, []);
async function handleMessage(company) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userID"); // pastikan ini diset saat login

    console.log("token:", token);
    console.log("role:", role);
    console.log("id:", userId);

    if (!token || !userId || !company) {
        console.error("Missing required data");
        return;
    }

    // Payload disesuaikan dengan role, dan company adalah target
    const payload =role === "seller"  ? { seller_id: userId, buyer_id: company.CustomerID || company.CompanyID }  : { buyer_id: userId, seller_id: company.CustomerID || company.CompanyID };

    try {
        const res = await fetch("https://aolse-production.up.railway.app/api/chat/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok)
            throw new Error(`Failed to start chat. Status: ${res.status}`);

        const room = await res.json();
        navigate(`/chat/${room.id}`); // sesuaikan dengan struktur response
    } catch (err) {
        console.error("Error starting chat room:", err);
    }
}


return (
    <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
            {companies.map((company) => (
                <div key={company.CompanyID} className={styles.card}>
                    <div className={styles.header}>
                        <img
                            src={
                                company.CompanyPhotoURL || "https://via.placeholder.com/100"
                            }
                            alt={company.CompanyName}
                            className={styles.profileImg}
                        />
                    </div>
                    <div className={styles.content}>
                        <div className={styles.contentText}>
                            <h2 className={styles.name}>{company.CompanyName}</h2>
                            <p className={styles.country}>{company.CompanyAddress}</p>
                            <p className={styles.sector}>
                                Sector:{" "}
                                {company.CompanySector?.map((sector, index) => (
                                    <span key={index} className={styles.sectorItem}>
                                        {sector}
                                        {index < company.CompanySector.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </p>
                        </div>
                        <div className={styles.buttons}>
                            <Link to={`/customer/${company.CompanyID}`}>
                                <button className={styles.button}>Details</button>
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <Footer />
    </div>
);
}
