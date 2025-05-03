import React from "react";
import styles from "./Css/Footer.module.css"

function Footer(){
    return(
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.logoSection}>
                    <img src="/logoPutih.png" alt="Logo" className={styles.logoFooter} />
                    <img src="/garisFooter.png" alt="line" className={styles.line} />
                </div>
                <div className={styles.footerInfo}>
                    <div className={styles.contact}>
                        <a href=""><img src="IGlogo.png" alt="" /> BizBridgeCorp</a>
                    </div>
                    <div className={styles.contact}>
                        <a href=""><img src="facebookLogo.png" alt="" /> info@bizbridge.com</a>
                    </div>
                    <div className={styles.contact}>
                        <a href=""><img src="emailLogo.png" alt="" /> www.bizbridgeglobal.com</a>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>© 2025 BizBridgeCorp. All rights reserved.</div>
        </footer>
    );
}

export default Footer;