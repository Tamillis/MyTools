
class TableMaker {
    static tableAttributeDefaults = {
        id: "t" + Date.now(), 
        classes: {
            table : ["table", "table-striped", "table-bordered"],
            th : ["h5"],
            td : ["text-body-secondary"],
            button: ["btn"]
        }, 
        parentSelector: "body",
        sorting : false
    };

    //courtesy of https://stackoverflow.com/questions/21147832/convert-camel-case-to-human-readable-string
    static toCapitalizedWords(name) {
        var words = name.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
        return words.map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
    }

    static addStylesToElement(el, styles) {
        if(Array.isArray(styles)) for(let style of styles) el.classList.add(style);
    }

    static generateTableHead(table, data, classes) {
        let thead = table.createTHead();
        let row = thead.insertRow();
        for (let key of data) {
            let th = document.createElement("th");
            TableMaker.addStylesToElement(th, classes.th);
            th.value = key;
            let text = document.createTextNode(TableMaker.toCapitalizedWords(key));
            th.appendChild(text);
            row.appendChild(th);
        }
        return thead;
    }

    static addSorting(head, sortings, classes, data) {
        // thead > tr > th
        for(let th of head.childNodes[0].childNodes) {
            console.log(th, th.value, sortings)
            if(sortings.includes(th.value)) {
                let btn = document.createElement("button");
                btn.innerText = "←";
                btn.onclick = () => alert("TODO, the tricky bit");
                TableMaker.addStylesToElement(btn, classes.btn);
                th.appendChild(btn);
            }
        }
    }

    static generateTableBody(table, tableData, classes) {
        let tbody = table.createTBody();
        TableMaker.addStylesToElement(tbody, classes.tbody);
        for (let rowData of tableData) {
            TableMaker.generateRow(tbody, rowData, classes.td);
        }
        return tbody;
    }

    static generateRow(tbody, data, classes) {
        let tr = tbody.insertRow();
        
        for (let key in data) {
            let td = tr.insertCell();
            TableMaker.addStylesToElement(td, classes.td);

            //FORMAT DATA
            let content = data[key];
            if(content instanceof Date) content = content.toLocaleDateString();
            
            let text = document.createTextNode(content);
            td.appendChild(text);
        }
        return tr;
    }

    static fillTable(table, data, tableAttributes) {

        let headings = Object.keys(data[0]);
        let head = TableMaker.generateTableHead(table, headings, tableAttributes.classes);
        if(tableAttributes.sorting) TableMaker.addSorting(head, tableAttributes.sorting, tableAttributes.classes, data);

        TableMaker.generateTableBody(table, data, tableAttributes.classes);

        return table;
    }

    /// Main entry point, data must be valid and well-formed JSON
    static makeTable(data, tableAttributes = {}) {
        tableAttributes = {
            ...TableMaker.tableAttributeDefaults,
            ...tableAttributes
        };

        tableAttributes.classes = {
            ...TableMaker.tableAttributeDefaults.classes,
            ...tableAttributes.classes
        }

        let table = document.getElementById(tableAttributes.id);
        if (!table) {
            table = document.createElement("table");
            table.id = tableAttributes.id;
        }

        for(let style of tableAttributes.classes.table) table.classList.add(style);

        document.querySelector(tableAttributes.parentSelector).appendChild(table);

        return TableMaker.fillTable(table, data, tableAttributes);
    }
}
