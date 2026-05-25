
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

function deepCopy(dst, src) {
    for (var p in src) {
        if (src[p] !== null && typeof src[p] === 'object') {
            if (dst.hasOwnProperty(p)) {
                this.deepCopy(dst[p], src[p]);
            } else {
                dst[p] = src[p]
            }
        } else {
            dst[p] = src[p]
        }
    }
}

function deepEquals(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
        return arrayEquals(a, b);
    }
    const ta = typeof a, tb = typeof b;
    if (ta != tb) {
        return false;
    }
    if (ta !== 'object') {
        return a === b;
    }
    if (Object.keys(a).length != Object.keys(b).length) {
        return false;
    }
    for (const p in a) {
        if (!deepEquals(a[p], b[p])) {
            return false;
        }
    }
    return true;
}

function arrayEquals(a, b) {
    return a.length == b.length
        && a.find((item, index, _) => !deepEquals(item, b[index])) === undefined;
}

module.exports = {
    unhex,
    intToIP,
    filterProperties,
    deepCopy,
    deepEquals
};
