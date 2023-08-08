//file for js concerning visuals, canvases and HTML

const DIMS = 10;
const SCALE = 40;
const grid = [];
let drawing = false;

function setup() {
    let canvas = createCanvas(DIMS * SCALE, DIMS * SCALE);
    canvas.parent('canvas');
    background(0);

    textSize(14);
    resetGrid();
}

function resetGrid() {
    for (let i = 0; i < DIMS; i++) {
        grid[i] = [];
        for (let j = 0; j < DIMS; j++) {
            grid[i][j] = new GridBlock(i + j * DIMS);
        }
    }
}

function draw() {
    drawGrid();
    drawText();
}

function drawGrid() {
    for (let j = 0; j < DIMS; j++) {
        for (let i = 0; i < DIMS; i++) {
            grid[i][j].draw();
        }
    }
}

function drawText() {
    for (let j = 0; j < DIMS; j++) {
        for (let i = 0; i < DIMS; i++) {
            grid[i][j].underMouse = isMouseOverGridPoint(i, j);
            grid[i][j].drawText();
        }
    }
}

function getRandomColor() {
    let options = [30, 62, 96, 128, 160, 192, 224];
    return color(random(options), random(options), random(options));
}

function isMouseOverGridPoint(i, j) {
    return getMouseGridPoint().i == i && getMouseGridPoint().j == j;
}

function getMouseGridPoint() {
    return { i: Math.floor(mouseX / SCALE), j: Math.floor(mouseY / SCALE) };
}

function updateStack() {
    //rerender stack
    document.getElementById('stack').remove();

    let newStack = document.createElement("div");
    newStack.id = "stack";
    newStack.className = "flex-v-rev";
    document.getElementById("stack-container").appendChild(newStack);

    stack.forEach(block => {
        //add to stack
        //create a div with that id to hold the collection of elements
        addToHTMLStack(block.label, block.data, block.address, block.bytes);
    })
}

function addToHTMLStack(label, data, address, bytes) {
    let newDiv = document.createElement("div");
    newDiv.id = address;
    newDiv.className = "datablock";

    //append that div to the stack div in the DOM
    document.getElementById('stack').appendChild(newDiv);

    //create a descriptive <p/> from form.data.value
    const p = document.createElement("p");
    const pText = document.createTextNode(`${label} : ${data} [*${address} ${bytes}B]`);
    p.appendChild(pText);
    p.style.display = "inline";

    //append it to that div
    newDiv.appendChild(p);

    //create a kill me btn
    const btn = document.createElement("button");
    btn.type = "button";
    btn.onclick = () => deleteData(address);
    const btnText = document.createTextNode("X");
    btn.appendChild(btnText);
    btn.className = "btn";

    //append btn to that div
    newDiv.appendChild(btn);
}

function clearMemory() {
    //clear heap
    resetGrid();
    //clear stack
    let ids = [];
    document.getElementById('stack').childNodes
        .forEach(child => ids.push(child.id));

    ids.forEach(id => deleteData(id));
}

function deleteData(id) {
    document.getElementById(id).remove();
    //remove from memory model
    //id is memory address so that should be ok

    //from stack
    for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].address === id) stack.splice(i, 1);
    }
}

