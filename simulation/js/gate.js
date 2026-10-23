import { registerGate } from "./main.js";
import { setPosition } from "./layout.js";
import {
  computeAnd,
  computeNand,
  computeNor,
  computeOr,
  computeXnor,
  computeXor,
} from "./validator.js";
import { jsPlumbInstance } from "./main.js";
import {
  flipFlops,
  simulateFFDD,
  checkConnectionsDD,
  testSimulateDD,
  presetFlipFlops,
} from "./flipflop.js";

("use strict");
export let gates = {}; // Array of gates
window.numComponents = 0;
export function clearGates() {
  gates = {};
}

export class Gate {
  constructor(type) {
    this.type = type;
    this.id = type + "-" + window.numComponents++;
    this.positionX = 0;
    this.positionY = 0;
    this.isConnected = false;
    this.inputPoints = [];
    this.outputPoints = [];
    this.inputs = []; // List of input gates
    this.outputs = [];
    this.output = null; // Output value
    this.isInput = false;
    this.isOutput = false;
    this.name = null;
  }
  setId(id) {
    this.id = id;
  }
  addInput(gate, pos) {
    this.inputs.push([gate, pos]);
  }
  addOutput(gate) {
    this.outputs.push(gate);
  }
  removeInput(gate) {
    for (let i = this.inputs.length - 1; i >= 0; i--) {
      if (this.inputs[i][0] === gate) {
        this.inputs.splice(i, 1);
      }
    }
  }
  removeOutput(gate) {
    // Find and remove all occurrences of gate
    for (let i = this.outputs.length - 1; i >= 0; i--) {
      if (this.outputs[i] === gate) {
        this.outputs.splice(i, 1);
      }
    }
  }
  updatePosition(id) {
    this.positionY =
      window.scrollY + document.getElementById(id).getBoundingClientRect().top; // Y

    this.positionX =
      window.scrollX + document.getElementById(id).getBoundingClientRect().left; // X
  }
  setName(name) {
    this.name = name;
  }

  generateComponent() {
    let component = "";

    switch (this.type) {
      case "Input":
        component = `<div class="high" id= ${this.id} ><a onclick="setInput(event)" title="Click to toggle between 0 and 1">1</a><p> ${this.name}  </p></div>`;
        this.output = true;
        this.isInput = true;
        break;
      case "Output":
        component = `<div class="output" id= ${this.id}><a></a><p>  ${this.name}  </p></div>`;
        this.isOutput = true;
        break;
      default:
        component = `<div class="drag-drop logic-gate ${this.type.toLowerCase()}" id= ${
          this.id
        }></div>`;
    }
    return component;
  }

  // Adds element to the circuit board, adds event listeners and generates its endpoints.
  registerComponent(workingArea, x = 0, y = 0) {
    // get width of working area
    const width = document.getElementById(workingArea).offsetWidth;
    const height = document.getElementById(workingArea).offsetHeight;
    let scale = 900;
    let yScale = 800;
    x = (x / scale) * width;
    y = (y / yScale) * height;

    const el = document.getElementById(this.id);
    el.style.left = x + "px";
    el.style.top = y + "px";

    if (this.type != "Input" && this.type != "Output") {
      el.addEventListener(
        "contextmenu",
        function (ev) {
          ev.preventDefault();
          const origin = {
            left: ev.pageX - document.getScroll()[0],
            top: ev.pageY - document.getScroll()[1],
          };
          setPosition(origin);
          window.selectedComponent = this.id;
          window.componentType = "gate";
          return false;
        },
        false
      );
    }
    gates[this.id] = this;
    registerGate(this.id, this);

    this.updatePosition(this.id);
  }

  addInputPoints(input) {
    this.inputPoints.push(input);
  }

  addOutputPoints(output) {
    this.outputPoints.push(output);
  }

  generateOutput() {
    switch (this.type) {
      case "AND":
        this.output = computeAnd(
          getOutput(this.inputs[0]),
          getOutput(this.inputs[1])
        );
        break;
      case "OR":
        this.output = computeOr(
          getOutput(this.inputs[0]),
          getOutput(this.inputs[1])
        );
        break;
      case "NOT":
        this.output = !getOutput(this.inputs[0]);
        break;
      case "NAND":
        this.output = computeNand(
          getOutput(this.inputs[0]),
          getOutput(this.inputs[1])
        );
        break;
      case "NOR":
        this.output = computeNor(
          getOutput(this.inputs[0]),
          getOutput(this.inputs[1])
        );
        break;
      case "XOR":
        this.output = computeXor(
          getOutput(this.inputs[0]),
          getOutput(this.inputs[1])
        );
        break;
      case "XNOR":
        this.output = computeXnor(
          getOutput(this.inputs[0]),
          getOutput(this.inputs[1])
        );
        break;
      case "Output":
        this.output = getOutput(this.inputs[0]);
        break;
    }
  }

