import * as gatejs from "./gate.js";
import { wireColours, setPosition } from "./layout.js";
import "./layout.js"; // Import layout.js to execute changeTabs setup and other global functions
import * as clockjs from "./clock.js";
import * as flipflopjs from "./flipflop.js";
import { testSISO4bit, testPIPO } from "./validator.js";
("use strict");

let num_wires = 0;
let draggedElement = null;
let draggedGate = null;

document.getScroll = function () {
  if (window.scrollY != undefined) {
    return [scrollX, scrollY];
  } else {
    let sx,
      sy,
      d = document,
      r = d.documentElement,
      b = d.body;
    sx = r.scrollLeft || b.scrollLeft || 0;
    sy = r.scrollTop || b.scrollTop || 0;
    return [sx, sy];
  }
};

const workingArea = document.getElementById("working-area");
export const jsPlumbInstance = jsPlumbBrowserUI.newInstance({
  container: workingArea,
  maxConnections: -1,
  endpoint: {
    type: "Dot",
    options: { radius: 6 },
  },
  dragOptions: {
    containment: "parentEnclosed",
    containmentPadding: 5,
  },
  connector: "Flowchart",
  paintStyle: { strokeWidth: 4, stroke: "#888888" },
  connectionsDetachable: false,
});

// Enhanced drag functionality
jsPlumbInstance.bind("dragstart", function (data) {
  draggedElement = data.el;
  const gateId = data.el.id;
  if (gatejs.gates[gateId]) {
    draggedGate = gatejs.gates[gateId];
  }
});

jsPlumbInstance.bind("dragstop", function (data) {
  if (draggedGate) {
    // Update gate position after drag
    const rect = data.el.getBoundingClientRect();
    const containerRect = workingArea.getBoundingClientRect();
    draggedGate.x = rect.left - containerRect.left;
    draggedGate.y = rect.top - containerRect.top;
  }
  draggedElement = null;
  draggedGate = null;
});

// Add connection hover events for deletion
jsPlumbInstance.bind("connection", function (info) {
  const connection = info.connection;
  const connectorElement = connection.connector.canvas;

  if (connectorElement) {
    // Add hover class on mouse enter
    connectorElement.addEventListener("mouseenter", function () {
      connectorElement.classList.add("jtk-hover");
    });

    // Remove hover class on mouse leave
    connectorElement.addEventListener("mouseleave", function () {
      connectorElement.classList.remove("jtk-hover");
    });

    // Add context menu for wire deletion
    connectorElement.addEventListener("contextmenu", function (ev) {
      ev.preventDefault();
      let left = ev.pageX - document.getScroll()[0];
      let top = ev.pageY - document.getScroll()[1];
      const origin = {
        left: left,
        top: top,
      };
      setPosition(origin);
      window.contextMenuTarget = connectorElement;
      window.isConnectionContext = true;
      return false;
    });
  }
});

// Returns the component (gate, input/output bit, clock or D flip-flop) with the given id
function findComponent(id) {
  return gatejs.gates[id] || flipflopjs.flipFlops[id] || null;
}

function isFlipFlop(component) {
  return component && component.constructor.name === "DFlipFlop";
}

// Returns the id of the label overlay of an endpoint (the pin name); it is empty for gates and input/output bits
function pinLabel(endpoint) {
  const keys = Object.keys(endpoint.overlays || {});
  return keys.length > 0 ? keys[0] : "";
}

// Tells which output of a component a wire starts from: "Q" or "Q'" for a flip-flop, "" for everything else
function outputPos(component, endpoint) {
  if (isFlipFlop(component)) {
    return pinLabel(endpoint).includes("qbarout") ? "Q'" : "Q";
  }
  return "";
}

// Returns the output endpoint and the input endpoint of a wire, whichever way it was drawn
function splitEndpoints(epA, epB) {
  return epA.uuid.startsWith("output") ? [epA, epB] : [epB, epA];
}

