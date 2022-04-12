import * as gatejs from "./gate.js";
import { wireColours } from "./layout.js";
import * as clockjs from "./clock.js";
import * as flipflopjs from "./flipflop.js";

let num_wires = 0;

document.getScroll = function () {
    if (window.pageYOffset != undefined) {
        return [pageXOffset, pageYOffset];
    } else {
        let sx, sy, d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    }
}
const workingArea = document.getElementById("working-area");
export const jsPlumbInstance = jsPlumbBrowserUI.newInstance({
    container: workingArea,
    maxConnections: -1,
    endpoint: {
        type: "Dot",
        options: { radius: 7 },
    },
    dragOptions: {
        containment: "parentEnclosed",
        containmentPadding: 5,
    },
    connector: "Flowchart",
    paintStyle: { strokeWidth: 4, stroke: "#888888" },
    connectionsDetachable: false,
});

export const bindEvent1 = function () {
    jsPlumbInstance.bind("beforeDrop", function (data) {
        let endpoint = data.connection.endpoints[0];
        let dropEndpoint = data.dropEndpoint;

        const start_uuid = endpoint.uuid.split(":")[0];
        const end_uuid = dropEndpoint.uuid.split(":")[0];

        if (endpoint.elementId == dropEndpoint.elementId) {
            return false;
        }

        if (start_uuid == "input" && end_uuid == "input") {
            return false;
        } else if (start_uuid == "output" && end_uuid == "output") {
            return false;
        } else {
            jsPlumbInstance.connect({ uuids: [endpoint.uuid, dropEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
            num_wires++;
            num_wires = num_wires % wireColours.length;
            if (start_uuid == "output") {
                let input = gatejs.gates[endpoint.elementId];
                input.isConnected = true;
                gatejs.gates[dropEndpoint.elementId].addInput(input, "");
            } else if (end_uuid == "output") {
                let input = gatejs.gates[dropEndpoint.elementId];
                input.isConnected = true;
                gatejs.gates[endpoint.elementId].addInput(input, "");
            }

            // return true;
        }
    });
}

// D Flip Flop and gates
export const bindEvent2 = function () {
    jsPlumbInstance.bind("beforeDrop", function (data) {
        let endpoint = data.connection.endpoints[0];
        let dropEndpoint = data.dropEndpoint;

        const start_uuid = endpoint.uuid.split(":")[0];
        const end_uuid = dropEndpoint.uuid.split(":")[0];

        if (endpoint.elementId == dropEndpoint.elementId) {
            return false;
        }

        if (start_uuid == "input" && end_uuid == "input") {
            return false;
        } else if (start_uuid == "output" && end_uuid == "output") {
            return false;
        } else {
            jsPlumbInstance.connect({ uuids: [endpoint.uuid, dropEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
            num_wires++;
            num_wires = num_wires % wireColours.length;
            const start_type = endpoint.elementId.split("-")[0];
            let end_type = dropEndpoint.elementId.split("-")[0];
            if (end_type == "Clock") {
                end_type = "Input";
            }
            if (start_type == "DDFlipFlop" && end_type == "DDFlipFlop") {
                if (start_uuid == "output") {
                    let input = flipflopjs.flipFlops[endpoint.elementId];
                    // console.log(endpoint.overlays);
                    let pos = "";
                    if (Object.keys(endpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(dropEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setClk([input, pos]);
                    }
                } else if (end_uuid == "output") {
                    let input = flipflopjs.flipFlops[dropEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(dropEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(endpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[endpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[endpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type == "DDFlipFlop" && end_type == "Input") {
                if (end_uuid == "output") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(endpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[endpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[endpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type == "Input" && end_type == "DDFlipFlop") {
                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(dropEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type == "DDFlipFlop" && end_type == "Output") {
                if (start_uuid == "output") {
                    let input = flipflopjs.flipFlops[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(endpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                    // fajs.finalOutputs[dropEndpoint.elementId] = [input, pos];
                }
            }
            else if (start_type == "Output" && end_type == "DDFlipFlop") {
                if (start_uuid == "input") {
                    let input = flipflopjs.flipFlops[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    let pos = ""
                    if (Object.keys(dropEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                    // fajs.finalOutputs[endpoint.elementId] = [input, pos];
                }
            }
            else if (start_type == "Input" && end_type == "Output") {
                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                    // fajs.finalOutputs[dropEndpoint.elementId] = [input, ""];
                }
            }
            else if (start_type == "Output" && end_type == "Input") {
                if (start_uuid == "input") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                    // fajs.finalOutputs[endpoint.elementId] = [input, ""];
                }
            }
            else if (start_type == "DDFlipFlop" && dropEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of r-s flipflop
                if (start_uuid == "output") {
                    // connection will end at the input of the gate
                    let input = flipflopjs.flipFlops[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(endpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
                // connection is started from the inputs of r-s flipflop
                else if (start_uuid == "input") {
                    // connection will end at the output of the gate
                    let input = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(endpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[endpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[endpoint.elementId].setClk([input, pos]);
                    }

                }
            }
            else if (end_type == "DDFlipFlop" && endpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of gate
                if (start_uuid == "output") {
                    // connection will end at the input of r-s flipflop
                    let input = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(dropEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setClk([input, pos]);
                    }


                }
                // connection is started from the inputs of gate
                else if (start_uuid == "input") {
                    // connection will end at the output of the r-s flip flop

                    let input = flipflopjs.flipFlops[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    let pos = ""
                    if (Object.keys(dropEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);

                }
            }
            else if (start_type == "Input" && dropEndpoint.elementId in gatejs.gates) {

                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (endpoint.elementId in gatejs.gates && end_type == "Input") {
                if (start_uuid == "input") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");

                }
            }
            else if (start_type == "Output" && dropEndpoint.elementId in gatejs.gates) {
                if (start_uuid == "input") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (endpoint.elementId in gatejs.gates && end_type == "Output") {
                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            // need to check
            else if (endpoint.elementId in gatejs.gates && dropEndpoint.elementId in gatejs.gates) {

                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                } else if (end_uuid == "output") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            // return true;
        }
    });
}


export const bindEvent3 = function () {
    jsPlumbInstance.bind("beforeDrop", function (data) {
        let endpoint = data.connection.endpoints[0];
        let dropEndpoint = data.dropEndpoint;

        const start_uuid = endpoint.uuid.split(":")[0];
        const end_uuid = dropEndpoint.uuid.split(":")[0];

        if (endpoint.elementId == dropEndpoint.elementId) {
            return false;
        }

        if (start_uuid == "input" && end_uuid == "input") {
            return false;
        } else if (start_uuid == "output" && end_uuid == "output") {
            return false;
        } else {
            jsPlumbInstance.connect({ uuids: [endpoint.uuid, dropEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
            num_wires++;
            num_wires = num_wires % wireColours.length;
            const start_type = endpoint.elementId.split("-")[0];
            let end_type = dropEndpoint.elementId.split("-")[0];
            if (end_type == "Clock") {
                end_type = "Input";
            }
            if (start_type == "JKFlipFlop" && end_type == "JKFlipFlop") {
                if (start_uuid == "output") {
                    let input = flipflopjs.flipFlops[endpoint.elementId];
                    // console.log(endpoint.overlays);
                    let pos = "";
                    if (Object.keys(endpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(dropEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setClk([input, pos]);
                    }
                } else if (end_uuid == "output") {
                    let input = flipflopjs.flipFlops[dropEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(dropEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(endpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[endpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[endpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[endpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type == "JKFlipFlop" && end_type == "Input") {
                if (end_uuid == "output") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(endpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[endpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[endpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[endpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type == "Input" && end_type == "JKFlipFlop") {
                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(dropEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type == "JKFlipFlop" && end_type == "Output") {
                if (start_uuid == "output") {
                    let input = flipflopjs.flipFlops[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(endpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                    // fajs.finalOutputs[dropEndpoint.elementId] = [input, pos];
                }
            }
            else if (start_type == "Output" && end_type == "JKFlipFlop") {
                if (start_uuid == "input") {
                    let input = flipflopjs.flipFlops[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    let pos = ""
                    if (Object.keys(dropEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                    // fajs.finalOutputs[endpoint.elementId] = [input, pos];
                }
            }
            else if (start_type == "Input" && end_type == "Output") {
                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                    // fajs.finalOutputs[dropEndpoint.elementId] = [input, ""];
                }
            }
            else if (start_type == "Output" && end_type == "Input") {
                if (start_uuid == "input") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                    // fajs.finalOutputs[endpoint.elementId] = [input, ""];
                }
            }
            else if (start_type == "JKFlipFlop" && dropEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of r-s flipflop
                if (start_uuid == "output") {
                    // connection will end at the input of the gate
                    let input = flipflopjs.flipFlops[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(endpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
                // connection is started from the inputs of r-s flipflop
                else if (start_uuid == "input") {
                    // connection will end at the output of the gate
                    let input = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(endpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[endpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[endpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(endpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[endpoint.elementId].setClk([input, pos]);
                    }

                }
            }
            else if (end_type == "JKFlipFlop" && endpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of gate
                if (start_uuid == "output") {
                    // connection will end at the input of r-s flipflop
                    let input = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(dropEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[dropEndpoint.elementId].setClk([input, pos]);
                    }


                }
                // connection is started from the inputs of gate
                else if (start_uuid == "input") {
                    // connection will end at the output of the r-s flip flop

                    let input = flipflopjs.flipFlops[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    let pos = ""
                    if (Object.keys(dropEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(dropEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);

                }
            }
            else if (start_type == "Input" && dropEndpoint.elementId in gatejs.gates) {

                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (endpoint.elementId in gatejs.gates && end_type == "Input") {
                if (start_uuid == "input") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");

                }
            }
            else if (start_type == "Output" && dropEndpoint.elementId in gatejs.gates) {
                if (start_uuid == "input") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (endpoint.elementId in gatejs.gates && end_type == "Output") {
                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            // need to check
            else if (endpoint.elementId in gatejs.gates && dropEndpoint.elementId in gatejs.gates) {

                if (start_uuid == "output") {
                    let input = gatejs.gates[endpoint.elementId];
                    let output = gatejs.gates[dropEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                } else if (end_uuid == "output") {
                    let input = gatejs.gates[dropEndpoint.elementId];
                    let output = gatejs.gates[endpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            // return true;
        }
    });
}

export const unbindEvent = () => {
    jsPlumbInstance.unbind("beforeDrop");
}


export function registerGate(id, gate) {
    const element = document.getElementById(id);
    const gateType = id.split("-")[0];

    if (
        gateType == "AND" ||
        gateType == "OR" ||
        gateType == "XOR" ||
        gateType == "XNOR" ||
        gateType == "NAND" ||
        gateType == "NOR"
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
    }
    else if (gateType == "ThreeIPNAND") {
        gate.addInputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.3, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:0:" + id,
            })
        );
        gate.addInputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.5, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
            })
        );
        gate.addInputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.7, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:2:" + id,
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
    }
    else if (gateType == "NOT") {
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
    } else if (gateType == "Input" || gateType == "Clock") {
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [1, 0.5, 1, 0, 7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "output:0:" + id,
            })
        );
    } else if (gateType == "Output") {
        gate.addInputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.5, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:0:" + id,
            })
        );
    }
    else if (gateType == "FullAdder") {
        // carry output
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.5, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "output:0:" + id,
                overlays: [
                    { type: "Label", options: { label: "Cout", id: "cout", location: [3, 0.2] } }
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
                    { type: "Label", options: { label: "Sum", id: "sum", location: [0.3, -1.7] } }
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
                    { type: "Label", options: { label: "A0", id: "a0", location: [0.3, 1.7] } }
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
                    { type: "Label", options: { label: "B0", id: "b0", location: [0.3, 1.7] } }
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
                    { type: "Label", options: { label: "Cin", id: "cin", location: [-1, 0.2] } }
                ],
            })
        );
    }
    else if (gateType == "RSFlipFlop") {
        // input s
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.7, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
                overlays: [
                    { type: "Label", options: { id: "rin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "sin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "clk", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "qout", location: [-1, 0.2] } }
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
                    { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } } // qbar for q '
                ],
            })
        );
    }
    else if (gateType == "JKFlipFlop") {
        // input K
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.7, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
                overlays: [
                    { type: "Label", options: { id: "kin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "jin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "clk", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "qout", location: [-1, 0.2] } }
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
                    { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } } // qbar for q '
                ],
            })
        );
    }
    else if (gateType == "DDFlipFlop") {
        // input D
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.31, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
                overlays: [
                    { type: "Label", options: { id: "din", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "clk", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "qout", location: [-1, 0.2] } }
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
                    { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } } // qbar for q '
                ],
            })
        );
    }
}

export function initSISOFlipFlop() {
    let ids = ["Input-0", "Output-1"];
    let types = ["Input", "Output"];
    let names = ["D", "Q"];
    let positions = [
        { x: 40, y: 350 },
        { x: 750, y: 100 }
        
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
    clockjs.addClock(2, 50, "working-area", 40, 600, "Clk", "Clock-0");
}

export function initPIPOFlipFlop() {
    let ids = ["Input-0", "Input-1", "Input-2", "Input-3", "Output-1", "Output-2", "Output-3", "Output-4"];
    let types = ["Input", "Input", "Input", "Input", "Output", "Output", "Output", "Output"];
    let names = ["P4", "P3", "P2", "P1", "Q4", "Q3", "Q2", "Q1"];
    let positions = [
        { x: 150, y: 650 },
        { x: 350, y: 650 },
        { x: 550, y: 650 },
        { x: 750, y: 650 },
        { x: 150, y: 50 },
        { x: 350, y: 50 },
        { x: 550, y: 50 },
        { x: 750, y: 50 }
        
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
    clockjs.addClock(2, 50, "working-area", 20, 500, "Clk", "Clock-0");
}


export function initFullAdder() {
    let ids = ["Input-0", "Input-1", "Input-2", "Output-3", "Output-4"]; // [A,B,carry -input,Sum,carry-output]
    let types = ["Input", "Input", "Input", "Output", "Output"];
    let names = ["A", "B", "CarryIn", "Sum", "CarryOut"];
    let positions = [
        { x: 40, y: 150 },
        { x: 40, y: 375 },
        { x: 40, y: 600 },
        { x: 820, y: 262.5 },
        { x: 820, y: 487.5 },
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
}

export function initRippleAdder() {
    let ids = ["Input-0", "Input-1", "Output-2", "Input-3", "Input-4", "Output-5", "Input-6", "Input-7", "Output-8", "Input-9", "Input-10", "Output-11", "Output-12", "Input-13"] // [A0,B0,Sum0,A1,B1,Sum1,A2,B2,Sum2,A3,B3,Sum3,CarryOut, CarryIn]
    let types = ["Input", "Input", "Output", "Input", "Input", "Output", "Input", "Input", "Output", "Input", "Input", "Output", "Output", "Input"]
    let names = ["A0", "B0", "Sum0", "A1", "B1", "Sum1", "A2", "B2", "Sum2", "A3", "B3", "Sum3", "CarryOut", "CarryIn"]
    let positions = [
        { x: 640, y: 50 },
        { x: 740, y: 50 },
        { x: 800, y: 625 },
        { x: 440, y: 50 },
        { x: 540, y: 50 },
        { x: 600, y: 625 },
        { x: 240, y: 50 },
        { x: 340, y: 50 },
        { x: 400, y: 625 },
        { x: 40, y: 50 },
        { x: 140, y: 50 },
        { x: 200, y: 625 },
        { x: 40, y: 500 },
        { x: 820, y: 150 },
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
}

export function initDFlipFlop() {
    let ids = ["Input-0", "Output-1", "Output-2"]; // [A B Sum Carry Out]
    let types = ["Input", "Output", "Output"];
    let names = ["D", "Q", "Q'"];
    let positions = [
        { x: 40, y: 200 },
        { x: 820, y: 200 },
        { x: 820, y: 550 }
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
    clockjs.addClock(2, 50, "working-area", 40, 300, "Clk", "Clock-0");
}

export function initTFlipFlop() {
    let ids = ["Input-0", "Output-1", "Output-2"]; // [A B Sum Carry Out]
    let types = ["Input", "Output", "Output"];
    let names = ["T", "Q", "Q'"];
    let positions = [
        { x: 40, y: 200 },
        { x: 820, y: 200 },
        { x: 820, y: 550 }
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
    clockjs.addClock(1, 50, "working-area", 40, 300, "Clk", "Clock-0");
}

export function refreshWorkingArea() {
    jsPlumbInstance.reset();
    window.numComponents = 0;

    gatejs.clearGates();
    flipflopjs.clearFlipFlops();
}

const getInfo = function () {
    console.log(gatejs.gates, flipflopjs.flipFlops);
};

window.getInfo = getInfo;

window.currentTab = "Task1";
bindEvent2();
refreshWorkingArea();
initSISOFlipFlop();
