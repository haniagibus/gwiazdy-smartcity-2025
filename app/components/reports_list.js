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
            <h2>Lista raportów</h2>

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
                    <li key={index} className="report-item">
                        <p><strong>Nick:</strong> {item.name}</p>
                        <p><strong>Koordynaty:</strong> {item.x_coord}, {item.y_coord}</p>
                        <p><strong>Dodano:</strong> {new Date(item.added_date).toLocaleString()}</p>
                        <p><strong>Treść zgłoszenia::</strong></p>
                        <p>{item.desc}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReportList;