// Records a new wire in the circuit model. It works the same for gates, input/output bits, the clock and the
// D flip-flops, and for both directions in which a wire can be dragged.
function linkEndpoints(fromEndpoint, toEndpoint) {
  const [outEp, inEp] = splitEndpoints(fromEndpoint, toEndpoint);
  const driver = findComponent(outEp.elementId);
  const sink = findComponent(inEp.elementId);
  if (!driver || !sink) {
    return;
  }
  const pos = outputPos(driver, outEp);

  // the component that drives the wire
  if (isFlipFlop(driver)) {
    if (pos === "Q") {
      driver.addqOutput(sink);
    } else {
      driver.addqbarOutput(sink);
    }
    driver.setConnected(true, pos);
  } else {
    driver.addOutput(sink);
    driver.setConnected(true);
  }

  // the component that receives the wire
  if (isFlipFlop(sink)) {
    const pin = pinLabel(inEp);
    if (pin.includes("din")) {
      sink.setD([driver, pos]);
    } else if (pin.includes("clk")) {
      sink.setClk([driver, pos]);
    }
  } else {
    sink.addInput(driver, pos);
  }
}

// Removes a single occurrence of item from list
function removeOne(list, item) {
  const index = list.indexOf(item);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

// Removes a deleted wire from the circuit model
function unlinkEndpoints(connection, epA, epB) {
  if (!epA || !epB || !epA.uuid || !epB.uuid) {
    return;
  }
  const [outEp, inEp] = splitEndpoints(epA, epB);
  if (!outEp.uuid.startsWith("output") || !inEp.uuid.startsWith("input")) {
    return;
  }
  const driver = findComponent(outEp.elementId);
  const sink = findComponent(inEp.elementId);
  if (!driver || !sink) {
    return;
  }
  const pos = outputPos(driver, outEp);
  // the driver stays connected only if it has another wire
  const lastWire = outEp.connections.filter((c) => c !== connection).length === 0;

  if (isFlipFlop(driver)) {
    removeOne(pos === "Q" ? driver.qOutputs : driver.qbarOutputs, sink);
  } else {
    removeOne(driver.outputs, sink);
  }
  if (lastWire) {
    driver.setConnected(false, pos);
  }

  if (isFlipFlop(sink)) {
    const pin = pinLabel(inEp);
    if (pin.includes("din")) {
      sink.setD([]);
    } else if (pin.includes("clk")) {
      sink.setClk([]);
    }
  } else {
    const index = sink.inputs.findIndex(
      (pair) => pair[0] === driver && pair[1] === pos
    );
    if (index !== -1) {
      sink.inputs.splice(index, 1);
    }
  }
}

// Keep the circuit model in sync when a wire is deleted
jsPlumbInstance.bind("connection:detach", function (info) {
  unlinkEndpoints(info.connection, info.sourceEndpoint, info.targetEndpoint);
});

export const connectDFlipFlopGate = function () {
  jsPlumbInstance.unbind("beforeDrop");
  jsPlumbInstance.bind("beforeDrop", function (data) {
    const fromEndpoint = data.connection.endpoints[0];
    const toEndpoint = data.dropEndpoint;

    const start_uuid = fromEndpoint.uuid.split(":")[0];
    const end_uuid = toEndpoint.uuid.split(":")[0];

    // Prevent self-connection
    if (fromEndpoint.elementId === toEndpoint.elementId) {
      return false;
    }

    // Prevent invalid connections
    if (start_uuid === "input" && end_uuid === "input") {
      return false;
    } else if (start_uuid === "output" && end_uuid === "output") {
      return false;
    } else if (
      (end_uuid === "input" && toEndpoint.connections.length > 0) ||
      (start_uuid === "input" && fromEndpoint.connections.length > 1)
    ) {
      // An input pin takes one wire only
      return false;
    }
    jsPlumbInstance.connect({
      uuids: [fromEndpoint.uuid, toEndpoint.uuid],
      paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
    });
    num_wires++;
    num_wires = num_wires % wireColours.length;
    linkEndpoints(fromEndpoint, toEndpoint);
    // the wire has been drawn above, so the drop itself is cancelled
    return false;
  });
};

export const unbindEvent = () => {
  jsPlumbInstance.unbind("beforeDrop");
};

export function registerGate(id, gate) {
  const element = document.getElementById(id);
  const gateType = id.split("-")[0];

  if (
    gateType === "AND" ||
    gateType === "OR" ||
    gateType === "XOR" ||
    gateType === "XNOR" ||
    gateType === "NAND" ||
    gateType === "NOR"
  ) {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, -9],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 10],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
      })
    );
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "NOT") {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "Input" || gateType === "Clock") {
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "Output") {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
  } else if (gateType === "FullAdder") {
    // carry output
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "Cout", id: "cout", location: [3, 0.2] },
          },
        ],
      })
    );
    // sum output
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.5, 1, 0, 1, 0, 7],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:1:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "Sum", id: "sum", location: [0.3, -1.7] },
          },
        ],
      })
    );
    // input A0
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.5, 0, 0, -1, -25, -7],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "A0", id: "a0", location: [0.3, 1.7] },
          },
        ],
      })
    );
    // input B0
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.5, 0, 0, -1, 25, -7],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "B0", id: "b0", location: [0.3, 1.7] },
          },
        ],
      })
    );
    // carry input
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:2:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "Cin", id: "cin", location: [-1, 0.2] },
          },
        ],
      })
    );
  } else if (gateType === "RSFlipFlop") {
    // input s
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.7, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          { type: "Label", options: { id: "rin", location: [3, 0.2] } },
        ],
      })
    );
    // input R
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.3, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
        overlays: [
          { type: "Label", options: { id: "sin", location: [3, 0.2] } },
        ],
      })
    );
    // input clock
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:4:" + id,
        overlays: [
          { type: "Label", options: { id: "clk", location: [3, 0.2] } },
        ],
      })
    );
    // output Q
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.3, 1, 0, 7, 1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:2:" + id,
        overlays: [
          { type: "Label", options: { id: "qout", location: [-1, 0.2] } },
        ],
      })
    );
    // output Q'
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.7, 1, 0, 7, -1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:3:" + id,
        overlays: [
          { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } }, // qbar for q '
        ],
      })
    );
  } else if (gateType === "JKFlipFlop") {
    // input K
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.7, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          { type: "Label", options: { id: "kin", location: [3, 0.2] } },
        ],
      })
    );
    // input J
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.3, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
        overlays: [
          { type: "Label", options: { id: "jin", location: [3, 0.2] } },
        ],
      })
    );
    // input clock
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:4:" + id,
        overlays: [
          { type: "Label", options: { id: "clk", location: [3, 0.2] } },
        ],
      })
    );
    // output Q
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.3, 1, 0, 7, 1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:2:" + id,
        overlays: [
          { type: "Label", options: { id: "qout", location: [-1, 0.2] } },
        ],
      })
    );
    // output Q'
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.7, 1, 0, 7, -1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:3:" + id,
        overlays: [
          { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } }, // qbar for q '
        ],
      })
    );
  } else if (gateType === "DFlipFlop") {
    // input D
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.31, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          { type: "Label", options: { id: "din", location: [3, 0.2] } },
        ],
      })
    );
    // input clock
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.69, 0, 1, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:4:" + id,
        overlays: [
          { type: "Label", options: { id: "clk", location: [3, 0.2] } },
        ],
      })
    );
    // output Q
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.3, 1, 0, 7, 1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:2:" + id,
        overlays: [
          { type: "Label", options: { id: "qout", location: [-1, 0.2] } },
        ],
      })
    );
    // output Q' (Qbar)
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.7, 1, 0, 7, -1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:3:" + id,
        overlays: [
          { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } },
        ],
      })
    );
  }
}

