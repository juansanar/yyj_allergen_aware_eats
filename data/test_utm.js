function utmToLatLng(easting, northing, zone = 10, northernHemisphere = true) {
    const UTM_SCALE_FACTOR = 0.9996;
    const a = 6378137.0; // WGS84 semi-major axis
    const f = 1.0 / 298.257223563; // WGS84 flattening
    const b = a * (1 - f); // semi-minor axis
    const e2 = (a*a - b*b) / (a*a); // eccentricity squared
    const ePrime2 = (a*a - b*b) / (b*b); // second eccentricity squared
    
    const x = easting - 500000.0; // remove false easting
    const y = northernHemisphere ? northing : northing - 10000000.0;
    
    const lambda0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180.0; // central meridian
    
    const n = (a - b) / (a + b);
    
    // Footprint latitude
    const M = y / UTM_SCALE_FACTOR;
    const mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*Math.pow(e2, 3)/256));
    
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const J1 = (3*e1/2 - 27*Math.pow(e1, 3)/32);
    const J2 = (21*e1*e1/16 - 55*Math.pow(e1, 4)/32);
    const J3 = (151*Math.pow(e1, 3)/96);
    const J4 = (1097*Math.pow(e1, 4)/512);
    
    const fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);
    
    const C1 = ePrime2 * Math.pow(Math.cos(fp), 2);
    const T1 = Math.pow(Math.tan(fp), 2);
    const R1 = a * (1 - e2) / Math.pow(1 - e2*Math.sin(fp)*Math.sin(fp), 1.5);
    const N1 = a / Math.sqrt(1 - e2*Math.sin(fp)*Math.sin(fp));
    const D = x / (N1 * UTM_SCALE_FACTOR);
    
    // Latitude
    let lat = fp - (N1 * Math.tan(fp) / R1) * (D*D/2 - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*ePrime2)*Math.pow(D, 4)/24 + (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*ePrime2 - 3*C1*C1)*Math.pow(D, 6)/720);
    
    // Longitude
    let lon = (D - (1 + 2*T1 + C1)*Math.pow(D, 3)/6 + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*C1*C1 + 24*T1*T1)*Math.pow(D, 5)/120) / Math.cos(fp);
    
    lat = lat * 180.0 / Math.PI;
    lon = (lon * 180.0 / Math.PI) + (lambda0 * 180.0 / Math.PI);
    
    return { lat, lng: lon };
}

// Test with BLOCK KITCHEN AND BAR coordinates
const blockCoords = utmToLatLng(472709.484, 5363834.2373, 10, true);
console.log("BLOCK KITCHEN AND BAR Lat/Lng:", blockCoords);
