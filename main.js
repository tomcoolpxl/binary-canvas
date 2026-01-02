// Configuration
const LOGIC_WIDTH = 160;
const LOGIC_HEIGHT = 144;
const CHAR_W = 5; // Width of the bit character in pixels
const CHAR_H = 6; // Height of the bit character in pixels

// Buffers (1 = on, 0 = off)
const dataA = new Uint8Array(LOGIC_WIDTH * LOGIC_HEIGHT);
const dataB = new Uint8Array(LOGIC_WIDTH * LOGIC_HEIGHT);
const dataRes = new Uint8Array(LOGIC_WIDTH * LOGIC_HEIGHT);

// State
let currentOp = 'AND';
let viewMode = 'BIN'; // 'BIN' or 'HEX'
const isDrawing = { A: false, B: false };
const lastPos = { A: null, B: null };

// DOM Elements
const canvasA = document.getElementById('canvasA');
const canvasB = document.getElementById('canvasB');
const canvasRes = document.getElementById('canvasRes');

const bitsA = document.getElementById('bitsA');
const bitsB = document.getElementById('bitsB');
const bitsRes = document.getElementById('bitsRes');

const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');
const ctxRes = canvasRes.getContext('2d');

const ctxBitsA = bitsA.getContext('2d');
const ctxBitsB = bitsB.getContext('2d');
const ctxBitsRes = bitsRes.getContext('2d');

// --- Initialization ---

function init() {
    // 1. Resize Bit Canvases to fit the text density
    [bitsA, bitsB, bitsRes].forEach(c => {
        c.width = LOGIC_WIDTH * CHAR_W;
        c.height = LOGIC_HEIGHT * CHAR_H;
    });

    // 2. Pre-generate Sprites for '0' and '1'
    // We create a raw buffer for the 0 and 1 glyphs to blit them fast.
    generateSprites();

    // 3. Setup Events
    setupMouseHandlers(canvasA, 'A', dataA);
    setupMouseHandlers(canvasB, 'B', dataB);
    setupControls();

    // 4. Initial Draw
    updateTruthTable();
    updateAll();
}

// --- Sprite Generation (The "Micro Font") ---

let sprite0, sprite1; 
let hexSprites = []; // Array of 16 sprites for 0-F

function generateSprites() {
    const colorOn = [0, 255, 0, 255]; // Green
    const colorOff = [20, 20, 20, 255]; // Dark Grey
    
    const w = CHAR_W;
    const h = CHAR_H;

    const createSpriteData = (pattern) => {
        const buffer = new Uint8ClampedArray(w * h * 4);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const isPixel = pattern[y] && pattern[y][x] === 'X';
                const c = isPixel ? colorOn : colorOff;
                buffer[i] = c[0];
                buffer[i+1] = c[1];
                buffer[i+2] = c[2];
                buffer[i+3] = c[3];
            }
        }
        return buffer;
    };

    const patterns = {
        '0': [" XXX ","X   X","X   X","X   X"," XXX "],
        '1': ["  X  "," XX  ","  X  ","  X  ","XXXXX"],
        '2': [" XXX ","    X","  XX "," X   ","XXXXX"],
        '3': ["XXXXX","   X ","  XX ","    X","XXXXX"],
        '4': ["X   X","X   X","XXXXX","    X","    X"],
        '5': ["XXXXX","X    ","XXXX ","    X","XXXX "],
        '6': [" XXX ","X    ","XXXX ","X   X"," XXX "],
        '7': ["XXXXX","    X","   X ","  X  "," X   "],
        '8': [" XXX ","X   X"," XXX ","X   X"," XXX "],
        '9': [" XXX ","X   X"," XXXX","    X"," XXX "],
        'A': [" XXX ","X   X","XXXXX","X   X","X   X"],
        'B': ["XXXX ","X   X","XXXX ","X   X","XXXX "],
        'C': [" XXX ","X    ","X    ","X    "," XXX "],
        'D': ["XXXX ","X   X","X   X","X   X","XXXX "],
        'E': ["XXXXX","X    ","XXXX ","X    ","XXXXX"],
        'F': ["XXXXX","X    ","XXXX ","X    ","X    "]
    };

    sprite0 = createSpriteData(patterns['0']);
    sprite1 = createSpriteData(patterns['1']);

    for (let i = 0; i < 16; i++) {
        const char = i.toString(16).toUpperCase();
        hexSprites[i] = createSpriteData(patterns[char]);
    }
}

