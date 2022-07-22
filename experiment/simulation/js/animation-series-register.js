import { setCoordinates,fillInputDots,fillColor,objectDisappear,objectAppear,setter, calculateNot} from "./animation-utility.js";

'use strict'

window.appendSI = appendSI;
window.appendClock = appendClock;
window.simulationStatus = simulationStatus;
window.restartCircuit = restartCircuit;
window.setSpeed=setSpeed;



// Dimensions of working area
const circuitBoard = document.getElementById("circuit-board");
const sidePanels = document.getElementsByClassName("v-datalist-container");
// Distance of working area from top
const circuitBoardTop = circuitBoard.offsetTop;
// Full height of window
const windowHeight = window.innerHeight;
const width = window.innerWidth;

const svg = document.querySelector(".svg");
const svgns = "http://www.w3.org/2000/svg";

const EMPTY="";
// stroing the necessary div elements in const
const status = document.getElementById("play-or-pause");
const observ = document.getElementById("observations");
const speed = document.getElementById("speed");

// global varaibles declared here
const objects = [
    document.getElementById("serialinput"),
    document.getElementById("clock"),
    document.getElementById("serialoutput")
];
const textInput = [
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text")
];
const textOutput = [
    document.createElementNS(svgns, "text")
];
const dots = [
    document.createElementNS(svgns, "circle"),
    document.createElementNS(svgns, "circle")
];
// First dot emerges from Serial Input
// Rest 4 dots emerge from Clock



// decide help to decide the speed
let decide = false;
// circuitStarted is initialised to 0 which depicts that demo hasn't started whereas circuitStarted 1 depicts that the demo has started.
let circuitStarted = false;


// function to take care of width
function demoWidth() {
    if (width < 1024) {
        circuitBoard.style.height = "600px";
    } else {
        circuitBoard.style.height = `${windowHeight - circuitBoardTop - 20}px`;
    }
    sidePanels[0].style.height = circuitBoard.style.height;
}

// function to initialise the input text i.e. either 0/1 that gets displayed after user click on them
function textIOInit() {
    for( const text of textInput){
        text.textContent = 2;
    }
}


// function to mark the output coordinates
function outputCoordinates() {
    setCoordinates(996,124,textOutput[0]);
    svg.append(textOutput[0]);
}

// function to mark the input dots
function inputDots() {
    for(const dot of dots){
        fillInputDots(dot,20,550,15,"#FF0000");
        svg.append(dot);
    }
}

// function to disappear the input dots
function inputDotDisappear() {
    for(const dot of dots){
        objectDisappear(dot);
    }
}

function serialinputDisappear() {
    objectDisappear(dots[0]);
}

function clockDisappear() {
    objectDisappear(dots[1]);
}

function serialinputAppear() {
    objectAppear(dots[0]);
}

function clockAppear() {
    objectAppear(dots[1]);
}


// function to appear the input dots
function inputDotVisible() {
    for(const dot of dots){
        objectAppear(dot);
    }
}
// function to disappear the output text
function outputDisappear() {
    for(const text of textOutput){
        objectDisappear(text);
    }
}
// function to appear the output text
function outputVisible() {
    for(const text of textOutput){
        objectAppear(text);
    }
}
// function to diappear the input text
function inputTextDisappear() {
    for(const text of textInput){
        objectDisappear(text);
    }
}

function clearObservation() {
    observ.innerHTML = EMPTY;
}
function allDisappear() {
    inputDotDisappear();
    outputDisappear();
    inputTextDisappear();
    for(const object of objects){
        fillColor(object,"#008000");
    }
}

function appendSI() {
    if (textInput[0].textContent !== "0" && timeline.progress() === 0) {
        changeto0(16,124,0,0);
        observ.innerHTML = "SI bit is equal to 0";
    }
    else if (textInput[0].textContent !== "1" && timeline.progress() === 0) {
        changeto1(16,124,0,0);
        observ.innerHTML = "SI bit is equal to 1";
    }
    else
    {
        observ.innerHTML = "Cannot change the SI bit once the simulation has started";
    }
    setter(textInput[0].textContent,dots[0]);
}
function appendClock() {
    if (textInput[1].textContent !== "0" && timeline.progress() === 0) {
        changeto0(16,504,1,1);
    }
    else if (textInput[1].textContent !== "1" && timeline.progress() === 0) {
        changeto1(16,504,1,1);
        observ.innerHTML = "Clock is turned ON";
    }
    else
    {
        observ.innerHTML = "Cannot change the clock once the simulation has started";
    }
    setter(textInput[1].textContent,dots[1]);
}

function alternateClock() {
    if (textInput[1].textContent === "0") {
        changeto1(16,504,1,1);
        observ.innerHTML = "Clock is turned ON";
    }
    else if (textInput[1].textContent === "1") {
        changeto0(16,504,1,1);
        observ.innerHTML = "The clock has reached negative edge for a duration of 2 seconds. When the next positive edge would be encountered serial transfer would take place to the right.";
    }
    else
    {
        console.debug("Error! Invalid state in clock");
    }
}



