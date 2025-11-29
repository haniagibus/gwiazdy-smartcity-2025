'use client'

import React, { useRef, useEffect, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';
import configData from '../config/config.ts';
import OpinionForm from "../components/opinion_form";
import ReportsList from "../components/reports_list";
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';

const LAYERS = ['districts-layer', 'reports', 'airports'];

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [activeLayer, setActiveLayer] = useState('districts-layer');

  const gdansk = { lng: 18.638306, lat: 54.372158 };
  const zoom = 11;
  const demography_dataset_id = configData.MAPTILER_DATSET_DISTRICTS_ID;
  const reports_dataset_id = configData.MAPTILER_DATSET_REPORTS_ID;

  maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

  let hoveredDistrictId = null;

  let report_lng = gdansk.lng;
  let report_lat = gdansk.lat;

  useEffect(() => {
    if (map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [gdansk.lng, gdansk.lat],
      zoom: zoom
    });

    map.current.on("load", async () => {
      const demography_dataset = await maptilersdk.data.get(demography_dataset_id);
      const reports_dataset = await maptilersdk.data.get(reports_dataset_id);

      map.current.addSource('districts', {
        type: 'geojson',
        data: demography_dataset
      });

      map.current.addSource('reports', {
        type: 'geojson',
        data: reports_dataset
      });

      const geocoder = new GeocodingControl({
        //bbox: [18.31, 54.29, 18.87, 54.45]
      });

      map.current.addControl(geocoder, "bottom-right");

      // [DISTRICTS LAYER]
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

      // [PLACEHOLDER LAYER]
      // map.current.addSource('airports', {
      //   type: 'geojson',
      //   data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson'
      // });
      // const image = await map.current.loadImage('https://docs.maptiler.com/sdk-js/examples/geojson-point/icon-plane-512.png');
      // map.current.addImage('plane', image.data);
      // map.current.addLayer({
      //   'id': 'airports',
      //   'type': 'symbol',
      //   'source': 'airports',
      //   'layout': {
      //     'icon-image': 'plane',
      //     'icon-size': ['*', ['get', 'scalerank'], 0.01]
      //   },
      //   'paint': {}
      // });

      // [REPORTS LAYER]
      map.current.addLayer({
        id: 'reports-layer',
        type: 'fill',
        source: 'reports',
        layout: {},
        paint: {
          'fill-opacity': 0
        }
      });

      // [DISTRICTS EVENT HOOKS]
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

      // [REPORTS EVENT HOOKS]
      map.current.on('mouseenter', 'reports-layer', function () {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      // map.current.on('click', 'reports-layer', function (e) {
      //   new maptilersdk.Marker()
      //     .setLngLat(e.lngLat)
      //     .addTo(map.current);
      // });

      map.current.on('click', 'reports-layer', function (e) {
        report_lng = e.lngLat.lng;
        report_lat = e.lngLat.lat;

        document.body.classList.add("sidebar-reports-open");
        const closeBtn = document.getElementById("closeSideBarReportsbtn");
        if (closeBtn) {
          closeBtn.addEventListener("click", (ev) => {
            ev.stopPropagation;
            console.log("klik");

            document.body.classList.remove("sidebar-reports-open");
          });
        }
      });
    });

    map.current.on("click", 'airports', (e) => {
      const { lng, lat } = e.lngLat;
      
      const popup = new maptilersdk.Popup()
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

  useEffect(() => {
    if (!map.current) return;

    LAYERS.forEach(id => {
      if (!map.current.getLayer(id)) return;

      map.current.setLayoutProperty(
        id,
        'visibility',
        id === activeLayer ? 'visible' : 'none'
      );
    });

    if (map.current.getLayer('district-borders')) {
      const districtsVisibility = map.current.getLayoutProperty('districts-layer', 'visibility');
      map.current.setLayoutProperty(
        'district-borders',
        'visibility',
        districtsVisibility || 'none'
      );
    }
  }, [activeLayer]);


  return (
    <div className="map-wrap">
      <div id="mySidenav" className="sidenav">
        <a
          href="#"
          id="demografia"
          onClick={(e) => {
            e.preventDefault();
            setActiveLayer('districts-layer');
          }}
        ><i>Demografia </i>

        </a>
        <a href="#" id="wydarzenia" onClick={(e) => {
          e.preventDefault();
          setActiveLayer('airports');
        }}><i>Usługi</i></a>

        <a href="#" id="zgloszenia" onClick={(e) => {
          e.preventDefault();
          setActiveLayer('reports-layer')
        }}>;<i>Zgłoszenia</i></a>
      </div>


      <div ref={mapContainer} className="map" />

      <div className="sidebar">
        <OpinionForm />
        <ReportsList />
        <button id="closeSideBarbtn">-</button>
      </div>
      
      <div className="sidebar-reports">
        <ReportsList lng={report_lng} lat={report_lat} />
        <button id="closeSideBarReportsbtn">-</button>
      </div>
    </div>
  );
}

