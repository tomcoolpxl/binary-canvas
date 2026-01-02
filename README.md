# Binary Canvas (Bitwise Architecture Simulator)

Binary Canvas is an interactive, web-based visualization tool designed to demonstrate the fundamental concepts of bitwise operations and computer graphics. It provides a real-time "Matrix-style" view of how raw binary data translates into visual images.

## Features

### 1. Dual Registers (A & B)

* **Visual & Bit View:** See the image and the underlying `0`s and `1`s simultaneously.
* **Drawing Tools:** Draw directly on the canvas to flip bits.
* **Manipulation:**
  * **Set 0/1:** Clear or fill the entire register.
  * **NOT:** Invert all bits.
  * **Shift (<< / >>):** Bitwise shift operations.
  * **Bad Apple:** Load a frame from the famous shadow art animation (Register A).
  * **Patterns:** Cycle through generated test patterns like Stripes, Checkerboard, and Noise (Register B).

### 2. Arithmetic Logic Unit (ALU)

* **Real-time Operations:** compute the result of `Register A [OP] Register B` instantly.
* **Supported Operations:**
  * **AND:** `A & B` (Intersection)
  * **OR:** `A | B` (Union)
  * **XOR:** `A ^ B` (Difference)
  * **NAND:** `~(A & B)`
* **Truth Table:** A dynamic legend explains the logic rules for the currently selected operation.

### 3. Hexadecimal Visualization

* **Toggle Mode:** Switch the "Bit View" between standard Binary (`1010`) and Hexadecimal (`A5`) representations.
* **Understanding Data:** Visualizes how 4-bit nibbles map to Hex codes (0-F), a critical skill for low-level programming.

## How to Run

Since this is a static web application, no build tools or servers are required.

1. Clone or download the repository.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, etc.).

## Controls

* **Mouse (Left Click + Drag):** Draw pixels on Register A or B.
* **Mode Toggle:** Switch between "Erase" (write 0) and "Draw" (write 1).
* **Operation Buttons:** Select the ALU logic (AND, OR, XOR, NAND).
* **Mode: Binary/Hex:** Toggle the text representation at the bottom of the ALU column.