  setOutput(val) {
    this.output = val;
  }
  setConnected(val) {
    this.isConnected = val;
  }
}

function getOutput(input) {
  let gate = input[0];
  let pos = input[1];

  if (pos === "") {
    return gate.output;
  } else if (pos === "Q") {
    return gate.q;
  } else if (pos === "Q'") {
    return gate.qbar;
  }
}

export function getResult(gate) {
  if (gate.output != null) {
    return;
  }
  for (let i = 0; i < gate.inputs.length; i++) {
    // changes made to get result for all gates
    if (getOutput(gate.inputs[i]) == null) {
      getResult(gate.inputs[i]);
    }
  }
  gate.generateOutput();
  return;
}

// Position of the last mouse/touch press, used to tell a click apart from the end of a drag
let pressPosition = { x: 0, y: 0 };
document.addEventListener(
  "pointerdown",
  function (event) {
    pressPosition = { x: event.clientX, y: event.clientY };
  },
  true
);

// Set the Input values of the input bits on click
function setInput(event) {
  // ignore the click that ends a drag of the input bit
  if (
    Math.hypot(event.clientX - pressPosition.x, event.clientY - pressPosition.y) > 5
  ) {
    return;
  }
  let parentElement = event.target.parentElement;
  let element = event.target;
  let type = parentElement.className.split(" ")[0];
  let gate = gates[parentElement.id];
  if (type === "high") {
    // change class high to low
    parentElement.classList.replace("high", "low");
    element.innerHTML = "0";
    gate.setOutput(false);
  } else if (type === "low") {
    parentElement.classList.replace("low", "high");
    element.innerHTML = "1";
    gate.setOutput(true);
  }
}

window.setInput = setInput;

export function clearResult() {
  const result = document.getElementById("result");
  result.innerHTML = "";
  document.getElementById("table-body").innerHTML = "";
  document.getElementById("table-head").innerHTML = "";
}

function addGate(event) {
  const type = event.target.innerHTML.toUpperCase();
  const gate = new Gate(type);
  const component = gate.generateComponent();
  const parent = document.getElementById("working-area");
  parent.insertAdjacentHTML("beforeend", component);
  gate.registerComponent("working-area");
}

window.addGate = addGate;

export function printErrors(message, objectId) {
  const result = document.getElementById("result");
  result.innerHTML += message;
  result.className = "failure-message";
  if (objectId !== null) {
    objectId.classList.add("highlight");
    setTimeout(function () {
      objectId.classList.remove("highlight");
    }, 5000);
  }
}

export function checkConnections() {
  console.log("🔍 CHECK_CONN: Starting connection validation");
  console.log(
    "🔧 CHECK_CONN: Total gates to check:",
    Object.keys(gates).length
  );

  for (let gateId in gates) {
    const gate = gates[gateId];
    const id = document.getElementById(gate.id);

    console.log(`🔗 CHECK_CONN: Checking gate ${gateId} (${gate.type})`);
    console.log(
      `   - Input points: ${gate.inputPoints.length}, Inputs: ${gate.inputs.length}`
    );
    console.log(
      `   - Is connected: ${gate.isConnected}, Outputs: ${gate.outputs.length}`
    );
    console.log(
      `   - Is output: ${gate.isOutput}, Is clock: ${gate.type === "Clock"}`
    );

    // Relaxed validation for practical circuit building
    // Input gates and clock components don't need connections
    if (gate.isInput || gate.type === "Clock") {
      console.log(
        `✅ CHECK_CONN: Gate ${gateId} is input/clock - skipping connection check`
      );
      continue;
    }

    // For logic gates, check input connections only if they have input points
    if (
      gate.inputPoints.length > 0 &&
      gate.inputPoints.length != gate.inputs.length
    ) {
      console.log(
        `❌ CHECK_CONN: Gate ${gateId} input mismatch - expected ${gate.inputPoints.length}, got ${gate.inputs.length}`
      );
      printErrors("Highlighted component not connected properly\n", id);
      return false;
    }

    // For output gates, they must have at least one input
    if (gate.isOutput && gate.inputs.length === 0) {
      console.log(`❌ CHECK_CONN: Output gate ${gateId} has no inputs`);
      printErrors("Highlighted component not connected properly\n", id);
      return false;
    }

    console.log(`✅ CHECK_CONN: Gate ${gateId} passed validation`);
  }
  console.log("✅ CHECK_CONN: All connections valid");
  return true;
}

