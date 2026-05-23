
function unhex(data) {
    result = "";
    for (i=0; i<data.length; i+=2) {
        result += String.fromCharCode(Number.parseInt(data.substr(i,2), 16))
    }
    return result
}

function intToIP(value) {
    a = value >>> 24;
    b = (value & 0x00FF0000) >>> 16;
    c = (value & 0x0000FF00) >>> 8;
    d = (value & 0x000000FF);
    return `${a}.${b}.${c}.${d}`;
}

function filterProperties (obj, properties) {
    let ret = {};
    for (var p of properties) {
        ret[p] = obj[p];
    }
    return ret;
}

module.exports = {
    unhex,
    intToIP,
    filterProperties
};
