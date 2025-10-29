import { registerGate, jsPlumbInstance } from "./main.js";
import { setPosition } from "./layout.js";
import { gates, printErrors } from "./gate.js";

("use strict");

export let flipFlops = {};

export function clearFlipFlops() {
  flipFlops = {};
}

class DFlipFlop {
  constructor() {
    this.id = "DFlipFlop-" + window.numComponents++;
    this.d = []; // Takes 2 items in a list : Gate, Output endpoint of gate
    this.clk = [];
    this.q = true;
    this.qbar = false;
    this.inputPoints = [];
    this.outputPoints = [];
    this.qOutputs = [];
    this.qbarOutputs = [];
    this.qIsConnected = false;
    this.qbarIsConnected = false;
    this.component =
      '<div class="drag-drop dflipflop" id=' + this.id + "></div>";
  }
  registerComponent(workingArea, x = 0, y = 0) {
    const parent = document.getElementById(workingArea);
    parent.insertAdjacentHTML("beforeend", this.component);
    document.getElementById(this.id).style.left = x + "px";
    document.getElementById(this.id).style.top = y + "px";

    const el = document.getElementById(this.id);
    el.addEventListener(
      "contextmenu",
      function (ev) {
        ev.preventDefault();
        let left = ev.pageX - document.getScroll()[0];
        let top = ev.pageY - document.getScroll()[1];
        const origin = {
          left: left,
          top: top,
        };
        setPosition(origin);
        window.selectedComponent = this.id;
        window.componentType = "flipFlop";
        return false;
      },
      false
    );

    flipFlops[this.id] = this;
    registerGate(this.id, this);
  }

  setD(d) {
    this.d = d;
  }
  setClk(clk) {
    this.clk = clk;
  }
  setQ(q) {
    this.q = q;
  }
  setQbar(qbar) {
    this.qbar = qbar;
  }
  addInputPoints(input) {
    this.inputPoints.push(input);
  }

  addOutputPoints(output) {
    this.outputPoints.push(output);
  }

  addqOutput(gate) {
    this.qOutputs.push(gate);
  }
  addqbarOutput(gate) {
    this.qbarOutputs.push(gate);
  }

  removeqOutput(gate) {
    // Find and remove all occurrences of gate
    for (let i = this.qOutputs.length - 1; i >= 0; i--) {
      if (this.qOutputs[i] === gate) {
        this.qOutputs.splice(i, 1);
      }
    }
  }
  removeqbarOutput(gate) {
    // Find and remove all occurrences of gate
    for (let i = this.qbarOutputs.length - 1; i >= 0; i--) {
      if (this.qbarOutputs[i] === gate) {
        this.qbarOutputs.splice(i, 1);
      }
    }
  }

  setConnected(val, pos) {
    if (pos === "Q") {
      this.qIsConnected = val;
    } else if (pos === "Q'") {
      this.qbarIsConnected = val;
    }
  }

  generateOutput() {
    const d = getOutputD(this.d[0], this.d[1]);
    const clk = getOutputD(this.clk[0], this.clk[1]);

    if (!clk) {
      return;
    } else {
      if (!d) {
        this.q = false;
        this.qbar = true;
      } else if (d) {
        this.q = true;
        this.qbar = false;
      }
    }
  }
}

function addDFlipFlop(event) {
  // Generate random position for the new D flip-flop
  const x = Math.random() * 400 + 50;
  const y = Math.random() * 300 + 50;

  const ff = new DFlipFlop();
  ff.registerComponent("working-area", x, y);
}

window.addDFlipFlop = addDFlipFlop;

function getOutputD(gate, pos) {
  if (pos === "Q") {
    return gate.q;
  } else if (pos === "Q'") {
    return gate.qbar;
  }
  // But if the gate is not an FA, but an input bit, then return the value of the input
  else {
    return gate.output;
  }
}

// done checking
function getResultDD(ff) {
  // check if flipflop type is Gate object
  if (ff.constructor.name === "Gate") {
    return;
  }

  if (
    getOutputD(ff.d[0], ff.d[1]) != null &&
    getOutputD(ff.clk[0], ff.clk[1]) != null
  ) {
    ff.generateOutput();
  }
  return;
}

