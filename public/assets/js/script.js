import {barChart, piechart} from "./charts.js";
import {BASEURL} from "./config.js";

const BASEURL = 'http://localhost:3000';
const CACHE = {
    drivers : null,
};




async function init() {
    await getAllDriverNames();
    document.querySelector(".search-driver-form").addEventListener("submit", e => {
        e.preventDefault();
        getAllDriverNames().then(() => document.querySelector(".driver-stats-simple").classList.add("hidden"));
        updateSelectedDriver(e);
    });
    document.querySelector(".drivers").addEventListener("change", updateSelectedDriver);
    document.querySelector(".switch").addEventListener("click", e => switchToAddNewResultForm(e));
}

async function getCachedDrivers() {
    if (CACHE.drivers === null) {
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

    document.querySelector(".new-result-form").classList.toggle("hidden");
    document.querySelector(".switch").innerHTML = document.querySelector(".driver-select").classList.contains("hidden") ? "Search Drivers" : "Add New Result";
}

Chart.register(ChartDataLabels);
init();
