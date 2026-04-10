import * as gatejs from "./gate.js";
import { wireColours, setPosition } from "./layout.js";
import "./layout.js"; // Import layout.js to execute changeTabs setup and other global functions
import * as clockjs from "./clock.js";
import * as flipflopjs from "./flipflop.js";
import { testSISO, testSISO4bit, testPIPO } from "./validator.js";
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

export const connectGate = function () {
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
      // If it already has a connection, do not establish a new connection
      return false;
    } else {
      // Create connection with colored wire
      jsPlumbInstance.connect({
        uuids: [fromEndpoint.uuid, toEndpoint.uuid],
        paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
      });

      num_wires++;
      num_wires = num_wires % wireColours.length;

      // Update gate connections
      if (start_uuid === "output") {
        const input = gatejs.gates[fromEndpoint.elementId];
        input.isConnected = true;
        gatejs.gates[toEndpoint.elementId].addInput(input, "");
        input.addOutput(gatejs.gates[toEndpoint.elementId]);
      } else if (end_uuid === "output") {
        const input = gatejs.gates[toEndpoint.elementId];
        input.isConnected = true;
        gatejs.gates[fromEndpoint.elementId].addInput(input, "");
        input.addOutput(gatejs.gates[fromEndpoint.elementId]);
      }
    }
  });
};

// Helper functions for enhanced connection handling
function handleFlipFlopToFlipFlopConnection(
  fromEndpoint,
  toEndpoint,
  start_uuid,
  end_uuid
) {
  if (start_uuid === "output") {
    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
    let pos = "";
    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
      pos = "Q";
      input.addqOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
    } else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
      pos = "Q'";
      input.addqbarOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
    }
    input.setConnected(true, pos);
    if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
      flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
    } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
      flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
    }
  } else if (end_uuid === "output") {
    const input = flipflopjs.flipFlops[toEndpoint.elementId];
    let pos = "";
    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
      pos = "Q";
      input.addqOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
    } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
      pos = "Q'";
      input.addqbarOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
    }
    input.setConnected(true, pos);
    if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
      flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
    } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
      flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
    }
  }
}

function handleFlipFlopToInputConnection(fromEndpoint, toEndpoint, end_uuid) {
  if (end_uuid === "output") {
    const input = gatejs.gates[toEndpoint.elementId];
    input.setConnected(true);
    let pos = "";
    if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
      flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
    } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
      flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
    }
    input.addOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
  }
}

function handleInputToFlipFlopConnection(fromEndpoint, toEndpoint, start_uuid) {
  if (start_uuid === "output") {
    const input = gatejs.gates[fromEndpoint.elementId];
    input.setConnected(true);
    let pos = "";
    if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
      flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
    } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
      flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
    }
    input.addOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
  }
}

function handleFlipFlopToOutputConnection(
  fromEndpoint,
  toEndpoint,
  start_uuid
) {
  if (start_uuid === "output") {
    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
    const output = gatejs.gates[toEndpoint.elementId];
    let pos = "";
    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
      pos = "Q";
      input.addqOutput(gatejs.gates[toEndpoint.elementId]);
    } else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
      pos = "Q'";
      input.addqbarOutput(gatejs.gates[toEndpoint.elementId]);
    }
    input.setConnected(true, pos);
    output.addInput(input, pos);
  }
}

function handleOutputToFlipFlopConnection(
  fromEndpoint,
  toEndpoint,
  start_uuid
) {
  if (start_uuid === "input") {
    const input = flipflopjs.flipFlops[toEndpoint.elementId];
    const output = gatejs.gates[fromEndpoint.elementId];
    let pos = "";
    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
      pos = "Q";
      input.addqOutput(gatejs.gates[fromEndpoint.elementId]);
    } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
      pos = "Q'";
      input.addqbarOutput(output);
    }
    input.setConnected(true, pos);
    output.addInput(input, pos);
  }
}

function handleInputToOutputConnection(fromEndpoint, toEndpoint, start_uuid) {
  if (start_uuid === "output") {
    const input = gatejs.gates[fromEndpoint.elementId];
    const output = gatejs.gates[toEndpoint.elementId];
    input.setConnected(true);
    output.addInput(input, "");
    input.addOutput(output);
  }
}

