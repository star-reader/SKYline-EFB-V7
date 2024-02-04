// airac数据
// TODO: 画更多的AIRAC类型进离场程序，而不是目前这种重复的
function calculateGreatCirclePath(from: Coordinate, to: Coordinate): Coordinate[] {
    const fromLatRad = from.latitude * Math.PI / 180;
    const fromLonRad = from.longitude * Math.PI / 180;
    const toLatRad = to.latitude * Math.PI / 180;
    const toLonRad = to.longitude * Math.PI / 180;

    const deltaLon = toLonRad - fromLonRad;

    const d = Math.acos(Math.sin(fromLatRad) * Math.sin(toLatRad) 
        + Math.cos(fromLatRad) * Math.cos(toLatRad) * Math.cos(deltaLon));

    let f = (f: number) => {
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(fromLatRad) * Math.cos(fromLonRad) + B * Math.cos(toLatRad) * Math.cos(toLonRad);
        const y = A * Math.cos(fromLatRad) * Math.sin(fromLonRad) + B * Math.cos(toLatRad) * Math.sin(toLonRad);
        const z = A * Math.sin(fromLatRad) + B * Math.sin(toLatRad);
        return {
            latitude: Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI,
            longitude: Math.atan2(y, x) * 180 / Math.PI
        };
    }

    // 可以调整 step 的大小，得到更精细的路径点
    const step = 0.01;
    const steps = Math.ceil(1/step);

    let coordinates: Coordinate[] = [];
    for(let i = 0; i <= steps; i++) {
        coordinates.push(f(i * step));
    }
    
    return coordinates;
}

function calculateCoordinateByBearingAndDistance(start: Coordinate, bearing: number, distance: number): Coordinate {
    const earthRadius = 6371
    const startLatRad = start.latitude * Math.PI / 180
    const startLonRad = start.longitude * Math.PI / 180
    const bearingRad = bearing * Math.PI / 180
    const endLatRad = Math.asin(Math.sin(startLatRad) * Math.cos(distance/earthRadius) + 
                                Math.cos(startLatRad) * Math.sin(distance/earthRadius) * Math.cos(bearingRad))
    const endLonRad = startLonRad + Math.atan2(Math.sin(bearingRad) * Math.sin(distance/earthRadius) * Math.cos(startLatRad), 
                                               Math.cos(distance/earthRadius) - Math.sin(startLatRad) * Math.sin(endLatRad))
    return {
        latitude: endLatRad * 180 / Math.PI,
        longitude: endLonRad * 180 / Math.PI
    }
}

function calculateDistance(start: Coordinate, end: Coordinate): number {
    let radius = 6371; // 地球半径，单位为千米
    let startLat = toRadians(start.latitude);
    let startLng = toRadians(start.longitude);
    let endLat = toRadians(end.latitude);
    let endLng = toRadians(end.longitude);

    let dLat = endLat - startLat;
    let dLng = endLng - startLng;

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
}

function calculateBearing(start: Coordinate, end: Coordinate): number {
    let startLat = toRadians(start.latitude);
    let startLng = toRadians(start.longitude);
    let endLat = toRadians(end.latitude);
    let endLng = toRadians(end.longitude);

    let dLng = endLng - startLng;

    let y = Math.sin(dLng) * Math.cos(endLat);
    let x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    let bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
}

function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

function toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}

function calculateArcPath(start: Coordinate, end: Coordinate, center: Coordinate, isClockwise: boolean): Coordinate[] {
    let path = [];
    let startAngle = calculateBearing(center, start);
    let endAngle = calculateBearing(center, end);
    
    if (isClockwise && endAngle < startAngle) {
        endAngle += 360;
    } else if (!isClockwise && endAngle > startAngle) {
        startAngle += 360;
    }

    let step = isClockwise ? 1 : -1;
    for (let angle = startAngle; (isClockwise ? angle <= endAngle : angle >= endAngle); angle += step) {
        let point = calculateCoordinateByBearingAndDistance(center, angle % 360, calculateDistance(center, start));
        path.push(point);
    }

    return path;
}

function AF(start: Coordinate, end: Coordinate, center: Coordinate): Coordinate[] {
    return calculateArcPath(start, end, center, true);
}

function RF(start: Coordinate, end: Coordinate, center: Coordinate): Coordinate[] {
    return calculateArcPath(start, end, center, false);
}

function IF(fix: Coordinate): Coordinate[] {
    return [fix]
}

