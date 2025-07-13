<template>
  <div ref="mapContainer" id="map" class="mapbox-map" style="width: 100%; height: 100%;"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Replace with your actual Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoicGVyaWNhYjM1IiwiYSI6ImNtZDB3bDh5NTB0YmYyanFuZjM1cjR6MG4ifQ.Yu9Lb17GEXTFTB_5k5A9nA'

const props = defineProps({
  locations: {
    type: Array,
    required: true
  }
})

const mapContainer = ref(null)
let mapInstance = null

onMounted(async () => {
  // Dynamically import mapbox-gl (optional, for SSR safety)
  const mapboxgl = (await import('mapbox-gl')).default
  mapboxgl.accessToken = MAPBOX_TOKEN

  mapInstance = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/pericab35/cmd0xcb9j009301s9fh3w0k74',
    scrollZoom: false,
    // center: props.locations[0].coordinates,
    // zoom: 7
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();
  // Add markers for each location
  props.locations.forEach(loc => {
    //Add marker
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(mapInstance)
      
    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(mapInstance);
    
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates)
  });
  
  const lineCoordinates = props.locations.map(loc => loc.coordinates);

  mapInstance.on('load', () => {
    mapInstance.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates
        }
      }
    });
    
    mapInstance.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#55c57a',
        'line-width': 4
      }
    });
  });

  
  mapInstance.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
})
</script>

<style scoped>
.mapbox-map {
  width: 100%;
  height: 100%;
  border-radius: 1rem;
}
</style>
