import React, { useState, useEffect } from "react";
import { getReportsFromDatabase } from "../services/action.js";
import ReportForm from "./report_form.js";

const ReportList = ({ lng, lat }) => {
    const [reports, setReports] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getReportsFromDatabase();
                setReports(data);
            } catch (error) {
                console.error("Błąd podczas pobierania raportów:", error);
            }
        };

        fetchReports();
    }, []);

    return (
        <div>
            <h2>Lista raportów:</h2>

            <button onClick={() => setShowForm(true)}>
                Dodaj nowy raport
            </button>

            {showForm && (
                <div style={{ marginTop: "20px" }}>
                    <ReportForm lng={lng} lat={lat} onClose={() => setShowForm(false)} />
                </div>
            )}

            <ul>
                {reports.map((item, index) => (
                    <li key={index}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default ReportList;