function TF(fromFix: Coordinate, toFix: Coordinate): Coordinate[] {
    return calculateGreatCirclePath(fromFix, toFix);
}

function CF(fromFix: Coordinate, course: number, toFix: Coordinate): Coordinate[] {
    let path = calculateGreatCirclePath(fromFix, toFix);
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, course, path.length);
    return [...path, targetPoint];
}

function CA(fromFix: Coordinate, course: number, altitude: number): Coordinate[] {
    // 假设每升高1000米，飞行距离为111.2千米
    let distance = altitude / 1000 * 111.2;
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, course, distance);
    return calculateGreatCirclePath(fromFix, targetPoint);
}

function FD(fromFix: Coordinate, dmeReference: Coordinate, dmeDistance: number): Coordinate[] {
    let referencePath = calculateGreatCirclePath(fromFix, dmeReference);
    let targetPoint = referencePath[Math.floor(dmeDistance)];
    return calculateGreatCirclePath(fromFix, targetPoint);
}

function CD(fromFix: Coordinate, course: number, dmeDistance: number): Coordinate[] {
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, course, dmeDistance);
    return calculateGreatCirclePath(fromFix, targetPoint);
}

function FA(fromFix: Coordinate, toFix: Coordinate, altitude: number): Coordinate[] {
    let fullpath = calculateGreatCirclePath(fromFix, toFix);
    // 假设每升高1000米，飞行距离为111.2千米
    let distance = altitude / 1000 * 111.2;
    return fullpath.slice(0, Math.floor(distance));
}

function FC(fromFix: Coordinate, toFix: Coordinate, dmeDistance: number): Coordinate[] {
    let fullpath = calculateGreatCirclePath(fromFix, toFix);
    return fullpath.slice(0, Math.floor(dmeDistance));
}

function DF(fromFix: Coordinate, toFix: Coordinate, dmeDistance: number): Coordinate[] {
    let startPoint = calculateCoordinateByBearingAndDistance(fromFix, 0, dmeDistance);
    return calculateGreatCirclePath(startPoint, toFix);
}

function VA(fromFix: Coordinate, heading: number, vor: Coordinate): Coordinate[] {
    let radialBearing = (heading + 180) % 360; // 计算径向线的方位角
    // 假设距离为1000千米，这个值足够大以保证与飞行路径相交
    let targetPoint = calculateCoordinateByBearingAndDistance(vor, radialBearing, 1000);
    return calculateGreatCirclePath(fromFix, targetPoint);
}

function VM(fromFix: Coordinate, heading: number): Coordinate[] {
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, heading, 1000);
    return calculateGreatCirclePath(fromFix, targetPoint);
}

function CI(fromFix: Coordinate, course: number, interceptRadial: { reference: Coordinate, angle: number }): Coordinate[] {
    let radialBearing = (interceptRadial.angle + 180) % 360;
    // 假设距离为1000千米，足够大以保证相交
    let interceptPoint = calculateCoordinateByBearingAndDistance(interceptRadial.reference, radialBearing, 1000);
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, course, 1000);
    return [...calculateGreatCirclePath(fromFix, targetPoint), interceptPoint];
}

function VD(fromFix: Coordinate, heading: number, dmeDistance: number): Coordinate[] {
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, heading, dmeDistance);
    return calculateGreatCirclePath(fromFix, targetPoint);
}

function VI(fromFix: Coordinate, heading: number, interceptRadial: { reference: Coordinate, angle: number }): Coordinate[] {
    let radialBearing = (interceptRadial.angle + 180) % 360;
    // 假设距离为1000千米，足够大以保证相交
    let interceptPoint = calculateCoordinateByBearingAndDistance(interceptRadial.reference, radialBearing, 1000);
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, heading, 1000);
    return [...calculateGreatCirclePath(fromFix, targetPoint), interceptPoint];
}

function VR(fromFix: Coordinate, heading: number, radialTermination: Coordinate): Coordinate[] {
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, heading, 1000); // 假设距离为1000千米
    return [...calculateGreatCirclePath(fromFix, targetPoint), radialTermination];
}

function FM(fromFix: Coordinate, heading: number): Coordinate[] {
    let targetPoint = calculateCoordinateByBearingAndDistance(fromFix, heading, 1000); // 假设距离为1000千米
    return calculateGreatCirclePath(fromFix, targetPoint);
}

export{
    IF, TF, FA, FM, FC, FD, CF, CA, CD, CI, VA,
    VM, VD, VI, VR, DF, AF, RF
}