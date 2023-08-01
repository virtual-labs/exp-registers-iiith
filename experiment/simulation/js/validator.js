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
    let dataTable = "";
    let head = `<thead id="table-head">
    <tr>
      <th colspan="2">Inputs</th>
      <th colspan="1">Expected Values</th>
      <th colspan="1">Observed Values</th>
    </tr>
    <tr>
      <th>D</th>
      <th>Clk</th>
      <th>Q</th>
      <th>Q</th>
    </tr>
  </thead>`
  document.getElementById("table-head").innerHTML = head;


    let q = gates_list[outputQ];
    q.setOutput(true);
    for(let key in flipflops_list)
    {
        flipflops_list[key].setQ(true);
        flipflops_list[key].setQbar(false);
    }

    // each list element consists of 3 values, D,Clk,Q
    const evaluator = [[0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 1] , [0,0,1]];

    let incorrectConnections = false;
    evaluator.every((element, index) => {
        d.setOutput(element[0] === 1);
        clk.setOutput(element[1] === 1);
        if(!testSimulation(gates_list,flipflops_list))
        {
            incorrectConnections=true;
            return false;
        }
        // check if output is correct
        let className = "success-table";
        let observedQ = q.output ? 1 : 0;
        if (q.output != element[2]) {
            circuitIsCorrect = false;
            className = "failure-table";
        }
        dataTable += `<tr class="bold-table"><th>${element[0]}</th><th>${element[1]}</th><td>${element[2]}</td><td class="${className}"> ${observedQ} </td></tr>`;
        return true;
    });
    if(incorrectConnections)
    {
        return;
    }
    const table_elem = document.getElementById("table-body");
    table_elem.insertAdjacentHTML("beforeend", dataTable);
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
    let dataTable = "";
    let head = `<thead id="table-head">
    <tr>
      <th colspan="5">Inputs</th>
      <th colspan="4">Observed Values</th>
    </tr>
    <tr>
      <th>P1</th>
      <th>P2</th>
      <th>P3</th>
      <th>P4</th>
      <th>Clk</th>
      <th>Q1</th>
      <th>Q2</th>
      <th>Q3</th>
      <th>Q4</th>
    </tr>
  </thead>`
    document.getElementById("table-head").innerHTML = head;

    outputQ1.setOutput(true);
    outputQ2.setOutput(true);
    outputQ3.setOutput(true);
    outputQ4.setOutput(true);
    for(let key in flipflops_list)
    {
        flipflops_list[key].setQ(true);
        flipflops_list[key].setQbar(false);
    }


    // each list element consists of 9 values, P1,P2,P3,P4,Clk,Q1,Q2,Q3,Q4
    const evaluator = [[0,0,0,0,0,1,1,1,1], [1,1,1,1,0,1,1,1,1], [0,0,0,0,1,0,0,0,0], [1,1,1,1,1,1,1,1,1] , [0,0,0,0,0,1,1,1,1]];

    let incorrectConnections = false;
    evaluator.every((element, index) => {
        if(!circuitIsCorrect){
            return;
        }

        inputP1.setOutput(element[0] === 1);
        inputP2.setOutput(element[1] === 1);
        inputP3.setOutput(element[2] === 1);
        inputP4.setOutput(element[3] === 1);
        clk.setOutput(element[4] === 1);
        if(!testSimulation(gates_list,flipflops_list))
        {
            incorrectConnections=true;
            return false;
        }
        let className = "success-table";
        let observedQ1 = outputQ1.output ? 1 : 0;
        let observedQ2 = outputQ2.output ? 1 : 0;
        let observedQ3 = outputQ3.output ? 1 : 0;
        let observedQ4 = outputQ4.output ? 1 : 0;
        // check if output is correct
        if (outputQ1.output != element[5] || outputQ2.output != element[6] || outputQ3.output != element[7] || outputQ4.output != element[8]) {
            circuitIsCorrect = false;
            className = "failure-table";
        }
        dataTable += `<tr class="bold-table"><th>${element[0]}</th><th>${element[1]}</th><th>${element[2]}</th><th> ${element[3]}</th><th> ${element[4]} </th><td class="${className}"> ${observedQ1} </td><td class="${className}"> ${observedQ2}</td><td class="${className}"> ${observedQ3}</td><td class="${className}"> ${observedQ4}</td></tr>`;
        return true;
    });
    if(incorrectConnections)
    {
        return;
    }
    const table_elem = document.getElementById("table-body");
    table_elem.insertAdjacentHTML("beforeend", dataTable);
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

