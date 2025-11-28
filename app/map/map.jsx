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
    if (map.current) return; // stops map from intializing more than once

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [gdansk.lng, gdansk.lat],
      zoom: zoom
    });

  }, [gdansk.lng, gdansk.lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}