export function initSISO() {
  const ids = ["Input-0", "Output-1", "Output-2", "Output-3", "Output-4"];
  const types = ["Input", "Output", "Output", "Output", "Output"];
  const names = ["D", "Q4", "Q3", "Q2", "Q1"];
  const positions = [
    { x: 40, y: 400 }, // D input
    { x: 750, y: 100 }, // Final output Q4
    { x: 550, y: 100 }, // Q3 - intermediate output
    { x: 350, y: 100 }, // Q2 - intermediate output
    { x: 150, y: 100 }, // Q1 - intermediate output
  ];
  for (let i = 0; i < ids.length; i++) {
    let gate = new gatejs.Gate(types[i]);
    gate.setId(ids[i]);
    gate.setName(names[i]);
    const component = gate.generateComponent();
    const parent = document.getElementById("working-area");
    parent.insertAdjacentHTML("beforeend", component);
    gate.registerComponent("working-area", positions[i].x, positions[i].y);
  }
  clockjs.addClock(0.5, 50, "working-area", 40, 600, "Clk", "Clock-0");
}

export function initPIPO() {
  const ids = [
    "Input-0",
    "Input-1",
    "Input-2",
    "Input-3",
    "Output-1",
    "Output-2",
    "Output-3",
    "Output-4",
  ];
  const types = [
    "Input",
    "Input",
    "Input",
    "Input",
    "Output",
    "Output",
    "Output",
    "Output",
  ];
  const names = ["P4", "P3", "P2", "P1", "Q4", "Q3", "Q2", "Q1"];
  const positions = [
    { x: 150, y: 650 },
    { x: 350, y: 650 },
    { x: 550, y: 650 },
    { x: 750, y: 650 },
    { x: 150, y: 50 },
    { x: 350, y: 50 },
    { x: 550, y: 50 },
    { x: 750, y: 50 },
  ];
  for (let i = 0; i < ids.length; i++) {
    let gate = new gatejs.Gate(types[i]);
    gate.setId(ids[i]);
    gate.setName(names[i]);
    const component = gate.generateComponent();
    const parent = document.getElementById("working-area");
    parent.insertAdjacentHTML("beforeend", component);
    gate.registerComponent("working-area", positions[i].x, positions[i].y);
  }
  clockjs.addClock(0.5, 50, "working-area", 20, 500, "Clk", "Clock-0");
}

