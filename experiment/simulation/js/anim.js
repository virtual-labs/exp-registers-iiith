import { setCoordinates,fillInputDots,fillColor,objectDisappear,objectAppear,setter, calculateNot} from "./animation-utility.js";

'use strict'

window.appendSI1 = appendSI1;
window.appendSI2 = appendSI2;
window.appendSI3 = appendSI3;
window.appendSI4 = appendSI4;
window.appendClock = appendClock;
window.simulationStatus = simulationStatus;
window.restartCircuit = restartCircuit;
window.setSpeed=setSpeed;

let stage_num = 1;



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
    document.getElementById("serialinput1"),
    document.getElementById("serialinput2"),
    document.getElementById("serialinput3"),
    document.getElementById("serialinput4"),
    document.getElementById("clock"),
    document.getElementById("select"),
    document.getElementById("serialoutput1"),
    document.getElementById("serialoutput2"),
    document.getElementById("serialoutput3"),
    document.getElementById("serialoutput4")
];
const textInput = [
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text")
];
const textOutput = [
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text"),
    document.createElementNS(svgns, "text")
];
const dots = [
    document.createElementNS(svgns, "circle"),
    document.createElementNS(svgns, "circle"),
    document.createElementNS(svgns, "circle"),
    document.createElementNS(svgns, "circle"),
    document.createElementNS(svgns, "circle")
];
// First 4 dot emerge from Serial Input 1,2,3,4
// Last dot emerges from Clock



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
    setCoordinates(116,804,textInput[5]);
    svg.append(textInput[5]);
    setCoordinates(546,54,textOutput[0]);
    svg.append(textOutput[0]);
    setCoordinates(546,254,textOutput[1]);
    svg.append(textOutput[1]);
    setCoordinates(546,454,textOutput[2]);
    svg.append(textOutput[2]);
    setCoordinates(546,654,textOutput[3]);
    svg.append(textOutput[3]);
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
    for(let i=0;i<4;i++){
        objectDisappear(dots[i]);
    }
}


function serialinputAppear() {
    for(let i=0;i<4;i++){
        objectAppear(dots[i]);
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

function appendSI1() {
    if (textInput[0].textContent !== "0" && timeline.progress() === 0) {
        changeto0(46,54,0,0);
        observ.innerHTML = "I1 bit is equal to 0";
    }
    else if (textInput[0].textContent !== "1" && timeline.progress() === 0) {
        changeto1(46,54,0,0);
        observ.innerHTML = "I1 bit is equal to 1";
    }
    else
    {
        observ.innerHTML = "Cannot change the I1 bit once the simulation has started";
    }
    setter(textInput[0].textContent,dots[0]);
}
function appendSI2() {
    if (textInput[1].textContent !== "0" && timeline.progress() === 0) {
        changeto0(46,254,1,1);
        observ.innerHTML = "I2 bit is equal to 0";
    }
    else if (textInput[1].textContent !== "1" && timeline.progress() === 0) {
        changeto1(46,254,1,1);
        observ.innerHTML = "I2 bit is equal to 1";
    }
    else
    {
        observ.innerHTML = "Cannot change the I2 bit once the simulation has started";
    }
    setter(textInput[1].textContent,dots[1]);
}
function appendSI3() {
    if (textInput[2].textContent !== "0" && timeline.progress() === 0) {
        changeto0(46,454,2,2);
        observ.innerHTML = "I3 bit is equal to 0";
    }
    else if (textInput[2].textContent !== "1" && timeline.progress() === 0) {
        changeto1(46,454,2,2);
        observ.innerHTML = "I3 bit is equal to 1";
    }
    else
    {
        observ.innerHTML = "Cannot change the I3 bit once the simulation has started";
    }
    setter(textInput[2].textContent,dots[2]);
}
function appendSI4() {
    if (textInput[3].textContent !== "0" && timeline.progress() === 0) {
        changeto0(46,654,3,3);
        observ.innerHTML = "I4 bit is equal to 0";
    }
    else if (textInput[3].textContent !== "1" && timeline.progress() === 0) {
        changeto1(46,654,3,3);
        observ.innerHTML = "I4 bit is equal to 1";
    }
    else
    {
        observ.innerHTML = "Cannot change the I4 bit once the simulation has started";
    }
    setter(textInput[3].textContent,dots[3]);
}


function appendClock() {
    if (textInput[4].textContent !== "0" && timeline.progress() === 0) {
        changeto0(16,404,4,4);
    }
    else if (textInput[4].textContent !== "1" && timeline.progress() === 0) {
        changeto1(16,404,4,4);
        observ.innerHTML = "Clock is turned ON";
    }
    else
    {
        observ.innerHTML = "Cannot change the clock once the simulation has started";
    }
    setter(textInput[4].textContent,dots[4]);
}

function alternateSelect() {
    if(textInput[5].textContent === "0")
    {
        changeto1(116,804,5,5);
    }
    else
    {
        changeto0(116,804,5,5);
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
    let temp = textOutput[3].textContent;
    textOutput[3].textContent = textOutput[2].textContent;
    textOutput[2].textContent = textOutput[1].textContent;
    textOutput[1].textContent = textOutput[0].textContent;
    textOutput[0].textContent = temp;
    observ.innerHTML = "Bits are being shifted";
    setOutputColor();
}

function outputSetter(){
    textOutput[0].textContent = textInput[0].textContent;
    textOutput[1].textContent = textInput[1].textContent;
    textOutput[2].textContent = textInput[2].textContent;
    textOutput[3].textContent = textInput[3].textContent;
    setOutputColor();
}

function setOutputColor() {
    setter(textOutput[0].textContent,objects[6]);
    setter(textOutput[1].textContent,objects[7]);
    setter(textOutput[2].textContent,objects[8]);
    setter(textOutput[3].textContent,objects[9]);
}


function display() {
    observ.innerHTML = "Simulation has finished. Please click on Reset and repeat the instructions given to start again."
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
    stage_num = 1;
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
        observ.innerHTML = "Simulation has been Paused. Please click on the Start button to Resume.";
        decide = false;
        status.innerHTML = "Start";
        speed.selectedIndex = 0;
    }
    else {
        observ.innerHTML = "Please Restart the simulation";
    }
}
function startCircuit() {
    if(textInput[4].textContent==="0")
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
timeline.add(serialinputDisappear, 10);
timeline.add(outputSetter, 10);
timeline.add(outputVisible, 10);
timeline.add(outputDisappear, 12);
timeline.add(alternateSelect, 12);
timeline.add(transfer, 12);
timeline.add(outputVisible, 12);
timeline.add(outputDisappear, 14);
timeline.add(transfer, 14);
timeline.add(outputVisible, 14);
timeline.add(outputDisappear, 16);
timeline.add(transfer, 16);
timeline.add(outputVisible, 16);
timeline.eventCallback("onComplete", outputVisible);
timeline.eventCallback("onComplete", display);

timeline.to(dots[0], {
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
timeline.to(dots[1], {
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
timeline.to(dots[2], {
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
timeline.to(dots[3], {
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

timeline.pause();
inputDotDisappear();
alternateSelect();