function handleOutputToInputConnection(fromEndpoint, toEndpoint, start_uuid) {
  if (start_uuid === "input") {
    const input = gatejs.gates[toEndpoint.elementId];
    const output = gatejs.gates[fromEndpoint.elementId];
    input.setConnected(true);
    output.addInput(input, "");
    input.addOutput(output);
  }
}

function handleFlipFlopToGateConnection(fromEndpoint, toEndpoint, start_uuid) {
  if (start_uuid === "output") {
    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
    const output = gatejs.gates[toEndpoint.elementId];
    let pos = "";
    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
      pos = "Q";
      input.addqOutput(gatejs.gates[toEndpoint.elementId]);
    } else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
      pos = "Q'";
      input.addqbarOutput(gatejs.gates[toEndpoint.elementId]);
    }
    input.setConnected(true, pos);
    output.addInput(input, pos);
  }
}

function handleGateToFlipFlopConnection(fromEndpoint, toEndpoint, end_uuid) {
  if (end_uuid === "input") {
    const input = gatejs.gates[fromEndpoint.elementId];
    const flipFlop = flipflopjs.flipFlops[toEndpoint.elementId];
    input.setConnected(true);
    let pos = "";
    if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
      flipFlop.setD([input, pos]);
    } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
      flipFlop.setClk([input, pos]);
    }
    input.addOutput(flipFlop);
  }
}

// Enhanced D Flip Flop and gates connection with comprehensive validation
export const connectDFlipFlopGate = function () {
  jsPlumbInstance.bind("beforeDrop", function (data) {
    const fromEndpoint = data.connection.endpoints[0];
    const toEndpoint = data.dropEndpoint;

    const start_uuid = fromEndpoint.uuid.split(":")[0];
    const end_uuid = toEndpoint.uuid.split(":")[0];

    // Prevent self-connection
    if (fromEndpoint.elementId === toEndpoint.elementId) {
      console.warn("Cannot connect component to itself");
      return false;
    }

    // Prevent invalid connections
    if (start_uuid === "input" && end_uuid === "input") {
      console.warn("Cannot connect input to input");
      return false;
    } else if (start_uuid === "output" && end_uuid === "output") {
      console.warn("Cannot connect output to output");
      return false;
    } else if (
      (end_uuid === "input" && toEndpoint.connections.length > 0) ||
      (start_uuid === "input" && fromEndpoint.connections.length > 1)
    ) {
      console.warn("Connection already exists or exceeds maximum connections");
      return false;
    } else {
      // Create connection with validation
      try {
        jsPlumbInstance.connect({
          uuids: [fromEndpoint.uuid, toEndpoint.uuid],
          paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
        });

        num_wires++;
        num_wires = num_wires % wireColours.length;

        const start_type = fromEndpoint.elementId.split("-")[0];
        let end_type = toEndpoint.elementId.split("-")[0];

        // Handle clock components
        if (end_type === "Clock") {
          end_type = "Input";
        }

        // Enhanced connection logic with better error handling
        if (start_type === "DFlipFlop" && end_type === "DFlipFlop") {
          handleFlipFlopToFlipFlopConnection(
            fromEndpoint,
            toEndpoint,
            start_uuid,
            end_uuid
          );
        } else if (start_type === "DFlipFlop" && end_type === "Input") {
          handleFlipFlopToInputConnection(fromEndpoint, toEndpoint, end_uuid);
        } else if (start_type === "Input" && end_type === "DFlipFlop") {
          handleInputToFlipFlopConnection(fromEndpoint, toEndpoint, start_uuid);
        } else if (start_type === "DFlipFlop" && end_type === "Output") {
          handleFlipFlopToOutputConnection(
            fromEndpoint,
            toEndpoint,
            start_uuid
          );
        } else if (start_type === "Output" && end_type === "DFlipFlop") {
          handleOutputToFlipFlopConnection(
            fromEndpoint,
            toEndpoint,
            start_uuid
          );
        } else if (start_type === "Input" && end_type === "Output") {
          handleInputToOutputConnection(fromEndpoint, toEndpoint, start_uuid);
        } else if (start_type === "Output" && end_type === "Input") {
          handleOutputToInputConnection(fromEndpoint, toEndpoint, start_uuid);
        } else if (
          start_type === "DFlipFlop" &&
          toEndpoint.elementId in gatejs.gates
        ) {
          handleFlipFlopToGateConnection(fromEndpoint, toEndpoint, start_uuid);
        } else if (
          end_type === "DFlipFlop" &&
          fromEndpoint.elementId in gatejs.gates
        ) {
          handleGateToFlipFlopConnection(fromEndpoint, toEndpoint, end_uuid);
        } else if (
          fromEndpoint.elementId in gatejs.gates &&
          toEndpoint.elementId in gatejs.gates
        ) {
          // Handle gate to gate connections
          if (start_uuid === "output") {
            const input = gatejs.gates[fromEndpoint.elementId];
            const output = gatejs.gates[toEndpoint.elementId];
            input.setConnected(true);
            output.addInput(input, "");
            input.addOutput(output);
          } else if (end_uuid === "output") {
            const input = gatejs.gates[toEndpoint.elementId];
            const output = gatejs.gates[fromEndpoint.elementId];
            input.setConnected(true);
            output.addInput(input, "");
            input.addOutput(output);
          }
        }

        console.log(
          `✅ Connected ${fromEndpoint.elementId} to ${toEndpoint.elementId}`
        );
        return true;
      } catch (error) {
        console.error("Connection failed:", error);
        return false;
      }
    }
  });
};

