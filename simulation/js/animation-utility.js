"use strict";
export function setCoordinates(xObject, yObject, textObject) {
    gsap.set(textObject, {
        x: xObject,
        y: yObject
    })
}
export function fillInputDots(object, cxObject, cyObject, rObject, fillObject) {
    gsap.set(object, {
        attr: { cx: cxObject, cy: cyObject, r: rObject, fill: fillObject }
    });
}
export function objectDisappear(object) {
    gsap.to(object, 0, { autoAlpha: 0 });
}
export function objectAppear(object) {
    gsap.to(object, 0, { autoAlpha: 1 });
}
export function fillColor(object, color) {
    gsap.set(object, {
        fill: color
    });
}
export function setColor(object) {

    fillColor(object, "#eeeb22");
}
export function unsetColor(object) {
    fillColor(object, "#29e");
}

export function setter(value, component) {
    if (value === "1") {
        unsetColor(component);
    }
    else if (value === "0") {
        setColor(component);
    }
}

export function calculateFullAdder(a, b, cin) {
    let sum = parseInt(a) + parseInt(b) + parseInt(cin);
    switch (sum) {
        case 0:
            return ["0", "0"];
        case 1:
            return ["1", "0"];
        case 2:
            return ["0", "1"];
        default:
            return ["1", "1"];
    }
}

export function calculateAnd(a, b) {
    if (a === "1" && b === "1") {
        return "1";
    }
    return "0";
}

export function calculateXor(a, b) {
    if (a === b) {
        return "0";
    }
    return "1";
}

export function calculateOr(a, b) {
    if (a === "1" || b === "1") {
        return "1";
    }
    return "0";
}

export function calculateNot(a) {
    if (a === "1") {
        return "0";
    }
    return "1";
}

export function calculateMux(a, b, cin, s1, s2) {
    let combinedString = s1+s2;
    switch (combinedString) {
        case "00":
            return calculateFullAdder(a, b, cin)[0];
        case "01":
            return calculateAnd(a, b);
        case "10":
            return calculateOr(a, b);
        default:
            return calculateXor(a, b);
    }
}


