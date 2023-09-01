class NMaker {
    static updatedData = new Event("updatedData");
    static data = {};
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

    static makeBtn(name, fn, classes = null) {
        let btn = document.createElement("button");
        btn.innerText = name;
        btn.onclick = fn;
        if (classes) NMaker.addStylesToElement(btn, classes);
        return btn;
    }
}

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
            currency: false,
            hide: false
        };
        this.page = 0;
        this.inputData = data;

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

        document.addEventListener("updatedData", (e) => {
            alert(e);
            this.data = NMaker.data;
            console.log(NMaker.data);
            this.makeTable();
        })
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

            this.inputData.sort((prev, curr) => {
                let comparison = compare(prev[prop], curr[prop]);
                return btnKind == "asc" ? -1 * comparison : comparison;
            });
            this.makeTable();
        };
        return btn;
    }

    addSorting(head) {
        // thead > tr > th
        for (let th of head.childNodes[0].childNodes) {

            if (this.tableAttributes.sorting.includes(th.value)) {
                //record the state of the sort button
                if (this.tableAttributes.sortingOrientation[th.value] == null) this.tableAttributes.sortingOrientation[th.value] = "asc";

                let btn = this.addSortBtn(th.value);
                NMaker.addStylesToElement(btn, this.tableAttributes.classes.button);
                th.appendChild(btn);
            }
        }
    }

    generateTableHead() {
        let headings = Object.keys(this.data[0]);
        let thead = this.table.createTHead();
        let row = thead.insertRow();
        for (let key of headings) {
            if (this.tableAttributes.hide.includes(key)) continue;
            let th = document.createElement("th");
            NMaker.addStylesToElement(th, this.tableAttributes.classes.th);
            th.value = key;
            let text = document.createTextNode(NMaker.toCapitalizedWords(key));
            th.appendChild(text);
            row.appendChild(th);
        }
        return thead;
    }


    generateTableBody() {
        let tbody = this.table.createTBody();
        NMaker.addStylesToElement(tbody, this.tableAttributes.classes.tbody);

        for (let rowData of this.data) {
            this.generateRow(tbody, rowData, this.tableAttributes.classes.td);
        }
        return tbody;
    }

    generateRow(tbody, data, classes) {
        let tr = tbody.insertRow();

        for (let key in data) {
            if (this.tableAttributes.hide.includes(key)) continue;

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

            if (this.tableAttributes.currency && this.tableAttributes.currency.includes(key)) content = formatter.format(content);

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

class PaginatorMaker {
    constructor(data, attributes) {
        // Defaults
        this.page = 1;
        this.attributeDefaults = {
            pages: 1,
            classes : {
                container : ["btn-group", "flex"],
                button : ["btn", "btn-sm", "btn-outline-info"]
            }
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        };

        this.attributes.classes = {
            ...this.attributes.classes,
            ...attributes.classes
        };

        this.data = data;
        this.pagedData = this.getPagedData(data, this.page, this.attributes.pages);

        this.maxPage = () => Math.floor(this.data.length / this.attributes.pages);
    }

    /// produce a new array to prevent mutation
    getPagedData(data, page, totalPages) {
        let pagedData = [];

        //pages are 1-indexed
        for (let i = 0; i < totalPages; i++) {
            let j = (page - 1) * totalPages + i;
            if (j < data.length) pagedData[i] = data[j];
        }

        return pagedData;
    }

    makePaginator() {
        //create paginator container
        let container = document.createElement("div");
        container.id = this.attributes.id;
        NMaker.addStylesToElement(container, this.attributes.classes.container)
        document.querySelector(this.attributes.parentSelector).appendChild(container);

        let append = (child) => document.querySelector("#" + this.attributes.id).appendChild(child);

        let prevBtn = NMaker.makeBtn("<-", () => {
            this.page--;
            if (this.page < 1) this.page = 1;
            this.pagedData = this.getPagedData(this.data, this.page, this.attributes.pages);
            NMaker.data = this.pagedData;
            document.dispatchEvent(NMaker.updatedData);
        }, this.attributes.classes.button);
        append(prevBtn);

        //create current page display
        let pageDisplay = document.createElement("p");
        let pageDisplayText = document.createTextNode(this.page + " / " + this.maxPage());
        pageDisplay.appendChild(pageDisplayText);
        append(pageDisplay);

        let nextBtn = NMaker.makeBtn("->", () => {
            this.page++;
            if (this.page > this.maxPage()) this.page = this.maxPage();
            this.data = this.getPagedData(this.data, this.page, this.attributes.pages);
            console.log("Paginator provided data", this.data);
            NMaker.data = this.data;
            document.dispatchEvent(NMaker.updatedData);
        }, this.attributes.classes.button);
        append(nextBtn);
    }
}
