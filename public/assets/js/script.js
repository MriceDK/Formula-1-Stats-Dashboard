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
}

async function getAllDriverNames() {
    const driverSelect = document.querySelector(".drivers");
    driverSelect.innerHTML = "";

    if (cache.drivers === null) {
        cache.drivers = await fetch(`${BASEURL}/drivers`).then(res => res.json());
        console.info("Drivers Cached");
    }
    const drivers = cache.drivers;

    const filterValue = document.querySelector(".driver-name").value.toLowerCase();
    const filteredDrivers = drivers.filter(driver => driver.givenName.concat(" ", driver.familyName).toLowerCase().includes(filterValue));
    console.log(filteredDrivers);
    filteredDrivers.forEach(driver => {
        const { driver_id, givenName, familyName} = driver;
        const fullName = givenName.concat(" ", familyName);
        driverSelect.insertAdjacentHTML(`beforeend`, driverOptionElement(driver_id, fullName));
    });
}

function driverOptionElement(driver_id, driver_name) {
    return `<option value="${driver_id}">${driver_name}</option>`
}


init();