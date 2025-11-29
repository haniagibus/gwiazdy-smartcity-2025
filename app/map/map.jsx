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
      map.current.addControl(geocoder, 'bottom-right');

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

      map.current.on('mousemove', 'districts-layer', e => {
        if (!e.features || !e.features.length) return;

        if (hoveredDistrictId !== null) {
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
      });

      map.current.on('mouseleave', 'districts-layer', () => {
        if (hoveredDistrictId !== null) {
          map.current.setFeatureState(
            { source: 'districts', id: hoveredDistrictId },
            { hover: false }
          );
        }
        hoveredDistrictId = null;
        map.current.getCanvas().style.cursor = '';
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
      const image = await map.current.loadImage('/fireworks.png');
      map.current.addImage('pinReport', image.data);

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
    });


    // map.current.on('load', async () => {
    //   const reports = await getReportsFromDatabase();
    //   reports.forEach(report => {
    //     const lng = report.x_coord;
    //     const lat = report.y_coord;

    //     new maptilersdk.Marker()
    //       .setLngLat({ lng, lat })
    //       .addTo(map.current);
    //   });

    //   map.current.addLayer({
    //     id: 'reports-layer',
    //     type: 'fill',
    //     source: 'reports',
    //     layout: {
    //       visibility: activeLayer === 'events' ? 'visible' : 'none',
    //     },
    //     paint: {
    //       'fill-opacity': 0
    //     }
    //   });
    // });

    map.current.on('mouseenter', 'reports-layer', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'reports-layer', () => {
      map.current.getCanvas().style.cursor = '';
    });

    map.current.on('click', 'reports-layer', e => {
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

    // map.current.on('click', 'reports-layer', e => {
    //   const lng = e.lngLat.lng;
    //   const lat = e.lngLat.lat;

    //   setReportCoords(prev => [...prev, { lng, lat }]);

    //   new maptilersdk.Marker()
    //     .setLngLat([lng, lat])
    //     .addTo(map.current);

    //   document.body.classList.add('sidebar-reports-open');

    //   const closeBtn = document.getElementById('closeSideBarReportsbtn');
    //   if (closeBtn) {
    //     closeBtn.onclick = ev => {
    //       ev.stopPropagation();
    //       document.body.classList.remove('sidebar-reports-open');
    //     };
    //   }
    // });

    map.current.on('load', async () => {
      const image = await map.current.loadImage('/star.png');
      map.current.addImage('pinMetro', image.data);

      fetch('/data.csv')
        .then(res => res.text())
        .then(text => {
          const lines = text.trim().split('\n');
          const header = lines[0].split(',').map(h => h.trim());

          const features = lines.slice(1).map(line => {
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
                coordinates: [lon, lat]
              },
              properties: obj
            };
          });

          const geojson = {
            type: 'FeatureCollection',
            features
          };

          map.current.addSource('events', {
            type: 'geojson',
            data: geojson
          });

          map.current.addLayer({
            id: 'events',
            type: 'symbol',
            source: 'events',
            layout: {
              visibility: activeLayer === 'events' ? 'visible' : 'none',
              'icon-image': 'pinMetro',
              'icon-size': 0.8
            }
          });
        });
    });

    map.current.on('click', 'events', e => {
      const props = e.features[0].properties;
      new maptilersdk.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <h3>${props.name}</h3>
          <p>${props.date} ${props.hour}</p>
          <p>${props.place_name}, ${props.street}, ${props.city}</p>
          ${props.image ? `<img src="${props.image}" style="max-width:150px" />` : ''}
        `)
        .addTo(map.current);
    });
  }, [
    gdansk.lng,
    gdansk.lat,
    zoom,
    demography_dataset_id,
    reports_dataset_id,
    activeLayer
  ]);

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
          <i>Demografia</i>
        </a>

        <a
          href="#"
          id="wydarzenia"
          onClick={e => {
            e.preventDefault();
            setActiveLayer('events');
          }}
        >
          <i>Usługi</i>
        </a>

        <a
          href="#"
          id="zgloszenia"
          onClick={e => {
            e.preventDefault();
            setActiveLayer('reports-layer');
          }}
        >
          <i>Zgłoszenia</i>
        </a>
      </div>

      <div ref={mapContainer} className="map" />

      <div className="sidebar">
        <OpinionForm />
        <button id="closeSideBarbtn">-</button>
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