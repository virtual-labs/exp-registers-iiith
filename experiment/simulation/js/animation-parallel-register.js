"use strict";
// Dimensions of working area
const circuitBoard = document.getElementById("circuit-board");
const sidePanels = document.getElementsByClassName("v-datalist-container");
// Distance of working area from top
const circuitBoardTop = circuitBoard.offsetTop;
// Full height of window
const windowHeight = window.innerHeight;
const width = window.innerWidth;
if (width < 1024) {
  circuitBoard.style.height = 600 + "px";
} else {
  circuitBoard.style.height = windowHeight - circuitBoardTop - 20 + "px";
}
sidePanels[0].style.height = circuitBoard.style.height;

const svg = document.querySelector(".svg");
const inputpath1 = document.querySelector("#inputpath1");
const svgns = "http://www.w3.org/2000/svg";
gsap.registerPlugin(MotionPathPlugin);


let textI1 = document.createElementNS(svgns, "text");
let textI2 = document.createElementNS(svgns, "text");
let textI3 = document.createElementNS(svgns, "text");
let textI4 = document.createElementNS(svgns, "text");
let textClock = document.createElementNS(svgns, "text");
let textO1 = document.createElementNS(svgns, "text");
let textO2 = document.createElementNS(svgns, "text");
let textO3 = document.createElementNS(svgns, "text");
let textO4 = document.createElementNS(svgns, "text");
let textSelect = document.createElementNS(svgns, "text");

textI1.textContent = 2;
textI2.textContent = 2;
textI3.textContent = 2;
textI4.textContent = 2;

textSelect.textContent = 1;

textClock.textContent = 2;
gsap.set(textSelect, {
    x: 116,
    y: 804
});
gsap.set(textO1, {
    x: 546,
    y: 54
});
gsap.set(textO2, {
    x: 546,
    y: 254
});
gsap.set(textO3, {
    x: 546,
    y: 454
});
gsap.set(textO4, {
    x: 546,
    y: 654
});
svg.appendChild(textO1);
svg.appendChild(textSelect);
svg.appendChild(textO2);
svg.appendChild(textO3);
svg.appendChild(textO4);
const I1 = document.getElementById("SERIALINPUT1");
const I2 = document.getElementById("SERIALINPUT2");
const I3 = document.getElementById("SERIALINPUT3");
const I4 = document.getElementById("SERIALINPUT4");
const CLOCK = document.getElementById("CLOCK");
const O1 = document.getElementById("SERIALOUTPUT1");
const O2 = document.getElementById("SERIALOUTPUT2");
const O3 = document.getElementById("SERIALOUTPUT3");
const O4 = document.getElementById("SERIALOUTPUT4");
const SELECT = document.getElementById("COMMONSELECT");
const BUTTON = document.getElementById("play/pause");
const OBSERV = document.getElementById("Observations");

let serialDot1 = document.createElementNS(svgns, "circle");
gsap.set(serialDot1, {
    attr: { cx: 50, cy: 50, r: 15, fill: "#FF0000" }
});
let clockDot = document.createElementNS(svgns, "circle");
gsap.set(clockDot, {
    attr: { cx: 20, cy: 400, r: 15, fill: "#FF0000" }
});
let serialDot2 = document.createElementNS(svgns, "circle");
gsap.set(serialDot2, {
    attr: { cx: 50, cy: 250, r: 15, fill: "#FF0000" }
});
let serialDot3 = document.createElementNS(svgns, "circle");
gsap.set(serialDot3, {
    attr: { cx: 50, cy: 450, r: 15, fill: "#FF0000" }
});
let serialDot4 = document.createElementNS(svgns, "circle");
gsap.set(serialDot4, {
    attr: { cx: 50, cy: 650, r: 15, fill: "#FF0000" }
});

svg.appendChild(serialDot1);
svg.appendChild(serialDot3);
svg.appendChild(serialDot4);
svg.appendChild(clockDot);
svg.appendChild(serialDot2);

