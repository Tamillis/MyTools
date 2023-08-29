
class TableMaker {

    static generateTableHead(table, data) {
        let thead = table.createTHead();
        let row = thead.insertRow();
        for (let key of data) {
            let th = document.createElement("th");
            let text = document.createTextNode(key);
            th.appendChild(text);
            row.appendChild(th);
        }
    }
    
    static generateTable(table, data) {
        for (let element of data) {
            let row = table.insertRow();
            for (let key in element) {
                let cell = row.insertCell();
                let text = document.createTextNode(element[key]);
                cell.appendChild(text);
            }
        }
    }

    static fillTable(data, tableAttributes) {
        let table = document.getElementById(tableAttributes.id);
        if(!table) console.error("No table found");
        let classes = tableAttributes.classes == null ? [] : tableAttributes.classes;
        for(let style of classes) table.classList.add(style);
        let headings = Object.keys(data[0]);
        TableMaker.generateTableHead(table, headings, classes);
        TableMaker.generateTable(table, data, classes);
    }

    static makeTable(data, parentSelector, tableAttributes = { id: "", classes: []} ) {
        let table = document.createElement("table");
        if(!tableAttributes || !tableAttributes.id || tableAttributes.id == "") tableAttributes.id = "t" + Date.now();
        table.id = tableAttributes.id;
        document.querySelector(parentSelector).appendChild(table);

        TableMaker.fillTable(data, tableAttributes);
    }
}
