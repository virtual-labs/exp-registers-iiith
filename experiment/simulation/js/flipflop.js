import { registerGate } from "./main.js";
import { setPosition } from "./layout.js";
import { gates, getResult } from './gate.js';

let flipFlops = {};

function clearFlipFlops() {

    for (let ffID in flipFlops) {
        delete flipFlops[ffID];
    }
    flipFlops = {};
}

class RSFlipFlop {
    constructor() {
        this.id = "RSFlipFlop-" + window.numComponents++;
        this.R = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.S = [];
        this.Clk = [];
        this.Q = null;
        this.Qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.QIsConnected = false;
        this.QbarIsConnected = false;
        this.component = '<div class="drag-drop RSFlipFlop" id=' + this.id + '></div>';
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
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setR(R) {
        this.R = R;
    }
    setS(S) {
        this.S = S;
    }
    setClk(Clk) {
        this.Clk = Clk;
    }
    setQ(Q) {
        this.Q = Q;
    }
    setQbar(Qbar) {
        this.Qbar = Qbar;
    }
    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val, pos) {
        console.log(val, pos);
        if (pos == "Q") {
            this.QIsConnected = val;
        }
        else if (pos == "Q'") {
            this.QbarIsConnected = val;
        }
    }

    generateOutput() {
        const R = getOutputRS(this.R[0], this.R[1]);
        const S = getOutputRS(this.S[0], this.S[1]);
        const Clk = getOutputRS(this.Clk[0], this.Clk[1]);

        if (Clk == false) {
            return;
        }
        else {
            if (S == false && R == false) {
                return;
            }
            else if (S == false && R == true) {
                this.Q = false;
                this.Qbar = true;
            }
            else if (S == true && R == false) {
                this.Q = true;
                this.Qbar = false;
            }
            else if (S == true && R == true) {
                this.Q = true;
                this.Qbar = true;
            }
        }
    }
}


