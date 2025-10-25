### 4-bit Serial Input Serial Output (SISO) Shift Register

<!-- #### Circuit Diagram

<img src="images/siso_register.png" alt="SISO Shift Register Circuit Diagram">

_Figure 1: 4-bit SISO shift register circuit diagram showing 4 D flip-flops connected in series with common clock input. Reference: Theory section_ -->

#### Components Required

- 4 D Flip-Flops

#### Circuit Connections

1. Drag the first D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the D input bit.
2. Drag the second D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the first D Flip-Flop.
3. Drag the third D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the second D Flip-Flop.
4. Drag the fourth D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the third D Flip-Flop.
5. Connect the Q output point of the fourth D Flip-Flop to the Q output bit.
6. Set the value of D, click on "Simulate" and observe the output with varying clock values.

#### Observations

- When Clk is 0, the output bit Q remains unchanged. When Clk transitions from 0 to 1 (positive edge), the data shifts through the register by one position.
- The serial data input D is shifted through each flip-flop stage with each clock pulse, creating a 4-clock cycle delay from input to output.
- If the circuit has been made as described above, a "Success" message will be displayed upon clicking "Submit".

### 4-bit Parallel Input Parallel Output (PIPO) Register

<!-- #### Circuit Diagram

<img src="images/pipo_register.png" alt="PIPO Register Circuit Diagram" style="width: 100%; max-width: 500px; margin: 10px 0;">

_Figure 2: 4-bit PIPO register circuit diagram showing 4 D flip-flops with parallel inputs and outputs connected to a common clock. Reference: Theory section_ -->

#### Components Required

- 4 D Flip-Flops

#### Circuit Connections

1. Drag the first D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the P1 input bit. Also connect its output point Q to the Q1 output bit.
2. Drag the second D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the P2 input bit. Also connect its output point Q to the Q2 output bit.
3. Drag the third D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the P3 input bit. Also connect its output point Q to the Q3 output bit.
4. Drag the fourth D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the P4 input bit. Also connect its output point Q to the Q4 output bit.
5. Set the values of P1, P2, P3, and P4, click on "Simulate" and observe the outputs with varying clock values.

#### Observations

- When Clk is 0, the output bits Q1, Q2, Q3, and Q4 remain unchanged. When Clk transitions from 0 to 1 (positive edge), all parallel inputs are simultaneously loaded into their respective flip-flops.
- The parallel loading allows all 4 bits of data to be stored simultaneously in a single clock cycle: Q1 = P1, Q2 = P2, Q3 = P3, and Q4 = P4.
- If the circuit has been made as described above, a "Success" message will be displayed upon clicking "Submit".

### 4-bit Serial Input Parallel Output (SIPO) Shift Register

<!-- #### Circuit Diagram

<img src="images/sipo_register.png" alt="SIPO Shift Register Circuit Diagram" style="width: 100%; max-width: 600px; margin: 10px 0;">

_Figure 3: 4-bit SIPO shift register circuit diagram showing serial data input shifting through 4 D flip-flops with parallel outputs available at each stage. Reference: Theory section_ -->

#### Components Required

- 4 D Flip-Flops

#### Circuit Connections

1. Drag the first D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Serial_In input bit. Connect its Q output point to the Q1 output bit.
2. Drag the second D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the first D Flip-Flop. Connect its Q output point to the Q2 output bit.
3. Drag the third D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the second D Flip-Flop. Connect its Q output point to the Q3 output bit.
4. Drag the fourth D Flip-Flop and connect its Clk input point to the Clk input bit and its D input point to the Q output point of the third D Flip-Flop. Connect its Q output point to the Q4 output bit.
5. Set the value of Serial_In, click on "Simulate" and observe the parallel outputs Q1, Q2, Q3, Q4 with varying clock values.

#### Observations

- Serial data is shifted through the register with each clock pulse, and all intermediate values are available as parallel outputs.
- After 4 clock cycles, a complete 4-bit word will be stored in the register and available at outputs Q4, Q3, Q2, Q1.
- If the circuit has been made as described above, a "Success" message will be displayed upon clicking "Submit".

### 4-bit Parallel Input Serial Output (PISO) Shift Register

<!-- #### Circuit Diagram

<img src="images/piso_register.png" alt="PISO Shift Register Circuit Diagram" style="width: 100%; max-width: 600px; margin: 10px 0;">

_Figure 4: 4-bit PISO shift register circuit diagram showing parallel inputs with load control and serial shifting capability for serial output. Reference: Theory section_ -->

#### Components Required

- 4 D Flip-Flops
- 4 2:1 Multiplexers (for parallel load/shift control)
- 1 Load/Shift control input

#### Circuit Connections

1. Connect the Load/Shift control input to the select lines of all four multiplexers.
2. For each bit position i (where i = 1, 2, 3, 4):
   - Connect parallel input Pi to the '1' input of the i-th multiplexer.
   - For the first multiplexer: Connect Serial_In to the '0' input.
   - For other multiplexers: Connect the Q output of the previous flip-flop to the '0' input.
   - Connect the output of each multiplexer to the D input of the corresponding flip-flop.
   - Connect the Clk input to all flip-flops.
3. Connect the Q output of the fourth flip-flop to the Serial_Out output bit.
4. Set Load/Shift control:
   - Load/Shift = 1 for parallel loading (Pi → Qi)
   - Load/Shift = 0 for serial shifting (data shifts right)
5. Click on "Simulate" and observe the serial output for different control settings.

#### Observations

- When Load/Shift = 1: Parallel data P4, P3, P2, P1 is loaded simultaneously into all flip-flops in one clock cycle.
- When Load/Shift = 0: Data shifts serially to the right with each clock pulse, and the serial output shows the stored data bit by bit.
- The register can be loaded in parallel and then shifted out serially, making it useful for parallel-to-serial data conversion.
- If the circuit has been made as described above, a "Success" message will be displayed upon clicking "Submit".