export function refreshWorkingArea() {
  jsPlumbInstance.reset();
  window.numComponents = 0;

  gatejs.clearGates();
  flipflopjs.clearFlipFlops();
}

// Submit circuit function
function submitCircuit() {
  console.log("🎯 SUBMIT: Starting circuit submission");
  // a result from an earlier Submit or Simulate must not stay on the screen
  gatejs.clearResult();
  const task = window.currentTab;
  console.log("📋 SUBMIT: Current task:", task);
  console.log("🔧 SUBMIT: Available gates:", Object.keys(gatejs.gates));
  console.log(
    "🔧 SUBMIT: Available flip-flops:",
    Object.keys(flipflopjs.flipFlops)
  );

  // First check if there are any components at all
  if (
    Object.keys(gatejs.gates).length === 0 &&
    Object.keys(flipflopjs.flipFlops).length === 0
  ) {
    console.log("❌ SUBMIT: No components found");
    document.getElementById("result").innerHTML =
      "<span>&#10007;</span> No components found. Please add components to build the circuit.";
    document.getElementById("result").className = "failure-message";
    return;
  }

  // Check if there are any flip-flops (required for register circuits)
  if (Object.keys(flipflopjs.flipFlops).length === 0) {
    console.log("❌ SUBMIT: No flip-flops found");
    document.getElementById("result").innerHTML =
      "<span>&#10007;</span> No D flip-flops found. Register circuits require D flip-flops.";
    document.getElementById("result").className = "failure-message";
    return;
  }

  if (task === "task1") {
    console.log("📝 SUBMIT: Validating SISO (Task 1)");

    // Check each required component
    const requiredComponents = [
      "Input-0",
      "Clock-0",
      "Output-1",
      "Output-2",
      "Output-3",
      "Output-4",
    ];
    const missingComponents = [];

    requiredComponents.forEach((comp) => {
      if (gatejs.gates[comp]) {
        console.log(`✅ SUBMIT: Found ${comp}`);
      } else {
        console.log(`❌ SUBMIT: Missing ${comp}`);
        missingComponents.push(comp);
      }
    });

    if (missingComponents.length > 0) {
      console.log("❌ SUBMIT: Missing components:", missingComponents);
      document.getElementById(
        "result"
      ).innerHTML = `<span>&#10007;</span> Missing components: ${missingComponents.join(
        ", "
      )}. Please ensure all required components are connected: D input, Clock, and all 4 flip-flop outputs (Q1, Q2, Q3, Q4).`;
      document.getElementById("result").className = "failure-message";
      return;
    }

    // SISO validation with all 4 flip-flop outputs
    if (
      gatejs.gates["Input-0"] &&
      gatejs.gates["Clock-0"] &&
      gatejs.gates["Output-1"] &&
      gatejs.gates["Output-2"] &&
      gatejs.gates["Output-3"] &&
      gatejs.gates["Output-4"]
    ) {
      console.log("🔬 SUBMIT: Running SISO validation");
      testSISO4bit(
        "Input-0",
        "Clock-0",
        "Output-4",
        "Output-3",
        "Output-2",
        "Output-1"
      );
    } else {
      document.getElementById("result").innerHTML =
        "<span>&#10007;</span> Please ensure all required components are connected: D input, Clock, and all 4 flip-flop outputs (Q1, Q2, Q3, Q4).";
      document.getElementById("result").className = "failure-message";
    }
  } else if (task === "task2") {
    console.log("🔍 SUBMIT: Processing PIPO task");

    // PIPO validation
    const requiredInputs = ["Input-3", "Input-2", "Input-1", "Input-0"]; // P4,P3,P2,P1
    const requiredOutputs = ["Output-1", "Output-2", "Output-3", "Output-4"]; // Q4,Q3,Q2,Q1
    const requiredClock = ["Clock-0"];

    let allConnected = gatejs.gates["Clock-0"];
    console.log("🔍 SUBMIT: Clock component:", !!gatejs.gates["Clock-0"]);

    const missingInputs = [];
    const missingOutputs = [];

    for (let input of requiredInputs) {
      if (!gatejs.gates[input]) {
        allConnected = false;
        missingInputs.push(input);
        console.log(`❌ SUBMIT: Missing input: ${input}`);
      } else {
        console.log(`✅ SUBMIT: Found input: ${input}`);
      }
    }

    for (let output of requiredOutputs) {
      if (!gatejs.gates[output]) {
        allConnected = false;
        missingOutputs.push(output);
        console.log(`❌ SUBMIT: Missing output: ${output}`);
      } else {
        console.log(`✅ SUBMIT: Found output: ${output}`);
      }
    }

    if (!allConnected) {
      let errorMessage =
        "<span>&#10007;</span> Missing components for PIPO register: ";
      const missingComponents = [];

      if (!gatejs.gates["Clock-0"]) missingComponents.push("Clock");
      if (missingInputs.length > 0)
        missingComponents.push(`Inputs: ${missingInputs.join(", ")}`);
      if (missingOutputs.length > 0)
        missingComponents.push(`Outputs: ${missingOutputs.join(", ")}`);

      errorMessage += missingComponents.join("; ");
      errorMessage +=
        ". Please ensure all required components are connected (P1-P4 inputs, Clock, Q1-Q4 outputs).";

      document.getElementById("result").innerHTML = errorMessage;
      document.getElementById("result").className = "failure-message";
      return;
    }

    if (allConnected) {
      console.log("🔬 SUBMIT: Running PIPO validation");
      // P1 and Q1 are the right-most bits: Input-3 and Output-4
      testPIPO(
        "Input-3",
        "Input-2",
        "Input-1",
        "Input-0",
        "Clock-0",
        "Output-4",
        "Output-3",
        "Output-2",
        "Output-1"
      );
    }
  } else {
    console.log("❌ SUBMIT: Unknown task:", task);
    document.getElementById("result").innerHTML =
      "<span>&#10007;</span> Unknown task. Please select either SISO or PIPO tab.";
    document.getElementById("result").className = "failure-message";
  }
}