//closure of another instance of P5JS to have arrow drawing capability across the screen
const arrowCanvas = (p) => {
    class Arrow {
        constructor(x, y) {
            this.base = p.createVector(x, y);
            this.target = p.createVector(p.mouseX, p.mouseY);
            this.col = getRandomColor();
            this.width = 4;
            this.active = false;
        }

        drawArrow() {
            p.push();
            p.stroke(this.col);
            if(this.isUnderMouse() && !drawing) p.stroke(p.color(this.col._getRed(), this.col._getGreen(), this.col._getBlue(), 255/2));
            p.strokeWeight(this.width);
            p.fill(this.col);
            p.line(this.base.x, this.base.y, this.target.x, this.target.y);
            p.translate(this.target.x, this.target.y);
            p.rotate(p5.Vector.sub(this.target, this.base).heading());
            p.translate(-this.width * 3, 0);
            p.triangle(0, this.width * 3 / 2, 0, -this.width * 3 / 2, this.width * 3, 0);
            p.pop();
        }

        isUnderMouse() {
            let length = p.dist(this.base.x, this.base.y, this.target.x, this.target.y);
            let d1 = p.dist(p.mouseX, p.mouseY, this.base.x, this.base.y);
            let d2 = p.dist(p.mouseX, p.mouseY, this.target.x, this.target.y);
            return (d1+d2 > length - 1.5 && d1 + d2 < length + 1.5);
        }
    }

    let bg = p.color(0, 0, 0, 0);
    let drawNext = true;
    let hidden = false;
    let deleting = false;
    let activeArrow;
    let arrows = [];

    p.setup = () => {
        const container = document.getElementById('arrows');
        p.createCanvas(container.offsetWidth, container.offsetHeight);
    }

    p.draw = () => {
        p.clear();
        p.background(bg);
        //draw arrows
        if (!hidden) {
            arrows.forEach(arrow => {
                if (arrow.active) {
                    arrow.target.x = p.mouseX;
                    arrow.target.y = p.mouseY;
                }
                arrow.drawArrow();
            });
        }

        //draw indicator
        if (drawing && !mouseIsAboveInterface()) {
            p.noStroke();
            p.fill(255, 0, 0);
            p.circle(p.mouseX, p.mouseY, 10);
        }
    }

    p.mousePressed = () => {
        if (mouseIsAboveInterface()) return;
        if(deleting) deleteArrowUnderMouse();
        if (drawing) {
            if (drawNext) activeArrow = startArrow();
            else finishArrow(activeArrow);
        }
    }

    p.windowResized = () => {
        const container = document.getElementById('arrows')
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }

    startArrow = () => {
        let arrow = new Arrow(p.mouseX, p.mouseY);
        arrow.active = true;
        arrows.push(arrow);
        drawNext = false;
        return arrow;
    }

    finishArrow = (arrow) => {
        arrow.active = false;
        arrow.target.x = p.mouseX;
        arrow.target.y = p.mouseY;
        drawNext = true;
    }

    clearArrows = () => {
        arrows = [];
    }

    undoArrow = () => {
        if (!drawing) arrows.pop();
    }

    hideArrows = () => {
        hidden = !hidden;

        if(hidden) document.getElementById("hideBtn").innerHTML = "Show Arrows";
        else document.getElementById("hideBtn").innerHTML = "Hide Arrows";
    }

    startDeletingArrow = () => {
        deleting = true;
        document.getElementById("deleteBtn").style.backgroundColor = "red";
    }

    deleteArrowUnderMouse = () => {
        let newArrowArray = [];
        arrows.forEach(arrow => {if(!arrow.isUnderMouse()) newArrowArray.push(arrow)});
        arrows = newArrowArray;
        deleting = false;
        document.getElementById("deleteBtn").style.backgroundColor = null;
    }

    mouseIsAboveInterface = () => {
        const interpreter = document.getElementById("interpreter-container").getBoundingClientRect();
        const console = document.getElementById("console-container").getBoundingClientRect();
        const menu = document.getElementById("menu").getBoundingClientRect();

        return (
            p.mouseY > console.top - 10 &&
            p.mouseY < menu.bottom + 10 &&
            p.mouseX > interpreter.left &&
            p.mouseX < console.right);
    }
}

//create arrowCanvas template into a div that sits ontop of the whole DOM
let arrows = new p5(arrowCanvas, "arrows");

//html and arrow canvas interaction
toggleDrawing = () => {
    drawing = !drawing;

    let btn = document.getElementById("drawArrowBtn");
    if (drawing) btn.innerHTML = "Stop Drawing";
    else btn.innerHTML = "Start Drawing";
}