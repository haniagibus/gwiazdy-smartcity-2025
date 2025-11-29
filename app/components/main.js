import { Map, MapStyle, config } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk';
import '@maptiler/geocoding-control/style.css';

config.apiKey = 'YOUR_MAPTILER_API_KEY_HERE';

const bbox = [2.040051,48.736055,2.641553,49.017847];

const map = new Map({
  container: 'map', 
  style: MapStyle.STREETS,
  bounds: bbox
});

const gc = new GeocodingControl({
  bbox: bbox
});

map.addControl(gc, 'top-left');