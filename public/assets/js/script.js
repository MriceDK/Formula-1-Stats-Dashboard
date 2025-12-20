const BASEURL = 'http://localhost:3000';

const cache = {
    drivers : null,
}



function init() {
    getAllDriverNames();
    document.querySelector(".search-driver-form").addEventListener("submit", e => {
        e.preventDefault();
        getAllDriverNames();
    });
    document.querySelector(".drivers").addEventListener("change", updateSelectedDriver);
}

async function getCachedDrivers() {
    if (cache.drivers === null) {
        cache.drivers = await fetch(`${BASEURL}/drivers`).then(res => res.json());
        console.info("Drivers Cached");
    }
    return cache.drivers;
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
    return `<option value="${driver_id}">${driver_name}</option>`
}

async function updateSelectedDriver(e) {
    const driver_id = e.target.value;
    if (driver_id !== "") {
        const driverObject = await getCachedDrivers().then(d => d.filter(d => d.driver_id === driver_id)[0]);
        const verifiedDriverId = driverObject.driver_id;
        const winsObject = await fetch(`${BASEURL}/drivers/${verifiedDriverId}/wins`).then(res => res.json());


        document.querySelector(".selected-driver-name").innerHTML = driverObject.givenName.concat(" ", driverObject.familyName);
        document.querySelector(".total-races").innerHTML = winsObject.total_races;
        document.querySelector(".win-percentage").innerHTML = winsObject.win_percentage;

        document.querySelector(".driver-stats").classList.remove("hidden");
    } else {
        document.querySelector(".driver-stats").classList.add("hidden");
    }
}


init();