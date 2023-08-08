// File for js concerning function of interpretter and model

/*
TODO
Refactoring:
Create Heap and Stack Manager classes and try to change this file of a bajillion functions

Desired Features:
create expression computation so that x = y + 2 can be computed
have a pen tool, switch tools button
update model for 4 byte ints, 2 byte chars, 4 byte memory addresses
*/

const stack = [];

//keywords for the interpreter
const keywords = ["print", "int", "float", "double", "char", "bool", "ref", "string", "int[]", "string[]", "type", "var"];

function interpret(event) {
    //interpret is run every key press, but only executes logic on "Enter"
    if (event.key !== "Enter") return;

    let commands = processInput(document.getElementById('interpreter').value);

    if (commands.length == 0) printToConsole("...");
    // variable decleration (type variable = value)
    else if (commandIsVariableDecleration(commands)) declareVariable(commands);
    // variable assignment (variable = value)
    else if (commandIsAssignVariable(commands)) assignVariable(commands);
    // numeric variable increment / decrement (numeric++ || numeric--)
    else if (commandIsIncrOrDecrOp(commands)) incrDecrNumeric(commands);
    else if (commands[0] == "print") printToConsole(commands[1])
    else if (commands[0] == "type") printToConsole(commands[1], printType = true)
    else printToConsole("Invalid command");
}

