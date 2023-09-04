class NMaker {
    static updatedData = new Event("updatedData");
    static data = [];
    static currData = [];
    //courtesy of https://stackoverflow.com/questions/21147832/convert-camel-case-to-human-readable-string
    static toCapitalizedWords(name) {
        var words = name.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
        return words.map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(" ") + " ";
    }

    //courtesy of https://stackoverflow.com/questions/16242449/regex-currency-validation
    static isPoundCurrency(data) {
        return /(?=.*?\d)^£?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/.test(data);
    }

    static IsCompatible(data) {
        if (!Array.isArray(data)) {
            console.error("Data is not an array");
            return false;
        }
        let prevProps = "";
        for (let i = 0; i < data.length; i++) {
            let row = data[i];
            if (typeof row !== 'object' || Array.isArray(row) || row == null) {
                console.error("Row of data is not an JS object");
                return false;
            }
            let props = "";
            for (let prop in data[i]) {
                props += prop + ",";
            }

            //if the properties of the previous row don't match this one
            if (i > 0 && prevProps !== props) {
                console.error("Row of data doesn't fit columns");
                return false;
            }
            prevProps = props;
        }

        return true;
    }

    static addStylesToElement(el, styles) {
        if (Array.isArray(styles)) for (let style of styles) el.classList.add(style);
    }

    static makeBtn(name, fn, classes = null) {
        let btn = document.createElement("button");
        btn.innerText = name;
        btn.onclick = fn;
        if (classes) NMaker.addStylesToElement(btn, classes);
        return btn;
    }

    static init(data) {
        if(!NMaker.IsCompatible(data)) throw new Error("No or invalid JSON provided");
        NMaker.currData = [...data];
        NMaker.data = Object.freeze(data);
        NMaker.headings = Object.keys(data[0]);
    }
}

class TableMaker {
    constructor(attributes = {}) {
        //Defaults
        this.attributeDefaults = {
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
            currency: false,
            hide: false
        };

        this.inputData = data;

        //Table Data
        this.data = data;
        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        };

        this.attributes.classes = {
            ...this.attributeDefaults.classes,
            ...attributes.classes
        }

        this.data = NMaker.currData;

        document.addEventListener("updatedData", (e) => {
            this.data = NMaker.currData;
            this.makeTable();
        });
    }

    addSortBtn(column) {
        let compare = (a, b) => {
            if (a == null || b == null) return 1;
            if (typeof a == "number" && typeof b == "number") return a - b;
            if (typeof a == "string" && typeof b == "string") return a.localeCompare(b);
            if (a instanceof Date && b instanceof Date) return a - b;
            return 1;
        };

        let name = this.attributes.sortingOrientation[column] == "asc" ? "↑" : "↓";
        return NMaker.makeBtn(name, () => {
            let btnKind = this.attributes.sortingOrientation[column];  //the state of the button, "asc" or "desc"
            //invert the state
            this.attributes.sortingOrientation[column] = btnKind == "asc" ? "desc" : "asc";

            //sort the exposed data
            NMaker.currData.sort((prevRow, currRow) => {
                let comparison = compare(prevRow[column], currRow[column]);
                return btnKind == "asc" ? -1 * comparison : comparison;
            });
            document.dispatchEvent(NMaker.updatedData);
        }, this.attributes.classes.button);
    }

    addSorting(head) {
        // thead > tr > th
        for (let th of head.childNodes[0].childNodes) {

            if (this.attributes.sorting.includes(th.value)) {
                //record the state of the sort button
                if (this.attributes.sortingOrientation[th.value] == null) this.attributes.sortingOrientation[th.value] = "asc";

                let btn = this.addSortBtn(th.value);
                NMaker.addStylesToElement(btn, this.attributes.classes.button);
                th.appendChild(btn);
            }
        }
    }

    generateTableHead() {
        let thead = this.table.createTHead();
        let row = thead.insertRow();
        for (let key of NMaker.headings) {
            if (this.attributes.hide.includes(key)) continue;
            let th = document.createElement("th");
            NMaker.addStylesToElement(th, this.attributes.classes.th);
            th.value = key;
            let text = document.createTextNode(NMaker.toCapitalizedWords(key));
            th.appendChild(text);
            row.appendChild(th);
        }
        return thead;
    }


    generateTableBody() {
        let tbody = this.table.createTBody();
        NMaker.addStylesToElement(tbody, this.attributes.classes.tbody);

        for (let rowData of this.data) {
            this.generateRow(tbody, rowData, this.attributes.classes.td);
        }
        return tbody;
    }

    generateRow(tbody, data, classes) {
        let tr = tbody.insertRow();

        for (let key in data) {
            if (this.attributes.hide.includes(key)) continue;

            let td = tr.insertCell();
            NMaker.addStylesToElement(td, classes);

            //FORMAT DATA
            let content = data[key];
            if (content instanceof Date) content = content.toLocaleDateString();

            //Currency
            const formatter = new Intl.NumberFormat('en-UK', {
                style: 'currency',
                currency: 'GBP',
            });

            if (this.attributes.currency && this.attributes.currency.includes(key)) content = formatter.format(content);

            let text = document.createTextNode(content);
            td.appendChild(text);
        }
    }

    fillTable() {
        let head = this.generateTableHead();
        if (this.attributes.sorting) this.addSorting(head);

        this.generateTableBody();
    }

    /// Main entry point, data must be valid and well-formed JSON
    makeTable() {
        //either make new table element or overwrite specified table element
        this.table = document.getElementById(this.attributes.id);
        if (!this.table) {
            this.table = document.createElement("table");
        }
        else {
            this.table.parentElement.removeChild(this.table);
            this.table = document.createElement("table");
        }

        this.table.id = this.attributes.id;

        for (let style of this.attributes.classes.table) this.table.classList.add(style);

        document.querySelector(this.attributes.parentSelector).appendChild(this.table);

        this.fillTable();
    }
}