function changeto1(coordinateX,coordinateY,object,textObject) {
    textInput[textObject].textContent = 1;
    svg.appendChild(textInput[textObject]);
    setCoordinates(coordinateX,coordinateY,textInput[textObject]);
    fillColor(objects[object],"#29e");
    clearObservation();
    objectAppear(textInput[textObject]);
}

function changeto0(coordinateX,coordinateY,object,textObject) {
    textInput[textObject].textContent = 0;
    svg.appendChild(textInput[textObject]);
    setCoordinates(coordinateX,coordinateY,textInput[textObject]);
    fillColor(objects[object],"#eeeb22");
    clearObservation();
    objectAppear(textInput[textObject]);
}


function transfer() {
    
    alternateClock();
    observ.innerHTML = "The clock has reached negative edge for a duration of 2 seconds. When the next positive edge would be encountered serial transfer would take place to the right.";
}

function outputSetter(){
    textOutput[0].textContent = textInput[0].textContent;
    setter(textOutput[0].textContent,objects[2]);
}

function display() {
    observ.innerHTML = "Simulation has finished. Press Restart to start again"
}

function reboot() {
    for(const text of textInput){
        text.textContent = 2;
    }
}

function setSpeed(speed) {
    if (circuitStarted) {
        timeline.timeScale(parseInt(speed));
        observ.innerHTML = `${speed}x speed`;
    }
}

function restartCircuit() {
    if (circuitStarted) {
        circuitStarted = false;
    }
    timeline.seek(0);
    timeline.pause();
    allDisappear();
    reboot();
    clearObservation();
    decide = false;
    status.innerHTML = "Start";
    observ.innerHTML = "Successfully restored";
    speed.selectedIndex = 0;

}

function simulationStatus() {
    if (!decide) {
        startCircuit();
    }
    else {
        stopCircuit();
    }
}
function stopCircuit() {
    if (timeline.progress() !== 1) {
        timeline.pause();
        observ.innerHTML = "Simulation has been stopped.";
        decide = false;
        status.innerHTML = "Start";
        speed.selectedIndex = 0;
    }
    else {
        observ.innerHTML = "Please Restart the simulation";
    }
}
function startCircuit() {
    if(textInput[1].textContent==="0")
    {
        observ.innerHTML = "Please set the Clock as 1";
        return;
    }


    for(const text of textInput){
        if (text.textContent === "2") {
            observ.innerHTML = "Please set the input values";
            return;
        }
    }
    if (timeline.progress() !== 1) {
        circuitStarted = true;
        timeline.play();
        timeline.timeScale(1);
        observ.innerHTML = "Simulation has started.";
        decide = true;
        status.innerHTML = "Pause";
        speed.selectedIndex = 0;
    }
    else {
        observ.innerHTML = "Please Restart the simulation";
    }
}



// all the execution begin here
let timeline = gsap.timeline({ repeat: 0, repeatDelay: 0 });
gsap.registerPlugin(MotionPathPlugin);
demoWidth();
// calling all the functions that are going to initialise 
textIOInit();
outputCoordinates();
inputDots();
outputDisappear();

timeline.add(serialinputAppear, 0);
timeline.add(clockAppear, 0);
timeline.add(transfer, 3);
timeline.add(serialinputDisappear,3);
timeline.add(clockDisappear,3);
timeline.add(serialinputAppear,5);
timeline.add(clockAppear,5);
timeline.add(alternateClock,5);
timeline.add(transfer, 8);
timeline.add(serialinputDisappear,8);
timeline.add(clockDisappear,8);
timeline.add(alternateClock,10);
timeline.add(serialinputAppear,10);
timeline.add(clockAppear,10);
timeline.add(transfer, 13);
timeline.add(serialinputDisappear,13);
timeline.add(clockDisappear,13);
timeline.add(alternateClock,15);
timeline.add(serialinputAppear,15);
timeline.add(clockAppear,15);
timeline.add(transfer, 18);
timeline.add(serialinputDisappear,18);
timeline.add(clockDisappear,18);
timeline.add(alternateClock,20);
timeline.add(serialinputAppear,20);
timeline.add(outputSetter,21);
timeline.add(serialinputDisappear,21);
timeline.add(outputVisible,21);
timeline.eventCallback("onComplete", outputVisible);
timeline.eventCallback("onComplete", display);

timeline.to(dots[0], {
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
timeline.to(dots[0], {
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
timeline.to(dots[0], {
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
timeline.to(dots[0], {
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
timeline.to(dots[0], {
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
timeline.to(dots[1], {
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
timeline.to(dots[1], {
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
timeline.to(dots[1], {
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
timeline.to(dots[1], {
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
timeline.pause();
inputDotDisappear();