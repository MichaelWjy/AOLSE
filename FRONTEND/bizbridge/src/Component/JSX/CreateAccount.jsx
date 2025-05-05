import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Css/Register.module.css"
import countries from "world-countries";


export default function Register(){
    const countryOptions = countries.map((country) => ({
        value: country.cca2, // Country code
        label: country.name.common, // Country name
    }));
    const [role, setRole] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(""); // State untuk negara

    const handleRoleChange = (e) => {
        setRole(e.target.value); // Update state saat radio button berubah
    };

    const handleCountryChange = (event) => {
        setSelectedCountry(event.target.value);
    };
    
    return(
        <div className={styles.container}>
            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="" />
                <h1>Create your Account</h1>
                <form action="" className={styles.registerForm}>
                    <input type="text" placeholder="Username" />
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <input type="password" placeholder="Confirm Password" />
                    <p>Choose your role:</p>
                    <div className={styles.roleRadio}>
                        <input type="radio" value="buyer" name="role" id="buyer"onChange={handleRoleChange} />
                        <label htmlFor="buyer">Buyer</label>
                        <input type="radio" value="seller" name="role" id="seller" onChange={handleRoleChange}/>
                        <label htmlFor="seller">Seller</label>
                    </div>
                    {role === "seller" && (
                        <>
                            <input type="text" placeholder="Owner Name" />
                            <input type="text" placeholder="Company Name" />
                            <input type="text" placeholder="Company Address" />
                        </>
                    )}
                    {role ==="buyer"&&(
                        <>
                            {/* <input type="text" placeholder="Country" /> */}
                            <label htmlFor="country">Select your country:</label>
                            <select
                                id="country"
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className={styles.CountryPick}
                            >
                                <option value="">-- Country --</option>
                                {countryOptions.map((country, index) => (
                                    <option key={index} value={country.value}>
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <div className={styles.tnc}>
                        <input type="checkbox" />
                        <Link to='#' className={styles.tncLink}>Are you agree with our terms & condition</Link>
                    </div>
                    
                    <div className={styles.createButton}>
                        <Link to="/"><button>Create</button></Link>
                    </div>
                </form>
            </section>
        </div>
    );
}