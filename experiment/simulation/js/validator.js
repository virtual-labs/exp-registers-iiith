import {gates, testSimulation} from './gate.js';
import {flipFlops} from './flipflop.js';

'use strict';
// Helper functions
export function computeXor(a, b) {
    return a != b;
}
export function computeAnd(a, b) {
    return a && b;
}
export function computeOr(a, b) {
    return a || b;
}
export function computeXnor(a, b) {
    return a == b;
}
export function computeNand(a, b) {
    return !(a && b);
}
export function computeNor(a, b) {
    return !(a || b);
}


// SISO Tester
export function testSISO(inputD,inputClk, outputQ)  // This function takes 4 ids of the respective Gates
{
    let gates_list = gates;
    let flipflops_list = flipFlops;

    let d = gates_list[inputD];
    let clk = gates_list[inputClk];
    let circuitIsCorrect = true;


    let q = gates_list[outputQ];
    q.setOutput(true);

    // each list element consists of 5 values, D,Clk,Q
    const evaluator = [[0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 1] , [0,0,1]];

    evaluator.forEach(element => {
        d.setOutput(element[0] === 1);
        clk.setOutput(element[1] === 1);
        testSimulation(gates_list,flipflops_list);
        // check if output is correct
        if (q.output != element[2]) {
            circuitIsCorrect = false;
        }
    });

    const result = document.getElementById('result');

    if (circuitIsCorrect) {
        result.innerHTML = "<span>&#10003;</span> Success";
        result.className = "success-message";
    }
    else {
        result.innerHTML = "<span>&#10007;</span> Fail";
        result.className = "failure-message";
    }
}

// PIPO Tester
export function testPIPO(p1,p2,p3,p4,inputClk,q1,q2,q3,q4)  // This function takes 4 ids of the respective Gates
{
    let gates_list = gates;
    let flipflops_list = flipFlops;

    let inputP1 = gates_list[p1];
    let inputP2 = gates_list[p2];
    let inputP3 = gates_list[p3];
    let inputP4 = gates_list[p4];
    let clk = gates_list[inputClk];
    let outputQ1 = gates_list[q1];
    let outputQ2 = gates_list[q2];
    let outputQ3 = gates_list[q3];
    let outputQ4 = gates_list[q4];

    let circuitIsCorrect = true;

    outputQ1.setOutput(true);
    outputQ2.setOutput(true);
    outputQ3.setOutput(true);
    outputQ4.setOutput(true);


    // each list element consists of 5 values, P1,P2,P3,P4,Clk,Q1,Q2,Q3,Q4
    const evaluator = [[0,0,0,0,0,1,1,1,1], [1,1,1,1,0,1,1,1,1], [0,0,0,0,1,0,0,0,0], [1,1,1,1,1,1,1,1,1] , [0,0,0,0,0,1,1,1,1]];

    evaluator.forEach(element => {
        if(!circuitIsCorrect){
            return;
        }

        inputP1.setOutput(element[0] === 1);
        inputP2.setOutput(element[1] === 1);
        inputP3.setOutput(element[2] === 1);
        inputP4.setOutput(element[3] === 1);
        clk.setOutput(element[4] === 1);
        testSimulation(gates_list,flipflops_list);
        // check if output is correct
        if (outputQ1.output != element[5] || outputQ2.output != element[6] || outputQ3.output != element[7] || outputQ4.output != element[8]) {
            circuitIsCorrect = false;
        }
    });

    const result = document.getElementById('result');

    if (circuitIsCorrect) {
        result.innerHTML = "<span>&#10003;</span> Success";
        result.className = "success-message";
    }
    else {
        result.innerHTML = "<span>&#10007;</span> Fail";
        result.className = "failure-message";
    }
}

