class NMaker {
    static updatedData = new Event("updatedData");
    static updatedPageData = new Event("updatedPageData");
    static data = [];
    static filteredData = [];
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

    static replaceElement(id, kind) {
        let el = document.getElementById(id);
        if (el) el.parentElement.removeChild(el);
        el = document.createElement(kind);
        el.id = id;
        return el;
    }

    static makeBtn(name, fn, classes = null) {
        let btn = document.createElement("button");
        btn.innerText = name;
        btn.onclick = fn;
        if (classes) NMaker.addStylesToElement(btn, classes);
        return btn;
    }

    static makeLink(text, link, classes = null) {
        let a = document.createElement("a");
        a.innerText = text;
        a.href = link;
        if (classes) NMaker.addStylesToElement(a, classes);
        return a;
    }

    static init(data) {
        if (!NMaker.IsCompatible(data)) throw new Error("No or invalid JSON provided");
        NMaker.filteredData = [...data];
        NMaker.pagedData = [...data];
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
                heading: ["h5", "align-text-bottom"],
                row: ["text-body-secondary"],
                button: ["btn", "btn-sm", "btn-outline-primary", "float-end"],
                link: ["btn", "btn-sm", "btn-outline-info"]
            },
            classesIf: false,
            parentSelector: "body",
            sorting: false,
            sortingOrientation: {},
            currency: false,
            hide: false,
            link: false
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

        document.addEventListener("updatedPageData", (e) => {
            this.data = NMaker.pagedData;
            this.makeTable();
        });

        document.dispatchEvent(NMaker.updatedPageData);
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
            NMaker.pagedData.sort((prevRow, currRow) => {
                let comparison = compare(prevRow[column], currRow[column]);
                return btnKind == "asc" ? -1 * comparison : comparison;
            });
            document.dispatchEvent(NMaker.updatedPageData);
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
            if (this.attributes.hide && this.attributes.hide.includes(key)) continue;
            let th = document.createElement("th");
            let span = document.createElement("span");
            NMaker.addStylesToElement(span, this.attributes.classes.heading);
            th.value = key;
            span.innerText = NMaker.toCapitalizedWords(key);
            th.appendChild(span);
            row.appendChild(th);
        }
        return thead;
    }


    generateTableBody() {
        let tbody = this.table.createTBody();
        NMaker.addStylesToElement(tbody, this.attributes.classes.tbody);

        for (let rowData of this.data) {
            this.generateRow(tbody, rowData, this.attributes.classes.row);
        }
        return tbody;
    }

    generateRow(tbody, data, classes) {
        let tr = tbody.insertRow();

        for (let key in data) {
            if (this.attributes.hide && this.attributes.hide.includes(key)) continue;

            let td = tr.insertCell();
            NMaker.addStylesToElement(td, classes);

            //Apply conditional class to tr if condition is met against the cell's data
            // [prop] == true   // replace [prop] in condition with actual value, i.e. content, 

            //FORMAT DATA
            let content = data[key];

            //Date
            if (content instanceof Date) content = document.createTextNode(content.toLocaleDateString());

            //Currency
            else if (this.attributes.currency && this.attributes.currency.includes(key)) {
                const formatter = new Intl.NumberFormat('en-UK', {
                    style: 'currency',
                    currency: 'GBP',
                });
                content = document.createTextNode(formatter.format(content));
            }

            //Link
            else if (this.attributes.link && this.attributes.link.map(l => l.name).includes(key)) {
                let linkData = this.attributes.link.filter(l => l.name == key)[0];
                if (linkData) content = NMaker.makeLink(linkData.text, content, this.attributes.classes.link);
            }
            else {
                content = document.createTextNode(content);
            }

            td.appendChild(content);
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
        this.table = NMaker.replaceElement(this.attributes.id, "table");
        this.table.id = this.attributes.id;

        for (let style of this.attributes.classes.table) this.table.classList.add(style);

        document.querySelector(this.attributes.parentSelector).appendChild(this.table);

        this.fillTable();
    }
}

class PaginatorMaker {
    constructor(attributes) {
        // Defaults
        this.attributeDefaults = {
            id: "paginatorMaker" + Date.now(),
            pageLength: 2,
            classes: {
                container: ["navbar", "navbar-expand-sm"],
                button: ["btn", "btn-sm", "btn-outline-primary"],
                p: ["navbar-brand", "mx-2"]
            }
        };

        //Attributes
        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        };

