1. Design a simple 4-bit register using 4 'D' flip-flops and a common clock pulse. The register should copy new information from input to output at the negative edge of every clock cycle. Verify the timing diagram for the register operation.

2. Design a register with parallel load using 4 'D' flip-flops, a common clock pulse, and basic logic gates. The register should copy new information from input to output at the negative edge of clock whenever the LOAD signal is 1 and should retain the old values when LOAD signal is 0. For circuit diagram, refer to the theory section.

3. Design a 4-bit shift register which shifts its contents by 1 bit to the right at the negative edge of the clock pulse. There will be a 'serial input' (SI) which comes at the output of the leftmost flip-flop. For example: if register contains 0011 now and 1 is given as the serial input, then at the next falling edge of clock pulse, register should contain 1001.

   **HINT**: Connect the output of one flip-flop to the input of the next flip-flop.

4. Construct a 4-bit bidirectional shift register that can shift data either left or right based on a control signal. Given a direction control input (DIR), the register should shift right when DIR = 0 and shift left when DIR = 1. Include both serial inputs for left and right shifting operations.

5. Can a shift register be used to implement a counter circuit? If yes, design a 3-bit ring counter using D flip-flops. If no, explain why not with proper justification.
