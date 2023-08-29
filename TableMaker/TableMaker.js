
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

    static fillTable(tableId, data) {
        let table = document.querySelector(tableId);
        if(!table) return;
        let headings = Object.keys(data[0]);
        TableMaker.generateTableHead(table, headings);
        TableMaker.generateTable(table, data);
    }
}
