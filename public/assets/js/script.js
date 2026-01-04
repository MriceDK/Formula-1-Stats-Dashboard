import {barChart, piechart} from "./charts.js";
import {BASEURL} from "./config.js";
import {getNationalitiesList} from "./nationalities.js";
import {initializeMap, updateMapWithDrivers} from "./map.js";
import {Chart} from "chart.js";

const CACHE = {
    drivers : null,
};

async function init() {
    try {
        const webSocket = new WebSocket("ws://localhost:8080");
        webSocket.addEventListener("message", processIncoming);
        await getAllDriverNames();
        initializeMap();
        document.querySelector(".search-driver-form").addEventListener("submit", e => {
            e.preventDefault();
            getAllDriverNames().then(() => document.querySelector(".driver-stats-simple").classList.add("hidden"));
            updateSelectedDriver(e);
        });
        document.querySelector(".drivers").addEventListener("change", updateSelectedDriver);
        document.querySelector(".switch").addEventListener("click", e => switchToAddNewResultForm(e));
        document.querySelector(".new-driver-form").addEventListener("submit", e => addNewDriverResult(e));
        loadAllNationalities();
    } catch (err) {
        showError("Failed to initialize application. Please refresh the page.", "error");
    }

}

function showError(message, type = "error") {
    const existingError = document.querySelector(".error-message");
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = `error-message ${type}`;
    errorDiv.innerHTML = `
        <span class="error-text">${message}</span>
        <button class="error-close">&times;</button>
    `;

    const main = document.querySelector("main");
    main.insertBefore(errorDiv, main.firstChild);

    errorDiv.querySelector(".error-close").addEventListener("click", () => {
        errorDiv.remove();
    });

    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

async function getCachedDrivers(clearCache = false) {
    try {
        if (CACHE.drivers === null || clearCache) {
            const response = await fetch(`${BASEURL}/drivers`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            CACHE.drivers = await response.json();
        }
        return CACHE.drivers;
    } catch (err) {
        showError("Failed to load drivers data. Please try again.", "error");
        return [];
    }
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
    try {
        const winsObject = await fetch(`${BASEURL}/drivers/${driver_id}/wins`).then(res => res.json());
        const overtakingObject = await fetch(`${BASEURL}/drivers/${driver_id}/overtaking`).then(res => res.json());
        const teammateVSObject = await fetch(`${BASEURL}/drivers/${driver_id}/teammates`).then(res => res.json());

        document.querySelector(".total-races").innerHTML = `${winsObject.total_races === null ? "N/A" : winsObject.total_races} races`;
        document.querySelector(".win-percentage").innerHTML = `${winsObject.win_percentage === null ? "N/A" : winsObject.win_percentage}%`;

        document.querySelector(".avg-quali-pos").innerHTML = overtakingObject.avg_start_pos === null ? "N/A" : overtakingObject.avg_start_pos;
        document.querySelector(".avg-finish-pos").innerHTML = overtakingObject.avg_finish_pos === null ? "N/A" : overtakingObject.avg_finish_pos;

        document.querySelector(".vs-teammates").innerHTML = `${teammateVSObject.teammate_dominance_score === null ? "N/A" : teammateVSObject.teammate_dominance_score}%`;
    } catch (err) {
        showError("Failed to load driver simple data. Please try again.", "error");
    }
}

async function loadDriverDetailedStats(driver_id) {
    try {
        const totalPositions = await fetch(`${BASEURL}/drivers/${driver_id}/positions`).then(res => res.json());
        const pointsPerSeason = await fetch(`${BASEURL}/drivers/${driver_id}/points`).then(res => res.json());
        const retirements = await fetch(`${BASEURL}/drivers/${driver_id}/retirements`).then(res => res.json());

        const ctxDPC = document.querySelector('#driver-positions-chart').getContext('2d');
        const ctxPPS = document.querySelector('#points-per-season-chart').getContext('2d');
        const ctxRetirements = document.querySelector('#driver-retirement-chart').getContext('2d');

        piechart(totalPositions.positions, ctxDPC);
        piechart(retirements.retirements, ctxRetirements, true);
        barChart(pointsPerSeason.pointsPerSeason, ctxPPS);
    } catch (err) {
        showError("Failed to load driver detailed stats. Please try again.", "error");
    }
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
    updateSelectedDriver(e).catch(() => {});
    document.querySelector(".add-driver").classList.toggle("hidden");
    document.querySelector(".switch").innerHTML = document.querySelector(".driver-select").classList.contains("hidden") ? "Search Drivers" : "Add Driver";
    if (!document.querySelector(".add-driver").classList.contains("hidden")) {
        initializeMap();
    }
}

async function addNewDriverResult(e) {
    e.preventDefault();

    const firstName = document.querySelector(".new-first-name").value.trim();
    const familyName = document.querySelector(".new-family-name").value.trim();
    const nationality = document.querySelector(".new-nationality").value.trim();
    const dob = document.querySelector(".new-dob").value.trim();

    if (!firstName || !familyName || !nationality || !dob) {
        showError("Please fill in all required fields.", "warning");
        return;
    }

    const data = {
        driver_id: firstName.toLowerCase().concat("_", familyName.toLowerCase()),
        givenName: firstName,
        familyName: familyName,
        nationality: nationality,
        dob: new Date(dob).toISOString().split('T')[0]
    };

    try {
        const response = await fetch(`${BASEURL}/drivers/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await getCachedDrivers(true);
        updateMapWithDrivers();

        document.querySelector(".new-first-name").value = "";
        document.querySelector(".new-family-name").value = "";
        document.querySelector(".new-nationality").value = "";
        document.querySelector(".new-dob").value = "";
        const { givenName, familyName } = data;
        showError(`Driver ${givenName} ${familyName} added successfully!`, "success");
    } catch (err) {
        showError("Failed to add driver. Please try again.", "error");
    }

}

async function processIncoming(e) {
    try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'driver-added' && msg.driver) {
            if (!CACHE.drivers) CACHE.drivers = [];
            const exists = CACHE.drivers.some(d => d.driver_id === msg.driver.driver_id);
            if (!exists) {
                CACHE.drivers.push(msg.driver);
                await getAllDriverNames();

                if (!window._sessionAddedDrivers) {
                    window._sessionAddedDrivers = [];
                }
                window._sessionAddedDrivers.push(msg.driver);

                updateMapWithDrivers();
                showError(`New driver ${msg.driver.givenName} ${msg.driver.familyName} added by another user!`, "success");
            }
        }
    } catch (err) {
    }
}

function loadAllNationalities() {
    const nationalities = getNationalitiesList();
    const nationalitySelect = document.querySelector(".new-nationality");
    nationalities.forEach(nationality => {
        nationalitySelect.insertAdjacentHTML(`beforeend`, `<option value="${nationality}">${nationality}</option>`);
    });
}

Chart.register(ChartDataLabels);
init();
