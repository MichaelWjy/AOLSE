import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "../Css/customerList.module.css";

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found! Please log in.");

            const response = await fetch("https://aolse-production.up.railway.app/api/customer/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                setCustomers(data);
            } catch (err) {
                console.error("Error fetching customers:", err);
            }
        };
    
        fetchCustomers();
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
        const payload =role === "seller" ? { seller_id: userId, buyer_id: company.CustomerID || company.CompanyID }: { buyer_id: userId, seller_id: company.CustomerID || company.CompanyID };
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
            const userId = localStorage.getItem("userID");
            navigate(`/chat/${userId}/${company.CustomerID || company.CompanyID}`);
        //   navigate(`/chat/${room.id}`); // sesuaikan dengan struktur response
        } catch (err) {
            console.error("Error starting chat room:", err);
        }
    }

return (
    <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
            {customers.map((customer) => (
                <div key={customer.CustomerID} className={styles.card}>
                    <div className={styles.header}>
                        <img
                            src={
                                customer.CustomerPhotoURL || "https://via.placeholder.com/100"
                            }
                            alt={customer.CustomerName}
                            className={styles.profileImg}
                        />
                    </div>
                    <div className={styles.content}>
                        <h2 className={styles.name}>{customer.CustomerName}</h2>
                        <p className={styles.country}>{customer.CustomerCountry}</p>
                        <p className={styles.sector}>
                            Sector:{" "}
                            {customer.CustomerSector?.map((sector, index) => (
                                <span key={index} className={styles.sectorItem}>
                                    {sector}
                                    {index < customer.CustomerSector.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </p>
                        <div className={styles.buttons}>
                            <button
                                className={styles.button}
                                onClick={() => navigate(`/customer/${customer.CustomerID}`)}
                            >
                                See Profile
                            </button>
                            <button
                                className={styles.button}
                                onClick={() => handleMessage(customer)}
                            >
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <Footer />
    </div>
);
}