function myFunction() {
    OBSERV.innerHTML = "";
}
function selectTextDisappear()
{
    TweenLite.to(textSelect, 0, { autoAlpha: 0 });
}
function selectTextVisible()
{
    TweenLite.to(textSelect, 0, { autoAlpha: 1 });
}
function serialDotDisappear() {
    TweenLite.to(serialDot1, 0, { autoAlpha: 0 });
    TweenLite.to(serialDot2, 0, { autoAlpha: 0 });
    TweenLite.to(serialDot3, 0, { autoAlpha: 0 });
    TweenLite.to(serialDot4, 0, { autoAlpha: 0 });
}

function clockDotDisappear() {
    TweenLite.to(clockDot, 0, { autoAlpha: 0 });

}
function serialDotVisible() {
    TweenLite.to(serialDot1, 0, { autoAlpha: 1 });
    TweenLite.to(serialDot2, 0, { autoAlpha: 1 });
    TweenLite.to(serialDot3, 0, { autoAlpha: 1 });
    TweenLite.to(serialDot4, 0, { autoAlpha: 1 });
}

function clockDotVisible() {
    TweenLite.to(clockDot, 0, { autoAlpha: 1 });

}
function outputDisappear() {
    TweenLite.to(textO1, 0, { autoAlpha: 0 });
    TweenLite.to(textO2, 0, { autoAlpha: 0 });
    TweenLite.to(textO3, 0, { autoAlpha: 0 });
    TweenLite.to(textO4, 0, { autoAlpha: 0 });
}
function outputVisible() {
    TweenLite.to(textO1, 0, { autoAlpha: 1 });
    TweenLite.to(textO2, 0, { autoAlpha: 1 });
    TweenLite.to(textO3, 0, { autoAlpha: 1 });
    TweenLite.to(textO4, 0, { autoAlpha: 1 });
}
function serialDisappear1() {
    TweenLite.to(textI1, 0, { autoAlpha: 0 });
}
function serialDisappear2() {
    TweenLite.to(textI2, 0, { autoAlpha: 0 });
}
function serialDisappear3() {
    TweenLite.to(textI3, 0, { autoAlpha: 0 });
}
function serialDisappear4() {
    TweenLite.to(textI4, 0, { autoAlpha: 0 });
}
function clockDisappear() {
    TweenLite.to(textClock, 0, { autoAlpha: 0 });
}
function free() {
    OBSERV.innerHTML = "";
}
function serialVisible1() {
    TweenLite.to(textI1, 0, { autoAlpha: 1 });
}
function serialVisible2() {
    TweenLite.to(textI2, 0, { autoAlpha: 1 });
}
function serialVisible3() {
    TweenLite.to(textI3, 0, { autoAlpha: 1 });
}
function serialVisible4() {
    TweenLite.to(textI4, 0, { autoAlpha: 1 });
}
function clockVisible() {
    TweenLite.to(textClock, 0, { autoAlpha: 1 });
}

function selectDisappear() {
    TweenLite.to(textSelect, 0, { autoAlpha: 0 });
    gsap.set(SELECT, {

        fill: "#008000"
    });
selectTextDisappear();

}
selectDisappear();
function selectVisibleTo1() {
    TweenLite.to(textSelect, 0, { autoAlpha: 1 });
    gsap.set(SELECT, {

        fill: "#29e"
    });
    textSelect.textContent=1;
    selectTextVisible();
    

}
function selectVisibleTo0() {
    TweenLite.to(textSelect, 0, { autoAlpha: 1 });
    gsap.set(SELECT, {

        fill: "#eeeb22"
    });
    textSelect.textContent=0;
    selectTextVisible();
}