class PaginatorMaker {
    constructor(attributes) {
        // Defaults
        this.page = 1;
        this.attributeDefaults = {
            id: "paginatorMaker" + Date.now(),
            pageLength: 2,
            classes: {
                container: ["navbar", "navbar-expand-sm"],
                button: ["btn", "btn-sm", "btn-outline-dark"],
                p: ["navbar-brand", "mx-2"]
            }
        };

        //Attributes
        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        };

        this.attributes.classes = {
            ...this.attributes.classes,
            ...attributes.classes
        };

        // Paginator data
        this.data = NMaker.data;
        this.pages = Math.ceil(this.data.length / this.attributes.pageLength);

        this.pagedData = this.getPagedData();
        NMaker.currData = this.pagedData;

    }

    /// produce a new array to prevent mutation
    getPagedData() {
        let pagedData = [];
        //pages are 1-indexed
        //this.page is the current page, this.attributes.pages is the total number of pages, this.pageLength is the number of entries per page
        for (let i = 0; i < this.attributes.pageLength; i++) {
            let j = (this.page - 1) * this.attributes.pageLength + i;
            if (j < this.data.length) pagedData[i] = this.data[j];
        }

        return pagedData;
    }

    makePaginator() {
        //create paginator container
        let container = document.createElement("nav");
        container.id = this.attributes.id;
        NMaker.addStylesToElement(container, this.attributes.classes.container);

        //previous button
        let prevBtn = NMaker.makeBtn("<-", () => {
            this.page--;
            if (this.page < 1) this.page = 1;
            this.pagedData = this.getPagedData();
            NMaker.currData = this.pagedData;
            document.dispatchEvent(NMaker.updatedData);
            this.updateDisplay();
        }, this.attributes.classes.button);
        container.appendChild(prevBtn);

        //create current page display
        let pageDisplay = document.createElement("p");
        pageDisplay.id = this.id + "-display";
        let pageDisplayText = document.createTextNode(this.getDisplay());
        NMaker.addStylesToElement(pageDisplay, this.attributes.classes.p);
        pageDisplay.style.margin = "0";
        pageDisplay.appendChild(pageDisplayText);
        container.appendChild(pageDisplay);

        //next button
        let nextBtn = NMaker.makeBtn("->", () => {
            this.page++;
            if (this.page > this.pages) this.page = this.pages;
            this.pagedData = this.getPagedData();
            NMaker.currData = this.pagedData;
            document.dispatchEvent(NMaker.updatedData);
            this.updateDisplay();
        }, this.attributes.classes.button);
        container.appendChild(nextBtn);

        //attach
        document.querySelector(this.attributes.parentSelector).appendChild(container);
    }

    updateDisplay() {
        document.getElementById(this.id + "-display").innerText = this.getDisplay();
    }

    getDisplay() {
        return this.page + " / " + this.pages;
    }
}