function processInput(input) {
    if (input == "") return [];

    // ignoredTokens ; ( ) " { }
    // this allows for inputs from various langauges to still be parsable.
    input = input.replace(/\(|\)|\;|\"|\{|\}/g, " ");
    let commands = input.split(" ").filter(entry => entry !== "");

    //get rid of white space from interpretter input after "=" for variable decleration or assignment
    //so that array inputs can be "1, 2, 3" not just "1,2,3"
    if (commands[1] == "=") {
        for (let i = 3; i < commands.length; i++) {
            commands[2] += commands[i];
        }
    }
    if (keywords.includes(commands[0]) && commands[2] == "=") {
        for (let i = 4; i < commands.length; i++) {
            commands[3] += commands[i];
        }
    }

    //convert array labels that use an index with a label into that label's value instead (i.e. from nums[x] where x = 2 to nums[2])
    for (let i = 0; i < commands.length; i++) {
        commands[i] = convertLabelIndexesToValues(commands[i]);
        if (commands[i] == null) {
            alert(`${commands} contains a null`);
        }
    }

    return commands;
}

function declareVariable(commands) {
    let label = commands[1];

    //check label doesn't already exist in stack
    if (labelExists(label)) {
        alert(`Label "${label}" is already in use.`);
        return;
    }

    let type = commands[0];
    let data = commands[3];

    // the var keyword only infers type, so it needs to be processed
    if (type == "var") {
        if (labelExists(data)) {
            let block = getBlockAtLabel(data);
            type = block.type;
        }
        else type = inferTypeFromData(commands[3]);
    }

    //the data will be added as a memory block to stack,
    //with the block being built up depending on the data 
    //such as to pointing to new blocks added to the heap
    let block = new MemoryBlock(getNextStackAddress());
    block.label = label;
    block.type = type;
    block.data = data;
    block.bytes = 1;    //default

    //check data is label, if so get data at that label instead
    if (labelExists(data)) {
        let otherBlock = getBlockAtLabel(data);
        block.data = otherBlock.data;
        block.type = otherBlock.type;

        //if array type of block is (arrayLength > 0) push to stack a block
        //whose data is the same as otherBlock, but has their own stack address (so not a pure copy of otherBlock)
        if (otherBlock.arrayLength > 0) {
            block.arrayLength = otherBlock.arrayLength;
            stack.push(block);
            updateStack();
            return;
        }
    }

    //check data is of type type
    if (block.type !== inferTypeFromData(block.data) && !isArrayTypeWithRefData(block.type, block.data)) {
        alert(`${block.data} is not valid for type ${block.type}`);
        return;
    }

    //check type to modify raw data into actual data (including correct type),
    //to determine number of bytes, 
    //and other actions such as handling inner data of arrays
    switch (type) {
        case "int":
            block.bytes = 2;
            break;
        case "double":
            block.bytes = 4;
            break;
        case "char":
            break;
        case "bool":
            block.data = block.data.toLowerCase() == "true";
            break;
        case "ref":
            //needs to match an existing address
            let existingAddresses = getAddresses();
            //trim leading * from data
            data = data.slice(1);
            if (!existingAddresses.includes(int(data))) {
                alert("Reference types must have data that points to an occupied address");
                return;
            }
            block.data = "*" + data;
            break;

        // should short circuit the need for any other array index notation handling
        case "string":  //AKA char[]
            let heapAddress = getNextHeapAddress(data.length);
            addStringToHeap(data, label);
            //take note of char array length
            block.arrayLength = data.length;

            //and only return the address to go to the stack
            block.data = "*" + heapAddress;
            break;
        case "int[]":
            let intarray = data.split(',');

            //determine addresses, add data to heap
            let topAddress = "*" + getNextHeapAddress(2);
            intarray.forEach((int, i) => {
                let col = getRandomColor();
                for (let n = 0; n < 2; n++) {
                    let newBlock = new GridBlock(getNextHeapAddress(2));
                    newBlock.block.label = `${label}[${i}]`;
                    newBlock.block.data = int;
                    newBlock.block.type = "int";
                    newBlock.block.bytes = 2;
                    newBlock.col = col;
                    newBlock.block.arrayLength = 0;
                    newBlock.occupied = true;
                    newBlock.show = n === 0;
                    addBlockToHeapMemory(newBlock);
                }
            });

            //note array length
            block.arrayLength = intarray.length;

            //push addresses to heap
            block.data = topAddress;
            break;
        case "string[]":
            let strarray = data.split(',');

            //foreach str, generate an address and make an array of those addresses, 
            //adding each str to the heap at that address
            let addresses = strarray.map((str, i) => {
                let address = getNextHeapAddress(str.length);
                addStringToHeap(str, `${label}[${i}]`);
                return "*" + address;
            });

            //add array of addresses to heap
            let col = getRandomColor();
            let addressArrayAddress = getNextHeapAddress(addresses.length);

            addresses.forEach((ad, i) => {
                let newBlock = new GridBlock(getNextHeapAddress(1));
                newBlock.block.label = `${label}[${i}]`;
                newBlock.block.data = ad;
                newBlock.block.type = "string";
                newBlock.block.bytes = 1;
                newBlock.col = col;
                newBlock.block.arrayLength = strarray[i].length;
                newBlock.occupied = true;
                newBlock.show = true;
                addBlockToHeapMemory(newBlock);
            });

            //note array length
            block.arrayLength = addresses.length;

            //return a single address pointing to the array of addresses
            block.data = "*" + addressArrayAddress;
            break;
        default:
            alert("Error");
            return;
    }

    //finally add the block to stack
    stack.push(block);
    updateStack();
}

function commandIsVariableDecleration(commands) {
    return keywords.includes(commands[0])
        && commands[0] !== "print"
        && commands[0] !== "type"
        && commands[2] == "=";
}

function commandIsAssignVariable(commands) {
    if (commands.length < 3 || commands[1] !== "=") return false;

    if (!labelExists(commands[0])) {
        alert(`Cannot assign to value ${commands[0]}`);
        return false;
    }
    return true;
}

function commandIsIncrOrDecrOp(commands) {
    return commands.length == 1
        && (commands[0].substring(commands[0].length - 2) == "++"
            || commands[0].substring(commands[0].length - 2) == "--")
}

function assignVariable(commands) {
    //assignment operation x = y

    //get x block from label (already confirmed to be a label)
    let block = getBlockAtLabel(commands[0]);

    //get data from y
    let data = commands[2];

    //check if y is a label, if so get data from there
    if (labelExists(commands[2])) {
        let otherBlock = getBlockAtLabel(commands[2]);
        if (block.type !== otherBlock.type) {
            alert(`${otherBlock.type} ${otherBlock.data} does not match type ${block.type}`);
            return;
        }
        //only the stack block needs to be updated
        block.data = otherBlock.data;
        block.arrayLength = otherBlock.arrayLength;
    }
    else {
        let dataType = inferTypeFromData(data);
        if (block.type !== dataType) {
            alert(`${dataType} ${data} does not match type ${block.type}`);
            return;
        }
        assignDataToMemory(block, data);
    }

    updateStack();
}

function assignDataToMemory(block, data) {
    //data should be a string
    // depending on type assign value to the correct block, update stack & heap
    switch (block.type) {
        case ("string"):
            //push to heap new string data
            let heapAddress = getNextHeapAddress(data.length);
            addStringToHeap(data, block.label);
            //take note of char array length
            block.arrayLength = data.length;

            //update commands[0]'s block with the new address
            block.data = "*" + heapAddress;
            break;
        case ("int[]"):
            //push to heap new int array
            let intarray = data.split(',');

            //determine addresses, add data to heap
            let topAddress = "*" + getNextHeapAddress(2);
            intarray.forEach((int, i) => {
                let col = getRandomColor();
                for (let n = 0; n < 2; n++) {
                    let newBlock = new GridBlock(getNextHeapAddress(2));
                    newBlock.block.label = `${block.label}[${i}]`;
                    newBlock.block.data = int;
                    newBlock.block.type = "int";
                    newBlock.block.bytes = 2;
                    newBlock.block.arrayLength = 0;
                    newBlock.occupied = true;
                    newBlock.col = col;
                    newBlock.show = n === 0;
                    addBlockToHeapMemory(newBlock);
                }
            });

            //note array length
            block.arrayLength = intarray.length;

            //update data in commands[0]'s block with the new address
            block.data = topAddress;
            break;
        case ("string[]"):
            //push to heap new string array
            let strarray = data.split(',');
            let label = block.label;
            //foreach str, generate an address and make an array of those addresses, 
            //adding each str to the heap at that address
            let addresses = strarray.map((str, i) => {
                let address = getNextHeapAddress(str.length);
                addStringToHeap(str, `${label}[${i}]`);
                return "*" + address;
            });

            //add array of addresses to heap
            let col = getRandomColor();
            let addressArrayAddress = getNextHeapAddress(addresses.length);

            addresses.forEach((ad, i) => {
                let newBlock = new GridBlock(getNextHeapAddress(1));
                newBlock.block.label = `${label}[${i}]`;
                newBlock.block.data = ad;
                newBlock.block.type = "string";
                newBlock.block.bytes = 1;
                newBlock.col = col;
                newBlock.block.arrayLength = strarray[i].length;
                newBlock.occupied = true;
                newBlock.show = true;
                addBlockToHeapMemory(newBlock);
            });

            //note array length
            block.arrayLength = addresses.length;

            //update data in commands[0]'s block with the new address to the address array
            block.data = "*" + addressArrayAddress;
            break;
        default:
            //all value types are a simple matter of reassignment
            block.data = data;
            break;
    }
}

function incrDecrNumeric(commands) {
    //increment & decrement operations
    let op = commands[0].substring(commands[0].length - 2);
    commands[0] = commands[0].substring(0, commands[0].length - 2);

    if (!labelExists(commands[0])) {
        alert(`Invalid variable, ${commands[0]}, detected`);
        return;
    }

    let block = getBlockAtLabel(commands[0]);

    if (inferTypeFromData(block.data) == "int") {
        if (op == "++") block.data++;
        else block.data--;
    } else {
        alert(`Invalid type, must be of type 'int' to do ${op} operation`);
        return;
    }

    updateStack();
}

function printToConsole(input, printType = false) {
    document.getElementById('console').innerHTML = getConsoleMessage(input, printType);
}

function getConsoleMessage(input, printType) {
    let data = input;   //store input for later message

    //check input is reference, find data at that reference
    if (data.toString().startsWith("*")) data = getBlockAtAddress(data).data;

    //data could be a label or raw text. Raw text can just be output.
    if (!labelExists(input)) {
        if (printType) return data + ": String";
        return data;
    }
    //else data is label so
    let label = data;

    let stringifiedData = convertLabelToString(label);

    let msg = input + ": ";

    if (printType) {
        msg += " " + inferTypeFromData(stringifiedData);
    } else msg += " " + stringifiedData;

    return msg;
}

function convertLabelToString(label) {
    let block = getBlockAtLabel(label);

    //if block is an array get that data, 
    //else follow the address chain and get the data of the final block in the chain
    if (block.arrayLength > 0) {
        let blocks = getArrayOfBlocksFromPointerBlock(block);

        //strings want to be joined from char[]. string[] is a double level char array
        if (block.type == "string") {
            return blocks.map(block => block.data).join("");
        }
        else if (block.type == "string[]") {
            //for each address in data array, get string it points to
            return blocks.map(block => {
                let string = getStringFromPointerBlock(block);
                return string;
            });
        }
        else return blocks.map(block => block.data);
    }
    else return getBlockAtEndOfPointerBlockChain(block).data;
}

function convertLabelIndexesToValues(term) {
    //if no brackets then not array type, no conversion needed
    if (!(term.includes("[") || term.includes("]"))) return term;

    //check the string between first [ and first]
    let openBracketPosition = term.indexOf("[");
    let closedBracketPosition = term.indexOf("]");

    while (openBracketPosition !== -1) {
        //replace the label at the stubstring between [ and ] with that label's data
        let label = term.substring(openBracketPosition + 1, closedBracketPosition);

        //ignore empty brackets and integer values
        if (label == "" || !isNaN(label)) break;

        //check label exists
        if (!labelExists(label)) {
            alert(`${label} undefined`);
            return undefined;
        }

        let block = getBlockAtLabel(label);
        //check if block is an int, otherwise it can't be used as an index
        if (inferTypeFromData(block.data) !== "int") {
            alert(`Non-integer type in ${label} cannot be used as indexes.`);
            return undefined;
        }

        //replace label with block data
        term = term.replace(label, block.data);

        //check there are no more labels to be replaced
        openBracketPosition = term.indexOf("[", openBracketPosition + 1);
        closedBracketPosition = term.indexOf("[", closedBracketPosition + 1);
    }
    return term;
}

function getStringFromPointerBlock(block) {
    return getArrayOfBlocksFromPointerBlock(block)
        .map(b => b.data)
        .join("");
}

function getArrayOfBlocksFromPointerBlock(block) {
    //copy value to not propagate side effects
    let arrayLength = block.arrayLength;
    //check if block is address pointer, to get the array's heap start point
    if (block.data.toString().startsWith("*")) {
        block = getBlockAtAddress(block.data);
    }
    //increase arrayLength to cover all blocks of that array
    arrayLength *= block.bytes;
    //avoid double counting by setting step size to block.bytes
    let blocks = [];
    for (let i = 0; i < arrayLength; i += block.bytes) {
        let { x, y } = convert1Dto2D(Number(block.address) + i);
        blocks.push(grid[x][y].block);
    }
    return blocks;
}

function inferTypeFromData(data) {
    //I am so sorry for this nested mess.
    data = data.toString();
    if (data.trim() === "") return "string";
    if (isNaN(Number(data))) {
        if (data.length == 1) {
            return "char";
        } else if (data.toLowerCase() === "true" || data.toLowerCase() === "false") {
            return "bool";
        } else if (data.startsWith("*") && !isNaN(Number(data.slice(1)))) {
            return "ref";
        } else if (data.includes(",")) {
            //arrays
            data = data.split(",");
            for (let i = 0; i < data.length; i++) {
                if (isNaN(Number(data[i]))) return "string[]";
            }
            return "int[]"
        } else return "string";
    } else if (data.includes(".") && !isNaN(Number(data))) {
        return "double";
    }
    else if (!isNaN(Number(data))) {
        return "int";
    }
}

function isArrayTypeWithRefData(type, data) {
    return (type == "string" || type == "int[]" || type == "string[]") && inferTypeFromData(data) == "ref";
}

function addStringToHeap(string, label) {
    let col = getRandomColor();
    //add a char for each char of string to heap
    for (let i = 0; i < string.length; i++) {
        let heapAddress = getNextHeapAddress(1);

        //make a new MemoryBlock at this level to pass directly into addToHeapMemory
        let newBlock = new GridBlock(heapAddress);
        newBlock.block.label = `${label}[${i}]`;
        newBlock.block.data = string[i];
        newBlock.block.type = "char";
        newBlock.block.bytes = 1;
        newBlock.col = col;
        newBlock.occupied = true;
        newBlock.show = true;

        addBlockToHeapMemory(newBlock);
    }
}

function getLabels() {
    let labels = [];
    stack.forEach(block => labels.push(block.label));
    return labels;
}

function getAddresses() {
    let addresses = [];
    for (let j = 0; j < DIMS; j++) {
        for (let i = 0; i < DIMS; i++) {
            if (grid[i][j].occupied) addresses.push(grid[i][j].block.address);
        }
    }
    stack.forEach(block => addresses.push(block.address));

    addresses = addresses.filter((v, i, a) => a.indexOf(v) === i);
    return addresses;
}

function getNextStackAddress() {
    let address = DIMS * DIMS;
    if (stack.length == 0) return address;
    stack.forEach(block => address += block.bytes);
    return address;
}

function getNextHeapAddress(bytes) {
    for (let i = 0; i < DIMS * DIMS; i++) {
        let { x, y } = convert1Dto2D(i);
        if (!grid[x][y].occupied) {
            let ok = true;
            for (let n = 1; n < bytes; n++) {
                let nextAddress = convert2Dto1D(x, y) + n;
                let coords = convert1Dto2D(nextAddress);
                if (nextAddress >= DIMS * DIMS || grid[coords.x][coords.y].occupied) {
                    ok = false;
                    break;
                }
            }
            if (ok) return i;
        }
    }

    // can't have a negative address
    alert("No more room on the heap!");
    throw new Error("No more room on the heap");
}

function addBlockToHeapMemory(gridBlock) {
    let { x, y } = convert1Dto2D(gridBlock.block.address);
    grid[x][y] = gridBlock;
}

function convert1Dto2D(val) {
    return { x: Math.floor(val % DIMS), y: Math.floor(val / DIMS) };
}

function convert2Dto1D(x, y) {
    return x + y * DIMS;
}

function getBlockAtLabel(labelInput) {
    //a label doesn't included any array index notation, but that information is necessary. Strip but store it.
    let { label, indexes } = extractIndex(labelInput);

    //labels for value types hold the block directly on the stack (one label, one block), so just return that block
    let block = getStackBlockFromLabel(label);
    if (!String(block.data).startsWith("*")) return block;

    //get block at index if index present
    //for now hard coding indexes two deep only
    let blocks = getArrayOfBlocksFromPointerBlock(block);

    if (indexes.length == 1 && indexes[0] < blocks.length) block = blocks[indexes[0]];
    else if (indexes.length == 2 && indexes[1] < blocks[indexes[0]].arrayLength) block = getArrayOfBlocksFromPointerBlock(blocks[indexes[0]])[indexes[1]];

    return block;
}

function getStackBlockFromLabel(label) {
    //the stack holds all variable names, i.e. labels
    for (let i = 0; i < stack.length; i++) if (stack[i].label === label) return stack[i];

    alert(`${label} couldn't be identified on the stack`);
    return undefined;
}

function extractIndex(label) {
    //extract the index that is part of a label returning an object which is {label: label without index, indexes: array of index values}

    if (!(label.includes("[") && label.includes("]"))) {
        return { label: label, indexes: [] };
    }
    //check the string between first [ and first ]
    let openBracketPosition = label.indexOf("[");
    let closedBracketPosition = label.indexOf("]");
    let trimmedLabel = trimIndexFromLabel(label);

    let indexes = [];
    while (openBracketPosition !== -1) {
        let index = label.substring(openBracketPosition + 1, closedBracketPosition);

        indexes.push(Number(index));

        //check for next index brackets left
        openBracketPosition = label.indexOf("[", openBracketPosition + 1);
        closedBracketPosition = label.indexOf("[", closedBracketPosition + 1);
    }

    //return label trimmed of index
    return { label: trimmedLabel, indexes: indexes };
}

function trimIndexFromLabel(label) {
    if (label.indexOf("[") == -1) return label;
    return label.substring(0, label.indexOf("["));
}

function labelExists(label) {
    return getLabels().includes(trimIndexFromLabel(label));
}

function getBlockAtAddress(addressString) {
    //trim leading * from string in order to convert to Number
    let address = Number(addressString.slice(1));

    let block;
    if (address >= 0 && address < 100) block = grid[convert1Dto2D(address).x][convert1Dto2D(address).y].block;
    stack.forEach(b => { if (b.address == address) block = b });

    if (block === undefined) alert(`Block not found at address ${addressString}`);

    return block;
}

function getBlockAtEndOfPointerBlockChain(block) {
    if (block.data.toString().startsWith("*")) {
        block = getBlockAtAddress(block.data);
        block = getBlockAtEndOfPointerBlockChain(block);
    }
    return block;
}

function getDataFromAddressChain(data) {
    data = data.split(",");
    let existingAddresses = getAddresses();
    let newData = [];
    data.forEach(datum => {
        if (datum.startsWith("*")) {
            //needs to match an existing address

            //trim leading * from data
            datum = datum.slice(1);
            if (!existingAddresses.includes(int(datum))) {
                alert("References must point to an occupied address");
                return;
            }
            datum = "*" + datum;
            datum = getBlockAtAddress(datum).data;
            datum = getDataFromAddressChain(datum);
        }
        newData.push(datum);
    })

    console.log("getDataFromAddressChain");
    console.log(newData);
    return newData.toString();
}

function compactMemory() {
    //mark all grid data as "unreferenced"

    //start in stack

    //follow each reference piece of data, mark referenced block as referenced = true.

    //if that block holds reference data, follow it and so on

    //until end of stack

    //remove all unreferenced blocks from heap

    //copy heap data to temp store

    //clear heap

    //go through each occupied heap address and add it to nextClearHeapAddress on new grid, updating pointers
}

function showHelp() {
    alert(`
    Interpreter:
    Assignment is a matter of using two existing labels and the = operator:
    label = value (or other label)

    Arrays elements can be accessed using [] notation:
    print arr[i] will show the value of element i.

    Keywords: ${keywords.map(token => " " + token + " ")}

    Variable decleration must follow the pattern:
    [type] [label] = [value]

    Print prints X Y Z to the console, retrieving values if labels are provided:
    print X Y Z

    Type informs the type of the value provided, or of the value of the label provided:
    type X Y Z

    *Note: strings cannot contain whitespace, use _ or other instead.
    `)
}