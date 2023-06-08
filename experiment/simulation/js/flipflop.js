import { registerGate,jsPlumbInstance } from "./main.js";
import { setPosition } from "./layout.js";
import { gates, printErrors } from './gate.js';

'use strict';

export let flipFlops = {};

export function clearFlipFlops() {
    flipFlops = {};
}

class DFlipFlop {
    constructor() {
        this.id = "DFlipFlop-" + window.numComponents++;
        this.d = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.clk = [];
        this.q = true;
        this.qbar = false;
        this.inputPoints = [];
        this.outputPoints = [];
        this.qIsConnected = false;
        this.qbarIsConnected = false;
        this.component = '<div class="drag-drop dflipflop" id=' + this.id + '></div>';
    }
    registerComponent(workingArea, x = 0, y = 0) {
        const parent = document.getElementById(workingArea);
        parent.insertAdjacentHTML('beforeend', this.component);
        document.getElementById(this.id).style.left = x + "px";
        document.getElementById(this.id).style.top = y + "px";

        const el = document.getElementById(this.id);
        el.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            let left = ev.pageX - document.getScroll()[0];
            let top = ev.pageY - document.getScroll()[1];
            const origin = {
                left: left,
                top: top
            };
            setPosition(origin);
            window.selectedComponent = this.id;
            window.componentType = "flipFlop";
            return false;
        }, false);

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

    setConnected(val, pos) {
        if (pos === "Q") {
            this.qIsConnected = val;
        }
        else if (pos === "Q'") {
            this.qbarIsConnected = val;
        }
    }

    generateOutput() {
        const d = getOutputD(this.d[0], this.d[1]);
        const clk = getOutputD(this.clk[0], this.clk[1]);

        if (!clk) {
            return;
        }
        else {
            if (!d) {
                this.q = false;
                this.qbar = true;
            }
            else if (d) {
                this.q = true;
                this.qbar = false;
            }
        }
    }
}


function addDFlipFlop(x, y) {
    const ff = new DFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addDFlipFlop = addDFlipFlop;

function getOutputD(gate, pos) {
    if (pos === "Q") {
        return gate.q;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
    // But if the gate is not an FA, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
function getResultDD(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name === "Gate") {
        return;
    }


    if (getOutputD(ff.d[0], ff.d[1]) != null && getOutputD(ff.clk[0], ff.clk[1]) != null) {
        ff.generateOutput();
    }
    return;
}


// done checking
export function checkConnectionsDD() {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        const id = document.getElementById(gate.id);
        // For Full Adder objects
        // Check if all the outputs are connected
        if (gate.qIsConnected == false) {
            printErrors("Q of D Flip Flop not connected properly\n",id);
            return false;
        }
        // Check if all the inputs are connected
        if (gate.d == null || gate.d.length == 0) {
            printErrors("D of D Flip Flop not connected properly\n",id);
            return false;
        }
        if (gate.clk == null || gate.clk.length == 0) {
            printErrors("CLK of D Flip Flop not connected properly\n",id);
            return false;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        const id = document.getElementById(gate.id);
        if (gate.isInput) {
            if (!gate.isConnected ) {
                printErrors("Highlighted component not connected properly\n",id);
                return false;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length == 0) {
                printErrors("Highlighted component not connected properly\n",id);
                return false;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                printErrors("Highlighted component not connected properly\n",id);
                return false;
            }
            else if (!gate.isConnected  && !gate.isOutput ) {
                printErrors("Highlighted component not connected properly\n",id);
                return false;
            }
        }
    }

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
        }
        else if (ff.constructor.name === "RSFlipFlop") {
            if (flipFlops[key].r[0] === ff) {
                flipFlops[key].r = null;
            }
            if (flipFlops[key].s[0] === ff) {
                flipFlops[key].s = null;
            }
            if (flipFlops[key].clk[0] === ff) {
                flipFlops[key].clk = null;
            }
        }
        else if (ff.constructor.name === "DFlipFlop") {
            if (flipFlops[key].d[0] === ff) {
                flipFlops[key].d = null;
            }
            if (flipFlops[key].clk[0] === ff) {
                flipFlops[key].clk = null;
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
    }


    delete flipFlops[id];
}