        this.attributes.classes = {
            ...this.attributeDefaults.classes,
            ...attributes.classes
        };

        // Paginator data
        this.page = 1;
        this.pages = Math.ceil(NMaker.filteredData.length / this.attributes.pageLength);

        document.addEventListener("updatedData", (e) => {
            this.pages = Math.ceil(NMaker.filteredData.length / this.attributes.pageLength);
            this.page = 1;
            NMaker.pagedData = this.getPagedData();
            this.makePaginator();
        });

        document.dispatchEvent(NMaker.updatedData);
    }

    /// produce a new array to prevent mutation
    getPagedData() {
        let pagedData = [];
        //pages are 1-indexed
        //this.page is the current page, this.attributes.pages is the total number of pages, this.pageLength is the number of entries per page
        for (let i = 0; i < this.attributes.pageLength; i++) {
            let j = (this.page - 1) * this.attributes.pageLength + i;
            if (j < NMaker.filteredData.length) pagedData[i] = NMaker.filteredData[j];
        }

        return pagedData;
    }

    makePaginator() {
        //create paginator container
        let container = NMaker.replaceElement(this.attributes.id, "nav");
        container.id = this.attributes.id;
        NMaker.addStylesToElement(container, this.attributes.classes.container);

        //previous button
        let prevBtn = NMaker.makeBtn("<-", () => {
            this.page--;
            if (this.page < 1) this.page = 1;
            NMaker.pagedData = this.getPagedData();
            document.dispatchEvent(NMaker.updatedPageData);
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
            NMaker.pagedData = this.getPagedData();
            document.dispatchEvent(NMaker.updatedPageData);
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
        this.modifierOptions = Object.freeze({
            equals: "=",
            greaterThan: ">",
            lessThan: "<",
            not: "Not",
            match: "Match",
            contains: "Contains",
            startsWith: "Starts with",
            excludes: "Excludes",
            date: "Date",
            dateRange: "From -> To",
            boolean: "Boolean"
        });

        this.attributeDefaults = {
            id: "filter-" + Date.now(),
            parentSelector: "body",
            classes: {
                container: ["mb-2", "row", "g-0"],
                button: ["btn", "btn-sm", "btn-outline-primary", "col-1"],
                label: ["input-group-text"],
                checkbox: ["form-check-input"],
                selectorContainer: ["col-2"],
                selector: ["form-select" ],
                modifierContainer: ["col-2"],
                modifier: ["form-select"],
                inputContainer: ["col-6"],
                input: ["form-control"],
                dateRange: ["input-group"]
            },
            ignore: false,
            useModifier: false,
            modifier: {
                number: [this.modifierOptions.equals, this.modifierOptions.greaterThan, this.modifierOptions.lessThan, this.modifierOptions.not],
                string: [this.modifierOptions.match, this.modifierOptions.contains, this.modifierOptions.startsWith, this.modifierOptions.excludes],
                date: [this.modifierOptions.date, this.modifierOptions.dateRange],
                boolean: [this.modifierOptions.boolean]
            }
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        }

        this.attributes.classes = {
            ...this.attributeDefaults.classes,
            ...attributes.classes
        };

        this.attributes.modifier = {
            ...this.attributeDefaults.modifier,
            ...attributes.modifier
        }

        this.data = NMaker.data;
        this.makeFilter();
    }

    makeFilter() {
        //make outer container
        let container = document.createElement("div");
        container.id = this.attributes.id;
        NMaker.addStylesToElement(container, this.attributes.classes.container);

        //reset button
        let resetBtn = document.createElement("button");
        resetBtn.onclick = () => {
            document.getElementById(this.attributes.id + "-input").value = "";
            document.getElementById(this.attributes.id + "-input").checked = false;
            NMaker.filteredData = NMaker.data;
            NMaker.pagedData = NMaker.data;
            document.dispatchEvent(NMaker.updatedData);
            document.dispatchEvent(NMaker.updatedPageData);
        };
        resetBtn.innerHTML = "&#8635;";
        NMaker.addStylesToElement(resetBtn, this.attributes.classes.button);
        container.appendChild(resetBtn);

        //selector container
        let selectorContainer = document.createElement("div");
        selectorContainer.id = this.attributes.id + "-selector-container";
        NMaker.addStylesToElement(selectorContainer, this.attributes.classes.selectorContainer);

        //property dropdown 'selector'
        let selector = document.createElement("select");
        selector.id = this.attributes.id + "-selector";
        for (let prop in this.data[0]) {
            if (this.attributes.ignore && this.attributes.ignore.includes(prop)) continue;
            let opt = document.createElement("option");
            opt.value = prop;
            opt.innerText = NMaker.toCapitalizedWords(prop);
            selector.appendChild(opt);
        }
        NMaker.addStylesToElement(selector, this.attributes.classes.selector);

        selectorContainer.appendChild(selector);
        container.appendChild(selectorContainer);
        selector.onchange = () => this.makeInput(Object.values(NMaker.data[0])[selector.selectedIndex]);

        //create the modifier if wanted
        if (this.attributes.useModifier) {
            //modifier container
            let modifierContainer = document.createElement("div");
            modifierContainer.id = this.attributes.id + "-modifier-container";
            NMaker.addStylesToElement(modifierContainer, this.attributes.classes.modifierContainer);

            //modifier is select box
            let modifierSelector = document.createElement("select");
            modifierSelector.id = this.attributes.id + "-select";
            modifierSelector.onchange = () => {
                if (modifierSelector.value == this.modifierOptions.dateRange) this.makeDateRangeInput();
                else this.makeBasicInput(Object.values(NMaker.data[0])[selector.selectedIndex]);
                this.updateSearchBtn(document.getElementById(this.attributes.id + "-select").value);
            }
            NMaker.addStylesToElement(modifierSelector, this.attributes.classes.modifier);

            modifierContainer.appendChild(modifierSelector);
            container.appendChild(modifierContainer);
        }

        //create input container, as the input needs to be re-inserted smoothly and also to contain the modifier
        let inputContainer = document.createElement("div");
        inputContainer.id = this.attributes.id + "-input-container";
        NMaker.addStylesToElement(inputContainer, this.attributes.classes.inputContainer);

        //attach inputContainer to container
        container.appendChild(inputContainer);

        //create search button
        let search = document.createElement("button");
        search.innerText = "Search";
        search.id = this.attributes.id + "-search";
        search.type = "button";
        NMaker.addStylesToElement(search, this.attributes.classes.button);
        container.appendChild(search);

        document.querySelector(this.attributes.parentSelector).appendChild(container);

        //create the initial input
        this.makeInput(Object.values(NMaker.data[0])[selector.selectedIndex]);
    }

    makeInput(value) {
        this.makeBasicInput(value);

        if (this.attributes.useModifier) {
            this.makeModifierOptions(value);
        }
    }

    makeModifierOptions(value) {
        //populate Modifier options
        let selector = document.getElementById(this.attributes.id + "-select");

        //first clear old options
        while (selector.firstChild) {
            selector.removeChild(selector.lastChild);
        }

        //then add options according to selected data type
        switch (typeof value) {
            case "bigint":
            case "number":
                this.attachOptions(selector, this.attributes.modifier.number);
                break;
            case "string":
                this.attachOptions(selector, this.attributes.modifier.string);
                break;
            case "boolean":
                this.attachOptions(selector, this.attributes.modifier.boolean);
                break;
            case "object":
                if (value instanceof Date) {
                    this.attachOptions(selector, this.attributes.modifier.date);
                }
                else console.error("Invalid object value found");
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
            default:
                throw new Error();
        }
    }

    attachOptions(selector, options) {
        let isDefault = 1;
        for (let modifier of options) {
            let option = document.createElement("option");
            option.value = modifier;
            option.innerText = modifier;
            option.selected = isDefault++ == 1;
            selector.appendChild(option);
        }
    }

    makeBasicInput(value) {
        let input = NMaker.replaceElement(this.attributes.id + "-input", "input");

        switch (typeof value) {
            case "bigint":
            case "number":
                input.type = "number";
                input.placeholder = 0.00;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                this.updateSearchBtn(this.modifierOptions.match);
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
            case "string":
                input.type = "text";
                input.placeholder = "Select...";
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                this.updateSearchBtn(this.modifierOptions.match);
                break;
            case "boolean":
                input.type = "checkbox";
                NMaker.addStylesToElement(input, this.attributes.classes.checkbox);
                this.updateSearchBtn(this.modifierOptions.boolean);
                break;
            case "object":
                if (value instanceof Date) {
                    input.type = "date";
                    input.value = new Date().toISOString().split('T')[0];
                    NMaker.addStylesToElement(input, this.attributes.classes.input);
                    this.updateSearchBtn(this.modifierOptions.date);
                }
                else console.error("Invalid object value found");
                break;
            default:
                throw new Error();
        }
        document.getElementById(this.attributes.id + "-input-container").appendChild(input);
    }

    makeDateRangeInput() {
        //some defaults
        let today = new Date();
        let nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        let getDateValue = (t) => t.toISOString().split('T')[0];

        //replace input with new div, which will contain two date inputs, fromDate and toDate. input will have datasets for toDate and fromDate
        let input = NMaker.replaceElement(this.attributes.id + "-input", "div");
        NMaker.addStylesToElement(input, this.attributes.classes.dateRange);

        //make from Date input
        let fromDateInput = document.createElement("input");
        fromDateInput.type = "date";
        fromDateInput.value = getDateValue(today);
        NMaker.addStylesToElement(fromDateInput, this.attributes.classes.input);
        fromDateInput.onchange = () => input.dataset.fromDate = fromDateInput.value;

        //make new toDate
        let toDateInput = document.createElement("input");
        toDateInput.type = "date";
        toDateInput.id = this.attributes.id + "-toDate";
        toDateInput.value = getDateValue(nextweek);
        NMaker.addStylesToElement(toDateInput, this.attributes.classes.input);
        toDateInput.onchange = () => input.dataset.toDate = toDateInput.value;

        let toDateLabel = document.createElement("label");
        toDateLabel.innerText = "→";
        toDateLabel.for = toDateInput.id;
        NMaker.addStylesToElement(toDateLabel, this.attributes.classes.label);

        input.appendChild(fromDateInput);
        input.appendChild(toDateLabel);
        input.appendChild(toDateInput);

        this.updateSearchBtn(this.modifierOptions.dateRange);

        document.getElementById(this.attributes.id + "-input-container").appendChild(input);
    }

    updateSearchBtn(value) {
        let search = document.getElementById(this.attributes.id + "-search");
        search.onclick = () => this.filter(value);
    }

    filter(type = null) {
        let selector = document.getElementById(this.attributes.id + "-selector");
        let prop = NMaker.headings[selector.selectedIndex];
        this.data = NMaker.data;

        let filteredData = [];
        let input = document.getElementById(this.attributes.id + "-input")

        for (let row of this.data) {
            switch (type) {
                case this.modifierOptions.contains:
                    if (row[prop].toString().toLowerCase().includes(input.value.toLowerCase())) filteredData.push(row);
                    break;
                case this.modifierOptions.boolean:
                    if (row[prop] == input.checked) filteredData.push(row);
                    break;
                case this.modifierOptions.date:
                    if (Date.parse(row[prop]) == Date.parse(input.value)) filteredData.push(row);
                    break;
                case this.modifierOptions.match:
                case this.modifierOptions.equals:
                    if (row[prop].toString().toLowerCase() == input.value.toLowerCase()) filteredData.push(row);
                    break;
                case this.modifierOptions.not:
                case this.modifierOptions.excludes:
                    if (row[prop].toString().toLowerCase() != input.value.toString().toLowerCase()) filteredData.push(row);
                    break;
                case this.modifierOptions.greaterThan:
                    if (Number(row[prop]) > Number(input.value)) filteredData.push(row);
                    break;
                case this.modifierOptions.lessThan:
                    if (Number(row[prop]) < Number(input.value)) filteredData.push(row);
                    break;
                case this.modifierOptions.startsWith:
                    if (row[prop].toString().toLowerCase().startsWith(input.value.toString().toLowerCase())) filteredData.push(row);
                    break;
                case this.modifierOptions.dateRange:
                    if (Date.parse(row[prop]) >= Date.parse(input.dataset.fromDate) && Date.parse(row[prop]) <= Date.parse(input.dataset.toDate)) filteredData.push(row);
                    break;
            }
        }

        NMaker.filteredData = filteredData;
        NMaker.pagedData = filteredData;
        document.dispatchEvent(NMaker.updatedData);
        document.dispatchEvent(NMaker.updatedPageData);
    }
}

class DateRangeMaker {
    constructor(attributes) {
        let today = new Date();
        let nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

        let attributeDefaults = {
            start: today,
            to: nextweek
        };

        this.attributes = {
            ...attributeDefaults,
            ...attributes
        }
    }

    makeDateRange() {
        //start date input

        //to

        //end date input
    }
}