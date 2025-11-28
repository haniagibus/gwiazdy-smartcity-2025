import React, { useState } from "react";
import { Rating } from "react-simple-star-rating";
import {saveFormDatasToDatabase} from "./action.js"

const Form = () => {
    const [formData, setFormData] = useState({
        nick: "",
        desc: "",
        rating: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRating = (rate) => {
        setFormData({ ...formData, rating: rate });
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     console.log("Form Data:", formData);
    // };

    return (
        <form className="form" action={saveFormDatasToDatabase}>
    <label htmlFor="nick" className="label">
        Nick:
    </label>
    <input
        type="text"
        id="nick"
        name="nick"
        value={formData.nick}
        onChange={handleChange}
        className="input"
    />

    <label htmlFor="desc" className="label">
        Description:
    </label>
    <textarea
        id="desc"
        name="desc"
        value={formData.desc}
        onChange={handleChange}
        className="textarea"
    />

    <label className="label">Rating:</label>
    <Rating
        onClick={handleRating}
        initialValue={formData.rating}
        size={30}
    />

    <input type="hidden" name="rating" value={formData.rating} />

    <button type="submit" className="button">
        Submit
    </button>

    <button type="reset" className="button">
        Reset
    </button>
</form>
    );
};

export default Form;
