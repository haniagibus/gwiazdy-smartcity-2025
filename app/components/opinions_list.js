import React, { useState, useEffect } from "react";
import { getOpinionsFromDatabase } from "../services/action.js";
import OpinionForm from "./opinion_form.js";

const OpinionsList = ({ lon, lat }) => {
  const [opinions, setOpinions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
  if (lon == null || lat == null) return;

  const fetchOpinions = async () => {
    const data = await getOpinionsFromDatabase(lon, lat);
    setOpinions(data);
  };

  fetchOpinions();
}, [lon, lat]);


  return (
    <div>
      <h2>Lista opinii:</h2>

      <button onClick={() => setShowForm(true)}>
        Dodaj nową opinie
      </button>

      {showForm && (
        <div style={{ marginTop: "20px" }}>
          <OpinionForm lng={lon} lat={lat} onClose={() => setShowForm(false)} />
        </div>
      )}

      <ul>
        {opinions.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export default OpinionsList;
