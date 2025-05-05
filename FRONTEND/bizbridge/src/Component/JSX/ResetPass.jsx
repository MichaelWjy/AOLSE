import React from "react";
import styles from "../Css/Forgot.module.css"
import { Link } from "react-router-dom";

export default function Reset(){
    return(
        <div className={styles.container}>
            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="" />
                <h1>Reset Password</h1>
                <form action="">
                    <p>New Password<span style={{color:"red"}}>*</span></p>
                    <input type="password" />
                    <p>Confirm Password<span style={{color:"red"}}>*</span></p>
                    <input type="password" />
                    <div className={styles.forgotButton}>
                        <Link to="/"><button>Reset Password</button></Link>
                    </div>
                </form>
            </section>
        </div>
    );
}