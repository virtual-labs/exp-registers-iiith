import { gates } from "./gate.js";
import { registerGate } from "./main.js";
import { setPosition, toggleModal } from "./layout.js";


window.simulate = 0;

export class Clock {
    constructor(frequency, dutyCycle) {
        this.frequency = frequency;
        this.dutyCycle = dutyCycle;
        this.isOn = false;
        this.name = "C-" + window.numComponents;
        this.id = "Clock-" + window.numComponents++;
        this.component = '<div class="LOW" id=' + this.id + ' ><a>0</a><p>' + this.name + '</p></div>'
        this.output = false;
        this.isInput = true;
        this.inputPoints = [];
        this.inputs = [];
        this.outputPoints = [];
        this.isConnected = false;
        this.type = "Clock";
    }

    setId(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    updateComponent() {
        this.component = '<div class="LOW" id=' + this.id + ' ><a>0</a><p>' + this.name + '</p></div>'
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

    }

    updateOutput() {
        let element = document.getElementById(this.id);
        if (this.isOn) {
            element.className = "HIGH";
            element.childNodes[0].innerHTML = "1";
            this.output = true;
        }
        else {
            element.className = "LOW";
            element.childNodes[0].innerHTML = "0";
            this.output = false;
        }
    }

    simulate() {
        const time = 1000 / this.frequency;
        const intervalOn = (time * this.dutyCycle) / 100;
        const intervalOff = time - intervalOn;
        // isOn is on for intervalOn milliseconds, then off for intervalOff milliseconds

        let flag = 0;
        let timerOff = null;
        let timerOn = null;

        const run = () => {
            if(window.simulate == 1) {
                return;
            }
            if (flag == 0) {
                flag = 1;
                this.isOn = true;
                this.updateOutput();
                clearTimeout(timerOff);
                timerOn = setTimeout(run, intervalOn);
            }
            else {
                flag = 0;
                this.isOn = false;
                this.updateOutput();
                clearTimeout(timerOn);
                timerOff = setTimeout(run, intervalOff);
            }

            window.sim2();
        }

        timerOff = setTimeout(run, intervalOff);
    }

    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected (val) {
        this.isConnected = val;
    }



}


export function addClock(frequency, dutyCycle, workingArea, x, y, name, Id) {
    let clock = new Clock(frequency, dutyCycle);
    if(Id != null) {
    clock.setId(Id);
    }
    if(name != null) {
    clock.setName(name);
    }
    clock.updateComponent();
    const parent = document.getElementById(workingArea);
    parent.insertAdjacentHTML('beforeend', clock.component);
    clock.registerComponent(workingArea, x, y);

    return clock;
}

const clockAdd = document.getElementById("clockAdd");
clockAdd.addEventListener('click', function () {
    const frequency = document.getElementById("frequency-input").value;
    const dutyCycle = document.getElementById("dutycycle-input").value;
    addClock(frequency,dutyCycle,"working-area",0,0,null,null)
    toggleModal();
});


