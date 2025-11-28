// components/Form.js

import React, { useState } from "react";
import styles from "../globals.css";

const Form = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        age: "",
        gender: "",
        interests: [],
    });

    const handleChange = (e) => {
        const { name, value, type, checked, options } = e.target;
        if (type === "checkbox") {
            const selectedOptions = Array.from(options)
                .filter((option) => option.selected)
                .map((option) => option.value);
            setFormData({ ...formData, [name]: selectedOptions });
        } else if (type === "radio" && checked) {
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };

    return (
        <form className= "form" onSubmit={handleSubmit}>
            <label htmlFor="firstName" className= "label">
                First Name:
            </label>
            <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className= "input" />

            <label htmlFor="lastName" className="label">
                Last Name:
            </label>
            <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className= "input" />

            <label htmlFor="email" className= "label">
                Email:
            </label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className= "input" />

            <label htmlFor="address" className= "label">
                Address:
            </label>
            <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className= "input" />

            <label htmlFor="age" className= "label">
                Age:
            </label>
            <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className= "input" />

            <label className= "label">Gender:</label>

            <span style={{ display: "flex" }}>
                <label
                    style={{ width: "20px" }}
                    htmlFor="male"
                    className= "label">
                    Male
                </label>
                <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                    className= "radio" />
            </span>
            <span style={{ display: "flex" }}>
                <label
                    style={{ width: "20px" }}
                    htmlFor="female"
                    className= "label">
                    Female
                </label>
                <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                    className= "radio" />
            </span>

            <label htmlFor="interests" className= "label">
                Interests:
            </label>
            <select
                id="interests"
                name="interests"
                multiple
                value={formData.interests}
                onChange={handleChange}
                className= "select">
                <option value="coding">Coding</option>
                <option value="reading">Reading</option>
                <option value="music">Music</option>
            </select>

            <button type="submit" className= "button">
                Submit
            </button>
            <button type="reset" className= "button">
                Reset
            </button>
        </form>
    );
};

export default Form;