// done checking
export function checkConnectionsDD() {
  console.log("🔍 CHECK_DD: Starting D flip-flop connection validation");
  console.log(
    "🔧 CHECK_DD: Total flip-flops to check:",
    Object.keys(flipFlops).length
  );

  for (let ffID in flipFlops) {
    const gate = flipFlops[ffID];
    const id = document.getElementById(gate.id);

    console.log(`🔗 CHECK_DD: Checking flip-flop ${ffID}`);
    console.log(
      `   - Q connected: ${gate.qIsConnected}, Q outputs: ${gate.qOutputs.length}`
    );
    console.log(`   - D input: ${gate.d ? "connected" : "null"}`);
    console.log(`   - CLK input: ${gate.clk ? "connected" : "null"}`);

    // Relaxed validation: Check if critical inputs are connected
    // D input must be connected (either to another component or explicitly set)
    if (gate.d === null || gate.d.length === 0) {
      console.log(`❌ CHECK_DD: Flip-flop ${ffID} D input not connected`);
      printErrors("D of D Flip Flop not connected properly\n", id);
      return false;
    }

    // Clock input must be connected
    if (gate.clk === null || gate.clk.length === 0) {
      console.log(`❌ CHECK_DD: Flip-flop ${ffID} CLK input not connected`);
      printErrors("CLK of D Flip Flop not connected properly\n", id);
      return false;
    }

    // Note: Q output validation is relaxed - not all flip-flops need their outputs connected
    // This allows for more flexible circuit building
    console.log(`✅ CHECK_DD: Flip-flop ${ffID} passed basic validation`);
  }

  console.log("✅ CHECK_DD: All D flip-flop connections validated");
  return true;
}

export function simulateFFDD() {
  for (let ffID in flipFlops) {
    const gate = flipFlops[ffID];
    getResultDD(gate);
  }
}

export function testSimulateDD(flipFlops) {
  for (let ffID in flipFlops) {
    const gate = flipFlops[ffID];
    getResultDD(gate);
  }
}

export function deleteFF(id) {
  const ff = flipFlops[id];
  jsPlumbInstance.removeAllEndpoints(document.getElementById(ff.id));
  jsPlumbInstance._removeElement(document.getElementById(ff.id));
  for (let key in flipFlops) {
    if (ff.constructor.name === "JKFlipFlop") {
      if (flipFlops[key].j[0] === ff) {
        flipFlops[key].j = null;
      }
      if (flipFlops[key].j[0] === ff) {
        flipFlops[key].j = null;
      }
      if (flipFlops[key].clk[0] === ff) {
        flipFlops[key].clk = null;
      }
    } else if (ff.constructor.name === "RSFlipFlop") {
      if (flipFlops[key].r[0] === ff) {
        flipFlops[key].r = null;
      }
      if (flipFlops[key].s[0] === ff) {
        flipFlops[key].s = null;
      }
      if (flipFlops[key].clk[0] === ff) {
        flipFlops[key].clk = null;
      }
    } else if (ff.constructor.name === "DFlipFlop") {
      if (flipFlops[key].d[0] === ff) {
        flipFlops[key].d = null;
      }
      if (flipFlops[key].clk[0] === ff) {
        flipFlops[key].clk = null;
      }
      if (flipFlops[key].qOutputs.includes(ff)) {
        flipFlops[key].removeqOutput(ff);
      }
      if (flipFlops[key].qbarOutputs.includes(ff)) {
        flipFlops[key].removeqbarOutput(ff);
      }
    }
  }

  for (let elem in gates) {
    let found = 0;
    for (let index in gates[elem].inputs) {
      if (gates[elem].inputs[index][0].id === ff.id) {
        found = 1;
        break;
      }
    }
    if (found === 1) {
      gates[elem].removeInput(ff);
    }
    if (gates[elem].outputs.includes(ff)) {
      gates[elem].removeOutput(ff);
    }
  }

  delete flipFlops[id];
}