class FilterMaker {
    constructor(attributes) {
        this.attributeDefaults = {
            id: "filter-" + Date.now(),
            parentSelector: "body",
            classes: {
                container: ["row", "input-group"],
                button: ["btn", "btn-sm", "btn-outline-info"],
                input: ["form-control"],
                dropdown: ["form-select"],
                checkbox: ["form-check-input", "align-middle", "mx-0"]
            }
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        }

        this.data = NMaker.data;
    }

    makeFilter() {
        //make container
        let container = document.createElement("div");
        container.id = this.attributes.id;
        NMaker.addStylesToElement(container, this.attributes.classes.container);

        //select prop drop down
        let dropdown = document.createElement("select");
        dropdown.id = this.attributes.id + "-dropdown";
        for (let prop in this.data[0]) {
            let opt = document.createElement("option");
            opt.value = prop;
            opt.innerText = NMaker.toCapitalizedWords(prop);
            dropdown.appendChild(opt);
        }
        NMaker.addStylesToElement(dropdown, this.attributes.classes.dropdown);

        container.appendChild(dropdown);
        dropdown.onchange = () => this.makeInput(Object.values(NMaker.data[0])[dropdown.selectedIndex]);

        //create inputs that are dependent on the data type of the prop
        //they need to be in an input container to be properly re-inserted
        let inputContainer = document.createElement("div");
        inputContainer.id = this.attributes.id + "-input-container";
        inputContainer.classList.add("form-control");
        container.appendChild(inputContainer);

        //create search button
        let search = document.createElement("button");
        search.innerText = "Search";
        search.id = this.attributes.id + "-search";
        search.onclick = () => this.filter();
        NMaker.addStylesToElement(search, this.attributes.classes.button);
        // search.classList.add("col-auto");
        // search.classList.add("ms-auto");
        container.appendChild(search);

        document.querySelector(this.attributes.parentSelector).appendChild(container);

        //make the iniitial input
        this.makeInput(Object.values(NMaker.data[0])[dropdown.selectedIndex]);
    }

    makeInput(value) {
        let input = this.replaceElement(this.attributes.id + "-input", "input");

        switch (typeof value) {
            case "bigint":
            case "number":
                input.type = "number";
                input.placeholder = 0;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
            case "string":
                input.type = "text";
                input.placeholder = "Select...";
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "boolean":
                input.type = "checkbox";
                NMaker.addStylesToElement(input, this.attributes.classes.checkbox);
                break;
            case "object":
                if (value instanceof Date) {
                    input.type = "date";
                    NMaker.addStylesToElement(input, this.attributes.classes.input);
                }
                break;
            default:
                throw new Error();
        }
        document.getElementById(this.attributes.id + "-input-container").appendChild(input);
    }

    replaceElement(id, kind) {
        let el = document.getElementById(id);
        if (el) el.parentElement.removeChild(el);
        el = document.createElement(kind);
        el.id = id;
        return el;
    }

    filter() {
        let dropdown = document.getElementById(this.attributes.id + "-dropdown");
        let prop = NMaker.headings[dropdown.selectedIndex];
        let term = document.getElementById(this.attributes.id + "-input").value;

        let filteredData = [];
        for (let row of this.data) {
            if (row[prop].toString().includes(term)) filteredData.push(row);
        }

        NMaker.currData = filteredData;
        document.dispatchEvent(NMaker.updatedData);
    }
}