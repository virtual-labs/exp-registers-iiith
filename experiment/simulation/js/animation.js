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

// Instruction box
const instructionBox = document.getElementsByClassName("instructions-box")[0];
instructionBox.addEventListener("click", (e) => {
  instructionBox.classList.toggle("expand");
});

const svg = document.querySelector(".svg");
const inputpath1 = document.querySelector("#inputpath1");
const svgns = "http://www.w3.org/2000/svg";
gsap.registerPlugin(MotionPathPlugin);


let textSI = document.createElementNS(svgns, "text");

let textClock = document.createElementNS(svgns, "text");
let textSO = document.createElementNS(svgns, "text");

textSO.textContent = 2;

textSI.textContent = 2;

textClock.textContent = 2;
gsap.set(textSO, {
    x: 996,
    y: 124
});

svg.appendChild(textSI);

svg.appendChild(textClock);
svg.appendChild(textSO);

const SI = document.getElementById("SERIALINPUT");

const CLOCK = document.getElementById("CLOCK");
const SO = document.getElementById("SERIALOUTPUT");

const BUTTON = document.getElementById("play/pause");
const OBSERV = document.getElementById("Observations");


let serialDot = document.createElementNS(svgns, "circle");
gsap.set(serialDot, {
    attr: { cx: 20, cy: 120, r: 15, fill: "#FF0000" }
});
let clockDot = document.createElementNS(svgns, "circle");
gsap.set(clockDot, {
    attr: { cx: 20, cy: 500, r: 15, fill: "#FF0000" }
});

svg.appendChild(serialDot);
svg.appendChild(clockDot);

function myFunction() {
    OBSERV.innerHTML = "";
}
function serialDotDisappear() {
    TweenLite.to(serialDot, 0, { autoAlpha: 0 });
}

function clockDotDisappear() {
    TweenLite.to(clockDot, 0, { autoAlpha: 0 });

}
function serialDotVisible() {
    TweenLite.to(serialDot, 0, { autoAlpha: 1 });
}

function clockDotVisible() {
    TweenLite.to(clockDot, 0, { autoAlpha: 1 });

}
function outputDisappear() {
    TweenLite.to(textSO, 0, { autoAlpha: 0 });

}
function outputVisible() {
    TweenLite.to(textSO, 0, { autoAlpha: 1 });

}
function serialDisappear() {
    TweenLite.to(textSI, 0, { autoAlpha: 0 });
}
function clockDisappear() {
    TweenLite.to(textClock, 0, { autoAlpha: 0 });
}
function free() {
    OBSERV.innerHTML = "";
}
function serialVisible() {
    TweenLite.to(textSI, 0, { autoAlpha: 1 });
}
function clockVisible() {
    TweenLite.to(textClock, 0, { autoAlpha: 1 });
}