function updateTruthTable() {
    const el = document.getElementById('truth-table');
    if (!el) return;

    const ops = {
        'AND': (a, b) => a & b,
        'OR':  (a, b) => a | b,
        'XOR': (a, b) => a ^ b,
        'NAND': (a, b) => (1 - (a & b))
    };

    const op = ops[currentOp];
    const char = currentOp === 'AND' ? '&' : (currentOp === 'OR' ? '|' : (currentOp === 'XOR' ? '^' : '⊼'));

    el.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
            <div>0 ${char} 0 = ${op(0, 0)}</div>
            <div>0 ${char} 1 = ${op(0, 1)}</div>
            <div>1 ${char} 0 = ${op(1, 0)}</div>
            <div>1 ${char} 1 = ${op(1, 1)}</div>
        </div>
    `;
}

// --- Core Rendering ---

function drawGraphics(ctx, data) {
    const imgData = ctx.createImageData(LOGIC_WIDTH, LOGIC_HEIGHT);
    const d = imgData.data;
    
    for (let i = 0; i < data.length; i++) {
        const val = data[i];
        const offset = i * 4;
        const c = val ? 255 : 0; // White or Black
        d[offset] = c;
        d[offset+1] = c;
        d[offset+2] = c;
        d[offset+3] = 255;
    }
    
    ctx.putImageData(imgData, 0, 0);
}

function drawBits(ctx, data) {
    const fullW = LOGIC_WIDTH * CHAR_W;
    const fullH = LOGIC_HEIGHT * CHAR_H;
    const imgData = ctx.createImageData(fullW, fullH);
    const buf = imgData.data;

    if (viewMode === 'BIN') {
        for (let ly = 0; ly < LOGIC_HEIGHT; ly++) {
            for (let lx = 0; lx < LOGIC_WIDTH; lx++) {
                const bit = data[ly * LOGIC_WIDTH + lx];
                const sprite = bit ? sprite1 : sprite0;
                blit(buf, sprite, lx * CHAR_W, ly * CHAR_H, fullW);
            }
        }
    } else {
        // HEX Mode: 2 hex digits per 8 bits. 40 digits per 160 pixels.
        // Each hex digit takes 4 logic pixels width (20 pixels).
        for (let ly = 0; ly < LOGIC_HEIGHT; ly++) {
            for (let lx = 0; lx < LOGIC_WIDTH; lx += 4) {
                // Get 4 bits (nibble)
                let nibble = 0;
                for (let b = 0; b < 4; b++) {
                    nibble = (nibble << 1) | data[ly * LOGIC_WIDTH + lx + b];
                }
                const sprite = hexSprites[nibble];
                // Center the sprite in the 4-pixel (20px) wide area
                // CHAR_W is 5. 4 cells * 5px = 20px. Sprite is 5px.
                // Offset by (20 - 5) / 2 = 7.5? Let's just put it at +1 cell (5px).
                blit(buf, sprite, (lx + 1) * CHAR_W, ly * CHAR_H, fullW);
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

function blit(destBuf, sprite, targetX, targetY, fullW) {
    for (let sy = 0; sy < CHAR_H; sy++) {
        const rowOffsetSrc = sy * CHAR_W * 4;
        const rowOffsetDst = ((targetY + sy) * fullW + targetX) * 4;
        for (let sx = 0; sx < CHAR_W * 4; sx++) {
            destBuf[rowOffsetDst + sx] = sprite[rowOffsetSrc + sx];
        }
    }
}

function updateALU() {
    for (let i = 0; i < dataA.length; i++) {
        const a = dataA[i];
        const b = dataB[i];
        let res = 0;
        
        switch (currentOp) {
            case 'AND': res = a & b; break;
            case 'OR':  res = a | b; break;
            case 'XOR': res = a ^ b; break;
            case 'NAND': res = ~(a & b) & 1; break;
        }
        dataRes[i] = res;
    }
}

function updateAll() {
    updateALU();
    
    drawGraphics(ctxA, dataA);
    drawBits(ctxBitsA, dataA);

    drawGraphics(ctxB, dataB);
    drawBits(ctxBitsB, dataB);

    drawGraphics(ctxRes, dataRes);
    drawBits(ctxBitsRes, dataRes);
}

// --- Interaction ---

function setupMouseHandlers(canvas, name, dataBuffer) {
    const setPixel = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        
        if (x >= 0 && x < LOGIC_WIDTH && y >= 0 && y < LOGIC_HEIGHT) {
            const mode = document.querySelector(`input[name="mode${name}"]:checked`).value;
            dataBuffer[y * LOGIC_WIDTH + x] = parseInt(mode);
            updateAll();
        }
    };

    canvas.addEventListener('mousedown', (e) => {
        isDrawing[name] = true;
        setPixel(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing[name]) setPixel(e);
    });

    window.addEventListener('mouseup', () => {
        isDrawing[name] = false;
    });
}

function setupControls() {
    // Helper to wire up buttons
    const click = (id, fn) => document.getElementById(id)?.addEventListener('click', () => { fn(); updateAll(); });

    // --- REG A ---
    click('btnA_Clear', () => dataA.fill(0));
    click('btnA_Fill', () => dataA.fill(1));
    click('btnA_Not', () => { for(let i=0; i<dataA.length; i++) dataA[i] = 1 - dataA[i]; });
    click('btnA_SL', () => shift(dataA, -1));
    click('btnA_SR', () => shift(dataA, 1));
    click('btnA_BadApple', () => drawBadApple(dataA));

    // --- REG B ---
    click('btnB_Clear', () => dataB.fill(0));
    click('btnB_Fill', () => dataB.fill(1));
    click('btnB_Not', () => { for(let i=0; i<dataB.length; i++) dataB[i] = 1 - dataB[i]; });
    click('btnB_Copy', () => dataB.set(dataA));
    click('btnB_SL', () => shift(dataB, -1));
    click('btnB_SR', () => shift(dataB, 1));
    click('btnB_Pattern', () => cyclePattern(dataB));

    // --- ALU ---
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active-op'));
            e.target.classList.add('active-op');
            currentOp = e.target.dataset.op;
            updateTruthTable();
            updateAll();
        });
    });

    // --- VIEW MODE ---
    click('btn_ToggleHex', () => {
        viewMode = viewMode === 'BIN' ? 'HEX' : 'BIN';
        document.getElementById('btn_ToggleHex').innerText = `MODE: ${viewMode === 'BIN' ? 'BINARY' : 'HEXADECIMAL'}`;
    });
}

// --- Logic Helpers ---

function shift(data, dir) {
    // Simple pixel shift. 
    // If dir is -1 (Left), we shift index down by 1? No, visual left is index - 1.
    // We treat the array as one long stream for simplicity, or row by row?
    // Bitwise shift usually implies row-wrapping in these kinds of visualizers, 
    // OR strict row isolation. Let's do strict whole-buffer shift for the "Stream" feel.
    
    if (dir === -1) {
        // Left Shift
        for (let i = 0; i < data.length - 1; i++) data[i] = data[i+1];
        data[data.length-1] = 0;
    } else {
        // Right Shift
        for (let i = data.length - 1; i > 0; i--) data[i] = data[i-1];
        data[0] = 0;
    }
}

// ASCII Art Parser for Bad Apple
function drawBadApple(data) {
    if (typeof BAD_APPLE_ASCII === 'undefined') {
        console.error("BAD_APPLE_ASCII not found. Ensure bad_apple_data.js is loaded.");
        return;
    }

    // Inverted Logic for Shadow Art Style (Black Silhouette on White Background)
    // The ASCII data has characters for the Person and spaces for the Background.
    // We want Person = Black (0), Background = White (1).
    data.fill(1); // Default to White Background
    
    const lines = BAD_APPLE_ASCII.split('\n');
    
    // Config: The ASCII is approx 144 chars wide.
    // Vertical scaling: 3x looks about right for ASCII aspect ratio.
    const SCALE_Y = 3;
    const offsetX = Math.floor((LOGIC_WIDTH - 144) / 2); // Center horizontally
    
    // Loop through ASCII lines
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        for (let x = 0; x < line.length; x++) {
            if (line[x] !== ' ') {
                // It's a character (The Person). Set to Black (0).
                const targetX = x + offsetX;
                
                // Draw a vertical strip of SCALE_Y pixels
                for (let sy = 0; sy < SCALE_Y; sy++) {
                    const targetY = (y * SCALE_Y) + sy;
                    
                    if (targetX >= 0 && targetX < LOGIC_WIDTH && targetY >= 0 && targetY < LOGIC_HEIGHT) {
                        data[targetY * LOGIC_WIDTH + targetX] = 0;
                    }
                }
            }
        }
    }
}

let patternIdx = 0;
function cyclePattern(data) {
    const patterns = ['STRIPES_V', 'STRIPES_H', 'CHECKER', 'NOISE', 'CLEAR'];
    const current = patterns[patternIdx % patterns.length];
    
    // Update Button Text
    document.getElementById('btnB_Pattern').innerText = `PATTERN: ${current}`;
    patternIdx++;

    for(let i=0; i<data.length; i++) {
        const y = Math.floor(i / LOGIC_WIDTH);
        const x = i % LOGIC_WIDTH;
        
        switch (current) {
            case 'STRIPES_V': 
                data[i] = x % 2; 
                break;
            case 'STRIPES_H': 
                data[i] = y % 2; 
                break;
            case 'CHECKER': 
                data[i] = (x % 2) ^ (y % 2); 
                break;
            case 'NOISE': 
                data[i] = Math.random() > 0.5 ? 1 : 0; 
                break;
            case 'CLEAR':
                data[i] = 0;
                break;
        }
    }
}

// Start
init();
