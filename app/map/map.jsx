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
  const demography_dataset_id = configData.MAPTILER_DATSET_ID;
  maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

  let hoveredDistrictId = null;

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      geolocate: maptilersdk.GeolocationType.POINT
    });

    map.current.on("load", async () => {
      const demography_dataset = await maptilersdk.data.get(demography_dataset_id);

      map.current.addSource('districts', {
        type: 'geojson',
        data: demography_dataset
      });

      // The feature-district dependent fill-opacity expression will render the hover effect
      // when a feature's hover district is set to true.
      map.current.addLayer({
        id: 'districts-layer',
        type: 'fill',
        source: 'districts',
        layout: {},
        paint: {
          'fill-color': '#627BC1',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6,
            0.2
          ]
        }
      });

      map.current.addLayer({
        id: 'district-borders',
        type: 'line',
        source: 'districts',
        layout: {},
        paint: {
          'line-color': '#627BC1',
          'line-width': 2
        }
      });

      // When the user moves their mouse over the state-fill layer, we'll update the
      // feature state for the feature under the mouse.
      map.current.on('mousemove', 'districts-layer', function (e) {
        if (e.features.length > 0) {
          if (hoveredDistrictId) {
            map.current.setFeatureState(
              { source: 'districts', id: hoveredDistrictId },
              { hover: false }
            );
          }
          hoveredDistrictId = e.features[0].id;
          map.current.setFeatureState(
            { source: 'districts', id: hoveredDistrictId },
            { hover: true }
          );
        }
      });

      // When a click event occurs on a feature in the states layer, open a popup at the
      // location of the click, with description HTML from its properties.
      map.current.on('click', 'districts-layer', function (e) {
        new maptilersdk.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.DZIELNICY)
          .addTo(map.current);
      });

      // Change the cursor to a pointer when the mouse is over the states layer.
      map.current.on('mouseenter', 'districts-layer', function () {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.current.on('mouseleave', 'districts-layer', function () {
        if (hoveredDistrictId) {
          map.current.setFeatureState(
            { source: 'districts', id: hoveredDistrictId },
            { hover: false }
          );
        }
        hoveredDistrictId = null;

        map.current.getCanvas().style.cursor = '';
      });      
    });

  }, [gdansk.lng, gdansk.lat, zoom]);

  return (
    <div className="map-wrap">
      <div ref={mapContainer} className="map" />
    </div>
  );
}