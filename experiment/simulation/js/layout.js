import { deleteElement } from "./gate.js";
import { connectDFlipFlopGate, unbindEvent, initSISO, initPIPO, refreshWorkingArea } from "./main.js";
import {deleteFF} from "./flipflop.js";
'use strict';
// Wires
export const wireColours = ["#ff0000", "#00ff00", "#0000ff", "#bf6be3", "#ff00ff", "#00ffff", "#ff8000", "#00ff80", "#80ff00", "#ff0080", "#8080ff", "#c0c0c0"];

// Contextmenu
const menu = document.querySelector(".menu");
const menuOption = document.querySelector(".menu-option");
export const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.display = "block";
};
window.addEventListener("click", e => {
  menu.style.display = "none";
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

  if (window.currentTab !== null) {
    document.getElementById(window.currentTab).classList.remove("is-active");
  }
  window.currentTab = task;
  document.getElementById(task).classList.add("is-active");
  updateInstructions();
  connectDFlipFlopGate();
  refreshWorkingArea();
  // Half adder
  switch (task) {
    case "task1":
      initSISO();
      break;
    case "task2":
      initPIPO();
      break;
    default:
      console.debug("Unknown task");
      break;
  }
  simButton.innerHTML = "Simulate";
  window.simulationStatus = 1;
  updateInstructions();
  updateToolbar();
  clearObservations();
  resize();
}

window.changeTabs = changeTabs;

// Instruction box
const updateInstructions = () => {
  const task = window.currentTab;
  const instructionBox = document.getElementById("instruction-title");
  let title = ""; 
  if (task === "task1") {
    title = `Instructions<br>Implement a Simple Shift register using D flip-flops. (SISO)`;
  } else if (task === "task2") {
    title = `Instructions<br>Implement a Parallel Load register using D flip-flops. (PIPO)`;
  }
  instructionBox.innerHTML = title;
}

// Toolbar

function updateToolbar() {
  let elem = "";
  if (window.currentTab === "task1" || window.currentTab === "task2") {
    elem = `<div class="component-button and" onclick="addGate(event)">AND</div>
            <div class="component-button or" onclick="addGate(event)">OR</div>
            <div class="component-button not" onclick="addGate(event)">NOT</div>
            <div class="component-button nand" onclick="addGate(event)">NAND</div>
            <div class="component-button nor" onclick="addGate(event)">NOR</div>
            <div class="component-button xor" onclick="addGate(event)">XOR</div>
            <div class="component-button xnor" onclick="addGate(event)">XNOR</div>
            <div class="component-button dflipflop" onclick="addDFlipFlop(event)"></div>
            <div class="component-button clock" id="addclock">CLOCK</div>`;
  }

  document.getElementById("toolbar").innerHTML = elem;
  document.getElementById("addclock").addEventListener("click", toggleModal);

}

// Clear observations
function clearObservations() {
  document.getElementById("table-body").innerHTML = "";
  let head = "";

  if (window.currentTab === "task1") {
    head = `<thead id="table-head">
              <tr>
                <th colspan="2">Inputs</th>
                <th colspan="1">Expected Values</th>
                <th colspan="1">Observed Values</th>
              </tr>
              <tr>
                <th>D</th>
                <th>Clk</th>
                <th>Q</th>
                <th>Q</th>
              </tr>
            </thead>`
  } else if (window.currentTab === "task2") {
    head = `<thead id="table-head">
              <tr>
                <th colspan="5">Inputs</th>
                <th colspan="4">Observed Values</th>
              </tr>
              <tr>
                <th>P1</th>
                <th>P2</th>
                <th>P3</th>
                <th>P4</th>
                <th>Clk</th>
                <th>Q1</th>
                <th>Q2</th>
                <th>Q3</th>
                <th>Q4</th>
              </tr>
            </thead>` 
  }
  else
  {
    console.log("Error: Unknown tab");
  }

  document.getElementById("table-head").innerHTML = head;
  document.getElementById("result").innerHTML = "";
}

// Modal

const modal = document.querySelector(".modal");
const trigger = document.getElementById("addclock")
const closeButton = document.querySelector(".close-button");

export function toggleModal() {
  console.log("Toggling modal");
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
window.simulationStatus = 1;
const simButton = document.getElementById("simulate-button");
const submitButton = document.getElementById("submit-button");
function toggleSimulation() {
  if (window.simulationStatus === 0) {
    window.simulationStatus = 1;
    simButton.innerHTML = "Simulate";
    submitButton.disabled = false;
  }
  else {
    window.simulationStatus = 0;
    simButton.innerHTML = "Stop";
    submitButton.disabled = true;
    if(!window.simulate())
    {
      window.simulationStatus = 1;
      simButton.innerHTML = "Simulate";
      submitButton.disabled = false;
    }
  }
}

window.toggleSimulation = toggleSimulation;


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


