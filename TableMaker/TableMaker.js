class NMaker {
    static updatedData = new Event("updatedData");
    static updatedPageData = new Event("updatedPageData");
    static data = [];
    static filteredData = [];
    static headings = [];
    static hiddenHeadings = [];
    static displayValues = {};
    static modifierOptions = Object.freeze({
        equals: "=",
        greaterThan: ">",
        lessThan: "<",
        not: "Not",
        numberRange: "Between",
        match: "Matches",
        contains: "Contains",
        startsWith: "Starts with",
        excludes: "Excludes",
        date: "Date",
        dateRange: "From -> To",
        before: "Before",
        after: "After",
        boolean: "Boolean",
        select: "Select"
    });
    static paginatorOptions = Object.freeze({
        bookend: "Bookend",
        cycle: "Cycle"
    });

    static sortOptions = Object.freeze({
        original: "Original",
        alphabetical: "Alphabetical",
        alphabeticalReverse: "Alphabetical-reverse",
        numeric: "Numeric",
        numericReverse: "Numeric-reverse",
        date: "Date",
        dateReverse: "Date-reverse"
    });

    static table;
    static filter;
    static paginator;

    //courtesy of https://stackoverflow.com/questions/21147832/convert-camel-case-to-human-readable-string
    static toCapitalizedWords(name) {
        var words = name.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
        return words.map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
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

    static compare = (sortOption, a, b) => {
        if (a == null || b == null || sortOption == NMaker.sortOptions.original) return 1;
        if (sortOption == NMaker.sortOptions.numeric || sortOption == NMaker.sortOptions.date) return a - b;
        if (sortOption == NMaker.sortOptions.numericReverse || sortOption == NMaker.sortOptions.dateReverse) return b - a;
        if (sortOption == NMaker.sortOptions.alphabetical) return a.localeCompare(b);
        if (sortOption == NMaker.sortOptions.alphabeticalReverse) return b.localeCompare(a);
        return 1;
    };

    static sort(data, sortOrder) {
        return data.slice().sort((a, b) => NMaker.compare(sortOrder, a, b));
    }

    static addStylesToElement(el, styles) {
        if (Array.isArray(styles)) for (let style of styles) el.classList.add(style);
    }

    static replaceElement(id, kind, styles = null) {
        let el = document.getElementById(id);
        if (el) el.parentElement.removeChild(el);
        el = document.createElement(kind);
        el.id = id;
        if (styles) NMaker.addStylesToElement(el, styles);
        return el;
    }

    static makeBtn(id, name, fn, classes = null) {
        let btn = document.createElement("button");
        btn.id = id;
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

    static makeDateRangePicker(id, classes) {
        //some defaults
        let today = new Date();
        let nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        let getDateValue = (t) => t.toISOString().split('T')[0];    //courtesy of https://stackoverflow.com/questions/28729634/set-values-in-input-type-date-and-time-in-javascript

        //replace or make the container
        let dateRangePicker = NMaker.replaceElement(id, "div");
        NMaker.addStylesToElement(dateRangePicker, classes.inputGroup);

        //make from Date input
        let fromDateInput = document.createElement("input");
        fromDateInput.type = "date";
        fromDateInput.value = getDateValue(today);
        dateRangePicker.dataset.fromDate = getDateValue(today);
        NMaker.addStylesToElement(fromDateInput, classes.input);
        fromDateInput.onchange = () => dateRangePicker.dataset.fromDate = fromDateInput.value;

        //make to Date input
        let toDateInput = document.createElement("input");
        toDateInput.type = "date";
        toDateInput.value = getDateValue(nextweek);
        dateRangePicker.dataset.toDate = getDateValue(nextweek);
        NMaker.addStylesToElement(toDateInput, classes.input);
        toDateInput.onchange = () => dateRangePicker.dataset.toDate = toDateInput.value;

        let toDateLabel = document.createElement("label");
        toDateLabel.innerText = "→";
        toDateLabel.for = toDateInput.id;
        NMaker.addStylesToElement(toDateLabel, classes.label);

        dateRangePicker.appendChild(fromDateInput);
        dateRangePicker.appendChild(toDateLabel);
        dateRangePicker.appendChild(toDateInput);

        return dateRangePicker;
    }

    static makeNumberRangePicker(id, classes, lower = 0, upper = 1) {
        //replace or make the container
        let numberRangePicker = NMaker.replaceElement(id, "div");
        NMaker.addStylesToElement(numberRangePicker, classes.inputGroup);

        //make lower Number input
        let lowerNumberInput = document.createElement("input");
        lowerNumberInput.type = "number";
        lowerNumberInput.placeholder = lower;
        lowerNumberInput.id = id + "-lower";
        NMaker.addStylesToElement(lowerNumberInput, classes.input);

        //make upper number input
        let upperNumberInput = document.createElement("input");
        upperNumberInput.type = "number";
        upperNumberInput.placeholder = upper;
        upperNumberInput.id = id + "-upper";
        NMaker.addStylesToElement(upperNumberInput, classes.input);

        let between = document.createElement("label");
        between.innerText = "→";
        between.for = upperNumberInput.id;
        NMaker.addStylesToElement(between, classes.label);

        numberRangePicker.appendChild(lowerNumberInput);
        numberRangePicker.appendChild(between);
        numberRangePicker.appendChild(upperNumberInput);

        return numberRangePicker;
    }

    static init(data) {
        if (!NMaker.IsCompatible(data)) throw new Error("No or invalid JSON provided");
        NMaker.filteredData = [...data];
        NMaker.pagedData = [...data];
        NMaker.data = Object.freeze(data);
        for (let key of Object.keys(data[0])) NMaker.headings[key] = NMaker.toCapitalizedWords(key);    //to be later changed to displayName
    }
}

class TableMaker {
    constructor(attributes = {}) {
        //Defaults
        this.attributeDefaults = {
            id: "t-" + Date.now(),
            classes: {
                table: ["table", "table-bordered"],
                heading: ["h6", "align-text-bottom", "flex-fill", "me-2"],
                headingContainer: ["d-flex", "flex-row"],
                row: ["text-secondary"],
                button: ["btn", "btn-sm", "btn-outline-primary"],
                link: ["btn", "btn-sm", "btn-outline-info"]
            },
            displayHeadings: false,
            displayValues: false,
            conditionalClasses: false,
            parentSelector: "body",
            sorting: false,
            noSorting: false,
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

        NMaker.table = this;
        NMaker.hiddenHeadings = this.attributes.hide ? this.attributes.hide : [];
        if (this.attributes.displayHeadings) {
            for (let heading of Object.keys(this.attributes.displayHeadings)) {
                NMaker.headings[heading] = this.attributes.displayHeadings[heading];
            }
        }

        if (this.attributes.displayValues) {
            for (let displayValue in this.attributes.displayValues) {
                NMaker.displayValues[displayValue] = this.attributes.displayValues[displayValue];
            }
        }

        document.addEventListener("updatedPageData", (e) => {
            this.data = NMaker.pagedData;
            NMaker.table.makeTable();
        });

        document.dispatchEvent(NMaker.updatedPageData);
    }

    addSortBtn(column) {
        //Note that as the updatedPagedData event is fired, the whole button gets remade which is why the btn function actually works

        let btnKind = this.attributes.sortingOrientation[column];  //the state of the button, "unset", "asc" or "desc"
        let name = btnKind == "unset" ? "↑↓" : btnKind == "asc" ? "↓" : "↑";

        return NMaker.makeBtn(this.attributes.id + "-" + column, name, () => {
            //reset the state of other columns and invert the state of this column if necessary
            for (let col in this.attributes.sortingOrientation) {
                if (col == column) this.attributes.sortingOrientation[col] = btnKind == "asc" ? "desc" : "asc";
                else this.attributes.sortingOrientation[col] = "unset";
            }

            //sort the exposed data based on its type
            NMaker.filteredData = NMaker.filteredData.slice().sort((prevRow, currRow) => {
                let sortOption = null;
                if (typeof prevRow[column] == typeof currRow[column]) {
                    switch (typeof currRow[column]) {
                        case "number":
                            sortOption = btnKind == "asc" ? NMaker.sortOptions.numeric : NMaker.sortOptions.numericReverse;
                            break;
                        case "string":
                            sortOption = btnKind == "asc" ? NMaker.sortOptions.alphabetical : NMaker.sortOptions.alphabeticalReverse;
                            break;
                        case "object":
                            if (currRow[column] instanceof Date) sortOption = btnKind == "asc" ? NMaker.sortOptions.numeric : NMaker.sortOptions.numericReverse;
                            break;
                        default:
                            sortOption = NMaker.sortOptions.alphabetical;
                    }
                }

                return NMaker.compare(sortOption, prevRow[column], currRow[column]);
            });
            document.dispatchEvent(NMaker.updatedData);
            document.dispatchEvent(NMaker.updatedPageData);
        }, this.attributes.classes.button);
    }

    addSorting(head) {
        // thead > tr > th
        for (let th of head.childNodes[0].childNodes) {

            if (this.attributes.sorting.includes(th.value) || (this.attributes.sorting.includes("all") && !this.attributes.noSorting.includes(th.value))) {
                //record the state of the sort button
                if (this.attributes.sortingOrientation[th.value] == null) this.attributes.sortingOrientation[th.value] = "unset";

                let btn = this.addSortBtn(th.value);
                NMaker.addStylesToElement(btn, this.attributes.classes.button);
                th.firstChild.appendChild(btn);
            }
        }
    }

    generateTableHead() {
        let thead = this.table.createTHead();
        let row = thead.insertRow();
        for (let heading of Object.keys(NMaker.headings)) {
            if (this.attributes.hide && this.attributes.hide.includes(heading)) continue;

            let th = document.createElement("th");

            th.value = heading;

            NMaker.addStylesToElement(th, this.attributes.classes.th);

            let headingContainer = document.createElement("div");
            NMaker.addStylesToElement(headingContainer, this.attributes.classes.headingContainer);

            let span = document.createElement("span");
            NMaker.addStylesToElement(span, this.attributes.classes.heading);

            span.innerText = NMaker.headings[heading];

            headingContainer.appendChild(span);
            th.appendChild(headingContainer);
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
            let td = document.createElement("td");

            NMaker.addStylesToElement(td, classes);

            //FORMAT DATA
            let content = data[key];

            if (this.attributes.displayValues.hasOwnProperty(key) && this.attributes.displayValues[key].value == data[key]) content = this.attributes.displayValues[key].displayValue;

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

            // Apply conditional class to tr of td if condition is met against the cell's data
            // condition must be stated as boolean expression of values and boolean operators and the heading of the cell under evaluation, key, which will be replaced with the actual value of the cell
            // TODO Fix replacing prop with prop where the beginning is the same (i.e. replacing ViewLinkNotFound being replaced by ViewLink, leaving NotFound floating...)
            if (this.attributes.conditionalClasses.hasOwnProperty(key)) {
                let cc = { ...this.attributes.conditionalClasses[key] };

                //Replace any prop in the condition with the value of that prop
                for (let prop in data) {
                    cc.condition = cc.condition.replace(prop + ' ', JSON.stringify(data[prop]));
                }

                if (eval?.(`"use strict";(${cc.condition})`) && cc.classesIf) {
                    this.addStylesToTarget(cc.target, tr, td, cc.classesIf);
                }
                else if (cc.classesNot) {
                    this.addStylesToTarget(cc.target, tr, td, cc.classesNot);
                }
            }

            if (this.attributes.hide && this.attributes.hide.includes(key)) continue;

            tr.appendChild(td);
        }
    }

    addStylesToTarget(target, tr, td, classes) {
        switch (target) {
            case "row":
                NMaker.addStylesToElement(tr, classes);
                break;
            case "cell":
                NMaker.addStylesToElement(td, classes);
                break;
            case "link":
                NMaker.addStylesToElement(td.firstElementChild, classes);
                break;
        }
    }

    fillTable() {
        let head = this.generateTableHead();
        if (this.attributes.sorting || (this.attributes.sorting && this.attributes.sorting.includes("all") && this.attributes.noSorting)) this.addSorting(head);

        this.generateTableBody();
    }

    makeTable() {
        this.table = NMaker.replaceElement(this.attributes.id, "table");

        this.attributes.hide = NMaker.hiddenHeadings;

        NMaker.addStylesToElement(this.table, this.attributes.classes.table)

        document.querySelector(this.attributes.parentSelector).appendChild(this.table);

        this.fillTable();
    }
}

class PaginatorMaker {
    constructor(attributes = {}) {
        // Defaults
        this.attributeDefaults = {
            id: "paginatorMaker-" + Date.now(),
            parentSelector: "body",
            pageLength: 50,
            classes: {
                container: ["navbar", "navbar-expand-sm"],
                button: ["btn", "btn-sm", "btn-outline-primary"],
                p: ["navbar-brand", "mx-2"]
            },
            buttons: NMaker.paginatorOptions.bookend
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

        NMaker.paginator = this;

        document.addEventListener("updatedData", (e) => {
            this.pages = Math.ceil(NMaker.filteredData.length / this.attributes.pageLength);
            this.page = 1;
            NMaker.pagedData = this.getPagedData();
            NMaker.paginator.makePaginator();
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
        let prevBtn = NMaker.makeBtn("prevBtn", "←", () => {
            this.page--;
            if (this.page < 1) {
                if (this.attributes.buttons == NMaker.paginatorOptions.bookend) this.page = 1;
                else if (this.attributes.buttons == NMaker.paginatorOptions.cycle) this.page = this.pages;
                else throw new Error("Invalid PaginatorMaker buttons option");
            }
            NMaker.pagedData = this.getPagedData();
            document.dispatchEvent(NMaker.updatedPageData);
            this.updateDisplay();
        }, this.attributes.classes.button);
        container.appendChild(prevBtn);

        //create current page display
        let pageDisplay = document.createElement("p");
        pageDisplay.id = this.attributes.id + "-display";
        let pageDisplayText = document.createTextNode(this.getDisplay());
        NMaker.addStylesToElement(pageDisplay, this.attributes.classes.p);
        pageDisplay.style.margin = "0";
        pageDisplay.appendChild(pageDisplayText);
        container.appendChild(pageDisplay);

        //next button
        let nextBtn = NMaker.makeBtn("nextBtn", "→", () => {
            this.page++;
            if (this.page > this.pages) {
                if (this.attributes.buttons == NMaker.paginatorOptions.bookend) this.page = this.pages;
                else if (this.attributes.buttons == NMaker.paginatorOptions.cycle) this.page = 1;
                else throw new Error("Invalid PaginatorMaker buttons option");
            }
            NMaker.pagedData = this.getPagedData();
            document.dispatchEvent(NMaker.updatedPageData);
            this.updateDisplay();
        }, this.attributes.classes.button);
        container.appendChild(nextBtn);

        //attach
        document.querySelector(this.attributes.parentSelector).appendChild(container);
    }

    updateDisplay() {
        document.getElementById(this.attributes.id + "-display").innerText = this.getDisplay();
    }

    getDisplay() {
        return this.page + " / " + this.pages;
    }
}

class FilterMaker {
    constructor(attributes = {}) {
        this.attributeDefaults = {
            id: "filter-" + Date.now(),
            parentSelector: "body",
            classes: {
                container: ["mb-2", "row", "g-2"],
                button: ["btn", "btn-sm", "btn-outline-primary"],
                label: ["input-group-text"],
                checkbox: ["form-check-input"],
                selectionContainer: ["col-4"],
                selector: ["form-select"],
                modifier: ["form-select"],
                inputContainer: ["col-8"],
                input: ["form-control"],
                inputGroup: ["input-group"],
                dateRange: ["input-group"]
            },
            ignore: false,
            order: NMaker.sortOptions.original,
            preselect: false,
            useModifier: false,
            modifier: {
                number: [NMaker.modifierOptions.equals, NMaker.modifierOptions.greaterThan, NMaker.modifierOptions.lessThan, NMaker.modifierOptions.not, NMaker.modifierOptions.numberRange],
                string: [NMaker.modifierOptions.contains, NMaker.modifierOptions.select, NMaker.modifierOptions.startsWith, NMaker.modifierOptions.match, NMaker.modifierOptions.excludes],
                date: [NMaker.modifierOptions.date, NMaker.modifierOptions.dateRange, NMaker.modifierOptions.before, NMaker.modifierOptions.after],
                boolean: [NMaker.modifierOptions.boolean]
            },
            useColumnFilter: false
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
        NMaker.filter = this;

        document.addEventListener("updatedPageData", (e) => {
            if (this.attributes.useModifier) document.getElementById(this.attributes.id + "-modifier").onchange();
            else this.makeInputGroup();
        });
    }

    makeFilter() {
        //make outer container
        let container = this.makeContainer(this.attributes.id, this.attributes.classes.container);

        //make selection container (reset btn, selector, & modifier if in use)
        let selection = this.makeSelectionContainer();
        container.appendChild(selection);

        //make the input container
        let input = this.makeInputContainer();
        container.appendChild(input);

        //attach container to DOM
        document.querySelector(this.attributes.parentSelector).appendChild(container);

        //create the initial input
        this.makeInputGroup();

        //create the initial modifier options, if in use
        if (this.attributes.useModifier) {
            this.makeModifierOptions();
        }
    }

    makeInputContainer() {
        //create input container
        let inputContainer = this.makeContainer(this.attributes.id + "-input-container", this.attributes.classes.inputContainer);
        return inputContainer;
    }

    makeContainer(id, classes) {
        let container = document.createElement("div");
        container.id = id;
        NMaker.addStylesToElement(container, classes);
        return container;
    }

    makeSelectionContainer() {
        //selection container
        let selectionContainer = this.makeContainer(this.attributes.id + "-selection-container", this.attributes.classes.selectionContainer);

        //button and selector input group
        let selectionInputGroup = this.makeContainer(this.attributes.id + "-selection-group", this.attributes.classes.inputGroup);

        //reset button
        let resetBtn = NMaker.makeBtn(this.attributes.id + "-reset", "↺", () => {
            this.makeInputContainer();
            NMaker.filteredData = NMaker.data;
            NMaker.pagedData = NMaker.data;
            document.dispatchEvent(NMaker.updatedData);
            document.dispatchEvent(NMaker.updatedPageData);
        }, this.attributes.classes.button)
        selectionInputGroup.appendChild(resetBtn);

        //property dropdown 'selector'
        let selector = this.makeSelector();
        selectionInputGroup.appendChild(selector);

        //create the modifier if wanted
        if (this.attributes.useModifier) {
            let modifier = this.makeModifier();
            selectionInputGroup.appendChild(modifier);
        }

        selectionContainer.appendChild(selectionInputGroup);

        return selectionContainer;
    }

    makeModifier() {
        //modifier is select box
        let modifier = document.createElement("select");
        modifier.id = this.attributes.id + "-modifier";
        modifier.onchange = () => {
            if (modifier.value == NMaker.modifierOptions.dateRange) this.makeDateRangeInput();
            else if (modifier.value == NMaker.modifierOptions.select) this.makeSelectInput();
            else if (modifier.value == NMaker.modifierOptions.numberRange) this.makeNumberRangeInput();
            else {
                let priorValue = document.getElementById(this.attributes.id + "-input") ? document.getElementById(this.attributes.id + "-input").value : null;
                this.makeInputGroup();
                if (priorValue) document.getElementById(this.attributes.id + "-input").value = priorValue;
            }

            document.getElementById(this.attributes.id + "-search").onclick = () => this.filter(modifier.value);
        }
        NMaker.addStylesToElement(modifier, this.attributes.classes.modifier);

        return modifier;
    }

    makeSelector() {
        let selector = document.createElement("select");
        selector.id = this.attributes.id + "-selector";
        let options = NMaker.sort(Object.values(NMaker.headings), this.attributes.order);

        for (let displayName of options) {
            let key = Object.keys(NMaker.headings).find(key => NMaker.headings[key] === displayName);
            if (this.attributes.ignore && this.attributes.ignore.includes(key)) continue;
            let opt = document.createElement("option");
            opt.value = key;
            opt.innerText = NMaker.headings[key];
            if (this.attributes.preselect && this.attributes.preselect.includes(key)) opt.selected = true;
            selector.appendChild(opt);
        }
        NMaker.addStylesToElement(selector, this.attributes.classes.selector);

        selector.onchange = () => {
            this.makeInputGroup();
            if (this.attributes.useModifier) {
                this.makeModifierOptions();
            }
        }

        return selector;
    }

    makeModifierOptions() {
        //populate Modifier options
        let modifier = document.getElementById(this.attributes.id + "-modifier");
        modifier.hidden = false;
        modifier.style.display = "block";

        //first clear old options
        while (modifier.firstChild) {
            modifier.removeChild(modifier.lastChild);
        }

        //then add options according to selected data type
        let value = NMaker.data[0][document.getElementById(this.attributes.id + "-selector").value];

        switch (typeof value) {
            case "bigint":
            case "number":
                this.attachOptions(modifier, this.attributes.modifier.number);
                break;
            case "string":
                this.attachOptions(modifier, this.attributes.modifier.string);
                break;
            case "boolean":
                modifier.hidden = true;
                modifier.style.display = "none";
                break;
            case "object":
                if (value instanceof Date) {
                    this.attachOptions(modifier, this.attributes.modifier.date);
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

    attachOptions(selector, values) {
        let isDefault = 1;
        for (let i = 0; i < values.length; i++) {
            let option = document.createElement("option");
            option.value = values[i];
            option.innerText = values[i];
            option.selected = isDefault++ == 1;
            selector.appendChild(option);
        }
    }

    makeInputGroup() {
        let value = NMaker.data[0][document.getElementById(this.attributes.id + "-selector").value];

        //make / remake input group and therefore inputs
        let inputGroup = NMaker.replaceElement(this.attributes.id + "-input-group", "div", this.attributes.classes.inputGroup);

        //basic input is only one input element so make that
        let input = document.createElement("input");
        input.id = this.attributes.id + "-input";

        //and a search button
        let search = NMaker.makeBtn(this.attributes.id + "-search", "Search", () => null, this.attributes.classes.button);

        switch (typeof value) {
            case "bigint":
            case "number":
                input.type = "number";
                input.placeholder = 0.00;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                search.onclick = () => this.filter(NMaker.modifierOptions.match);
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
            case "string":
                input.type = "text";
                input.placeholder = "Select...";
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                search.onclick = () => this.filter(NMaker.modifierOptions.contains);
                break;
            case "boolean":
                input.type = "checkbox";
                NMaker.addStylesToElement(input, this.attributes.classes.checkbox);
                search.onclick = () => this.filter(NMaker.modifierOptions.boolean);
                break;
            case "object":
                if (value instanceof Date) {
                    input.type = "date";
                    input.value = new Date().toISOString().split('T')[0];
                    NMaker.addStylesToElement(input, this.attributes.classes.input);
                    search.onclick = () => this.filter(NMaker.modifierOptions.date);
                }
                else console.error("Invalid object value found");
                break;
            default:
                throw new Error();
        }

        //attach input
        inputGroup.appendChild(input);

        //attach search button
        inputGroup.appendChild(search);

        //If 'useColumnFilter' is true, add the column show/hide button
        if (this.attributes.useColumnFilter) inputGroup.appendChild(this.makeColToggleBtn());

        //attach to input container
        document.getElementById(this.attributes.id + "-input-container").appendChild(inputGroup);
    }

    makeColToggleBtn() {
        //currently selected prop
        let prop = document.getElementById(this.attributes.id + "-selector").value;

        let btnName = NMaker.hiddenHeadings.includes(prop) ? "Show" : "Hide";

        let toggleColBtn = NMaker.makeBtn(this.attributes.id + "-col-filter", btnName, () => {
            //currently selected prop
            let prop = document.getElementById(this.attributes.id + "-selector").value;

            //check if current selected prop is on Table's hidden list
            if (NMaker.hiddenHeadings.includes(prop)) {
                NMaker.hiddenHeadings = NMaker.hiddenHeadings.filter((h) => h !== prop);
                toggleColBtn.innerText = "Hide";
            }
            else {
                NMaker.hiddenHeadings.push(prop);
                toggleColBtn.innerText = "Show";
            }

            // update table
            document.dispatchEvent(NMaker.updatedData);
            document.dispatchEvent(NMaker.updatedPageData);
        }, this.attributes.classes.button);

        return toggleColBtn;
    }

    makeDateRangeInput() {
        let dateRangePicker = NMaker.makeDateRangePicker(this.attributes.id + "-input-group", this.attributes.classes);

        let search = NMaker.makeBtn(this.attributes.id + "-search", "Search", () => null, this.attributes.classes.button);
        search.onclick = () => this.filter(NMaker.modifierOptions.dateRange);
        dateRangePicker.appendChild(search);

        //If 'useColumnFilter' is true, add the column show/hide button
        if (this.attributes.useColumnFilter) dateRangePicker.appendChild(this.makeColToggleBtn());

        //append input group to input container
        document.getElementById(this.attributes.id + "-input-container").appendChild(dateRangePicker);
    }

    makeNumberRangeInput() {
        let numberRangePicker = NMaker.makeNumberRangePicker(this.attributes.id + "-input-group", this.attributes.classes);

        let search = NMaker.makeBtn(this.attributes.id + "-search", "Search", () => this.filter(NMaker.modifierOptions.numberRange), this.attributes.classes.button);
        numberRangePicker.appendChild(search);

        //If 'useColumnFilter' is true, add the column show/hide button
        if (this.attributes.useColumnFilter) numberRangePicker.appendChild(this.makeColToggleBtn());

        //append input group to input container
        document.getElementById(this.attributes.id + "-input-container").appendChild(numberRangePicker);
    }

    makeSelectInput() {
        //remove old input / inputs by clearing input-group
        let inputGroup = NMaker.replaceElement(this.attributes.id + "-input-group", "div", this.attributes.classes.inputGroup);

        //basic input is only one input element so make that
        let input = document.createElement("select");
        input.id = this.attributes.id + "-input";
        NMaker.addStylesToElement(input, this.attributes.classes.selector);

        let option = document.getElementById(this.attributes.id + "-selector").value;
        let options = Array.from(new Set(NMaker.data.map(datum => {
            if (NMaker.displayValues[option] && datum[option] == NMaker.displayValues[option].value) return NMaker.displayValues[option].displayValue;
            else return datum[option];
        })));

        options.sort();
        this.attachOptions(input, options);

        inputGroup.appendChild(input);

        //and a search button
        let search = NMaker.makeBtn(this.attributes.id + "-search", "Search", () => null, this.attributes.classes.button);
        search.onclick = () => this.filter(NMaker.modifierOptions.match);
        inputGroup.appendChild(search);

        //If 'useColumnFilter' is true, add the column show/hide button
        if (this.attributes.useColumnFilter) inputGroup.appendChild(this.makeColToggleBtn());

        //append input group to input container
        document.getElementById(this.attributes.id + "-input-container").appendChild(inputGroup);
    }

    filter(type = null) {
        let selector = document.getElementById(this.attributes.id + "-selector");
        let prop = selector.value;
        this.data = NMaker.data;

        let filteredData = [];
        let inputValue = document.getElementById(this.attributes.id + "-input").value;


        if (NMaker.displayValues[prop] && inputValue == NMaker.displayValues[prop].displayValue) inputValue = NMaker.displayValues[prop].value;

        let inputGroup = document.getElementById(this.attributes.id + "-input-group");

        for (let row of this.data) {
            //little null catching trickery
            if (row[prop] == null || inputValue == null) {
                if (row[prop] == null && inputValue == null) filteredData.push(row);
                continue;
            }

            //otherwise can do proper data comparison
            switch (type) {
                case NMaker.modifierOptions.contains:
                    if (row[prop].toString().toLowerCase().includes(inputValue.toLowerCase())) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.boolean:
                    if (row[prop] == input.checked) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.date:
                    if (Date.parse(row[prop]) == Date.parse(inputValue)) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.match:
                case NMaker.modifierOptions.equals:
                case NMaker.modifierOptions.select:
                    if (row[prop].toString().toLowerCase() == inputValue.toLowerCase()) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.not:
                case NMaker.modifierOptions.excludes:
                    if (row[prop].toString().toLowerCase() != inputValue.toString().toLowerCase()) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.greaterThan:
                    if (Number(row[prop]) > Number(inputValue)) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.lessThan:
                    if (Number(row[prop]) < Number(inputValue)) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.startsWith:
                    if (row[prop].toString().toLowerCase().startsWith(inputValue.toString().toLowerCase())) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.dateRange:
                    if (Date.parse(row[prop]) >= Date.parse(inputGroup.dataset.fromDate) && Date.parse(row[prop]) <= Date.parse(inputGroup.dataset.toDate)) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.before:
                    if (!(row[prop] instanceof Date)) {
                        console.error("Cannot sort Date, data is not date");
                        break;
                    }
                    if (Date.parse(row[prop]) < Date.parse(input.value)) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.after:
                    if (!(row[prop] instanceof Date)) {
                        console.error("Cannot sort Date, data is not date");
                        break;
                    }
                    if (Date.parse(row[prop]) > Date.parse(input.value)) filteredData.push(row);
                    break;
                case NMaker.modifierOptions.numberRange:
                    let lowerInput = document.getElementById(inputGroup.id + "-lower");
                    let upperInput = document.getElementById(inputGroup.id + "-upper");
                    if (row[prop] < upperInput.value && row[prop] > lowerInput.value) filteredData.push(row);
            }
        }

        NMaker.filteredData = filteredData;
        NMaker.pagedData = filteredData;
        document.dispatchEvent(NMaker.updatedData);
        document.dispatchEvent(NMaker.updatedPageData);
    }
}