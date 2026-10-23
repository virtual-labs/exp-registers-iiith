import { gates, testSimulation } from "./gate.js";
import { flipFlops, presetFlipFlops } from "./flipflop.js";

("use strict");
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

// Applies one row of a test sequence: the data inputs get their values while the clock is low, and a row with
// Clk = 1 then raises the clock, which is the clock edge that the flip-flops react to. The clock is brought back
// to 0 before the next row. Returns false if the circuit is not connected properly.
function applyRow(gates_list, flipflops_list, clk, dataInputs, clkValue) {
  clk.setOutput(false);
  dataInputs.forEach(([input, value]) => input.setOutput(value === 1));
  if (!testSimulation(gates_list, flipflops_list)) {
    return false;
  }
  if (clkValue === 1) {
    clk.setOutput(true);
    if (!testSimulation(gates_list, flipflops_list)) {
      return false;
    }
    clk.setOutput(false);
    if (!testSimulation(gates_list, flipflops_list)) {
      return false;
    }
  }
  return true;
}

// Enhanced SISO Tester with all flip-flop outputs
export function testSISO4bit(
  inputD,
  inputClk,
  outputQ1,
  outputQ2,
  outputQ3,
  outputQ4
) {
  let gates_list = gates;
  let flipflops_list = flipFlops;

  let d = gates_list[inputD];
  let clk = gates_list[inputClk];
  let q1 = gates_list[outputQ1];
  let q2 = gates_list[outputQ2];
  let q3 = gates_list[outputQ3];
  let q4 = gates_list[outputQ4];

  let circuitIsCorrect = true;
  let dataTable = "";
  let head = `<thead id="table-head">
    <tr>
      <th colspan="2">Inputs</th>
      <th colspan="4">Expected Values</th>
      <th colspan="4">Observed Values</th>
    </tr>
    <tr>
      <th>D</th>
      <th>Clk</th>
      <th>Q1</th>
      <th>Q2</th>
      <th>Q3</th>
      <th>Q4</th>
      <th>Q1</th>
      <th>Q2</th>
      <th>Q3</th>
      <th>Q4</th>
    </tr>
  </thead>`;
  document.getElementById("table-head").innerHTML = head;

  // Set all outputs to true initially
  if (q1) q1.setOutput(true);
  if (q2) q2.setOutput(true);
  if (q3) q3.setOutput(true);
  if (q4) q4.setOutput(true);

  presetFlipFlops();
  d.setOutput(false);
  clk.setOutput(false);

  // SISO test sequence - data shifts through 4 flip-flops, starting from Q1 = Q2 = Q3 = Q4 = 1.
  // Format: [D, Clk, expected Q1, Q2, Q3, Q4]
  // A row with Clk = 1 applies one complete clock pulse (the clock goes to 1 and back to 0) with D set to the
  // value of the row, so the flip-flops are triggered once by the rising edge of the clock.
  const evaluator = [
    [0, 0, 1, 1, 1, 1], // Initial state
    [1, 0, 1, 1, 1, 1], // D changes but no clock
    [0, 1, 0, 1, 1, 1], // Clock edge: 0 enters Q1
    [1, 1, 1, 0, 1, 1], // Clock edge: 1 enters Q1, 0 shifts to Q2
    [0, 1, 0, 1, 0, 1], // Clock edge: 0 enters Q1, 0 shifts to Q3
    [1, 1, 1, 0, 1, 0], // Clock edge: the first 0 reaches Q4
    [1, 1, 1, 1, 0, 1], // Clock edge: the 1 keeps shifting
  ];

  let incorrectConnections = false;
  evaluator.every((element, index) => {
    if (!applyRow(gates_list, flipflops_list, clk, [[d, element[0]]], element[1])) {
      incorrectConnections = true;
      return false;
    }

    // Check all outputs
    let observedQ1 = q1 ? (q1.output ? 1 : 0) : 0;
    let observedQ2 = q2 ? (q2.output ? 1 : 0) : 0;
    let observedQ3 = q3 ? (q3.output ? 1 : 0) : 0;
    let observedQ4 = q4 ? (q4.output ? 1 : 0) : 0;

    let classQ1 = "success-table";
    let classQ2 = "success-table";
    let classQ3 = "success-table";
    let classQ4 = "success-table";

    if (observedQ1 != element[2]) {
      circuitIsCorrect = false;
      classQ1 = "failure-table";
    }
    if (observedQ2 != element[3]) {
      circuitIsCorrect = false;
      classQ2 = "failure-table";
    }
    if (observedQ3 != element[4]) {
      circuitIsCorrect = false;
      classQ3 = "failure-table";
    }
    if (observedQ4 != element[5]) {
      circuitIsCorrect = false;
      classQ4 = "failure-table";
    }

    dataTable += `<tr class="bold-table">
            <th>${element[0]}</th>
            <th>${element[1]}</th>
            <td>${element[2]}</td>
            <td>${element[3]}</td>
            <td>${element[4]}</td>
            <td>${element[5]}</td>
            <td class="${classQ1}">${observedQ1}</td>
            <td class="${classQ2}">${observedQ2}</td>
            <td class="${classQ3}">${observedQ3}</td>
            <td class="${classQ4}">${observedQ4}</td>
        </tr>`;
    return true;
  });

  if (incorrectConnections) {
    return;
  }

  const table_elem = document.getElementById("table-body");
  table_elem.insertAdjacentHTML("beforeend", dataTable);
  const result = document.getElementById("result");

  if (circuitIsCorrect) {
    result.innerHTML =
      "<span>&#10003;</span> Success - 4-bit SISO shift register working correctly";
    result.className = "success-message";
  } else {
    result.innerHTML =
      "<span>&#10007;</span> Fail - Check flip-flop connections and data flow";
    result.className = "failure-message";
  }
}

