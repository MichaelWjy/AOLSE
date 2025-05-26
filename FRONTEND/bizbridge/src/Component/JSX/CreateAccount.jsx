import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Css/Register.module.css";
import countries from "world-countries";
import Select from "react-select";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedSectors, setSelectedSectors] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [sectorError, setSectorError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:3000/api/sector/sectors")
            .then((res) => res.json())
            .then((data) => setSectors(data))
            .catch((err) => console.error("Failed to fetch sectors", err));
    }, []);

    const countryOptions = countries.map((country) => ({
        value: country.name.common,
        label: country.name.common,
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Password match validation
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        } else {
            setPasswordError("");
        }

        // Validate sectors only if buyer
        if (role === "buyer" && selectedSectors.length === 0) {
            setSectorError("Please select at least one sector (up to 3)");
            return;
        } else {
            setSectorError("");
        }

        try {
            const res = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role,
                    ownerName,
                    companyName,
                    companyAddress,
                    selectedSectors,
                    country: selectedCountry,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                alert("Account created successfully");
                navigate("/");
            } else {
                alert(data.error || "Registration failed");
            }
        } catch (err) {
            console.error("Registration error:", err);
            alert("An error occurred during registration.");
        }
    };

    return (
        <div className={styles.container}>
            <section className={styles.formSection}>
                <img src="/logoHitam.png" alt="Logo" />
                <h1>Create your Account</h1>
                <form className={styles.registerForm} onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    />
                    {passwordError && (<p style={{ color: "red", fontSize: "0.8rem" }}>{passwordError}</p>)}

                    <p>Choose your role:</p>
                    <div className={styles.roleRadio}>
                        <input type="radio" value="buyer" name="role" id="buyer" onChange={(e) => setRole(e.target.value)} required />
                        <label htmlFor="buyer">Buyer</label>
                        <input type="radio" value="seller" name="role" id="seller" onChange={(e) => setRole(e.target.value)} required />
                        <label htmlFor="seller">Seller</label>
                    </div>
                    {role === "seller" && (
                        <>
                            <div className={styles.sectorSelect}>
                                <Select
                                    isMulti
                                    options={sectors.map((s) => ({
                                        value: s.id,
                                        label: s.name,
                                    }))}
                                    value={selectedSectors
                                        .map((id) => {
                                            const sector = sectors.find((s) => s.id === id);
                                            return sector ? { value: sector.id, label: sector.name } : null;
                                        })
                                        .filter(Boolean)}
                                    onChange={(selectedOptions) => {
                                        if (selectedOptions.length <= 3) {
                                            setSelectedSectors(selectedOptions.map((o) => o.value));
                                            setSectorError("");
                                        }
                                    }}
                                    closeMenuOnSelect={false}
                                    isClearable={false}
                                    placeholder="Select up to 3 sectors"
                                    className="mt-2"
                                />
                            </div>
                            {sectorError && (
                                <p style={{ color: "red", fontSize: "0.8rem" }}>{sectorError}</p>
                            )}

                            <input type="text" placeholder="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                            <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                            <input type="text" placeholder="Company Address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} required />
                        </>
                    )}

                    {role === "buyer" && (
                        <>
                            <div className={styles.sectorSelect}>
                                <Select
                                    isMulti
                                    options={sectors.map((s) => ({
                                        value: s.id,
                                        label: s.name,
                                    }))}
                                    value={selectedSectors
                                        .map((id) => {
                                            const sector = sectors.find((s) => s.id === id);
                                            return sector ? { value: sector.id, label: sector.name } : null;
                                        })
                                        .filter(Boolean)}
                                    onChange={(selectedOptions) => {
                                        if (selectedOptions.length <= 3) {
                                            setSelectedSectors(selectedOptions.map((o) => o.value));
                                            setSectorError("");
                                        }
                                    }}
                                    closeMenuOnSelect={false}
                                    isClearable={false}
                                    placeholder="Select up to 3 sectors"
                                    className="mt-2"
                                />
                            </div>
                            {sectorError && (
                                <p style={{ color: "red", fontSize: "0.8rem" }}>{sectorError}</p>
                            )}

                            <label htmlFor="country">Select your country:</label>
                            <select
                                id="country"
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className={styles.CountryPick}
                                required
                            >
                                <option value="">-- Country --</option>
                                {countryOptions.map((country, idx) => (
                                    <option key={idx} value={country.value}>
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <div className={styles.tnc}>
                        <input type="checkbox" required />
                        <Link to="#" className={styles.tncLink}>
                            Are you agree with our terms & condition
                        </Link>
                    </div>
                    <div className={styles.createButton}>
                        <button type="submit">Create</button>
                    </div>
                </form>
            </section>
        </div>
    );
}
