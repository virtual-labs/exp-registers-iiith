import { registerGate,jsPlumbInstance } from "./main.js";
import { setPosition } from "./layout.js";
import { gates } from './gate.js';

'use strict';

export let flipFlops = {};

export function clearFlipFlops() {

    for (let ffID in flipFlops) {
        delete flipFlops[ffID];
    }
    flipFlops = {};
}

export class RSFlipFlop {
    constructor() {
        this.id = "RSFlipFlop-" + window.numComponents++;
        this.r = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.s = [];
        this.clk = [];
        this.q = null;
        this.qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.qIsConnected = false;
        this.qbarIsConnected = false;
        this.component = `<div class="drag-drop rsflipflop" id=${this.id}></div>`;
    }
    registerComponent(workingArea, x = 0, y = 0) {
        const parent = document.getElementById(workingArea);
        parent.insertAdjacentHTML('beforeend', this.component);
        const el = document.getElementById(this.id);
        el.style.left = x + "px";
        el.style.top = y + "px";

        el.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            const origin = {
                left: ev.pageX - document.getScroll()[0],
                top: ev.pageY - document.getScroll()[1]
            };
            setPosition(origin);
            window.selectedComponent = this.id;
            window.componentType = "flipFlop";
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setR(r) {
        this.r = r;
    }
    setS(s) {
        this.s = s;
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

        // In RS flip flop, when Clock is low, the flip flop is in memory state, hence there is no change in output
        // When clock is high, if both S and R are low, the flip flop is in memory state
        // If S is high and R is low, the flip flop is in set state i.e. Q is 1 and Q' is 0
        // If S is low and R is high, the flip flop is in reset state i.e. Q is 0 and Q' is 1
        // If both S and R are high, the flip flop gives both Q and Q' as 1 (invalid input generally)


        const r = getOutputRS(this.r[0], this.r[1]);
        const s = getOutputRS(this.s[0], this.s[1]);
        const clk = getOutputRS(this.clk[0], this.clk[1]);

        if (!clk) {
            return;
        }
        else {
            if (!s && !r) {
                return;
            }
            else if (!s && r) {
                this.q = false;
                this.qbar = true;
            }
            else if (s && !r) {
                this.q = true;
                this.qbar = false;
            }
            else if (s && r) {
                this.q = true;
                this.qbar = true;
            }
        }
    }
}


export function addRSFlipFlop(x, y) {
    const ff = new RSFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addRSFlipFlop = addRSFlipFlop;

export function getOutputRS(gate, pos) {
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
export function getResultRS(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name === "Gate") {
        return;
    }

    if (getOutputRS(ff.r[0], ff.r[1]) != null && getOutputRS(ff.s[0], ff.s[1]) != null && getOutputRS(ff.clk[0], ff.clk[1]) != null) {
        ff.generateOutput();
    }
    return;
}


// done checking
export function checkConnectionsRS() {
    let correctConnection = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (!gate.qIsConnected) {
            correctConnection = false;
            break;
        }
        if (!gate.qbarIsConnected) {
            correctConnection = false;
            break;
        }
        // Check if all the inputs are connected
        if (gate.r == null || gate.r.length === 0) {
            correctConnection = false;
            break;
        }
        if (gate.s == null || gate.s.length === 0) {
            correctConnection = false;
            break;
        }
        if (gate.clk == null || gate.clk.length === 0) {
            correctConnection = false;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput) {
            if (!gate.isConnected) {
                correctConnection = false;
                break;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length === 0) {
                correctConnection = false;
                break;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                correctConnection = false;
            }
            else if (!gate.isConnected && !gate.isOutput) {
                correctConnection = false;
            }
        }
    }

    if (correctConnection) {
        return true;
    }
    else {
        alert("Connections are not correct");
        return false;
    }
}

export function simulateFFRS() {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultRS(gate);
    }
}




