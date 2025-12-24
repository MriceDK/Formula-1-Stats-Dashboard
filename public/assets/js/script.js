import {barChart, piechart} from "./charts.js";
import {BASEURL} from "./config.js";
import {getCountryCoordinates} from "./countries.js";

const CACHE = {
    drivers : null,
};




async function init() {
    await getAllDriverNames();
    centraMap();
    document.querySelector(".search-driver-form").addEventListener("submit", e => {
        e.preventDefault();
        getAllDriverNames().then(() => document.querySelector(".driver-stats-simple").classList.add("hidden"));
        updateSelectedDriver(e);
    });
    document.querySelector(".drivers").addEventListener("change", updateSelectedDriver);
    document.querySelector(".switch").addEventListener("click", e => switchToAddNewResultForm(e));
    document.querySelector(".new-driver-form").addEventListener("submit", e => addNewDriverResult(e));
}

async function getCachedDrivers(clearCache = false) {
    if (CACHE.drivers === null || clearCache) {
        CACHE.drivers = await fetch(`${BASEURL}/drivers`).then(res => res.json());
        console.info("Drivers Cached");
    }
    return CACHE.drivers;
}

async function getAllDriverNames() {
    const driverSelect = document.querySelector(".drivers");
    driverSelect.innerHTML = `<option value="">- Select Your Driver -</option>`;
    const drivers = await getCachedDrivers();

    const filterValue = document.querySelector(".driver-name").value.trim().toLowerCase();
    const filteredDrivers = drivers.filter(driver => driver.givenName.concat(" ", driver.familyName).toLowerCase().includes(filterValue));
    filteredDrivers.forEach(driver => {
        const { driver_id, givenName, familyName} = driver;
        const fullName = givenName.concat(" ", familyName);
        driverSelect.insertAdjacentHTML(`beforeend`, driverOptionElement(driver_id, fullName));
    });
}

function driverOptionElement(driver_id, driver_name) {
    return `<option value="${driver_id}">${driver_name}</option>`;
}

async function loadSimpleDriverData(driver_id) {

    const winsObject = await fetch(`${BASEURL}/drivers/${driver_id}/wins`).then(res => res.json());
    const overtakingObject = await fetch(`${BASEURL}/drivers/${driver_id}/overtaking`).then(res => res.json());
    const teammateVSObject = await fetch(`${BASEURL}/drivers/${driver_id}/teammates`).then(res => res.json());

    document.querySelector(".total-races").innerHTML = `${winsObject.total_races === null ? "N/A" : winsObject.total_races} races`;
    document.querySelector(".win-percentage").innerHTML = `${winsObject.win_percentage === null ? "N/A" : winsObject.win_percentage}%`;

    document.querySelector(".avg-quali-pos").innerHTML = overtakingObject.avg_start_pos === null ? "N/A" : overtakingObject.avg_start_pos;
    document.querySelector(".avg-finish-pos").innerHTML = overtakingObject.avg_finish_pos === null ? "N/A" : overtakingObject.avg_finish_pos;

    document.querySelector(".vs-teammates").innerHTML = `${teammateVSObject.teammate_dominance_score === null ? "N/A" : teammateVSObject.teammate_dominance_score}%`;
}

async function loadDriverDetailedStats(driver_id) {
    const totalPositions = await fetch(`${BASEURL}/drivers/${driver_id}/positions`).then(res => res.json());
    const pointsPerSeason = await fetch(`${BASEURL}/drivers/${driver_id}/points`).then(res => res.json());
    const retirements = await fetch(`${BASEURL}/drivers/${driver_id}/retirements`).then(res => res.json());

    const ctxDPC = document.querySelector('#driver-positions-chart').getContext('2d');
    const ctxPPS = document.querySelector('#points-per-season-chart').getContext('2d');
    const ctxRetirements = document.querySelector('#driver-retirement-chart').getContext('2d');

    piechart(totalPositions.positions, ctxDPC);
    piechart(retirements.retirements, ctxRetirements, true);
    barChart(pointsPerSeason.pointsPerSeason, ctxPPS);

}

async function updateSelectedDriver(e) {
    const driver_id = e.target.value;
    const driverObject = await getCachedDrivers().then(d => d.filter(d => d.driver_id === driver_id)[0]);
    if (driverObject !== undefined) {
        const verifiedDriverId = driverObject.driver_id;

        document.querySelectorAll(".selected-driver-name").forEach(element => element.innerHTML = driverObject.givenName.concat(" ", driverObject.familyName));
        await loadSimpleDriverData(verifiedDriverId);
        await loadDriverDetailedStats(verifiedDriverId).then(() => {
            document.querySelector(".driver-stats-simple").classList.remove("hidden");
            document.querySelector(".driver-stats-charts").classList.remove("hidden");
        });
    } else {
        document.querySelector(".driver-stats-charts").classList.add("hidden");
        document.querySelector(".driver-stats-simple").classList.add("hidden");
    }
}

function switchToAddNewResultForm(e) {
    document.querySelector(".driver-select").classList.toggle("hidden");
    document.querySelector(".driver-name").value = "";
    document.querySelector(".drivers").innerHTML = `<option value="">- Select Your Driver -</option>`;
    updateSelectedDriver(e);

    document.querySelector(".add-driver").classList.toggle("hidden");
    document.querySelector(".switch").innerHTML = document.querySelector(".driver-select").classList.contains("hidden") ? "Search Drivers" : "Add Driver";
}

async function addNewDriverResult(e) {
    e.preventDefault();
    const data = {
        driver_id: document.querySelector(".new-first-name").value.toLowerCase().trim(),
        givenName: document.querySelector(".new-first-name").value.trim(),
        familyName: document.querySelector(".new-family-name").value.trim(),
        nationality: document.querySelector(".new-nationality").value.trim(),
        dob: new Date(document.querySelector(".new-dob").value.trim()).toISOString().split('T')[0]
    };

    await fetch(`${BASEURL}/drivers/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(() => getCachedDrivers(true));

    document.querySelector(".new-first-name").value = "";
    document.querySelector(".new-family-name").value = "";
    document.querySelector(".new-nationality").value = "";
    document.querySelector(".new-dob").value = "";

    alert("New driver added successfully!");
}

function centraMap() {
    const containerId = 'centra-map';
    const el = document.getElementById(containerId);
    if (!el) return;

    // If a map was previously created, remove it first
    if (window._centraMap) {
        window._centraMap.remove();
        window._centraMap = null;
    }

    const drivers = CACHE.drivers || [];
    const coordinates = getCoordinates(drivers).filter(c => Array.isArray(c) && c.length === 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]));

    // create map
    const map = L.map(containerId);
    window._centraMap = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    if (coordinates.length === 0) {
        // no valid coordinates — keep a sensible default view
        map.setView([0, 0], 100);
        return;
    }

    const markers = coordinates.map(coord => L.marker(coord));
    const markersGroup = L.featureGroup(markers).addTo(map);

    // fit to markers with some padding
    const bounds = markersGroup.getBounds();
    map.fitBounds(bounds, { padding: [50, 50] });
}

function getCoordinates(drivers) {
    const coordinates = [];
    for (let i = 0; i < drivers.length ; i++) {
        coordinates[i] = getCountryCoordinates(drivers[i].nationality);
    }
    return coordinates;
}

Chart.register(ChartDataLabels);
init();
