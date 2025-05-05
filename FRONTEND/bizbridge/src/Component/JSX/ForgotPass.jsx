import React from "react";
import styles from "../Css/Forgot.module.css"
import { Link } from "react-router-dom";

export default function forgot(){
    return(
        <div className={styles.container}>
            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="" />
                <h1>Forgot Password</h1>
                <form action="">
                    <p>Email<span style={{color:"red"}}>*</span></p>
                    <input type="email" />
                    <div className={styles.forgotButton}>
                        <Link to="/reset"><button>Forgot Password</button></Link>
                    </div>
                </form>
            </section>
        </div>
    );
}