// Global function assignments
window.submitCircuit = submitCircuit;

refresh.addEventListener("click", function () {
  gatejs.stopSimulation();
  gatejs.clearResult();
  jsPlumbInstance.reset();
  window.numComponents = 0;

  gatejs.clearGates();
  flipflopjs.clearFlipFlops();
  // the wire handler is set up again, as it is when the tab changes
  connectDFlipFlopGate();
  if (window.currentTab == "task1") initSISO();
  else initPIPO();
});

// Initialize the application
window.currentTab = "task1";
console.log("🚀 Initial setup: currentTab set to", window.currentTab);

connectDFlipFlopGate();
refreshWorkingArea();
initSISO();

// Initialize toolbar after DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM Content Loaded - initializing toolbar");
  // Use setTimeout to ensure all modules are loaded
  setTimeout(() => {
    if (typeof window.updateToolbar === "function") {
      console.log("✅ updateToolbar function found, calling it");
      window.updateToolbar();
    } else {
      console.log("❌ updateToolbar function not found");
    }
  }, 100);
});

// If DOM is already loaded, initialize toolbar immediately
if (document.readyState === "loading") {
  console.log("📄 DOM still loading, will wait for DOMContentLoaded");
} else {
  console.log("📄 DOM already loaded - initializing toolbar immediately");
  setTimeout(() => {
    if (typeof window.updateToolbar === "function") {
      console.log("✅ updateToolbar function found (immediate), calling it");
      window.updateToolbar();
    } else {
      console.log("❌ updateToolbar function not found (immediate)");
    }

    // Ensure changeTabs is available
    if (typeof window.changeTabs === "function") {
      console.log("✅ changeTabs function is available");
    } else {
      console.log("❌ changeTabs function not found - checking layout module");
      console.log(
        "Available functions:",
        Object.keys(window).filter((key) => typeof window[key] === "function")
      );
    }
  }, 100);
}

