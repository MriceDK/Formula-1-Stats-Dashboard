import {getNationalityCoordinates} from "./nationalities.js";

function initializeMap() {
    const containerId = 'centra-map';
    const el = document.getElementById(containerId);
    if (!el) return;

    // If a map was previously created, remove it first
    if (window._centraMap) {
        window._centraMap.remove();
        window._centraMap = null;
    }
    // create map
    const map = L.map(containerId, {
        preferCanvas: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5
    }).setView([20, 0], 2);
    window._centraMap = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        updateWhenIdle: false,
        updateWhenZooming: true,
        keepBuffer: 2
    }).addTo(map);

    window._centraMarkers = L.featureGroup().addTo(map);

    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

function updateMapWithDrivers() {
    if (!window._centraMap || !window._centraMarkers) {
        initializeMap();
    }

    if (!window._sessionAddedDrivers) {
        window._sessionAddedDrivers = [];
    }

    const coordinates = getCoordinates(window._sessionAddedDrivers).filter(c => Array.isArray(c) && c.length === 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]));

    // Clear existing markers
    window._centraMarkers.clearLayers();

    if (coordinates.length === 0) {
        return;
    }

    const redIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
                <path fill="#e10600" stroke="#ffffff" stroke-width="1.5" 
                    d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 14 8 14s8-8.5 8-14c0-4.42-3.58-8-8-8z"/>
                <circle cx="12" cy="8" r="3" fill="#ffffff"/>
            </svg>
        `),
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
    });

    // Add new markers
    coordinates.forEach(coord => {
        L.marker(coord, {icon : redIcon}).addTo(window._centraMarkers);
    });

    // Fit bounds to show all markers
    const bounds = window._centraMarkers.getBounds();
    if (bounds.isValid()) {
        window._centraMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

function getCoordinates(drivers) {
    const coordinates = [];
    for (let i = 0; i < drivers.length ; i++) {
        coordinates[i] = getNationalityCoordinates(drivers[i].nationality);
    }
    return coordinates;
}

export {
    initializeMap,
    updateMapWithDrivers,
    getCoordinates
};