function allDisappear() {
    serialDisappear1();
    serialDisappear2();
    serialDisappear3();
    serialDisappear4();
    serialDotDisappear();
    selectDisappear();
    clockDisappear();
    clockDotDisappear();
    outputDisappear();
    gsap.set(I1, {

        fill: "#008000"
    });
    gsap.set(I2, {

        fill: "#008000"
    });
    gsap.set(I3, {

        fill: "#008000"
    });
    gsap.set(I4, {

        fill: "#008000"
    });

    gsap.set(CLOCK, {

        fill: "#008000"
    });
    gsap.set(O1, {

        fill: "#008000"
    });
    gsap.set(O2, {

        fill: "#008000"
    });
    gsap.set(O3, {

        fill: "#008000"
    });
    gsap.set(O4, {

        fill: "#008000"
    });

}
function outputDot() {
    gsap.set(O1, {

        fill: "#008000"
    });
    gsap.set(O2, {

        fill: "#008000"
    });
    gsap.set(O3, {

        fill: "#008000"
    });
    gsap.set(O4, {

        fill: "#008000"
    });
}
function outputHandlerSetter() {
    textO1.textContent = textI1.textContent;
    textO2.textContent = textI2.textContent;
    textO3.textContent = textI3.textContent;
    textO4.textContent = textI4.textContent;
}
let temp = 0;
function outputHandler() {
    temp = textO4.textContent;
    textO4.textContent = textO3.textContent;
    textO3.textContent = textO2.textContent;
    textO2.textContent = textO1.textContent;
    textO1.textContent = temp;
}
function set(a) {
    gsap.set(a, {

        fill: "#eeeb22"
    });
}//output 0
function unset(a) {
    gsap.set(a, {

        fill: "#29e"
    });
}//output 1
function appendI1() {
    if (textI1.textContent != 0 && tl.progress() == 0) {
        serialDisappear1();
        textI1.textContent = 0;
        svg.appendChild(textI1);
        gsap.set(textI1, {
            x: 46,
            y: 54
        });
        gsap.set(I1, {

            fill: "#eeeb22"
        });
        free();
        serialVisible1();
        errno();
        setter(textI1.textContent, serialDot1);

        OBSERV.innerHTML = "I1 is set to 0";
    }
    else if (textI1.textContent != 1 && tl.progress() == 0) {
        appendI1To1();
    }




}
function appendI1To1() {
    serialDisappear1();
    textI1.textContent = 1;
    svg.appendChild(textI1);
    gsap.set(textI1, {
        x: 46,
        y: 54
    });
    gsap.set(I1, {

        fill: "#29e"
    });
    free();
    serialVisible1();
    errno();
    setter(textI1.textContent, serialDot1);

    OBSERV.innerHTML = "I1 is set to 1";

}
function appendI2() {
    if (textI2.textContent != 0 && tl.progress() == 0) {
        serialDisappear2();
        textI2.textContent = 0;
        svg.appendChild(textI2);
        gsap.set(textI2, {
            x: 46,
            y: 254
        });
        gsap.set(I2, {

            fill: "#eeeb22"
        });
        free();
        serialVisible2();
        errno();
        setter(textI2.textContent, serialDot2);

        OBSERV.innerHTML = "I2 is set to 0";
    }
    else if (textI2.textContent != 1 && tl.progress() == 0) {
        appendI2To1();
    }




}
function appendI2To1() {
    serialDisappear2();
    textI2.textContent = 1;
    svg.appendChild(textI2);
    gsap.set(textI2, {
        x: 46,
        y: 254
    });
    gsap.set(I2, {

        fill: "#29e"
    });
    free();
    serialVisible2();
    errno();
    setter(textI2.textContent, serialDot2);

    OBSERV.innerHTML = "I2 is set to 1";

}
function appendI3() {
    if (textI3.textContent != 0 && tl.progress() == 0) {
        serialDisappear3();
        textI3.textContent = 0;
        svg.appendChild(textI3);
        gsap.set(textI3, {
            x: 46,
            y: 454
        });
        gsap.set(I3, {

            fill: "#eeeb22"
        });
        setter(textI3.textContent, serialDot3);
        free();
        serialVisible3();
        errno();



        OBSERV.innerHTML = "I3 is set to 0";
    }
    else if (textI3.textContent != 1 && tl.progress() == 0) {
        appendI3To1();
    }
}