export function testPIPO(p1, p2, p3, p4, inputClk, q1, q2, q3, q4) {
  // This function takes the ids of the respective Gates
  let gates_list = gates;
  let flipflops_list = flipFlops;

  const inputs = [gates_list[p1], gates_list[p2], gates_list[p3], gates_list[p4]];
  const clk = gates_list[inputClk];
  const outputs = [gates_list[q1], gates_list[q2], gates_list[q3], gates_list[q4]];

  let circuitIsCorrect = true;
  let dataTable = "";
  let head = `<thead id="table-head">
    <tr>
      <th colspan="5">Inputs</th>
      <th colspan="4">Expected Values</th>
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
      <th>Q1</th>
      <th>Q2</th>
      <th>Q3</th>
      <th>Q4</th>
    </tr>
  </thead>`;
  document.getElementById("table-head").innerHTML = head;

  outputs.forEach((output) => output.setOutput(true));
  presetFlipFlops();
  clk.setOutput(false);

  // each list element consists of 9 values: P1,P2,P3,P4,Clk and the expected Q1,Q2,Q3,Q4, starting from Q = 1111.
  // A row with Clk = 1 applies one complete clock pulse (the clock goes to 1 and back to 0), so the register
  // loads the value of P1..P4 at the rising edge and keeps it until the next one.
  const evaluator = [
    [0, 0, 0, 0, 0, 1, 1, 1, 1], // initial state
    [1, 0, 1, 0, 0, 1, 1, 1, 1], // P changes but there is no clock
    [1, 0, 1, 0, 1, 1, 0, 1, 0], // clock edge: P is loaded
    [0, 1, 0, 1, 0, 1, 0, 1, 0], // P changes, Q holds the loaded value
    [0, 1, 0, 1, 1, 0, 1, 0, 1], // clock edge: the new P is loaded
    [0, 0, 1, 1, 0, 0, 1, 0, 1], // P changes, Q holds again
  ];

  let incorrectConnections = false;
  evaluator.every((element) => {
    const dataInputs = inputs.map((input, i) => [input, element[i]]);
    if (!applyRow(gates_list, flipflops_list, clk, dataInputs, element[4])) {
      incorrectConnections = true;
      return false;
    }
    const observed = outputs.map((output) => (output.output ? 1 : 0));
    const classes = observed.map((value, i) =>
      value === element[5 + i] ? "success-table" : "failure-table"
    );
    if (classes.includes("failure-table")) {
      circuitIsCorrect = false;
    }
    dataTable += `<tr class="bold-table"><th>${element[0]}</th><th>${element[1]}</th><th>${element[2]}</th><th>${element[3]}</th><th>${element[4]}</th>
      <td>${element[5]}</td><td>${element[6]}</td><td>${element[7]}</td><td>${element[8]}</td>
      <td class="${classes[0]}">${observed[0]}</td><td class="${classes[1]}">${observed[1]}</td><td class="${classes[2]}">${observed[2]}</td><td class="${classes[3]}">${observed[3]}</td></tr>`;
    return true;
  });
  if (incorrectConnections) {
    return;
  }
  const table_elem = document.getElementById("table-body");
  table_elem.insertAdjacentHTML("beforeend", dataTable);
  const result = document.getElementById("result");

  if (circuitIsCorrect) {
    result.innerHTML =
      "<span>&#10003;</span> Success - 4-bit PIPO register working correctly";
    result.className = "success-message";
  } else {
    result.innerHTML =
      "<span>&#10007;</span> Fail - Check the flip-flop connections and the clock";
    result.className = "failure-message";
  }
}
