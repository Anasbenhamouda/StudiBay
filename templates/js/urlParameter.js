// splits up all url parameters in array of json objects
// consisting of name/value pairs
function getUrlParameters() {
    // split name/value pairs into array elements
    var pairs = window.location.search.substring(1).split('&');

    // create target array
    var arr = Array();

    // transform each pair into json object and add to array
    for (i = 0; i < pairs.length; i++) {
        // only process if pair exists
        if (pairs[i].length > 0) {
            // split into name/value pair
            var pair = pairs[i].split('=');
            
            // create json object and add to array
            arr.push({
                parameterName: pair[0], 
                parameterValue: decodeURIComponent(pair[1])
            });
        }
    }

    // return array
    return arr;
}

// counts all url parameters
function countUrlParameters() {
    return getUrlParameters().length;
}

// return true, if url parameters received
function hasUrlParameters() {
    return countUrlParameters() > 0;
}

// extracts value of name value pair by name
// return null if not existent
function getUrlParameterValue(parameterName) {
    var params = getUrlParameters();

    for (i = 0; i < params.length; i++) {
        if (params[i].parameterName === parameterName) {
            return params[i].parameterValue;
        }
    }

    return null;
}

// searches for name value pair by name
// return true if exists, otherwise false
function existsUrlParameter(parameterName) {
    var params = getUrlParameters();

    for (i = 0; i < params.length; i++) {
        if (params[i].parameterName === parameterName) {
            return true;
        }
    }

    return false;
}