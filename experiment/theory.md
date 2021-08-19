Registers can move two types of digital information: parallel and serial. Registers also have two basic ways of moving it: FIFO and LIFO. The simplest register is a FIFO, which is only one level deep and one bit wide. It is basically a single D Type Flip/Flop.


**FIFO**

A FIFO (First In First Out) is a digital device that moves data in the same way a queue would. The first chunk of information in is moved over as more is loaded in behind it. This continues until it is pushed out the end. Like a grocery line.


**LIFO**

A LIFO (Last In First Out) is a like a FIFO only the data comes out in the reverse order it came in. Data is processed like a stack data structure. Imagine putting items onto a stack, the first item taken off would be at the top of the stack. Thus, the last item in (item at the top of the stack), would be the first item out


**Parallel** 

Parallel Registers take in mulitple bits at a time.


**Shift Registers**

Shift Registers are the simplest serial interfaces. They take serial data in one bit at a time and convert it to parallel form or the other way around. The first way is Serial In Parallel Out and the ladder is Parallel In Serial Out. Shift Registers are used to make larger state machines like counters and UARTs.


