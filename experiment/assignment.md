1. Design a simple register using 4 'D' flip flops and a common clock pulse. The register should copy new information from input to output at negative edge of every clock cycle.

2. Design a register with parallel load using 4 'D' flip flops, a common clock pulse and basic gates. The register should copy new information from input to output at negative edge of clock whenever the LOAD signal is 1 and should retain the old values when LOAD signal is 0.

3. Design a shift register which shifts its contents by 1 bit to the right at negative edge of the clock pulse. There will be a 'serial input' (SI) which comes at the output of leftmost flip flop. For ex:- if register contains 0011 now and 1 is given as the serial input, then at next falling edge of clock pulse, register should contain 1001.
HINT: Connect output of one flip flop to the input of next flip flop 