// Stops the clock of a running simulation and brings the Simulate and Submit buttons back to their normal state
export function stopSimulation() {
  window.simulationStatus = 1;
  const simulateButton = document.getElementById("simulate-button");
  if (simulateButton) {
    simulateButton.innerHTML = "Simulate";
  }
  const submitButton = document.getElementById("submit-button");
  if (submitButton) {
    submitButton.disabled = false;
  }
}

// Starts the clock and shows how the register works on the circuit board. The Submit button does the grading.
export function simulate() {
  clearResult();
  window.simulationStatus = 0;

  if (!checkConnections()) {
    return false;
  }

  if (window.currentTab === "task1" || window.currentTab === "task2") {
    if (!checkConnectionsDD()) {
      return false;
    }
  }

  // every new simulation gets its own number, so that the loops of an earlier one stop by themselves
  window.simulationGeneration = (window.simulationGeneration || 0) + 1;
  presetFlipFlops();

  for (let gateId in gates) {
    const gate = gates[gateId];
    if (gate.type === "Clock") {
      gate.simulate();
    }
  }

  // show the starting state (Q = 1) on the output bits right away; the clock edges follow
  simulateWithClock();

  return true;
}

// Make simulate function available globally
window.simulate = simulate;

function simulateWithClock() {
  // input bits
  for (let gateId in gates) {
    const gate = gates[gateId];
    for (let index in gate.inputs) {
      let input = gate.inputs[index][0];
      if (input.isInput) {
        let val = input.output;
        if (gate.type === "OR" && val) {
          gate.setOutput(true);
        }
        if (gate.type === "AND" && !val) {
          gate.setOutput(false);
        }
        if (gate.type === "NOR" && val) {
          gate.setOutput(false);
        }
        if (gate.type === "NAND" && !val) {
          gate.setOutput(true);
        }
      }
    }
  }
  // logic gates and flip flop
  for (let iterations = 0; iterations < 5; iterations++) {
    for (let gateId in gates) {
      const gate = gates[gateId];
      if (!gate.isOutput && !gate.isInput && gate.type != "NOT") {
        const val1 = getOutput(gate.inputs[0]);
        const val2 = getOutput(gate.inputs[1]);
        if (val1 == null || val2 == null) {
          let val = null;
          if (val1 == null && val2 == null) {
            continue;
          } else if (val1 == null) {
            val = val2;
          } else if (val2 == null) {
            val = val1;
          }

          if (gate.type === "OR" && val) {
            gate.setOutput(true);
          }
          if (gate.type === "AND" && !val) {
            gate.setOutput(false);
          }
          if (gate.type === "NOR" && val) {
            gate.setOutput(false);
          }
          if (gate.type === "NAND" && !val) {
            gate.setOutput(true);
          }
        } else {
          gate.generateOutput();
        }
      } else if (!gate.isOutput && !gate.isInput && gate.type === "NOT") {
        const val1 = getOutput(gate.inputs[0]);
        if (val1 == null) {
          continue;
        } else {
          gate.generateOutput();
        }
      } else if (!gate.isOutput && !gate.isInput) {
        const val1 = getOutput(gate.inputs[0]);
        const val2 = getOutput(gate.inputs[1]);
        const val3 = getOutput(gate.inputs[2]);
        const val = [];
        if (val1 != null) val.push(val1);
        if (val2 != null) val.push(val2);
        if (val3 != null) val.push(val3);
        if (val.length === 0) {
          continue;
        } else if (val.length === 3) {
          gate.generateOutput();
        } else {
          for (let value in val) {
            if (!val[value]) {
              gate.setOutput(true);
              break;
            }
          }
        }
      }
    }

    if (window.currentTab === "task1" || window.currentTab === "task2") {
      simulateFFDD();
    }
  }
  // output bits
  for (let gateId in gates) {
    const gate = gates[gateId];
    if (gate.isOutput) {
      let input = gate.inputs[0];
      let element = document.getElementById(gate.id);
      if (getOutput(input)) {
        element.className = "high";
        element.childNodes[0].innerHTML = "1";
      } else {
        element.className = "low";
        element.childNodes[0].innerHTML = "0";
      }
    }
  }
}

