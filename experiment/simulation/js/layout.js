import { simulate, deleteElement } from "./gate.js";
import { connectDFlipFlopGate, unbindEvent, initSISO, initPIPO, refreshWorkingArea } from "./main.js";
import {deleteFF} from "./flipflop.js";
'use strict';
// Wires
export const wireColours = ["#ff0000", "#00ff00", "#0000ff", "#bf6be3", "#ff00ff", "#00ffff", "#ff8000", "#00ff80", "#80ff00", "#ff0080", "#8080ff", "#c0c0c0"];

// Contextmenu
const menu = document.querySelector(".menu");
const menuOption = document.querySelector(".menu-option");
let menuVisible = false;

const toggleMenu = command => {
  menu.style.display = command === "show" ? "block" : "none";
  menuVisible = !menuVisible;
};

export const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  toggleMenu("show");
};

window.addEventListener("click", e => {
  if (menuVisible) toggleMenu("hide");
  window.selectedComponent = null;
  window.componentType = null;
});

menuOption.addEventListener("click", e => {
  if (e.target.innerHTML === "Delete") {
    if (window.componentType === "gate") {
      deleteElement(window.selectedComponent);
    }
    else if (window.componentType === "flipFlop") {
      deleteFF(window.selectedComponent);
    }
  }
  window.selectedComponent = null;
  window.componentType = null;
});

// Tabs

function changeTabs(e) {
  const task = e.target.parentNode.id;
  if (window.currentTab === task) {
    return;
  }

  if (window.currentTab != null) {
    document.getElementById(window.currentTab).classList.remove("is-active");
  }
  window.currentTab = task;
  document.getElementById(task).classList.add("is-active");

  // Half adder
  if (task === "task1") {
    unbindEvent();
    connectDFlipFlopGate();
    refreshWorkingArea();
    initSISO();
  }
  if (task === "task2") {
    unbindEvent();
    connectDFlipFlopGate();
    refreshWorkingArea();
    initPIPO();
  }
  simButton.innerHTML = "Simulate";
  window.simulate = 1;
  updateInstructions();
  updateToolbar();
  clearObservations();
  resize();
}

window.changeTabs = changeTabs;

function updateInstructions() {
  if (window.currentTab === "task1") {
    document.getElementById("TaskTitle").innerHTML = "Serial Register";
    document.getElementById("TaskDescription").innerHTML = 'Implement a simple shift register using D flip-flops. (SISO)';
  }
  if (window.currentTab === "task2") {
    document.getElementById("TaskTitle").innerHTML = "Parallel Load Register";
    document.getElementById("TaskDescription").innerHTML = 'Implement a Parallel Load register using D flip-flops. (PIPO)';
  }
}

// Toolbar

function updateToolbar() {
  let elem = "";
  if (window.currentTab === "task1" || window.currentTab === "task2") {
    elem = '<div class="component-button and" onclick="addGate(event)">AND</div><div class="component-button or" onclick="addGate(event)">OR</div><div class="component-button not" onclick="addGate(event)">NOT</div><div class="component-button nand" onclick="addGate(event)">NAND</div><div class="component-button nor" onclick="addGate(event)">NOR</div><div class="component-button xor" onclick="addGate(event)">XOR</div><div class="component-button xnor" onclick="addGate(event)">XNOR</div><div class="component-button clock" id="addclock">CLOCK</div><div class="component-button dflipflop" onclick="addDFlipFlop(event)"></div>'
  }

  document.getElementById("toolbar").innerHTML = elem;
}

// Clear observations
function clearObservations() {

  document.getElementById("table-body").innerHTML = "";
  let head = ''

  if (window.currentTab === "task1") {
    head = ''
  }
  else if (window.currentTab === "task2") {
    head = ''
  }
  document.getElementById("table-head").innerHTML = head;
  document.getElementById('result').innerHTML = "";
}

// Modal

const modal = document.querySelector(".modal");
const trigger = document.getElementById("addclock")
const closeButton = document.querySelector(".close-button");

export function toggleModal() {
  modal.classList.toggle("show-modal");
  document.getElementById('frequency-input').value = ""
  document.getElementById('dutycycle-input').value = ""
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);


// Simulation

const simButton = document.getElementById("simulate-button");
function toggleSimulation() {
    if (window.simulate === 0) {
    window.simulate = 1;
    simButton.innerHTML = "Simulate";
  }
  else {
    window.simulate = 0;
    simButton.innerHTML = "Stop";
    if(!window.sim())
    {
      window.simulate = 1;
      simButton.innerHTML = "Simulate";
    }
  }
}

simButton.addEventListener("click", toggleSimulation);



// Instruction box
const instructionBox = document.getElementsByClassName("instructions-box")[0];
instructionBox.addEventListener("click", (e) => {
  instructionBox.classList.toggle("expand");
});

// Making webpage responsive

// Dimensions of working area
const circuitBoard = document.getElementById("circuit-board");
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

function resize() {
  const circuitBoard = document.getElementById("circuit-board");
  const sidePanels = document.getElementsByClassName("v-datalist-container");

  if (width >= 1024) {
    for (let i = 0; i < sidePanels.length; i++) {
      sidePanels[i].style.height = circuitBoard.style.height;
    }
  }
}

resize();


