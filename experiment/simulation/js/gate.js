import { registerGate } from "./main.js";
import { setPosition } from "./layout.js";
import { halfAdder, fullAdderTest, rippleAdderTest } from "./validator.js";
import { jsPlumbInstance } from "./main.js";
import { checkConnectionsDD, simulateFFDD } from "./flipflop.js";

export let gates = {}; // Array of gates
window.numComponents = 0;
//(input0,input1,carryOut,OutputOut)
export function clearGates() {

    for (let gateId in gates) {
        delete gates[gateId];
    }

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
        // connections : start/end , line_id, button_id
        // { line_id : {button_id,start/end,}  }
        this.inputs = []; // List of input gates
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
    removeInput(gate) {
        let index = -1;
        let i = 0;
        for (let input in inputs) {
            if (inputs[input][0] == gate) {
                index = i;
                break;
            }
            i++;
        }

        if (index > -1) {
            this.inputs.splice(index, 1);
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
        let component = '';

        if (this.type == "AND") {

            component = '<div class="drag-drop AND" id=' + this.id + '></div>'

        }
        else if (this.type == "NOT") {
            component = '<div class="drag-drop NOT" id=' + this.id + '></div>'

        }
        else if (this.type == "OR") {
            component = '<div class="drag-drop OR" id=' + this.id + '></div>'

        }
        else if (this.type == "XOR") {
            component = '<div class="drag-drop XOR" id=' + this.id + '></div>'

        }
        else if (this.type == "XNOR") {

            component = '<div class="drag-drop XNOR" id=' + this.id + '></div>'

        }
        else if (this.type == "NAND") {

            component = '<div class="drag-drop NAND" id=' + this.id + '></div>'

        }
        else if (this.type == "NOR") {

            component = '<div class="drag-drop NOR" id=' + this.id + '></div>'

        }
        else if (this.type == "Input") {
            component = '<div class="HIGH" id=' + this.id + ' ><a ondblclick="setInput(event)">1</a><p>' + this.name + '</p></div>'
            this.output = true;
            this.isInput = true;
        }
        else if (this.type == "Output") {
            component = '<div class="Output" id=' + this.id + '><a></a><p>' + this.name + '</p></div>'
            this.isOutput = true;
        }
        else if (this.type == "ThreeIPNAND") {
            component = '<div class="drag-drop ThreeIPNAND" id=' + this.id + '></div>'
        }
        return component;

    }

    registerComponent(workingArea, x = 0, y = 0) {

        // get width of working area
        const width = document.getElementById(workingArea).offsetWidth;
        let scale = 900;
        x = (x / scale) * width;
        document.getElementById(this.id).style.left = x + "px";
        document.getElementById(this.id).style.top = y + "px";
        if (this.type != "Input" && this.type != "Output") {
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
                window.componentType = "gate";
                // deleteElement(this.id);
                return false;
            }, false);
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
        if (this.type == "AND") {
            this.output = getOutput(this.inputs[0]) && getOutput(this.inputs[1]);
        }
        else if (this.type == "OR") {
            this.output = getOutput(this.inputs[0]) || getOutput(this.inputs[1]);
        }
        else if (this.type == "NOT") {
            this.output = !getOutput(this.inputs[0]);
        }
        else if (this.type == "XOR") {
            this.output = (getOutput(this.inputs[0]) && !getOutput(this.inputs[1])) || (!getOutput(this.inputs[0]) && getOutput(this.inputs[1]));
        }
        else if (this.type == "XNOR") {
            this.output = (!getOutput(this.inputs[0]) || getOutput(this.inputs[1])) && (getOutput(this.inputs[0]) || !getOutput(this.inputs[1]));
        }
        else if (this.type == "NAND") {
            this.output = !(getOutput(this.inputs[0]) && getOutput(this.inputs[1]));
        }
        else if (this.type == "NOR") {
            this.output = !(getOutput(this.inputs[0]) || getOutput(this.inputs[1]));
        }
        else if (this.type == "Output") {
            this.output = getOutput(this.inputs[0]);
        }
        else if (this.type = "ThreeIPNAND") {
            this.output = !(getOutput(this.inputs[0]) && getOutput(this.inputs[1]) && getOutput(this.inputs[2]));
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

    if (pos == "") {
        return gate.output;
    }
    else if (pos == "Q") {
        return gate.Q;
    }
    else if (pos == "Q'") {
        return gate.Qbar;
    }
}


function add_gate(event) {
    let type = event.target.innerHTML;
    if (type == "3-NAND")
        type = "ThreeIPNAND";
    const gate = new Gate(type);
    const component = gate.generateComponent();
    const parent = document.getElementById("working-area");
    parent.insertAdjacentHTML('beforeend', component);
    gate.registerComponent("working-area");
}

window.Add = add_gate;

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
    if (type == "HIGH") {
        // change class HIGH to LOW
        parentElement.classList.replace("HIGH", "LOW");
        element.innerHTML = "0";
        gate.setOutput(false);
    }
    else if (type == "LOW") {
        parentElement.classList.replace("LOW", "HIGH");
        element.innerHTML = "1";
        gate.setOutput(true);
    }
}

window.setInput = setInput;

export function checkConnections() {
    let flag = 0;
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.inputPoints.length != gate.inputs.length) {
            flag = 1;
        }
        else if (gate.isConnected == false && gate.isOutput == false) {
            flag = 1;
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

export function simulate() {

    window.simulate = 0;

    if (!checkConnections()) {
        return;
    }

    if (window.currentTab="Task1") {
        if(!checkConnectionsDD()) {
            return;
        }
    }

    let flag = 0;

    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.type == "Clock") {
            flag = 1;
            gate.simulate();
        }
    }
    if (flag == 0) {
        simulate2();
    }
}

