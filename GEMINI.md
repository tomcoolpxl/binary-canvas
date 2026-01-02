# Binary Canvas (Bitwise Architecture Simulator)

## Project Overview
Binary Canvas is a web-based tool designed to visualize bitwise operations on raw image data. It provides an interactive interface where users can manipulate two 1-bit image registers (Source A and Source B) and observe the results of various ALU operations (AND, OR, XOR, NAND) in real-time.

The project emphasizes a "Matrix-style" visualization, displaying both the rendered image and the raw underlying bit stream density.

## Status
**Current Phase:** Completed (Core Features)
**Achievements:**
1.  Implemented dual 160x144 registers with drawing tools and bit manipulation.
2.  Optimized bit-stream rendering using sprite-based blitting for high-performance visualization.
3.  Integrated ALU with AND, OR, XOR, and NAND operations.
4.  Added dynamic Truth Table legend for pedagogical clarity.
5.  Implemented Hexadecimal view toggle for data density analysis.
6.  Added Bad Apple frame loader and pattern generation.

## Architecture
*   **Platform:** Web (HTML5, CSS3, JavaScript).
*   **Frameworks:** None (Vanilla JS).
*   **Data Structure:** `Uint8Array` used to store pixel data (160x144 resolution).
*   **Rendering:**
    *   **Visual Canvas:** Standard HTML5 Canvas rendering via `putImageData`.
    *   **Bit Stream Canvas:** High-performance pixel-sprite blitting. Pre-renders glyphs for 0-F and copies them directly into the bit canvas buffer to maintain 60FPS.

## Key Features
1.  **Dual Registers (A & B):**
    *   Independent drawing and manipulation.
    *   Tools: Erase/Draw, Set All 0/1, NOT (Invert), Bitwise Shift (<<, >>).
    *   Presets: "Bad Apple" frame (Register A), Geometric patterns (Register B).
2.  **ALU (Arithmetic Logic Unit):**
    *   Real-time computation of logical operations between Register A and B.
    *   Supported Ops: AND, OR, XOR, NAND.
    *   **Dynamic Legend:** Updates based on current operation to show the logic table.
3.  **Visualization:**
    *   **Graphical View:** 2x scaled pixel display.
    *   **Bit View:** A dense, crisp display of the raw data.
    *   **Binary/Hex Toggle:** Switch between bit-level (0/1) and byte-level (Hex) density.

## Development Conventions
*   **Code Style:** Modern ES6+ JavaScript.
*   **Performance:** Avoid standard text rendering (`fillText`) for high-density grids; use buffer-to-buffer blitting.
*   **UI/UX:** Dark mode "Terminal" aesthetic. Green/Amber text on dark backgrounds.

## Usage
Open `index.html` in any modern web browser. No build step required.