export const connectTFlipFlopGate = function () {
  jsPlumbInstance.bind("beforeDrop", function (data) {
    const fromEndpoint = data.connection.endpoints[0];
    const toEndpoint = data.dropEndpoint;

    const start_uuid = fromEndpoint.uuid.split(":")[0];
    const end_uuid = toEndpoint.uuid.split(":")[0];

    if (fromEndpoint.elementId === toEndpoint.elementId) {
      return false;
    }

    if (start_uuid === "input" && end_uuid === "input") {
      return false;
    } else if (start_uuid === "output" && end_uuid === "output") {
      return false;
    } else if (
      (end_uuid === "input" && toEndpoint.connections.length > 0) ||
      (start_uuid === "input" && fromEndpoint.connections.length > 1)
    ) {
      // If it already has a connection, do not establish a new connection
      return false;
    } else {
      jsPlumbInstance.connect({
        uuids: [fromEndpoint.uuid, toEndpoint.uuid],
        paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
      });
      num_wires++;
      num_wires = num_wires % wireColours.length;
      const start_type = fromEndpoint.elementId.split("-")[0];
      let end_type = toEndpoint.elementId.split("-")[0];
      if (end_type === "Clock") {
        end_type = "Input";
      }
      if (start_type === "JKFlipFlop" && end_type === "JKFlipFlop") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        } else if (end_uuid === "output") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "JKFlipFlop" && end_type === "Input") {
        if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "Input" && end_type === "JKFlipFlop") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "JKFlipFlop" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Output" && end_type === "JKFlipFlop") {
        if (start_uuid === "input") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Input" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (start_type === "Output" && end_type === "Input") {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        start_type === "JKFlipFlop" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of r-s flipflop
        if (start_uuid === "output") {
          // connection will end at the input of the gate
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
        // connection is started from the inputs of r-s flipflop
        else if (start_uuid === "input") {
          // connection will end at the output of the gate
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (
        end_type === "JKFlipFlop" &&
        fromEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of gate
        if (start_uuid === "output") {
          // connection will end at the input of r-s flipflop
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        }
        // connection is started from the inputs of gate
        else if (start_uuid === "input") {
          // connection will end at the output of the r-s flip flop

          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (
        start_type === "Input" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Input"
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        start_type === "Output" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Output"
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      }
      // need to check
      else if (
        fromEndpoint.elementId in gatejs.gates &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        } else if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      }
    }
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
      testPIPO(
        "Input-0",
        "Input-1",
        "Input-2",
        "Input-3",
        "Clock-0",
        "Output-1",
        "Output-2",
        "Output-3",
        "Output-4"
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
  jsPlumbInstance.reset();
  window.numComponents = 0;

  gatejs.clearGates();
  flipflopjs.clearFlipFlops();
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