function allDisappear() {
    serialDisappear();
    serialDotDisappear();

    clockDisappear();
    clockDotDisappear();
    outputDisappear();
    gsap.set(SI, {

        fill: "#008000"
    });

    gsap.set(CLOCK, {

        fill: "#008000"
    });
    gsap.set(SO, {

        fill: "#008000"
    });


}
function outputHandler() {
    textSO.textContent=textSI.textContent;

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
function appendSI() {
    if (textSI.textContent != 0 && tl.progress() == 0) {
        serialDisappear();
        textSI.textContent = 0;
        svg.appendChild(textSI);
        gsap.set(textSI, {
            x: 16,
            y: 124
        });
        gsap.set(SI, {

            fill: "#eeeb22"
        });
        free();
        serialVisible();
        errno();
        setter(textSI.textContent, serialDot);
        OBSERV.innerHTML = "SI is set to 0";
    }
    else if (textSI.textContent != 1 && tl.progress() == 0) {
        appendSITo1();
    }




}
function appendClock() {
    if (textClock.textContent != 0 && tl.progress() == 0 ) {
        appendClockTo0();
    }
    else if (textClock.textContent != 1 && tl.progress() == 0 ) {
        appendClockTo1();
    }

}
function appendClockTo0() {
    clockDisappear();
    textClock.textContent = 0;
    svg.appendChild(textClock);
    gsap.set(textClock, {
        x: 16,
        y: 504
    });
    gsap.set(CLOCK, {

        fill: "#eeeb22"
    });
    free();
    clockVisible();
    setter(textClock.textContent, clockDot);

    errno();
    OBSERV.innerHTML = "";
}
function appendClockTo1() {
    clockDisappear();
    textClock.textContent = 1;
    svg.appendChild(textClock);
    gsap.set(textClock, {
        x: 16,
        y: 504
    });
    gsap.set(CLOCK, {

        fill: "#29e"
    });
    free();
    clockVisible();
    setter(textClock.textContent, clockDot);

    errno();
    OBSERV.innerHTML = "Clocked is turned ON";
}
function reboot() {
    textSI.textContent = 2;

    textClock.textContent = 2;

}



function appendSITo1() {
    serialDisappear();
    textSI.textContent = 1;
    svg.appendChild(textSI);
    gsap.set(textSI, {
        x: 16,
        y: 124
    });
    gsap.set(SI, {

        fill: "#29e"
    });
    free();
    serialVisible();

    setter(textSI.textContent, serialDot);

    OBSERV.innerHTML = "SI is set to 1";

    errno();

}

function outputSetter() {
    setter(textSO.textContent, SO);

}

function errno() {

}
function batado() {
    OBSERV.innerHTML = "Simulation has finished. Press Restart to start again"
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
var tl1=gsap.timeline({ repeat: 0, repeatDelay: 0 });

function fourXspeed() {
    if (textClock.textContent == 1 && textSI.textContent != 2 && tl.progress() != 1 && tl.progress() != 0) {
        tl.resume();
        tl.timeScale(4);
        OBSERV.innerHTML = "4x speed";
        decide = 1;
        BUTTON.innerHTML = "Halt";
    }
}
function doubleSpeed() {
    if (textClock.textContent == 1 && textSI.textContent != 2 && tl.progress() != 1 && tl.progress() != 0) {
        tl.resume();
        tl.timeScale(2);
        OBSERV.innerHTML = "2x speed";
        decide = 1;
        BUTTON.innerHTML = "Halt";
    }
}

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
function stopCircuit() {
    if (tl.time() != 0 && tl.progress() != 1) {
        tl.pause();
        // console.log(tl.progress());
        OBSERV.innerHTML = "Simulation has been stopped."
        decide = 0;
        BUTTON.innerHTML = "Start";
        SPEED.selectedIndex=0;
    }
    else if (tl.progress() == 1) {
        OBSERV.innerHTML = "Please Restart the simulation"
    }

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
function startCircuit() {

    if (textClock.textContent == 1 && textSI.textContent != 2 && tl.progress() != 1) {
        tl.play();
        tl.timeScale(1);
        serialDotVisible();
        clockDotVisible();
        OBSERV.innerHTML = "Simulation has started.";
        decide = 1;
        BUTTON.innerHTML = "Halt";
        SPEED.selectedIndex=0;
    }
    else if (textSI.textContent == 2) {
        OBSERV.innerHTML = "Please select the values";
    }
    else if (textClock.textContent == 2) {
        OBSERV.innerHTML = "Please select the values";
    }
    else if (textClock.textContent == 0 && tl.progress()==0) {
        OBSERV.innerHTML = "Please setup the clock.";
    }
    else if (tl.progress() == 1) {
        OBSERV.innerHTML = "Please Restart the simulation";
    }

}
function SetSpeed(speed) {
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
function transfer() {
    
    appendClockTo0();
    OBSERV.innerHTML = "The clock has reached negative edge for a duration of 2 seconds. When the next positive edge would be encountered serial transfer would take place to the right.";
   
    decide = 0;
    BUTTON.innerHTML = "Start";
}
tl.add(serialDotVisible, 0);
tl.add(clockDotVisible, 0);
tl.add(transfer, 3);
tl.add(serialDotDisappear,3);
tl.add(clockDotDisappear,3);
tl.add(serialDotVisible,5);
tl.add(clockDotVisible,5);
tl.add(appendClockTo1,5);
tl.add(transfer, 8);
tl.add(serialDotDisappear,8);
tl.add(clockDotDisappear,8);
tl.add(appendClockTo1,10);
tl.add(serialDotVisible,10);
tl.add(clockDotVisible,10);
tl.add(transfer, 13);
tl.add(serialDotDisappear,13);
tl.add(clockDotDisappear,13);
tl.add(appendClockTo1,15);
tl.add(serialDotVisible,15);
tl.add(clockDotVisible,15);
tl.add(transfer, 18);
tl.add(serialDotDisappear,18);
tl.add(clockDotDisappear,18);
tl.add(appendClockTo1,20);
tl.add(serialDotVisible,20);
tl.add(outputHandler,20);
tl.add(outputSetter,21);
tl.add(serialDotDisappear,21);
tl.add(outputVisible,21);


tl.eventCallback("onComplete", outputVisible);
tl.eventCallback("onComplete", batado);

tl.to(serialDot, {
    motionPath: {
        path: "#path7",
        align: "#path7",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);
tl.to(serialDot, {
    motionPath: {
        path: "#path8",
        align: "#path8",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 5);
tl.to(serialDot, {
    motionPath: {
        path: "#path9",
        align: "#path9",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 10);
tl.to(serialDot, {
    motionPath: {
        path: "#path10",
        align: "#path10",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 15);
tl.to(serialDot, {
    motionPath: {
        path: "#path11",
        align: "#path11",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 1,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 20);
tl.to(clockDot, {
    motionPath: {
        path: "#path3",
        align: "#path3",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 0);
tl.to(clockDot, {
    motionPath: {
        path: "#path4",
        align: "#path4",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 5);
tl.to(clockDot, {
    motionPath: {
        path: "#path5",
        align: "#path5",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 10);
tl.to(clockDot, {
    motionPath: {
        path: "#path6",
        align: "#path6",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
    },

    duration: 3,
    repeat: 0,
    repeatDelay: 3,
    yoyo: true,
    ease: "none",
    paused: false,

}, 15);



tl.pause();

serialDotDisappear();

clockDotDisappear();



