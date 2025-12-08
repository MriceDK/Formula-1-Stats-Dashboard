/* Transform a mysql datetime object to a date string */
function getDate(release_date) {
    return release_date.toDateString();
}

/*
Takes an array of objects
For each object the value of the key `key` is taken and put in a new array.
This new array of strings is then returned.
*/
function flatten(results, key) {
    return results.map(element => element[key]);
}

/* Takes the first element of an array */
function takeFirst(results) {
    return results[0];
}

export { getDate, flatten, takeFirst }