function addRSFlipFlop(x, y) {
    const ff = new RSFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addRSFlipFlop = addRSFlipFlop;

function getOutputRS(gate, pos) {
    if (pos == "Q") {
        return gate.Q;
    }
    else if (pos == "Q'") {
        return gate.Qbar;
    }
    // But if the gate is not an FA, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
function getResultRS(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name == "Gate") {
        return;
    }

    // if (ff.Q != null && ff.Qbar != null) {
    //     return;
    // }

    if (getOutputRS(ff.R[0], ff.R[1]) != null && getOutputRS(ff.S[0], ff.S[1]) != null && getOutputRS(ff.Clk[0], ff.Clk[1]) != null) {
        ff.generateOutput();
    }
    return;
}


// done checking
function checkConnectionsRS() {
    let flag = 0;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (gate.QIsConnected == false) {
            flag = 1;
            break;
        }
        if (gate.QbarIsConnected == false) {
            flag = 1;
            break;
        }
        // Check if all the inputs are connected
        if (gate.R == null || gate.R.length == 0) {
            flag = 1;
            break;
        }
        if (gate.S == null || gate.S.length == 0) {
            flag = 1;
            break;
        }
        if (gate.Clk == null || gate.Clk.length == 0) {
            flag = 1;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput == true) {
            if (gate.isConnected == false) {
                flag = 1;
                break;
            }
        }
        else if (gate.isOutput == true) {
            if (gate.inputs.length == 0) {
                flag = 1;
                break;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                flag = 1;
            }
            else if (gate.isConnected == false && gate.isOutput == false) {
                flag = 1;
            }
        }
    }

    if (flag == 0) {
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

class JKFlipFlop {
    constructor() {
        this.id = "JKFlipFlop-" + window.numComponents++;
        this.K = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.J = [];
        this.Clk = [];
        this.Q = null;
        this.Qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.QIsConnected = false;
        this.QbarIsConnected = false;
        this.component = '<div class="drag-drop JKFlipFlop" id=' + this.id + '></div>';
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
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setK(K) {
        this.K = K;
    }
    setJ(J) {
        this.J = J;
    }
    setClk(Clk) {
        this.Clk = Clk;
    }
    setQ(Q) {
        this.Q = Q;
    }
    setQbar(Qbar) {
        this.Qbar = Qbar;
    }
    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val, pos) {
        console.log(val, pos);
        if (pos == "Q") {
            this.QIsConnected = val;
        }
        else if (pos == "Q'") {
            this.QbarIsConnected = val;
        }
    }

    generateOutput() {
        const K = getOutputJK(this.K[0], this.K[1]);
        const J = getOutputJK(this.J[0], this.J[1]);
        const Clk = getOutputRS(this.Clk[0], this.Clk[1]);

        if (Clk == false) {
            return;
        }
        else {
            if (J == false && K == false) {
                return;
            }
            else if (J == false && K == true) {
                this.Q = false;
                this.Qbar = true;
            }
            else if (J == true && K == false) {
                this.Q = true;
                this.Qbar = false;
            }
            else if (J == true && K == true) {
                this.Q = true;
                this.Qbar = true;
            }
        }
    }
}


function addJKFlipFlop(x, y) {
    const ff = new JKFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addJKFlipFlop = addJKFlipFlop;

function getOutputJK(gate, pos) {
    if (pos == "Q") {
        return gate.Q;
    }
    else if (pos == "Q'") {
        return gate.Qbar;
    }
    // But if the gate is not a flipflop, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
function getResultJK(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name == "Gate") {
        return;
    }


    if (getOutputJK(ff.K[0], ff.K[1]) != null && getOutputJK(ff.J[0], ff.J[1]) != null && getOutputJK(ff.Clk[0], ff.Clk[1]) != null) {
        ff.generateOutput();
    }

    return;
}


// done checking
function checkConnectionsJK() {
    let flag = 0;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (gate.QIsConnected == false) {
            flag = 1;
            break;
        }
        if (gate.QbarIsConnected == false) {
            flag = 1;
            break;
        }
        // Check if all the inputs are connected
        if (gate.K == null || gate.K.length == 0) {
            flag = 1;
            break;
        }
        if (gate.J == null || gate.J.length == 0) {
            flag = 1;
            break;
        }
        if (gate.Clk == null || gate.Clk.length == 0) {
            flag = 1;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput == true) {
            if (gate.isConnected == false) {
                flag = 1;
                break;
            }
        }
        else if (gate.isOutput == true) {
            if (gate.inputs.length == 0) {
                flag = 1;
                break;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                flag = 1;
            }
            else if (gate.isConnected == false && gate.isOutput == false) {
                flag = 1;
            }
        }
    }

    if (flag == 0) {
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




class DDFlipFlop {
    constructor() {
        this.id = "DDFlipFlop-" + window.numComponents++;
        this.D = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.Clk = [];
        this.Q = null;
        this.Qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.QIsConnected = false;
        this.QbarIsConnected = false;
        this.component = '<div class="drag-drop DDFlipFlop" id=' + this.id + '></div>';
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
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setD(D) {
        this.D = D;
    }
    setClk(Clk) {
        this.Clk = Clk;
    }
    setQ(Q) {
        this.Q = Q;
    }
    setQbar(Qbar) {
        this.Qbar = Qbar;
    }
    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val, pos) {
        console.log(val, pos);
        if (pos == "Q") {
            this.QIsConnected = val;
        }
        else if (pos == "Q'") {
            this.QbarIsConnected = val;
        }
    }

    generateOutput() {
        const D = getOutputDD(this.D[0], this.D[1]);
        const Clk = getOutputDD(this.Clk[0], this.Clk[1]);

        if (Clk == false) {
            return;
        }
        else {
            if (D == false) {
                this.Q = false;
                this.Qbar = true;
            }
            else if (D == true) {
                this.Q = true;
                this.Qbar = false;
            }
        }
    }
}


function addDDFlipFlop(x, y) {
    const ff = new DDFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addDDFlipFlop = addDDFlipFlop;

function getOutputDD(gate, pos) {
    if (pos == "Q") {
        return gate.Q;
    }
    else if (pos == "Q'") {
        return gate.Qbar;
    }
    // But if the gate is not an FA, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
function getResultDD(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name == "Gate") {
        return;
    }

    // if (ff.Q != null && ff.Qbar != null) {
    //     return;
    // }

    if (getOutputDD(ff.D[0], ff.D[1]) != null && getOutputDD(ff.Clk[0], ff.Clk[1]) != null) {
        ff.generateOutput();
    }
    return;
}


// done checking
export function checkConnectionsDD() {
    let flag = 0;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (gate.QIsConnected == false) {
            flag = 1;
            break;
        }
        // if (gate.QbarIsConnected == false) {
        //     flag = 1;
        //     break;
        // }
        // Check if all the inputs are connected
        if (gate.D == null || gate.D.length == 0) {
            flag = 1;
            break;
        }
        if (gate.Clk == null || gate.Clk.length == 0) {
            flag = 1;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput == true) {
            if (gate.isConnected == false) {
                flag = 1;
                break;
            }
        }
        else if (gate.isOutput == true) {
            if (gate.inputs.length == 0) {
                flag = 1;
                break;
            }
        }
        else {
            if (gate.inputPoints.length != gate.inputs.length) {
                flag = 1;
            }
            else if (gate.isConnected == false && gate.isOutput == false) {
                flag = 1;
            }
        }
    }

    if (flag == 0) {
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

export function deleteFF(id) {
    const ff = flipFlops[id];
    jsPlumbInstance.removeAllEndpoints(document.getElementById(ff.id));
    jsPlumbInstance._removeElement(document.getElementById(ff.id));

    for (let key in flipFlops) {
        if(ff.constructor.name == "JKFlipFlop"){
            if(flipFlops[key].J[0] == ff) {
                flipFlops[key].J = null;
            }
            if(flipFlops[key].K[0] == ff) {
                flipFlops[key].K = null;
            }
            if(flipFlops[key].Clk[0] == ff) {
                flipFlops[key].Clk = null;
            }
        }
        else if(ff.constructor.name == "RSFlipFlop"){
            if(flipFlops[key].R[0] == ff){
                flipFlops[key].R = null;
            }
            if(flipFlops[key].S[0] == ff){
                flipFlops[key].S = null;
            }
            if(flipFlops[key].Clk[0] == ff){
                flipFlops[key].Clk = null;
            }
        }
        else if(ff.constructor.name == "DDFlipFlop"){
            if(flipFlops[key].D[0] == ff){
                flipFlops[key].D = null;
            }
            if(flipFlops[key].Clk[0] == ff){
                flipFlops[key].Clk = null;
            }
        }
    }



    delete flipFlops[id];
}






export { checkConnectionsRS, getOutputRS, getResultRS, addRSFlipFlop, clearFlipFlops, flipFlops, RSFlipFlop };
