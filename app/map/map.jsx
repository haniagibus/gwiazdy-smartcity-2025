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

const LAYERS = ['districts-layer', 'reports', 'events'];

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [activeLayer, setActiveLayer] = useState('districts-layer');
  const [selectedEvent, setSelectedEvent] = useState(null);

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
      zoom: zoom,
      fullscreenControl: true
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
        // paint: {
        //   'fill-color': '#627BC1',
        //   'fill-opacity': [
        //     'case',
        //     ['boolean', ['feature-state', 'hover'], false],
        //     0.6,
        //     0.2
        //   ]
        // }
        'paint': {
          'fill-color': [
            'let',
            'density',
            ['get', 'GEST_ZAL'],
            [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              [
                'interpolate',
                ['linear'],
                ['var', 'density'],
                274,
                ['to-color', '#edf8e9'],
                1551,
                ['to-color', '#006d2c']
              ],
              10,
              [
                'interpolate',
                ['linear'],
                ['var', 'density'],
                274,
                ['to-color', '#eff3ff'],
                1551,
                ['to-color', '#08519c']

              ]
            ]
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.6
          ]
        }
      });

      map.current.addLayer({
        id: 'district-borders',
        type: 'line',
        source: 'districts',
        layout: {},
        paint: {
          'line-color': '#08519c',
          'line-width': 2,
          'line-opacity': 0.7
        }
      });
     

      // const geocoder = new GeocodingControl({
      //   //bbox: [18.31, 54.29, 18.87, 54.45]
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
        const description = `
          <h2 style="text-align: center;">${e.features[0].properties.DZIELNICY}</h2>
          <p><b>Liczba ludności:</b> ${e.features[0].properties.L_MIESZK} osób</p>
          <p><b>Powierzchnia:</b> ${e.features[0].properties.POWIERZCHN} km²</p>
          <p><b>Gęstość zaludnienia:</b> ${e.features[0].properties.GEST_ZAL} osób/km²</p>
          <p><b>Saldo migracyjne:</b> ${e.features[0].properties.SALDO_MIGR}</p>
        `;

        new maptilersdk.Popup()
          .setLngLat(e.lngLat)
          .setHTML(description)
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
      
    });
     map.current.on('load', async () => {
      const image = await map.current.loadImage("/star.png");
      map.current.addImage('pinMetro', image.data);
          fetch('/data.csv') 
  .then((res) => res.text())
  .then((text) => {
    const lines = text.trim().split('\n');

    const header = lines[0].split(',').map(h => h.trim()); 

    const features = lines.slice(1).map((line) => {
      const cols = line.split(',').map(c => c.trim());      
      const obj={};
      
      header.forEach((h, i) => {
        obj[h] = cols[i];
      });

      const lat = parseFloat(obj.lat);
      const lon = parseFloat(obj.lon);

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties: obj,
      };
    });
    
    const geojson = {
      type: 'FeatureCollection',
      features,
    };
    console.log(geojson);

    map.current.addSource('events', {
      type: 'geojson',
      data: geojson,
    });

    map.current.addLayer({
      id: 'events',
      type: 'symbol', 
      source: 'events',
      layout:{
        visibility: activeLayer === 'events' ? 'visible' : 'none',
        'icon-image': 'pinMetro',
        'icon-size': 0.8
      },
    });
  });
  map.current.on("click", "events", (e) => {
  if (!e.features?.length) return;

  const props = e.features[0].properties;

  const popup = new maptilersdk.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <h3>${props.name}</h3>
      <p>${props.date} ${props.hour}</p>
     <button id="openSidebarBtn" style="
     margin-left:25px;
      width:70%;
      padding: 8px 12px;
      background: #0B70D5;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    ">
      Zobacz więcej
    </button>
    `);

  popup.on("open", () => {
    const popupEl = popup.getElement();              
    const btn = popupEl.querySelector("#openSidebarBtn");
    if (btn) {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();                      
        ev.preventDefault();
        setSelectedEvent(props);
        console.log("klik");
        document.body.classList.add("sidebar-open");
      });
    }

    const closeBtn = document.getElementById("closeSideBarbtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();

        console.log("zamknij");
        document.body.classList.remove("sidebar-open");
        setSelectedEvent(null);
      });
    }
  });

  popup.addTo(map.current);
});

        });
//  map.current.on("click", 'districts-layer',(e)=> {
//     const { lng, lat } = e.lngLat;

//       const popup = new maptilersdk.Popup()
//         .setLngLat([lng, lat])
//         .setHTML(`<h3>pls dzialaj</h3><p>Lng: ${lng.toFixed(5)}, Lat: ${lat.toFixed(5)}</p>
//       <button id="openSidebarBtn">+</button>`)

//       popup.on("open", () => {

//         const btn = document.getElementById("openSidebarBtn");
//         if (btn) {
//           btn.addEventListener("click", (ev) => {
//             ev.stopPropagation;
//             console.log("klik");

//             document.body.classList.add("sidebar-open");
//           });
//         }

//         const closeBtn = document.getElementById("closeSideBarbtn");
//         if (closeBtn) {
//           closeBtn.addEventListener("click", (ev) => {
//             ev.stopPropagation;
//             console.log("klik");

//             document.body.classList.remove("sidebar-open");
//           });
//         }

//       });
//       popup.addTo(map.current);
//     });
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


  // if (map.current.getLayer('district-borders')) {
  //   const districtsVisibility = map.current.getLayoutProperty('districts-layer', 'visibility');
  //   map.current.setLayoutProperty(
  //     'district-borders',
  //     'visibility',
  //     districtsVisibility || 'none'
  //   );
  // }
  // if (map.current.getLayer('events')) {
  //   const districtsVisibility = map.current.getLayoutProperty('events', 'visibility');
  //   map.current.setLayoutProperty(
  //     'district-borders',
  //     'visibility',
  //     districtsVisibility || 'none'
  //   );
  // }
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
          setActiveLayer('events');
        }}><i>Usługi</i></a>

        <a href="#" id="zgloszenia" onClick={(e) => {
          e.preventDefault();
          setActiveLayer('reports-layer')
        }}>;<i>Zgłoszenia</i></a>
      </div>


      <div ref={mapContainer} className="map" />
    <div className="sidebar">
  {selectedEvent ? (
    <div className="event-card">
      <div className="event-header">
        <h2>{selectedEvent.name}</h2>
        <p className="event-datetime">
          <span>{selectedEvent.date}</span>
          <span>{selectedEvent.hour}</span>
        </p>
      </div>

      {selectedEvent.image && (
        <img
          className="event-image"
          src={selectedEvent.image}
          alt={selectedEvent.name}
        />
      )}

      <div className="event-info">
        <p>
          <strong>Miejsce:</strong><br />
          {selectedEvent.place_name}<br />
          {selectedEvent.street}<br />
          {selectedEvent.city}
        </p>
      </div>

      
    </div>
  ) : (
    <OpinionForm />
  )}

  <button
    id="closeSideBarbtn"
    className="close-sidebar-btn"
    onClick={(e) => {
      e.preventDefault();
      document.body.classList.remove("sidebar-open");
      setSelectedEvent(null);
    }}
  >
    X
  </button>
</div>
<div className="sidebar-reports">
        <ReportsList lng={report_lng} lat={report_lat} />
        <button id="closeSideBarReportsbtn">-</button>
      </div>

      
    </div>
  );
}

