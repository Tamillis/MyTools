
class TableMaker {
    constructor(data, tableAttributes = {}) {
        //Defaults
        this.tableAttributeDefaults = {
            id: "t" + Date.now(),
            classes: {
                table: ["table", "table-striped", "table-bordered"],
                th: ["h5", "align-text-bottom"],
                td: ["text-body-secondary"],
                button: ["btn"]
            },
            parentSelector: "body",
            sorting: false,
            sortingOrientation: {},
            currency: false
        };

        //Table Data
        this.data = data;
        this.tableAttributes = {
            ...this.tableAttributeDefaults,
            ...tableAttributes
        };

        this.tableAttributes.classes = {
            ...this.tableAttributeDefaults.classes,
            ...tableAttributes.classes
        }

        this.makeTable();
    }

    //courtesy of https://stackoverflow.com/questions/21147832/convert-camel-case-to-human-readable-string
    static toCapitalizedWords(name) {
        var words = name.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
        return words.map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(" ") + " ";
    }

    //courtesy of https://stackoverflow.com/questions/16242449/regex-currency-validation
    static isPoundCurrency(data) {
        return /(?=.*?\d)^£?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/.test(data);
    }

    static addStylesToElement(el, styles) {
        if (Array.isArray(styles)) for (let style of styles) el.classList.add(style);
    }

    addSortBtn(prop) {
        let compare = (a, b) => {
            if (a == null || b == null) return 1;
            if (typeof a == "number" && typeof b == "number") return a - b;
            if (typeof a == "string" && typeof b == "string") return a.localeCompare(b);
            if (a instanceof Date && b instanceof Date) return a - b;
            return 1;
        };

        let btn = document.createElement("button");
        btn.innerText = this.tableAttributes.sortingOrientation[prop] == "asc" ? "↑" : "↓";
        btn.onclick = () => {
            let btnKind = this.tableAttributes.sortingOrientation[prop];
            this.tableAttributes.sortingOrientation[prop] = btnKind == "asc" ? "desc" : "asc";

            this.data.sort((prev, curr) => {
                let comparison = compare(prev[prop], curr[prop]);
                return btnKind == "asc" ? -1 * comparison : comparison;
            });
            this.makeTable();
        };
        return btn;
    }

    generateTableHead() {
        let headings = Object.keys(this.data[0]);
        let thead = this.table.createTHead();
        let row = thead.insertRow();
        for (let key of headings) {
            let th = document.createElement("th");
            TableMaker.addStylesToElement(th, this.tableAttributes.classes.th);
            th.value = key;
            let text = document.createTextNode(TableMaker.toCapitalizedWords(key));
            th.appendChild(text);
            row.appendChild(th);
        }
        return thead;
    }

    addSorting(head) {
        // thead > tr > th
        for (let th of head.childNodes[0].childNodes) {

            if (this.tableAttributes.sorting.includes(th.value)) {
                //record the state of the sort button
                if (this.tableAttributes.sortingOrientation[th.value] == null) this.tableAttributes.sortingOrientation[th.value] = "asc";

                let btn = this.addSortBtn(th.value);
                TableMaker.addStylesToElement(btn, this.tableAttributes.classes.button);
                th.appendChild(btn);
            }
        }
    }

    generateTableBody() {
        let tbody = this.table.createTBody();
        TableMaker.addStylesToElement(tbody, this.tableAttributes.classes.tbody);
        for (let rowData of this.data) {
            this.generateRow(tbody, rowData, this.tableAttributes.classes.td);
        }
        return tbody;
    }

    generateRow(tbody, data, classes) {
        let tr = tbody.insertRow();

        for (let key in data) {
            let td = tr.insertCell();
            TableMaker.addStylesToElement(td, classes);

            //FORMAT DATA
            let content = data[key];
            if (content instanceof Date) content = content.toLocaleDateString();

            //Currency
            const formatter = new Intl.NumberFormat('en-UK', {
                style: 'currency',
                currency: 'GBP',
            });

            if(this.tableAttributes.currency.includes(key)) content = formatter.format(content);

            let text = document.createTextNode(content);
            td.appendChild(text);
        }
    }

    fillTable() {
        let head = this.generateTableHead();
        if (this.tableAttributes.sorting) this.addSorting(head);

        this.generateTableBody();
    }

    /// Main entry point, data must be valid and well-formed JSON
    makeTable() {
        //either make new table element or overwrite specified table element
        this.table = document.getElementById(this.tableAttributes.id);
        if (!this.table) {
            this.table = document.createElement("table");
        }
        else {
            this.table.parentElement.removeChild(this.table);
            this.table = document.createElement("table");
        }

        this.table.id = this.tableAttributes.id;

        for (let style of this.tableAttributes.classes.table) this.table.classList.add(style);

        document.querySelector(this.tableAttributes.parentSelector).appendChild(this.table);

        this.fillTable();
    }
}