function simulate2() {
    // input bits
    for (let gateId in gates) {
        const gate = gates[gateId];
        for (let index in gate.inputs) {
            let input = gate.inputs[index][0];
            if (input.isInput) {
                let val = input.output;
                if (gate.type == "OR" && val == true) {
                    gate.setOutput(true);
                }
                if (gate.type == "AND" && val == false) {
                    gate.setOutput(false);
                }
                if (gate.type == "NOR" && val == true) {
                    gate.setOutput(false);
                    console.log("NOR");
                }
                if (gate.type == "NAND" && val == false) {
                    gate.setOutput(true);
                }
                if (gate.type == "ThreeIPNAND" && val == false) {
                    gate.setOutput(true);
                }
            }
        }
    }
    // logic gates and flip flop
    for (let iterations = 0; iterations < 5; iterations++) {
        for (let gateId in gates) {
            const gate = gates[gateId];
            if (gate.isOutput == false && gate.isInput == false && gate.type != "NOT" && gate.type != "ThreeIPNAND") {
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

                    if (gate.type == "OR" && val == true) {
                        gate.setOutput(true);
                    }
                    if (gate.type == "AND" && val == false) {
                        gate.setOutput(false);
                    }
                    if (gate.type == "NOR" && val == true) {
                        gate.setOutput(false);
                        console.log("NOR");
                    }
                    if (gate.type == "NAND" && val == false) {
                        gate.setOutput(true);
                    }
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (gate.isOutput == false && gate.isInput == false && gate.type == "NOT") {
                const val1 = getOutput(gate.inputs[0]);
                if (val1 == null) {
                    continue;
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (gate.isOutput == false && gate.isInput == false && gate.type == "ThreeIPNAND") {
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
                if (val.length == 0) {
                    continue;
                }
                else if (val.length == 3) {
                    gate.generateOutput();
                }
                else {
                    // console.log(val);
                    for (let value in val) {
                        if (val[value] == false) {
                            gate.setOutput(true);
                            break;
                        }
                    }
                }
            }
        }


        if (window.currentTab === "Task1") {
            simulateFFDD();
        }
        else if (window.currentTab === "Task2") {
            simulateFFDD();
        }

    }
    // output bits
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isOutput == true) {
            let input = gate.inputs[0];
            // getResult(gate);
            let element = document.getElementById(gate.id)
            if (getOutput(input) == true) {
                element.className = "HIGH";
                element.childNodes[0].innerHTML = "1";
            }
            else {
                element.className = "LOW";
                element.childNodes[0].innerHTML = "0";
            }
        }
    }
}

window.sim = simulate;
window.sim2 = simulate2;

export function testSimulation(gates) {
    if (!checkConnections()) {
        return;
    }

    // reset output in gate
    for (let gateId in gates) {
        if (!gates[gateId].isInput) {
            gates[gateId].output = null;
        }
    }

    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isOutput == true) {
            getResult(gate);
        }
    }
}

// function to submit the desired circuit and get the final success or failure message
export function submitCircuit() {

    document.getElementById("table-body").innerHTML = "";
    if (window.currentTab == "Task1") {
        halfAdder("Input-0", "Input-1", "Output-3", "Output-2");
    }
    else if (window.currentTab == "Task2") {
        fullAdderTest("Input-0", "Input-1", "Input-2", "Output-4", "Output-3");
    }
    else if (window.currentTab == "Task3") {
        rippleAdderTest("Input-0", "Input-1", "Input-3", "Input-4", "Input-6", "Input-7", "Input-9", "Input-10", "Input-13", "Output-12", "Output-2", "Output-5", "Output-8", "Output-11");
    }
}
window.submitCircuit = submitCircuit;


export function deleteElement(gateid) {

    let gate = gates[gateid];
    // jsPlumbInstance.selectEndpoints().detachAll();
    jsPlumbInstance.removeAllEndpoints(document.getElementById(gate.id));
    // jsPlumbInstance.detach(gate.id); // <--
    jsPlumbInstance._removeElement(document.getElementById(gate.id));
    for (let elem in gates) {

        let found = 0;
        for (let index in gates[elem].inputs) {
            if (gates[elem].inputs[index][0].id == gate.id) {
                found = 1;
                break;
            }
        }
        if (found == 1) {
            gates[elem].removeInput(gate);
        }
    }
    delete gates[gateid];
    // jsPlumbInstance.repaintEverything();
}