window.simulate = simulate;
window.simClk = simulateWithClock;

export function testSimulation(gates, flipFlops) {
  if (!checkConnections()) {
    document.getElementById("table-body").innerHTML = "";
    return false;
  }

  if (window.currentTab === "task1" || window.currentTab === "task2") {
    if (!checkConnectionsDD()) {
      document.getElementById("table-body").innerHTML = "";
      return false;
    }
  }

  // input bits
  for (let gateId in gates) {
    const gate = gates[gateId];
    for (let index in gate.inputs) {
      let input = gate.inputs[index][0];
      if (input.isInput) {
        let val = input.output;
        if (gate.type === "OR" && val === true) {
          gate.setOutput(true);
        }
        if (gate.type === "AND" && val === false) {
          gate.setOutput(false);
        }
        if (gate.type === "NOR" && val === true) {
          gate.setOutput(false);
        }
        if (gate.type === "NAND" && val === false) {
          gate.setOutput(true);
        }
      }
    }
  }
  // logic gates and flip flop
  for (let iterations = 0; iterations < 5; iterations++) {
    for (let gateId in gates) {
      const gate = gates[gateId];
      if (
        gate.isOutput === false &&
        gate.isInput === false &&
        gate.type != "NOT"
      ) {
        const val1 = getOutput(gate.inputs[0]);
        const val2 = getOutput(gate.inputs[1]);
        if (val1 == null || val2 == null) {
          let val = null;
          if (val1 == null && val2 == null) {
            continue;
          } else if (val1 == null) {
            val = val2;
          } else if (val2 == null) {
            val = val1;
          }

          if (gate.type === "OR" && val === true) {
            gate.setOutput(true);
          }
          if (gate.type === "AND" && val === false) {
            gate.setOutput(false);
          }
          if (gate.type === "NOR" && val === true) {
            gate.setOutput(false);
          }
          if (gate.type === "NAND" && val === false) {
            gate.setOutput(true);
          }
        } else {
          gate.generateOutput();
        }
      } else if (
        gate.isOutput === false &&
        gate.isInput === false &&
        gate.type === "NOT"
      ) {
        const val1 = getOutput(gate.inputs[0]);
        if (val1 == null) {
          continue;
        } else {
          gate.generateOutput();
        }
      } else if (gate.isOutput === false && gate.isInput === false) {
        const val1 = getOutput(gate.inputs[0]);
        const val2 = getOutput(gate.inputs[1]);
        const val3 = getOutput(gate.inputs[2]);
        const val = [];
        if (val1 != null) val.push(val1);
        if (val2 != null) val.push(val2);
        if (val3 != null) val.push(val3);
        if (val.length === 0) {
          continue;
        } else if (val.length === 3) {
          gate.generateOutput();
        } else {
          for (let value in val) {
            if (val[value] === false) {
              gate.setOutput(true);
              break;
            }
          }
        }
      }
    }

    if (window.currentTab === "task1" || window.currentTab === "task2") {
      testSimulateDD(flipFlops);
    }
  }
  // output bits
  for (let gateId in gates) {
    const gate = gates[gateId];
    if (gate.isOutput) {
      let input = gate.inputs[0];
      if (getOutput(input) != null) {
        gate.setOutput(getOutput(input));
      }
    }
  }
  return true;
}

export function deleteElement(gateid) {
  let gate = gates[gateid];
  jsPlumbInstance.removeAllEndpoints(document.getElementById(gate.id));
  jsPlumbInstance._removeElement(document.getElementById(gate.id));
  for (let elem in gates) {
    let found = 0;
    for (let index in gates[elem].inputs) {
      if (gates[elem].inputs[index][0].id === gate.id) {
        found = 1;
        break;
      }
    }
    if (found === 1) {
      gates[elem].removeInput(gate);
    }
    if (gates[elem].outputs.includes(gate)) {
      gates[elem].removeOutput(gate);
    }
  }
  for (let key in flipFlops) {
    if (flipFlops[key].constructor.name === "DFlipFlop") {
      if (flipFlops[key].d[0] === gate) {
        flipFlops[key].d = [];
      }
      if (flipFlops[key].clk[0] === gate) {
        flipFlops[key].clk = [];
      }
      if (flipFlops[key].qOutputs.includes(gate)) {
        flipFlops[key].removeqOutput(gate);
      }
      if (flipFlops[key].qbarOutputs.includes(gate)) {
        flipFlops[key].removeqbarOutput(gate);
      }
    }
  }
  delete gates[gateid];
}
