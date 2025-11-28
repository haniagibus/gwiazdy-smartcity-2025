'use client'

import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import configData from '../config/config.ts';

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const gdansk = { lng: 18.638306, lat: 54.372158 };
  const zoom = 11;
  
  maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

  useEffect(() => {
    if (map.current) return; 

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [gdansk.lng, gdansk.lat],
      zoom: zoom
    });
 map.current.on("click", (e) => {
    const { lng, lat } = e.lngLat;

    const popup=new maptilersdk.Popup()
      .setLngLat([lng, lat])
      .setHTML(`<h3>pls dzialaj</h3><p>Lng: ${lng.toFixed(5)}, Lat: ${lat.toFixed(5)}</p>
      <button id="openSidebarBtn">+</button>`)
    
      popup.on("open", () => {

    const btn = document.getElementById("openSidebarBtn");
    if (btn) {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation;
        console.log("klik");

        document.body.classList.add("sidebar-open"); 
      });
    }

    const closeBtn = document.getElementById("closeSideBarbtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation;
        console.log("klik");

        document.body.classList.remove("sidebar-open"); 
      });
    }
    
  });
  popup.addTo(map.current);
  });
  }, [gdansk.lng, gdansk.lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
      <div className="sidebar">
        TRESC!!!!!!!
        <button id="closeSideBarbtn">-</button>
      </div>
    </div>
  );
}
