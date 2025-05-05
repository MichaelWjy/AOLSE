import React from "react";
import carouselSettings from "../LoginCarouselSetting";
import Slider from "react-slick";
import styles from "../Css/loginPage.module.css"
import { Link } from "react-router-dom";

export default function Login(){
    return(
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
                <form action="">
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                </form>
                <div className={styles.loginInfo}>
                    <div className={styles.remember}>
                        <input type="checkbox"/>
                        <p>Remember Me</p>
                    </div>
                    <Link to="/forgot">Forgot password?</Link>
                </div>
                <div className={styles.loginButton}>
                    <Link to="/home"><button>Login</button></Link>
                    <div className={styles.noAcc}>
                    <p>Don’t have an account? <Link to="/register">Click Here</Link></p>
                        {/* <p>Don’t have an account? <a href="homePage.jsx">Click Here</a></p> */}
                    </div>
                </div>
            </section>
        </div>
        
    );
}