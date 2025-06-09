global.packageMoveCameraData = (x, y, z, pitch, yaw) => {
    let returnpackage = new $CompoundTag()
    let location = new $CompoundTag()
    location.putDouble("x", x)
    location.putDouble("y", y)
    location.putDouble("z", z)
    let direction = new $CompoundTag()
    direction.putFloat("x", pitch)
    direction.putFloat("y", yaw)

    returnpackage.put("direction", direction)
    returnpackage.put("location", location)

    return returnpackage
}
global.generateYawPitchTransition = (start, end, interval, getEnd) => {
    let sYaw = Number(start.yaw);
    let eYaw = Number(end.yaw);
    let sPitch = Number(start.pitch);
    let ePitch = Number(end.pitch);
    interval = Math.abs(Number(interval));

    let arr = [];
    if (!interval || interval <= 0) return arr;

    // Let the caller handle scheduling or duration. Just make one step per interval, from 0 to 1.
    // For example, caller: for t = 0; t <= 1; t += (interval / totalDuration)
    for (let t = 0; t < 1; t += interval) {
        let deltaYaw = ((eYaw - sYaw + 540) % 360) - 180;
        let interpYaw = (sYaw + deltaYaw * t + 360) % 360;
        let interpPitch = sPitch + (ePitch - sPitch) * t;
        arr.push({
            yaw: interpYaw,
            pitch: interpPitch,
            t: t
        });
    }
    if(getEnd) {
        // Always include the exact end
        arr.push({
            yaw: eYaw,
            pitch: ePitch,
            t: 1
        });
    }
    return arr;
}


global.generateLineWithTiming = (from, to, distance, interval) => {
    // Read coordinates (support NativeObject or plain objects)
    let fx = from.x !== undefined ? from.x : from['x'];
    let fy = from.y !== undefined ? from.y : from['y'];
    let fz = from.z !== undefined ? from.z : from['z'];
    let tx = to.x !== undefined ? to.x : to['x'];
    let ty = to.y !== undefined ? to.y : to['y'];
    let tz = to.z !== undefined ? to.z : to['z'];

    // Calculate total straight-line distance
    let dx = tx - fx;
    let dy = ty - fy;
    let dz = tz - fz;
    let totalDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Calculate number of steps
    let steps = Math.max(1, Math.floor(totalDist / distance));
    let arr = [];

    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let x = fx + dx * t;
        let y = fy + dy * t;
        let z = fz + dz * t;

        arr.push({
            pos: { x: x, y: y, z: z },
            time: i * interval
        });
    }

    return arr;
}
global.getCirclePositions = (center, radius, step) => {
    let PI = 3.14159265359;
    let positions = [];
    let cx = center.x !== undefined ? center.x : center['x'];
    let cy = center.y !== undefined ? center.y : center['y'];
    let cz = center.z !== undefined ? center.z : center['z'];
    let circumference = 2 * PI * radius;
    let points = Math.max(1, Math.floor(circumference / step));

    for (let i = 0; i < points; i++) {
        let angle = (2 * PI * i) / points;
        let x = cx + radius * Math.cos(angle);
        let z = cz + radius * Math.sin(angle);
        positions.push({ x: x, y: cy, z: z });
    }
    return positions;
}
global.packageRenderParticleData = (particle_type, x, y, z, dx, dy, dz, count, speed) => {
    let returnpackage = new $CompoundTag()
    let location = new $CompoundTag()
    location.putDouble("x", x)
    location.putDouble("y", y)
    location.putDouble("z", z)
    let direction = new $CompoundTag()
    direction.putDouble("x", dx)
    direction.putDouble("y", dy)
    direction.putDouble("z", dz)

    returnpackage.putString("particle", particle_type)
    returnpackage.putDouble("speed", speed)
    returnpackage.putInt("count", count)

    returnpackage.put("direction", direction)
    returnpackage.put("location", location)

    return returnpackage
}
function lerp(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + (b - a) * t;
    }
    if (typeof a === 'object' && typeof b === 'object') {
        let result = {};
        for (let key in a) {
            if (b.hasOwnProperty(key)) {
                result[key] = lerp(a[key], b[key], t);
            }
        }
        return result;
    }
    return a;
}
global.syncTransitionsByTime = (referenceArr, transitionArrs) => {
 if (!Array.isArray(referenceArr) || referenceArr.length === 0) {
        return [];
    }
    let result = [];
    for (let i = 0; i < referenceArr.length; i++) {
        let ref = referenceArr[i];
        let t = (typeof ref.t === "number") ? ref.t : (i / Math.max(1, referenceArr.length - 1));
        let synced = [ref];
        for (let j = 0; j < transitionArrs.length; j++) {
            let arr = transitionArrs[j];
            if (!Array.isArray(arr) || arr.length === 0) {
                synced.push(undefined);
                continue;
            }
            // Find closest frame by progress t
            let closest = arr[0];
            let minDiff = Math.abs(t - arr[0].t);
            for (let k = 1; k < arr.length; k++) {
                let diff = Math.abs(t - arr[k].t);
                if (diff < minDiff) {
                    closest = arr[k];
                    minDiff = diff;
                }
            }
            synced.push(closest);
        }
        result.push(synced);
    }
    return result;
}