export class JKFlipFlop {
    constructor() {
        this.id = "JKFlipFlop-" + window.numComponents++;
        this.k = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.j = [];
        this.clk = [];
        this.q = null;
        this.qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.qIsConnected = false;
        this.qbarIsConnected = false;
        this.component = `<div class="drag-drop jkflipflop" id=${this.id}></div>`;
    }
    registerComponent(workingArea, x = 0, y = 0) {
        const parent = document.getElementById(workingArea);
        parent.insertAdjacentHTML('beforeend', this.component);
        const el = document.getElementById(this.id);
        el.style.left = x + "px";
        el.style.top = y + "px";

        el.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            const origin = {
                left: ev.pageX - document.getScroll()[0],
                top: ev.pageY - document.getScroll()[1]
            };
            setPosition(origin);
            window.selectedComponent = this.id;
            window.componentType = "flipFlop";
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setK(k) {
        this.k = k;
    }
    setJ(j) {
        this.j = j;
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
        // In JK flip flop, when Clock is low, the flip flop is in memory state, hence there is no change in output
        // When clock is high, if both J and K are low, the flip flop is in memory state
        // If J is high and K is low, the flip flop is in set state i.e. Q is 1 and Q' is 0
        // If J is low and K is high, the flip flop is in reset state i.e. Q is 0 and Q' is 1
        // If both J and K are high, the flip flop toggles its state i.e. Q is Q' and Q' is Q

        const k = getOutputJK(this.k[0], this.k[1]);
        const j = getOutputJK(this.j[0], this.j[1]);
        const clk = getOutputRS(this.clk[0], this.clk[1]);

        if (!clk) {
            return;
        }
        else {
            if (!j && !k) {
                return;
            }
            else if (!j && k) {
                this.q = false;
                this.qbar = true;
            }
            else if (j && !k) {
                this.q = true;
                this.qbar = false;
            }
            else if (j && k) {
                let temp = this.q;
                this.q = this.qbar;
                this.qbar = temp;
            }
        }
    }
}


export function addJKFlipFlop(x, y) {
    const ff = new JKFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addJKFlipFlop = addJKFlipFlop;

export function getOutputJK(gate, pos) {
    if (pos === "Q") {
        return gate.q;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
    // But if the gate is not a flipflop, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
export function getResultJK(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name === "Gate") {
        return;
    }


    if (getOutputJK(ff.k[0], ff.k[1]) != null && getOutputJK(ff.j[0], ff.j[1]) != null && getOutputJK(ff.clk[0], ff.clk[1]) != null) {
        ff.generateOutput();
    }

    return;
}


// done checking
export function checkConnectionsJK() {
    let correctConnection = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (!gate.qIsConnected) {
            correctConnection = false;
            break;
        }
        if (!gate.qbarIsConnected) {
            correctConnection = false;
            break;
        }
        // Check if all the inputs are connected
        if (gate.k == null || gate.k.length === 0) {
            correctConnection = false;
            break;
        }
        if (gate.j == null || gate.j.length === 0) {
            correctConnection = false;
            break;
        }
        if (gate.clk == null || gate.clk.length === 0) {
            correctConnection = false;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput) {
            if (!gate.isConnected) {
                correctConnection = false;
                break;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length === 0) {
                correctConnection = false;
                break;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                correctConnection = false;
            }
            else if (!gate.isConnected && !gate.isOutput) {
                correctConnection = false;
            }
        }
    }

    if (correctConnection) {
        return true;
    }
    else {
        alert("Connections are not correct");
        return false;
    }
}

export function simulateFFJK() {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultJK(gate);
    }
}


class DFlipFlop {
    constructor() {
        this.id = "DFlipFlop-" + window.numComponents++;
        this.d = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.clk = [];
        this.q = null;
        this.qbar = null;
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
    let correctConnection = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (gate.qIsConnected == false) {
            correctConnection = false;
            break;
        }
        // Check if all the inputs are connected
        if (gate.d == null || gate.d.length == 0) {
            correctConnection = false;
            break;
        }
        if (gate.clk == null || gate.clk.length == 0) {
            correctConnection = false;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput) {
            if (!gate.isConnected ) {
                correctConnection = false;
                break;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length == 0) {
                correctConnection = false;
                break;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                correctConnection = false;
            }
            else if (!gate.isConnected  && !gate.isOutput ) {
                correctConnection = false;
            }
        }
    }

    if (correctConnection) {
        return true;
    }
    else {
        alert("Connections are not correct");
        return false;
    }
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
        if(ff.constructor.name === "JKFlipFlop"){
            if(flipFlops[key].J[0] === ff) {
                flipFlops[key].J = null;
            }
            if(flipFlops[key].K[0] === ff) {
                flipFlops[key].K = null;
            }
            if(flipFlops[key].clk[0] === ff) {
                flipFlops[key].clk = null;
            }
        }
        else if(ff.constructor.name === "RSFlipFlop"){
            if(flipFlops[key].R[0] === ff){
                flipFlops[key].R = null;
            }
            if(flipFlops[key].S[0] === ff){
                flipFlops[key].S = null;
            }
            if(flipFlops[key].clk[0] === ff){
                flipFlops[key].clk = null;
            }
        }
        else if(ff.constructor.name === "DFlipFlop"){
            if(flipFlops[key].d[0] === ff){
                flipFlops[key].d = null;
            }
            if(flipFlops[key].clk[0] === ff){
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




