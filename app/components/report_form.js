import React, { useState } from "react";
import { Rating } from "react-simple-star-rating";
import {saveReportToDatabase} from "../services/action.js"

const ReportForm = ({ lng, lat }) => {
    const [formData, setFormData] = useState({
        x_coord: lng,
        y_coord: lat,
        nick: "",
        desc: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleReset = () => {
    setFormData({
        x_coord: 0,
        y_coord: 0,
        nick: "",
        desc: "",
    });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        const data = new FormData(e.target); 

        await saveReportToDatabase(data);

        setFormData({
            x_coord: lng,
            y_coord: lat,
            nick: "",
            desc: "",
        });
    }; 

    return (
        <form className="form" onSubmit={handleSubmit}>
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

    <input type="hidden" name="x_coord" value={lng} />
    <input type="hidden" name="y_coord" value={lat} />

    <button type="submit" className="button">
        Submit
    </button>

    <button type="reset" className="button" onClick={handleReset}>
        Reset
    </button>
</form>
    );
};

export default ReportForm;
