import { registerGate } from "./main.js";
import { setPosition } from "./layout.js";
import { testSISO,computeAnd, computeNand, computeNor, computeOr, computeXnor, computeXor, testPIPO } from "./validator.js";
import { jsPlumbInstance } from "./main.js";
import { flipFlops, simulateFFDD,checkConnectionsDD, testSimulateDD } from "./flipflop.js";

'use strict';
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
        this.outputs=[];
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
        this.positionY = window.scrollY + document.getElementById(id).getBoundingClientRect().top // Y

        this.positionX = window.scrollX + document.getElementById(id).getBoundingClientRect().left // X
    }
    setName(name) {
        this.name = name;
    }

    generateComponent() {
        let component = "";

        switch (this.type) {
            case "Input":
                component = `<div class="high" id= ${this.id} ><a ondblclick="setInput(event)">1</a><p> ${this.name}  </p></div>`;
                this.output = true;
                this.isInput = true;
                break;
            case "Output":
                component = `<div class="output" id= ${this.id}><a></a><p>  ${this.name}  </p></div>`;
                this.isOutput = true;
                break;
            default:
                component = `<div class="drag-drop logic-gate ${this.type.toLowerCase()}" id= ${this.id
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
                this.output = computeAnd(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "OR":
                this.output = computeOr(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "NOT":
                this.output = !getOutput(this.inputs[0]);
                break;
            case "NAND":
                this.output = computeNand(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "NOR":
                this.output = computeNor(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "XOR":
                this.output = computeXor(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "XNOR":
                this.output = computeXnor(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
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
    }
    else if (pos === "Q") {
        return gate.q;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
}


function addGate(event) {
    let type = event.target.innerHTML;
    const gate = new Gate(type);
    const component = gate.generateComponent();
    const parent = document.getElementById("working-area");
    parent.insertAdjacentHTML('beforeend', component);
    gate.registerComponent("working-area");
}

window.addGate = addGate;

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


function setInput(event) {
    let parentElement = event.target.parentElement;
    let element = event.target;
    let type = parentElement.className.split(" ")[0];
    let gate = gates[parentElement.id];
    if (type === "high") {
        // change class high to low
        parentElement.classList.replace("high", "low");
        element.innerHTML = "0";
        gate.setOutput(false);
    }
    else if (type === "low") {
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
    document.getElementById("table-head").innerHTML="";
}

export function printErrors(message,objectId) {
    const result = document.getElementById('result');
    result.innerHTML += message;
    result.className = "failure-message";
    if(objectId !== null)
    {
        objectId.classList.add("highlight")
        setTimeout(function () {objectId.classList.remove("highlight")}, 5000);
    }
}

export function checkConnections() {
    for (let gateId in gates) {
        const gate = gates[gateId];
        const id = document.getElementById(gate.id);
        if (gate.inputPoints.length != gate.inputs.length) {
            printErrors("Highlighted component not connected properly\n",id);
            return false;
        }
        else if (gate.type!=="Clock" && (!gate.isConnected || gate.outputs.length==0)  && !gate.isOutput) {
            printErrors("Highlighted component not connected properly\n",id);
            return false;
        }
    }
    return true;
}

export function simulate() {

    clearResult();
    window.simulationStatus = 0;

    if (!checkConnections()) {
        return false;
    }

    if (window.currentTab==="task1" || window.currentTab==="task2") {
        if(!checkConnectionsDD()) {
            return false;
        }
    }

    let circuitHasClock = false;

    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.type === "Clock") {
            circuitHasClock = true;
            gate.simulate();
        }
    }
    if (!circuitHasClock) {
        simulateWithClock();
    }

    return true;
}

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
            if (!gate.isOutput  && !gate.isInput  && gate.type != "NOT") {
                const val1 = getOutput(gate.inputs[0]);
                const val2 = getOutput(gate.inputs[1]);
                if (val1 == null || val2 == null) {
                    let val = null;
                    if (val1 == null && val2 == null) {
                        continue;
                    }
                    else if (val1 == null) {
                        val = val2;
                    }
                    else if (val2 == null) {
                        val = val1;
                    }

                    if (gate.type === "OR" && val) {
                        gate.setOutput(true);
                    }
                    if (gate.type === "AND" && !val ) {
                        gate.setOutput(false);
                    }
                    if (gate.type === "NOR" && val) {
                        gate.setOutput(false);
                    }
                    if (gate.type === "NAND" && !val ) {
                        gate.setOutput(true);
                    }
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (!gate.isOutput && !gate.isInput && gate.type === "NOT") {
                const val1 = getOutput(gate.inputs[0]);
                if (val1 == null) {
                    continue;
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (!gate.isOutput && !gate.isInput) {
                const val1 = getOutput(gate.inputs[0]);
                const val2 = getOutput(gate.inputs[1]);
                const val3 = getOutput(gate.inputs[2]);
                const val = [];
                if (val1 != null)
                    val.push(val1);
                if (val2 != null)
                    val.push(val2);
                if (val3 != null)
                    val.push(val3);
                if (val.length === 0) {
                    continue;
                }
                else if (val.length === 3) {
                    gate.generateOutput();
                }
                else {
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
            let element = document.getElementById(gate.id)
            if (getOutput(input)) {
                element.className = "high";
                element.childNodes[0].innerHTML = "1";
            }
            else {
                element.className = "low";
                element.childNodes[0].innerHTML = "0";
            }
        }
    }
}

window.simulate = simulate;
window.simClk = simulateWithClock;


export function testSimulation(gates,flipFlops) {
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
            if (gate.isOutput === false && gate.isInput === false && gate.type != "NOT") {
                const val1 = getOutput(gate.inputs[0]);
                const val2 = getOutput(gate.inputs[1]);
                if (val1 == null || val2 == null) {
                    let val = null;
                    if (val1 == null && val2 == null) {
                        continue;
                    }
                    else if (val1 == null) {
                        val = val2;
                    }
                    else if (val2 == null) {
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
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (gate.isOutput === false && gate.isInput === false && gate.type === "NOT") {
                const val1 = getOutput(gate.inputs[0]);
                if (val1 == null) {
                    continue;
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (gate.isOutput === false && gate.isInput === false) {
                const val1 = getOutput(gate.inputs[0]);
                const val2 = getOutput(gate.inputs[1]);
                const val3 = getOutput(gate.inputs[2]);
                const val = [];
                if (val1 != null)
                    val.push(val1);
                if (val2 != null)
                    val.push(val2);
                if (val3 != null)
                    val.push(val3);
                if (val.length === 0) {
                    continue;
                }
                else if (val.length === 3) {
                    gate.generateOutput();
                }
                else {
                    for (let value in val) {
                        if (val[value] === false) {
                            gate.setOutput(true);
                            break;
                        }
                    }
                }
            }
        }

        if(window.currentTab === "task1" || window.currentTab === "task2") {
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


// function to submit the desired circuit and get the final success or failure message
export function submitCircuit() {
    clearResult();
    document.getElementById("table-body").innerHTML = "";
    if (window.currentTab === "task1") {
        if(!checkConnections() || !checkConnectionsDD())
        return;
        testSISO("Input-0","Clock-0", "Output-1");
    }
    else if (window.currentTab === "task2") {
        if(!checkConnections() || !checkConnectionsDD())
        return;
        testPIPO("Input-3", "Input-2", "Input-1", "Input-0","Clock-0","Output-4", "Output-3", "Output-2", "Output-1");
    }
    // Refresh the input bit values to default 1, clock to 0 and output bit values to default empty black circles after submitting
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput && gate.type!=="Clock") {
            gate.setOutput(true);
            let element = document.getElementById(gate.id);
            element.className = "high";
            element.childNodes[0].innerHTML = "1";
        }
        if(gate.isOutput) {
            gate.setOutput(null);
            let element = document.getElementById(gate.id);
            element.className = "output";
            element.childNodes[0].innerHTML = "";
        }
        if(gate.type === "Clock"){
            gate.isOn = false;
            gate.updateOutput();
        }
    }
}
window.submitCircuit = submitCircuit;


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
        if(gates[elem].outputs.includes(gate)) {
            gates[elem].removeOutput(gate);
        }
    }
    for (let key in flipFlops) {
        if (flipFlops[key].constructor.name === "DFlipFlop") {
            if (flipFlops[key].d[0] === gate) {
                flipFlops[key].d = null;
            }
            if (flipFlops[key].clk[0] === gate) {
                flipFlops[key].clk = null;
            }
            if(flipFlops[key].qOutputs.includes(gate)) {
                flipFlops[key].removeqOutput(gate);
            }
            if(flipFlops[key].qbarOutputs.includes(gate)) {
                flipFlops[key].removeqbarOutput(gate);
            }
        }
    }
    delete gates[gateid];
}