// Ensure critical functions are available immediately
setTimeout(() => {
  // Force re-import of layout functions if needed
  if (!window.changeTabs) {
    console.log("🔧 changeTabs not found, attempting to re-establish...");
    import("./layout.js").then(() => {
      console.log("📦 Layout module re-imported");
    });
  }
}, 50);

// Fallback changeTabs function if module loading fails
if (!window.changeTabs) {
  window.changeTabs = function (e) {
    console.log("🔄 Using fallback changeTabs function");
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

    // Update instructions
    const instructionBox = document.getElementById("instruction-title");
    if (instructionBox) {
      let title = "";
      if (task === "task1") {
        title = `Instructions<br>Implement a 4-bit Serial Input Serial Output (SISO) shift register using D flip-flops`;
      } else if (task === "task2") {
        title = `Instructions<br>Implement a 4-bit Parallel Input Parallel Output (PIPO) register using D flip-flops`;
      }
      instructionBox.innerHTML = title;
    }

    // Update toolbar
    console.log("🔧 Calling updateToolbar()");
    if (typeof window.updateToolbar === "function") {
      window.updateToolbar();
    } else {
      console.log("❌ updateToolbar function not found");
    }

    // Clear working area and re-initialize
    refreshWorkingArea();

    // Initialize appropriate task
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
        console.log("❌ Unknown task:", task);
        break;
    }

    // Reset simulation status
    const simButton = document.getElementById("simulate-button");
    if (simButton) {
      simButton.innerHTML = "Simulate";
    }
    window.simulationStatus = 1;

    // Clear observations
    document.getElementById("table-body").innerHTML = "";
    document.getElementById("table-head").innerHTML = "";
    document.getElementById("result").innerHTML = "";

    console.log(`✅ Tab switch to ${task} completed (fallback)`);
  };
  console.log("🔄 Fallback changeTabs function registered");
}

// Ensure toggleSimulation is available
if (!window.toggleSimulation) {
  window.toggleSimulation = function () {
    console.log("🎮 FALLBACK: Simulation button clicked");

    if (typeof window.simulate === "function") {
      console.log("✅ FALLBACK: Calling window.simulate()");
      const result = window.simulate();
      console.log("📊 FALLBACK: Simulate function returned:", result);
    } else {
      console.log("❌ FALLBACK: window.simulate is not available");
    }
  };
  console.log("🔄 Fallback toggleSimulation function registered");
}
