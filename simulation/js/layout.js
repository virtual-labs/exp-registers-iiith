import { deleteElement } from "./gate.js";
import {
  connectDFlipFlopGate,
  unbindEvent,
  initSISO,
  initPIPO,
  refreshWorkingArea,
  jsPlumbInstance,
} from "./main.js";
import { deleteFF } from "./flipflop.js";
("use strict");
// Wires
export const wireColours = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#bf6be3",
  "#ff00ff",
  "#00ffff",
  "#ff8000",
  "#00ff80",
  "#80ff00",
  "#ff0080",
  "#8080ff",
  "#c0c0c0",
];

// Contextmenu
const menu = document.querySelector(".menu");
const menuOptions = document.querySelectorAll(".menu-option");
export const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.display = "block";
};
window.addEventListener("click", (e) => {
  menu.style.display = "none";
  window.selectedComponent = null;
  window.componentType = null;
  window.contextMenuTarget = null;
  window.isConnectionContext = false;
});

menuOptions.forEach((menuOption) => {
  menuOption.addEventListener("click", (e) => {
    if (e.target.innerHTML === "Delete") {
      if (window.isConnectionContext && window.contextMenuTarget) {
        // Delete wire connection
        deleteConnection(window.contextMenuTarget);
      } else if (window.componentType === "gate") {
        deleteElement(window.selectedComponent);
      } else if (window.componentType === "flipFlop") {
        deleteFF(window.selectedComponent);
      }
    }
    // Reset context variables for both Delete and Cancel
    window.selectedComponent = null;
    window.componentType = null;
    window.contextMenuTarget = null;
    window.isConnectionContext = false;
    menu.style.display = "none";
  });
});

// Function to delete wire connections
function deleteConnection(connectorElement) {
  if (connectorElement && jsPlumbInstance) {
    let connectionDeleted = false;

    try {
      // Method 1: Find connection by connector element
      const connections = jsPlumbInstance.getConnections();
      for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        if (
          connection.connector &&
          connection.connector.canvas === connectorElement
        ) {
          jsPlumbInstance.deleteConnection(connection);
          connectionDeleted = true;
          console.log("Deleting connection via getConnections");
          break;
        }
      }

      // Method 2: Use the connections property directly
      if (!connectionDeleted && jsPlumbInstance.connections) {
        for (let i = 0; i < jsPlumbInstance.connections.length; i++) {
          const connection = jsPlumbInstance.connections[i];
          if (
            connection.connector &&
            connection.connector.canvas === connectorElement
          ) {
            jsPlumbInstance.deleteConnection(connection);
            connectionDeleted = true;
            console.log("Deleting connection via connections array");
            break;
          }
        }
      }

      // Method 3: Fallback to DOM removal
      if (!connectionDeleted && connectorElement.parentNode) {
        connectorElement.parentNode.removeChild(connectorElement);
        console.log("Deleting connection via DOM removal (fallback)");
        connectionDeleted = true;
      }
    } catch (error) {
      console.log("Error deleting connection:", error);
    }

    if (!connectionDeleted) {
      console.log("No connections found to delete");
    }
  }
}

// Tabs

// Tabs

function changeTabs(e) {
  const task = e.target.parentNode.id;
  console.log(`🔄 Tab switch requested: ${window.currentTab} → ${task}`);

  if (window.currentTab === task) {
    console.log(`⚠️ Already on ${task}, no change needed`);
    return;
  }

  if (window.currentTab !== null) {
    document.getElementById(window.currentTab).classList.remove("is-active");
    console.log(`➖ Removed active class from ${window.currentTab}`);
  }

  window.currentTab = task;
  document.getElementById(task).classList.add("is-active");
  console.log(`➕ Added active class to ${task}`);

  updateInstructions();
  connectDFlipFlopGate();
  refreshWorkingArea();

  // Switch task initialization
  switch (task) {
    case "task1":
      console.log("🔧 Initializing SISO task");
      initSISO();
      break;
    case "task2":
      console.log("🔧 Initializing PIPO task");
      initPIPO();
      break;
    default:
      console.debug("Unknown task");
      break;
  }

  const simButton = document.getElementById("simulate-button");
  if (simButton) {
    simButton.innerHTML = "Simulate";
  }
  window.simulationStatus = 1;
  updateInstructions();

  console.log("🔧 Calling updateToolbar()");
  updateToolbar();

  clearObservations();
  resize();
  console.log(`✅ Tab switch to ${task} completed`);
}

window.changeTabs = changeTabs;

// Export changeTabs for module imports
export { changeTabs };

// Instruction box
const updateInstructions = () => {
  const task = window.currentTab;
  const instructionBox = document.getElementById("instruction-title");
  let title = "";
  if (task === "task1") {
    title = `Instructions<br>Implement a 4-bit Serial Input Serial Output (SISO) shift register using D flip-flops`;
  } else if (task === "task2") {
    title = `Instructions<br>Implement a 4-bit Parallel Input Parallel Output (PIPO) register using D flip-flops`;
  }
  instructionBox.innerHTML = title;
};

