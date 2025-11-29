'use client';

import React, { useRef, useEffect, useState, lazy, Suspense } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import './map.css';
import configData from '../config/config';
import OpinionForm from '../components/opinion_form.js';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';
import { getReportsFromDatabase } from '../services/action.js';

const ReportsList = lazy(() => import('../components/reports_list.js'));

const LAYERS = ['districts-layer', 'reports-layer', 'events'];

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [activeLayer, setActiveLayer] = useState('districts-layer');
  const [reportCoords, setReportCoords] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const gdansk = { lng: 18.638306, lat: 54.372158 };
  const zoom = 11;
  const demography_dataset_id = configData.MAPTILER_DATSET_DISTRICTS_ID;
  const reports_dataset_id = configData.MAPTILER_DATSET_REPORTS_ID;

  maptilersdk.config.apiKey = configData.MAPTILER_API_KEY;

  useEffect(() => {
    if (map.current) return;

    let hoveredDistrictId = null;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [gdansk.lng, gdansk.lat],
      zoom,
      fullscreenControl: true
    });

    map.current.on('load', async () => {
      const demography_dataset = await maptilersdk.data.get(demography_dataset_id);
      // const reports_dataset = await maptilersdk.data.get(reports_dataset_id);

      map.current.addSource('districts', {
        type: 'geojson',
        data: demography_dataset
      });

      // map.current.addSource('reports', {
      //   type: 'geojson',
      //   data: reports_dataset
      // });

      const geocoder = new GeocodingControl({});
      map.current.addControl(geocoder, "top-left");

      map.current.addLayer({
        id: 'districts-layer',
        type: 'fill',
        source: 'districts',
        layout: {},
        paint: {
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
            0.9,
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

      map.current.addLayer({
        id: 'district-fills',
        type: 'fill',
        source: 'districts',
        layout: {},
        paint: {
          'fill-color': '#08519c',
          'fill-opacity': 0.1
        }
      });


      // const geocoder = new GeocodingControl({
      //   //bbox: [18.31, 54.29, 18.87, 54.45]
      // });

      map.current.addLayer({
        id: 'districts-fills',
        type: 'fill',
        source: 'districts',
        layout: {},
        paint: {
          'fill-color': '#08519c',
          'fill-opacity': 0.1
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

      map.current.on('mouseleave', 'districts-layer', function () {
        if (hoveredDistrictId) {
          map.current.setFeatureState(
            { source: 'districts', id: hoveredDistrictId },
            { hover: false }
          );
        }
        hoveredDistrictId = null;
      });

      map.current.on('click', 'districts-layer', e => {
        const f = e.features && e.features[0];
        if (!f) return;

        const p = f.properties || {};

        const description = `
          <h2 style="text-align: center;">${p.DZIELNICY}</h2>
          <p><b>Liczba ludności:</b> ${p.L_MIESZK} osób</p>
          <p><b>Powierzchnia:</b> ${p.POWIERZCHN} km²</p>
          <p><b>Gęstość zaludnienia:</b> ${p.GEST_ZAL} osób/km²</p>
          <p><b>Saldo migracyjne:</b> ${p.SALDO_MIGR}</p>
        `;

        new maptilersdk.Popup()
          .setLngLat(e.lngLat)
          .setHTML(description)
          .addTo(map.current);
      });
    });

    map.current.on('load', async () => {
      const image = await map.current.loadImage('/symbol_excla.png');
      map.current.addImage('pinReport', image.data);

      const reports_dataset = await maptilersdk.data.get(reports_dataset_id);

      map.current.addSource('reports_data', {
        type: 'geojson',
        data: reports_dataset
      });

      const reports = await getReportsFromDatabase();

      const features = reports.map(report => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [report.x_coord, report.y_coord]
        },
        properties: {
          ...report
        }
      }));

      const geojson = {
        type: 'FeatureCollection',
        features
      };

      map.current.addSource('reports', {
        type: 'geojson',
        data: geojson
      });

      map.current.addLayer({
        id: 'reports-layer',
        type: 'symbol',
        source: 'reports',
        layout: {
          visibility: activeLayer === 'reports' ? 'visible' : 'none',
          'icon-image': 'pinReport',
          'icon-size': 0.8
        }
      });

      map.current.addLayer({
        id: 'reports-layer-background',
        type: 'fill',
        source: 'reports_data',
        layout: {},
        paint: {
          'fill-opacity': 0
        }
      });
    });

    map.current.on('mouseenter', 'reports-layer-background', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'reports-layer-background', () => {
      map.current.getCanvas().style.cursor = '';
    });

    map.current.on('click', 'reports-layer', async (e) => {
      const feature = e.features[0];
      const [lng, lat] = feature.geometry.coordinates;

      setReportCoords(prev => [...prev, { lng, lat }]);

      document.body.classList.add('sidebar-reports-open');

      const closeBtn = document.getElementById('closeSideBarReportsbtn');
      if (closeBtn) {
        closeBtn.onclick = ev => {
          ev.stopPropagation();
          document.body.classList.remove('sidebar-reports-open');
        };
      }
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
            const obj = {};

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
            layout: {
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
      <h2 style="text-align: center;">${props.name}</h2>
      <p style="text-align: center;">${props.date} | ${props.hour}</p>
     <button id="openSidebarBtn" style="
     margin-left:30px;
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
    map.current.on('load', async () => {
      const image2 = await map.current.loadImage("/hospital.png");
      map.current.addImage('pinHospital', image2.data);
      fetch('/hospital.csv')
        .then((res) => res.text())
        .then((text) => {
          const lines = text.trim().split('\n');
          const header = lines[0].split(',').map(h => h.trim());

          const features = lines.slice(1).map((line) => {
            const cols = line.split(',').map(c => c.trim());
            const obj = {};

            header.forEach((h, i) => {
              obj[h] = cols[i];
            });

            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  parseFloat(obj.lon),
                  parseFloat(obj.lat),
                ],
              },
              properties: {
                id: obj.id,
                name: obj.name,
              },

            };
          });



          const geojson = {
            type: 'FeatureCollection',
            features,
          };
          console.log(geojson);



          map.current.addSource('hospitals', {
            type: 'geojson',
            data: geojson,
          });

          map.current.addLayer({
            id: 'hospitals',
            type: 'symbol',
            source: 'hospitals',
            layout: {
              visibility: activeLayer === 'hospitals' ? 'visible' : 'none',
              'icon-image': 'pinHospital',
              'icon-size': 0.8

            },
            paint: {

            },
          });
        });
    });

    map.current.on('load', async () => {
      const image = await map.current.loadImage("/bus.png");
      map.current.addImage('pinBus', image.data);
      fetch('/przystanki.csv')
        .then((res) => res.text())
        .then((text) => {
          const lines = text.trim().split('\n');

          const header = lines[0].split(',').map(h => h.trim());

          const features = lines.slice(1).map((line) => {
            const cols = line.split(',').map(c => c.trim());
            const obj = {};

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

          map.current.addSource('bus', {
            type: 'geojson',
            data: geojson,
          });

          map.current.addLayer({
            id: 'bus',
            type: 'symbol',
            source: 'bus',
            layout: {
              visibility: activeLayer === 'bus' ? 'visible' : 'none',
              'icon-image': 'pinBus',
              'icon-size': 0.8
            },
          });
        });

    });
    map.current.on('load', async () => {
      const image = await map.current.loadImage("/university.png");
      map.current.addImage('pinUni', image.data);
      fetch('/schools.csv')
        .then((res) => res.text())
        .then((text) => {
          const lines = text.trim().split('\n');

          const header = lines[0].split(',').map(h => h.trim());

          const features = lines.slice(1).map((line) => {
            const cols = line.split(',').map(c => c.trim());
            const obj = {};

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

          map.current.addSource('uni', {
            type: 'geojson',
            data: geojson,
          });

          map.current.addLayer({
            id: 'uni',
            type: 'symbol',
            source: 'uni',
            layout: {
              visibility: activeLayer === 'uni' ? 'visible' : 'none',
              'icon-image': 'pinUni',
              'icon-size': 0.8
            },
          });
        });

    });

    // map.current.on("click", 'events', (e) => {
    //   const props = e.features[0].properties;
    //   new maptilersdk.Popup()
    //     .setLngLat(e.lngLat)
    //     .setHTML(`
    //   <h3 >${props.name}</h3>
    //   <p>${props.date} ${props.hour}</p>
    //   <p>${props.place_name}, ${props.street}, ${props.city}</p>
    //   ${props.image ? `<img src="${props.image}" style="max-width:150px" />` : ''}

    // `)
    //     .addTo(map.current);

    // });
    map.current.on("click", 'hospitals', (e) => {
      const props = e.features[0].properties;
      new maptilersdk.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
      <h4 style="text-align: center;">${props.name}</h4>
      
    `)
        .addTo(map.current);

    });

    map.current.on("click", 'uni', (e) => {
      const props = e.features[0].properties;
      new maptilersdk.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
      <h4 style="text-align: center;">${props.name}</h4>
      
    `)
        .addTo(map.current);

    });

    map.current.on("click", 'bus', (e) => {
      const props = e.features[0].properties;
      new maptilersdk.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
      <h4 style="text-align: center;">Przystanek ${props.name}</h4>
      
    `)
        .addTo(map.current);

    });

    if (map.current.getLayer('hospitals')) {
      const districtsVisibility = map.current.getLayoutProperty('events', 'visibility');
      map.current.setLayoutProperty(
        'hospitals',
        'visibility',
        districtsVisibility || 'none'
      );
    }
    if (map.current.getLayer('bus')) {
      const districtsVisibility = map.current.getLayoutProperty('events', 'visibility');
      map.current.setLayoutProperty(
        'bus',
        'visibility',
        districtsVisibility || 'none'
      );
    }
    if (map.current.getLayer('uni')) {
      const districtsVisibility = map.current.getLayoutProperty('events', 'visibility');
      map.current.setLayoutProperty(
        'uni',
        'visibility',
        districtsVisibility || 'none'
      );
    }


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

  }, [activeLayer]);

  const lastReportCoords = reportCoords[reportCoords.length - 1];

  return (
    <div className="map-wrap">
      <div id="mySidenav" className="sidenav">
        <a
          href="#"
          id="demografia"
          onClick={e => {
            e.preventDefault();
            setActiveLayer('districts-layer');
          }}
        >
          <b>Demografia</b>
          <img src="/group_nav.png" alt="Demografia" />
        </a>

        <a
          href="#"
          id="wydarzenia"
          onClick={(e) => {
            e.preventDefault();
            setActiveLayer('events');
          }}
        >
          <b>Usługi</b>
          <img src="/star_nav.png" alt="Usługi" />
        </a>

        <a
          href="#"
          id="zgloszenia"
          onClick={(e) => {
            e.preventDefault();
            setActiveLayer('reports-layer');
          }}
        >
          <b>Zgłoszenia</b>
          <img src="/symbol_excla_nav.png" alt="Zgłoszenia" />
        </a>
      </div>

      <div ref={mapContainer} className="map" />
      <div className="sidebar">
        <button
          id="closeSideBarbtn"
          className="close-sidebar-btn"
          onClick={(e) => {
            e.preventDefault();
            document.body.classList.remove("sidebar-open");
            setSelectedEvent(null);
          }}
        >
          -
        </button>
        {selectedEvent ? (
          <div className="event-card">
            <div className="event-header">
              <h2>{selectedEvent.name}</h2>
            </div>

            {selectedEvent.image && (
              <img
                className="event-image"
                src={selectedEvent.image}
                alt={selectedEvent.name}
              />
            )}

            <div className="event-info">
              <p className="event-datetime">
                <span>{selectedEvent.date} | </span>
                <span>{selectedEvent.hour}</span>
              </p>
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
      </div>
      <div className="sidebar-reports">
        <Suspense fallback={<div>Ładowanie…</div>}>
          <ReportsList
            lng={lastReportCoords ? lastReportCoords.lng : 0}
            lat={lastReportCoords ? lastReportCoords.lat : 0}
          />
        </Suspense>
        <button id="closeSideBarReportsbtn">-</button>
      </div>


    </div>

  );
}