function appendI3To1() {
    serialDisappear3();
    textI3.textContent = 1;
    svg.appendChild(textI3);
    gsap.set(textI3, {
        x: 46,
        y: 454
    });
    gsap.set(I3, {

        fill: "#29e"
    });
    free();
    serialVisible3();
    errno();
    setter(textI3.textContent, serialDot3);

    OBSERV.innerHTML = "I3 is set to 1";

}
function appendI4() {
    if (textI4.textContent != 0 && tl.progress() == 0) {
        serialDisappear4();
        textI4.textContent = 0;
        svg.appendChild(textI4);
        gsap.set(textI4, {
            x: 46,
            y: 654
        });
        gsap.set(I4, {

            fill: "#eeeb22"
        });
        free();
        serialVisible4();
        errno();
        setter(textI4.textContent, serialDot4);

        OBSERV.innerHTML = "I4 is set to 0";
    }
    else if (textI4.textContent != 1 && tl.progress() == 0) {
        appendI4To1();
    }




}
function appendI4To1() {
    serialDisappear4();
    textI4.textContent = 1;
    svg.appendChild(textI4);
    gsap.set(textI4, {
        x: 46,
        y: 654
    });
    gsap.set(I4, {

        fill: "#29e"
    });
    free();
    serialVisible4();
    errno();
    setter(textI4.textContent, serialDot4);

    OBSERV.innerHTML = "I4 is set to 1";

}
function appendClock() {
    if (textClock.textContent != 0 && tl.progress() == 0) {
        clockDisappear();
        textClock.textContent = 0;
        svg.appendChild(textClock);
        gsap.set(textClock, {
            x: 16,
            y: 404
        });
        gsap.set(CLOCK, {

            fill: "#eeeb22"
        });
        free();
        clockVisible();
        setter(textClock.textContent, clockDot);

        errno();

    }
    else if (textClock.textContent != 1 && tl.progress() == 0) {
        appendClockTo1();
    }

}
function appendClockTo1() {
    clockDisappear();
    textClock.textContent = 1;
    svg.appendChild(textClock);
    gsap.set(textClock, {
        x: 16,
        y: 404
    });
    gsap.set(CLOCK, {

        fill: "#29e"
    });
    free();
    clockVisible();
    setter(textClock.textContent, clockDot);

    errno();
    OBSERV.innerHTML = "Clock has Started";

}
function reboot() {
    textI1.textContent = 2;
    textI2.textContent = 2;
    textI3.textContent = 2;
    textI4.textContent = 2;

    textClock.textContent = 2;

}






function outputSetter() {
    setter(textO1.textContent, O1);
    setter(textO2.textContent, O2);
    setter(textO3.textContent, O3);
    setter(textO4.textContent, O4);
}

function errno() {

}
function batado() {
    OBSERV.innerHTML = "Simulation has finished. Please click on Reset and repeat the instructions given to start again."
}
function setter(a, b) {
    if (a == 1) {
        unset(b);

    }
    else if (a == 0) {
        set(b);
    }
}
outputDisappear();
var tl = gsap.timeline({ repeat: 0, repeatDelay: 0 });

