import {gates, testSimulation} from './gate.js';


export function halfAdder(Input0,Input1,CarryOut,SumOut)  // This function takes 4 ids of the respective Gates
{
    // Gates[input0].outputs = true;
    // Gates[input1].outputs = true;
    let gates_list = gates;


    let input0 = gates_list[Input0];
    let input1 = gates_list[Input1];
    let flag = 0;

    let dataTable = ''

    for(let i=0; i<4;i++)
    {
        //convert i to binary
        let binary = i.toString(2);
        if(binary.length < 2)
            binary = '0' + binary;
        
        const bit0 = binary[1];
        const bit1 = binary[0];

        input1.setOutput(bit0 == "1");
        input0.setOutput(bit1 == "1");
        const calculatedSum = (input0.output && !input1.output) || (!input0.output && input1.output) ? 1 : 0;
        const calculatedCarry = input0.output && input1.output ? 1 : 0;

        // simulate the circuit
        testSimulation(gates_list);
        const sum = gates_list[SumOut].output ? 1 : 0;
        const carry = gates_list[CarryOut].output ? 1 : 0;

        dataTable += '<tr><th>'+ bit1 +'</th><th>'+ bit0 +'</th><td>'+ calculatedSum +'</td><td>'+ calculatedCarry +'</td><td>'+ sum +'</td><td>'+ carry +'</td></tr>'

        if(sum != calculatedSum || carry != calculatedCarry)
        {
            flag = 1;
        }
    }

    const table_elem = document.getElementById('table-body');
    table_elem.insertAdjacentHTML('beforeend', dataTable);

    const result = document.getElementById('result');

    if(flag == 0)
    {
        result.innerHTML = "<span>&#10003;</span> Success";
        result.className = "success-message";
    }
    else
    {
        result.innerHTML = "<span>&#10007;</span> Fail";
        result.className = "failure-message";
    }
}

export function fullAdderTest(Input0,Input1,CarryIn,CarryOut,SumOut)
{
    // Gates[input0].outputs = true;
    // Gates[input1].outputs = true;
    let gates_list = gates;
    let input0 = gates_list[Input0];
    let input1 = gates_list[Input1];
    let carryIn = gates_list[CarryIn];
    let flag = 0;
    let dataTable = ''

    for(let i=0; i<8;i++)
    {
        // covert i to binary
        let binary = i.toString(2);
        if(binary.length < 2)
            binary = '0' + binary;
        if(binary.length < 3)
            binary = '0' + binary;
        const bit0 = binary[2] || 0;
        const bit1 = binary[1] || 0;
        const bit2 = binary[0] || 0;

        input0.setOutput(bit2 == "1");
        input1.setOutput(bit1 == "1");
        carryIn.setOutput(bit0 == "1");

        const aXorb =  (input0.output && !input1.output) || (!input0.output && input1.output);

        // calculated sum is ((a xor b) xor carry_in)
        const calculatedSum = (aXorb && !carryIn.output) || (!aXorb && carryIn.output) ? 1 : 0;

        // calculated carry is a.b + (a xor b)
        const calculatedCarry = (input0.output && input1.output) || (aXorb && carryIn.output) ? 1 : 0;

        // simulate the circuit
        testSimulation(gates_list);
        const sum = gates_list[SumOut].output ? 1 : 0;
        const carry = gates_list[CarryOut].output ? 1 : 0;

        dataTable += '<tr><th>'+ bit2 +'</th><th>'+ bit1 +'</th><th>'+ bit0 +'</th><td>'+ calculatedSum +'</td><td>'+ calculatedCarry +'</td><td>'+ sum +'</td><td>'+ carry +'</td></tr>'

        if(sum != calculatedSum || carry != calculatedCarry)
        {
            flag = 1;
            // console.log(calculatedSum,calculatedCarry);
            // console.log(sum,carry,i);
        }
    }

    const table_elem = document.getElementById('table-body');
    table_elem.insertAdjacentHTML('beforeend', dataTable);

    const result = document.getElementById('result');

    if(flag == 0)
    {
        result.innerHTML = "<span>&#10003;</span> Success";
        result.className = "success-message";
    }
    else
    {
        result.innerHTML = "<span>&#10007;</span> Fail";
        result.className = "failure-message";
    }
}

