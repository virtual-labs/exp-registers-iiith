# Serial Register (SISO)

## Components Required - 

* 4 D Flip Flops

## Circuit Connections - 

* Drag the first D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the D input bit.
* Drag the second D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the first D Flip Flop.
* Drag the third D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the second D Flip Flop.
* Drag the fourth D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the third D Flip Flop.
* Connect the Q output point of the fourth D Flip Flop to the Q output bit.
* Set the value of D, simulate the circuit and observe the output with varying clock values.

## Observations - 

* When Clk is 0, the output bit Q remains unchanged. If Clk is 1, the output bit Q is set to the value of D.
* If the circuit has been made as described above, a "Success" message will be displayed upon clicking "Submit".

# Parallel Load Register (PIPO)

## Components Required - 

* 4 D Flip Flops

## Circuit Connections - 

* Drag the first D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the P1 input bit. Also connect its output point Q to the Q1 output bit.
* Drag the second D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the P2 input bit. Also connect its output point Q to the Q2 output bit.
* Drag the third D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the P3 input bit. Also connect its output point Q to the Q3 output bit.
* Drag the fourth D Flip Flop and connect its Clk input point to the Clk input bit and its D input point to the P4 input bit. Also connect its output point Q to the Q4 output bit.
* Set the value of P1 P2 P3 and P4, simulate the circuit and observe the output with varying clock values.

## Observations - 

* When Clk is 0, the output bits Q1 Q2 Q3 and Q4 remain unchanged. If Clk is 1, the output bit Q1 is set to the value of P1, Q2 is set to the value of P2, Q3 is set to the value of P3 and Q4 is set to the value of P4.
* If the circuit has been made as described above, a "Success" message will be displayed upon clicking "Submit".