//File for classes used in main.js to represent the model and bridge the model to the visual functionality in p5canvas.js

//memory block
class MemoryBlock {
    constructor(address) {
        this.label = "";
        this.data = "";
        this.type = "";
        this.bytes = 0;
        this.arrayLength = 0;
        this.address = address;
    };
}

// for representing heap memory on the visual grid
class GridBlock {
    constructor(address) {
        //grid position in canvas
        this.x = Math.floor(int(address) % DIMS);
        this.y = Math.floor(int(address) / DIMS);
        this.col = color(255, 255, 255);
        this.occupied = false;
        this.show = false;
        this.underMouse = false;
        this.block = new MemoryBlock(address);
    };

    draw() {
        fill(this.col);
        rect(this.x * SCALE, this.y * SCALE, SCALE, SCALE);
    }

    drawText() {
        fill(0, 0, 0);
        if (this.underMouse) {
            textAlign(CENTER, CENTER);
            text(`*${this.block.address}`, (this.x + 0.5) * SCALE, (this.y + 0.5) * SCALE);
        }
        else if (this.show) {
            textAlign(CENTER, CENTER);
            text(this.block.data, (this.x + 0.5) * SCALE, (this.y + 0.5) * SCALE);
        }
    }
}