import React from "react";
import Slider from "react-slick"; 
import styles from "../Css/HomePage.module.css";
import CarouselSetting from "../CarouselSetting"
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function HomePage() {
return (
    <div className={styles.container}>
        <Navbar />
        <section className={styles.carouselSection}>
            <Slider {...CarouselSetting}>
                <div>
                    <img src="/carousel1.png" alt="Slide 1" className={styles.carouselImage} />
                </div>
                <div>
                    <img src="/carousel2.png" alt="Slide 2" className={styles.carouselImage} />
                </div>
                <div>
                    <img src="/carousel3.png" alt="Slide 3" className={styles.carouselImage} />
                </div>
            </Slider>
        </section>
    
        <section className={styles.section}>
            <img src="/homeCrafterKiri.png" alt="Farmer" className={styles.image} />
            <div>
                <p className={styles.heading}>What is BizBridge?</p>
                <p className={styles.desc}>
                    A platform that connects Indonesian entrepreneurs with overseas customers. It facilitates partnerships and streamlines
                    cross-border transactions with safe, fast, and reliable services.
                    <br /><br />
                    Find authentic, high-quality products directly from Indonesian producers.
                </p>
            </div>
        </section>
        <section className={`${styles.section} ${styles.greenBackground}`}>
            <div>
                <p className={styles.headingKanan}>How does BizBridge work?</p>
                <p className={styles.descKanan}>
                    Overseas customers can search for Indonesian companies that offer the products or services they need.
                    <br /><br />
                    After finding a suitable company, customers can directly connect with the entrepreneurs through this fast feature on the platform.
                    <br /><br />
                    BizBridge does not handle transactions, but ensures all company profiles are trustworthy via background approval.
                    <br /><br />
                    Request and delivery can be made using methods agreed upon by both parties.
                </p>
            </div>
            <img src="/homeBatikKanan.png" alt="batik" className={styles.image} />
        </section>
        <section className={styles.section}>
            <img src="/homePabrikKiri.png" alt="Warehouse" className={styles.image} />
            <div>
                <p className={styles.heading}>Is the company trustworthy?</p>
                <p className={styles.desc}>
                    To ensure this, BizBridge only displays credible Indonesian SMEs that pass the BizBridge review. Photos and activities are verified before displaying companies to customers.
                    <br /><br />
                    Are you interested in companies in BizBridge?
                </p>
                <button className={styles.button}>Check It Out!</button>
            </div>
        </section>
        <Footer />
    </div>
);
}