// Toolbar

function updateToolbar() {
  console.log(`🔧 updateToolbar called for tab: ${window.currentTab}`);
  let elem = "";

  if (window.currentTab === "task1") {
    console.log("🔧 Setting SISO components");
    // SISO components - D flip-flops, clock, and basic gates
    elem = `<div class="component-button dflipflop" onclick="addDFlipFlop(event)">D Flip-Flop</div>
            <div class="component-button clock" id="addclock"></div>
            <div class="component-button and" onclick="addGate(event)">AND</div>
            <div class="component-button or" onclick="addGate(event)">OR</div>
            <div class="component-button not" onclick="addGate(event)">NOT</div>`;
  } else if (window.currentTab === "task2") {
    console.log("🔧 Setting PIPO components");
    // PIPO components - D flip-flops, clock, and all gates for more complex logic
    elem = `<div class="component-button dflipflop" onclick="addDFlipFlop(event)">D Flip-Flop</div>
            <div class="component-button clock" id="addclock"></div>
            <div class="component-button and" onclick="addGate(event)">AND</div>
            <div class="component-button or" onclick="addGate(event)">OR</div>
            <div class="component-button not" onclick="addGate(event)">NOT</div>
            <div class="component-button nand" onclick="addGate(event)">NAND</div>
            <div class="component-button nor" onclick="addGate(event)">NOR</div>
            <div class="component-button xor" onclick="addGate(event)">XOR</div>
            <div class="component-button xnor" onclick="addGate(event)">XNOR</div>`;
  } else {
    console.log(
      `🔧 Unknown tab: ${window.currentTab}, using default components`
    );
    // Default components
    elem = `<div class="component-button dflipflop" onclick="addDFlipFlop(event)">D Flip-Flop</div>
            <div class="component-button clock" id="addclock"></div>`;
  }

  console.log(`🔧 Toolbar HTML length: ${elem.length}`);
  const toolbarElement = document.getElementById("toolbar");
  if (toolbarElement) {
    toolbarElement.innerHTML = elem;
    console.log(`✅ Toolbar updated successfully`);
  } else {
    console.log(`❌ Toolbar element not found`);
  }

  const addClockBtn = document.getElementById("addclock");
  if (addClockBtn) {
    addClockBtn.addEventListener("click", toggleModal);
  }
}

// Clear observations
function clearObservations() {
  document.getElementById("table-body").innerHTML = "";
  document.getElementById("table-head").innerHTML = "";
  document.getElementById("result").innerHTML = "";
}

// Make updateToolbar available globally
window.updateToolbar = updateToolbar;

// Modal

const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");

export function toggleModal() {
  console.log("Toggling modal");
  modal.classList.toggle("show-modal");
  document.getElementById("frequency-input").value = "";
  document.getElementById("dutycycle-input").value = "";
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

// Setup modal event listeners (close button and window click only)
// Note: The clock button event listener is handled in updateToolbar()
function setupModalEventListeners() {
  if (closeButton) {
    closeButton.addEventListener("click", toggleModal);
  }

  window.addEventListener("click", windowOnClick);
}

// Call setup when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupModalEventListeners);
} else {
  setupModalEventListeners();
}

// Simulation
window.simulationStatus = 1;
const simButton = document.getElementById("simulate-button");
const submitButton = document.getElementById("submit-button");
function toggleSimulation() {
  console.log("🎮 TOGGLE: Simulation button clicked");
  console.log("📊 TOGGLE: Current simulation status:", window.simulationStatus);

  if (window.simulationStatus === 0) {
    console.log("🛑 TOGGLE: Stopping simulation");
    window.simulationStatus = 1;
    simButton.innerHTML = "Simulate";
    submitButton.disabled = false;
  } else {
    console.log("▶️ TOGGLE: Starting simulation");
    window.simulationStatus = 0;
    simButton.innerHTML = "Stop";
    submitButton.disabled = true;

    // For register simulation, we don't need complex animation
    // The simulation is mainly for visual feedback
    console.log("🔍 TOGGLE: Checking if window.simulate exists");
    console.log("🔍 TOGGLE: window.simulate type:", typeof window.simulate);
    console.log("🔍 TOGGLE: window.simulate exists:", !!window.simulate);

    if (window.simulate && typeof window.simulate === "function") {
      console.log("✅ TOGGLE: Calling window.simulate()");
      const result = window.simulate();
      console.log("📊 TOGGLE: Simulate function returned:", result);
    } else {
      console.log(
        "❌ TOGGLE: window.simulate is not available or not a function"
      );
    }

    // Reset simulation status after a brief period
    setTimeout(() => {
      console.log("⏰ TOGGLE: Resetting simulation status after timeout");
      window.simulationStatus = 1;
      simButton.innerHTML = "Simulate";
      submitButton.disabled = false;
    }, 1000);
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