function fourXspeed() {
    if (textClock.textContent == 1 && textI1.textContent != 2 && textI2.textContent != 2 && textI3.textContent != 2 && textI4.textContent != 2 && tl.progress() != 1) {
        tl.resume();
        tl.timeScale(4);
        OBSERV.innerHTML = "4x speed";
        decide = 1;
        BUTTON.innerHTML = "Halt";
    }
}
function doubleSpeed() {
    if (textClock.textContent == 1 && textI1.textContent != 2 && textI2.textContent != 2 && textI3.textContent != 2 && textI4.textContent != 2 && tl.progress() != 1) {
        tl.resume();
        tl.timeScale(2);
        OBSERV.innerHTML = "2x speed";
        decide = 1;
        BUTTON.innerHTML = "Halt";
    }
}
function setSpeed(speed) {
    if (speed == "1") {
        startCircuit();
    }
    else if (speed == "2") {
        doubleSpeed();
    }
    else if (speed == "4") {
        fourXspeed();
    }
    

}
const SPEED = document.getElementById("speed");
function restartCircuit() {
    tl.seek(0);
    tl.pause();
    allDisappear();
    reboot();
    myFunction();
    decide = 0;
    BUTTON.innerHTML = "Start";
    OBSERV.innerHTML = "Successfully restored";
    SPEED.selectedIndex=0;
}
var decide = 0;
function button() {
    if (decide == 0) {
        startCircuit();

    }
    else if (decide == 1) {
        stopCircuit();

    }
}
function stopCircuit() {
    if (tl.time() != 0 && tl.progress() != 1) {
        tl.pause();
        OBSERV.innerHTML = "Simulation has been Paused. Please click on the Start button to Resume.";
        decide = 0;
        BUTTON.innerHTML = "Start";
        SPEED.selectedIndex=0;
    }
    else if (tl.progress() == 1) {
        OBSERV.innerHTML = "Please Restart the simulation";
    }
}

function startCircuit() {
    if (textClock.textContent == 1 && textI1.textContent != 2 && textI2.textContent != 2 && textI3.textContent != 2 && textI4.textContent != 2 && tl.progress() != 1) {
        tl.play();
        tl.timeScale(1);
        OBSERV.innerHTML = "Simulation has started.";
        decide = 1;
        BUTTON.innerHTML = "Halt";
        SPEED.selectedIndex=0;
    }
    else if (textI1.textContent == 2 || textI2.textContent == 2 || textI3.textContent == 2 || textI4.textContent == 2 || textClock.textcontent == 2) {
        OBSERV.innerHTML = "Please select the values";
    }
    else if (textClock.textContent != 1 && tl.progress()==0) {
        OBSERV.innerHTML = "Please setup the clock.";
    }
    else if (tl.progress() == 1) {
        OBSERV.innerHTML = "Please Restart the simulation";
    }
}
tl.add(serialDotVisible, 0);
tl.add(selectVisibleTo0, 0);
tl.add(clockDotVisible, 0);

tl.add(clockDotDisappear, 10);

tl.add(serialDotDisappear, 10);
tl.add(selectDisappear, 10);
tl.add(selectVisibleTo1, 10);
tl.add(outputHandlerSetter, 10);
tl.add(outputSetter, 12);
tl.add(outputVisible, 12);
tl.add(outputDisappear, 15);
tl.add(outputDot, 15);
tl.add(outputHandler, 15);
tl.add(outputSetter, 16);
tl.add(outputVisible, 16);
tl.add(outputDisappear, 20);
tl.add(outputDot, 20);
tl.add(outputHandler, 20);
tl.add(outputSetter, 21);
tl.add(outputVisible, 21);
tl.add(outputDisappear, 25);
tl.add(outputDot, 25);
tl.add(outputHandler, 25);
tl.add(outputSetter, 26);
tl.add(outputVisible, 26);
tl.add(batado, 26);

tl.eventCallback("onComplete", outputVisible);
tl.eventCallback("onComplete", batado);


tl.to(serialDot1, {
    motionPath: {
        path: "#path1",
        align: "#path1",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 10,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);
tl.to(serialDot2, {
    motionPath: {
        path: "#path2",
        align: "#path2",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 10,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);
tl.to(serialDot3, {
    motionPath: {
        path: "#path3",
        align: "#path3",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 10,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);
tl.to(serialDot4, {
    motionPath: {
        path: "#path4",
        align: "#path4",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 10,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);



tl.to(serialDot2, {
    motionPath: {
        path: "#path2",
        align: "#path2",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 10,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);



tl.pause();

serialDotDisappear();
serialDotDisappear();

clockDotDisappear();