export function rippleAdderTest(InputA0,InputB0,InputA1,InputB1,InputA2,InputB2,InputA3,InputB3,InputCin,OutputCout,OutputS0,OutputS1,OutputS2,OutputS3)
{
    let gates_list = gates;
    let fA = fullAdder;
    let inputA0 = gates_list[InputA0];
    let inputB0 = gates_list[InputB0];
    let inputA1 = gates_list[InputA1];
    let inputB1 = gates_list[InputB1];
    let inputA2 = gates_list[InputA2];
    let inputB2 = gates_list[InputB2];
    let inputA3 = gates_list[InputA3];
    let inputB3 = gates_list[InputB3];
    let carryIn = gates_list[InputCin];
    let flag = 0;



    for(let i=0;i<512;i++) // 512 = 2^9 basically calculates all the possible combinations for 9 inputs
    {
        // covert i to binary
        let binary = i.toString(2);
        const bit0 = binary[0] || 0;
        const bit1 = binary[1] || 0;
        const bit2 = binary[2] || 0;
        const bit3 = binary[3] || 0;
        const bit4 = binary[4] || 0;
        const bit5 = binary[5] || 0;
        const bit6 = binary[6] || 0;
        const bit7 = binary[7] || 0;
        const bit8 = binary[8] || 0;

        inputA0.setOutput(bit0 == "1");
        inputB0.setOutput(bit1 == "1");
        inputA1.setOutput(bit2 == "1");
        inputB1.setOutput(bit3 == "1");
        inputA2.setOutput(bit4 == "1");
        inputB2.setOutput(bit5 == "1");
        inputA3.setOutput(bit6 == "1");
        inputB3.setOutput(bit7 == "1");
        carryIn.setOutput(bit8 == "1");

        // FOR FIRST ADDER
        const aXorb =  (inputA0.output && !inputB0.output) || (!inputA0.output && inputB0.output);
        // calculated sum is ((a xor b) xor carry_in)
        const sumS0 = (aXorb && !carryIn.output) || (!aXorb && carryIn.output);
        // calculated carry is a.b + (a xor b)
        const carryC1 = (inputA0.output && inputB0.output) || (aXorb && carryIn.output)



        // FOR SECOND ADDER
        const aXorb2 =  (inputA1.output && !inputB1.output) || (!inputA1.output && inputB1.output);
        const sumS1 = (aXorb2 && !carryC1) || (!aXorb2 && carryC1);
        const carryC2 = (inputA1.output && inputB1.output) || (aXorb2 && carryC1)


        // FOR THIRD ADDER
        const aXorb3 =  (inputA2.output && !inputB2.output) || (!inputA2.output && inputB2.output);
        const sumS2 = (aXorb3 && !carryC2) || (!aXorb3 && carryC2);
        const carryC3 = (inputA2.output && inputB2.output) || (aXorb3 && carryC2)


        // FOR FOURTH ADDER
        const aXorb4 =  (inputA3.output && !inputB3.output) || (!inputA3.output && inputB3.output);
        const sumS3 = (aXorb4 && !carryC3) || (!aXorb4 && carryC3);
        const carryCout = (inputA3.output && inputB3.output) || (aXorb4 && carryC3)
        
        // simulate the circuit
        // testSimulationFA(fA,gates_list)
        const sumSout0 = gates_list[OutputS0].output
        const sumSout1 = gates_list[OutputS1].output;
        const sumSout2 = gates_list[OutputS2].output;
        const sumSout3 = gates_list[OutputS3].output;
        const carryOut = gates_list[OutputCout].output;

        if(sumS0!=sumSout0 || sumS1!=sumSout1 || sumS2!=sumSout2 || sumS3!=sumSout3 || carryCout!=carryOut)
        {
            flag=1;
            console.log(sumS0,sumSout0,sumS1,sumSout1,sumS2,sumSout2,sumS3,sumSout3);
            break;
        }
    }

    const result = document.getElementById('result');

    if(flag == 0)
    {
        result.innerHTML = "<span>&#10003;</span> Success";
        result.className = "success-message";
    }
    else
    {
        result.innerHTML = "<span>&#10007;</span> Fail";
        result.className = "failure-message";
    }

}
