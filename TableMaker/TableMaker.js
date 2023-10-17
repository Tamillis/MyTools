class NMaker {
    static updatedData = new Event("updatedData");
    static updatedPageData = new Event("updatedPageData");
    static data = [];
    static filteredData = [];
    static headings = [];
    static hiddenHeadings = [];
    static displayValues = {};
    static searchHistory = "";

    static filterOptions = Object.freeze({
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

    static dom(queryString) {
        //just a shorter and slightly more flexible utility for getting DOM element/s, accepts id's as plain strings or css style selectors, and only returns a nodelist if multiple matches are found

        if (typeof queryString !== "string") return null;

        //assume plain text input is of an id unless it is an HTML element
        let htmlElements = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];
        queryString = /^[A-Za-z]*[A-Za-z][A-Za-z0-9-]*$/.test(queryString) && !htmlElements.includes(queryString) ? "#" + queryString : queryString;

        let els = document.querySelectorAll(queryString);

        //if the selector specifies one element, return that element directly, otherwise return the nodelist
        return els.length == 0 ? null :
            els.length == 1 ? els[0] : els;
    }

    //courtesy of https://stackoverflow.com/a/25047903
    static isDate(str) {
        return str !== null && (new Date(str) !== "Invalid Date") && !isNaN(new Date(str));
    }

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
        let el = NMaker.dom(id);
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

    static makeDateRangePicker(id, classes, lower = null, upper = null) {
        //some defaults
        let fromDateValue = NMaker.isDate(lower) ? lower : new Date().toISOString().split('T')[0];
        let toDateValue = NMaker.isDate(upper) ? upper : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7).toISOString().split('T')[0];

        //replace or make the container
        let dateRangePicker = NMaker.replaceElement(id, "div");
        NMaker.addStylesToElement(dateRangePicker, classes.inputGroup);

        //make from Date input
        let fromDateInput = document.createElement("input");
        fromDateInput.id = id + "-lower";
        fromDateInput.type = "date";
        fromDateInput.value = fromDateValue;
        NMaker.addStylesToElement(fromDateInput, classes.input);

        //make to Date input
        let toDateInput = document.createElement("input");
        toDateInput.id = id + "-upper";
        toDateInput.type = "date";
        toDateInput.value = toDateValue;
        NMaker.addStylesToElement(toDateInput, classes.input);

        let toDateLabel = document.createElement("label");
        toDateLabel.innerText = "→";
        toDateLabel.for = toDateInput.id;
        NMaker.addStylesToElement(toDateLabel, classes.label);

        dateRangePicker.appendChild(fromDateInput);
        dateRangePicker.appendChild(toDateLabel);
        dateRangePicker.appendChild(toDateInput);

        return dateRangePicker;
    }

    static makeNumberRangePicker(id, classes, lower = null, upper = null) {
        //replace or make the container
        let numberRangePicker = NMaker.replaceElement(id, "div");
        NMaker.addStylesToElement(numberRangePicker, classes.inputGroup);

        //make lower Number input
        let lowerNumberInput = document.createElement("input");
        lowerNumberInput.type = "number";
        if (lower === null) lowerNumberInput.placeholder = 0;
        else lowerNumberInput.value = lower;
        lowerNumberInput.id = id + "-lower";
        NMaker.addStylesToElement(lowerNumberInput, classes.input);

        //make upper number input
        let upperNumberInput = document.createElement("input");
        upperNumberInput.type = "number";
        if (upper === null) upperNumberInput.placeholder = 1;
        else upperNumberInput.value = upper;
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

    static resetData() {
        NMaker.filteredData = NMaker.data;
        NMaker.pagedData = NMaker.data;
        NMaker.searchHistory = "";
        NMaker.dom("filter-search-history") ? NMaker.dom("filter-search-history").innerText = "" : null;
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

        NMaker.dom(this.attributes.parentSelector).appendChild(this.table);

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
        NMaker.dom(this.attributes.parentSelector).appendChild(container);
    }

    updateDisplay() {
        NMaker.dom(this.attributes.id + "-display").innerText = this.getDisplay();
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
                container: ["mb-2", "d-flex", "g-2"],
                button: ["btn", "btn-sm", "btn-outline-primary"],
                label: ["input-group-text"],
                checkbox: ["form-check-input"],
                selectionContainer: ["px-2"],
                selector: ["form-select"],
                modifier: ["form-select"],
                inputContainer: ["flex-grow-1"],
                input: ["form-control"],
                inputGroup: ["input-group"],
                dateRange: ["input-group"],
                buttonGroup: ["btn-group", "px-2"]
            },
            ignore: false,
            order: NMaker.sortOptions.original,
            useModifier: false,
            modifiers: {
                number: [NMaker.filterOptions.equals, NMaker.filterOptions.greaterThan, NMaker.filterOptions.lessThan, NMaker.filterOptions.not, NMaker.filterOptions.numberRange],
                string: [NMaker.filterOptions.contains, NMaker.filterOptions.select, NMaker.filterOptions.startsWith, NMaker.filterOptions.match, NMaker.filterOptions.excludes],
                date: [NMaker.filterOptions.date, NMaker.filterOptions.dateRange, NMaker.filterOptions.before, NMaker.filterOptions.after],
                boolean: [NMaker.filterOptions.boolean]
            },
            useColumnFilter: false,
            useSubFilter: false
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        }

        this.attributes.classes = {
            ...this.attributeDefaults.classes,
            ...attributes.classes
        };

        this.attributes.modifiers = {
            ...this.attributeDefaults.modifiers,
            ...attributes.modifier
        }

        this.setupMemory();

        //make filter
        this.makeFilter();

        //call updatedPageData so that filter creation can be done with cross-dependencies
        document.addEventListener("updatedPageData", (e) => {
            if (this.attributes.useModifier) {
                for(let id of this.filterIds) NMaker.dom(id + "-modifier").onchange();
            }
            else this.makeSimpleInputGroup();
        });
    }

    setupMemory() {
        //this means memory can be overriden by the user to provide starting default selection, modifier and input prompts
        if (!this.attributes.memory) {
            this.attributes.memory = {
                selection: sessionStorage.getItem(this.attributes.id + "0-filter-memory-selection") ?? Object.keys(NMaker.data[0])[0],
                option: sessionStorage.getItem(this.attributes.id + "0-filter-memory-modifier") ?? NMaker.filterOptions.contains,
                upperValue: sessionStorage.getItem(this.attributes.id + "0-filter-memory-upper-value") ?? "",
                lowerValue: sessionStorage.getItem(this.attributes.id + "0-filter-memory-lower-value") ?? ""
            }
        }

        this.memory = {};
        this.memory[this.attributes.id] = this.attributes.memory;

        //used to enable the creation of subfilters
        this.filterIds = [];
        let storedFilterIds = sessionStorage.getItem(this.attributes.id + "-ids");
        if (this.attributes.useSubFilter && storedFilterIds !== null && storedFilterIds.split(",").length > 0) {
            this.filterIds = storedFilterIds.split(",");
        }

        if (this.filterIds.length > 0) {
            for (let i = 0; i < this.filterIds.length; i++) {
                this.memory[this.filterIds[i]] = {
                    selection: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-selection") ?? Object.keys(NMaker.data[0])[0],
                    option: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-modifier") ?? NMaker.filterOptions.contains,
                    upperValue: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-upper-value") ?? "",
                    lowerValue: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-lower-value") ?? ""
                };
            }
        }
    }

    makeFilter() {
        //make outer container
        let container = this.makeContainer(this.attributes.id, this.attributes.classes.container);
        //attach container to DOM
        NMaker.dom(this.attributes.parentSelector).appendChild(container);

        //make filter container
        let filterContainer = this.makeContainer(this.attributes.id + "-filters");
        container.appendChild(filterContainer);

        //make the button controls (add subfilter, reset button, search button)
        let btnControls = this.makeBtnControlsContainer();
        container.appendChild(btnControls);

        //create subfilters if memory calls for them && subfilters are in use
        if (this.attributes.useSubFilter && this.filterIds.length > 0) for (let i = 0; i < this.filterIds.length; i++) this.makeSubFilter(this.filterIds[i]);
        //else main filter is now just a new sub filter like any other
        else this.makeSubFilter();
    }

    makeSubFilter(id = null) {
        //a sub filter has only its own selection section and input section (no search box, reset btn, etc)
        //the subfilter has its own ID and uses that to piggy back on all the other filter maker functions

        //if id is null, a new dynamic subfilter is being made
        if (id == null) {
            id = this.attributes.id + this.filterIds.length;
            //push id of subfilter to filterIds
            this.filterIds.push(id);

            //start setting up new memory entry
            this.memory[id] = {};
        }

        //make subfilter container
        let container = this.makeContainer(id, this.attributes.classes.container);

        //make remove button, that removes subfilter & removes that id from filterIds array 
        let removeBtn = NMaker.makeBtn(id + "-remove-btn", "-", () => {
            if (this.filterIds.length == 1) return;
            this.filterIds = this.filterIds.filter(filterId => filterId !== id);
            NMaker.dom(id).remove();
        }, this.attributes.classes.button);
        container.appendChild(removeBtn);

        //make selection container (selector, & modifier if in use)
        let selection = this.makeSelectionContainer(id);
        container.appendChild(selection);

        //make the input container
        let input = this.makeContainer(id + "-input-container", this.attributes.classes.inputContainer);
        container.appendChild(input);

        //attach container to DOM
        NMaker.dom(this.attributes.id + "-filters").appendChild(container);

        //create the initial input
        this.makeSimpleInputGroup(id);

        //create the initial modifier options, if in use
        if (this.attributes.useModifier) {
            this.makeModifierOptions(id);
        }

    }

    makeContainer(id, classes) {
        let container = document.createElement("div");
        container.id = id;
        NMaker.addStylesToElement(container, classes);
        return container;
    }

    makeSelectionContainer(id = this.attributes.id) {
        //selection container
        let selectionContainer = this.makeContainer(id + "-selection-container", this.attributes.classes.selectionContainer);

        //selector input group
        let selectionInputGroup = this.makeContainer(id + "-selection-group", this.attributes.classes.inputGroup);

        //property dropdown 'selector'
        let selector = this.makeSelector(id);
        selectionInputGroup.appendChild(selector);

        //create the modifier if wanted
        if (this.attributes.useModifier) {
            let modifier = this.makeModifier(id);
            selectionInputGroup.appendChild(modifier);
        }

        selectionContainer.appendChild(selectionInputGroup);

        //If 'useColumnFilter' is true, add the column show/hide button
        if (this.attributes.useColumnFilter) selectionInputGroup.insertBefore(this.makeColToggleBtn(id, selector.value), selector);

        return selectionContainer;
    }

    makeBtnControlsContainer() {
        //btn group container
        let btnControlsContainer = this.makeContainer(this.attributes.id + "-btn-controls-container", this.attributes.classes.buttonGroup);

        if (this.attributes.useSubFilter) {
            //add filter button
            let addBtn = NMaker.makeBtn(this.attributes.id + "-add", "+", () => this.makeSubFilter(), this.attributes.classes.button);
            btnControlsContainer.appendChild(addBtn);
        }

        //reset button
        let resetBtn = NMaker.makeBtn(this.attributes.id + "-reset", "↺", () => {
            NMaker.resetData();
            document.dispatchEvent(NMaker.updatedData);
            document.dispatchEvent(NMaker.updatedPageData);
        }, this.attributes.classes.button)
        btnControlsContainer.appendChild(resetBtn);

        //make the search button
        let searchBtn = this.makeSearchBtn();
        btnControlsContainer.appendChild(searchBtn);

        return btnControlsContainer;
    }

    makeSearchBtn() {
        return NMaker.makeBtn(this.attributes.id + "-search", "Search", () => {
            //reset data to be without filters
            NMaker.resetData();

            //remake the filter memory
            this.memory = {};
            for (let filterId of this.filterIds) {
                let selection = NMaker.dom(filterId + "-selector").value;
                let lowerValue = NMaker.dom(filterId + "-input") == null ? "" : NMaker.dom(filterId + "-input").value;
                let option = this.attributes.useModifier ? NMaker.dom(filterId + "-modifier").value : this.getDefaultFilterOption(lowerValue);
                let upperValue = null;

                if (option == NMaker.filterOptions.dateRange || option == NMaker.filterOptions.numberRange) {
                    //inputGroup is used by the dateRange and numberRange
                    lowerValue = NMaker.dom(filterId + "-input-group-lower").value;
                    upperValue = NMaker.dom(filterId + "-input-group-upper").value;
                }
                else if (option == NMaker.filterOptions.boolean) {
                    lowerValue = NMaker.dom(filterId + "-input").checked;
                }

                this.memory[filterId] = {
                    option: option,
                    selection: selection,
                    lowerValue: lowerValue,
                    upperValue: upperValue
                };

                this.updateFilterSearchHistory(filterId, option, lowerValue, upperValue);

                //record in memory
                sessionStorage.setItem(filterId + "-filter-memory-selection", selection);
                sessionStorage.setItem(filterId + "-filter-memory-modifier", option);
                sessionStorage.setItem(filterId + "-filter-memory-lower-value", lowerValue);
                sessionStorage.setItem(filterId + "-filter-memory-upper-value", upperValue);
            }

            sessionStorage.setItem(this.attributes.id + "-ids", this.filterIds.reduce((acc, curr) => acc + "," + curr));

            //use the filter stack to apply a sequence of filters
            for (let filter of Object.values(this.memory)) {
                this.filter(filter.option, filter.selection, filter.lowerValue, filter.upperValue);
            }

            //dispatch events to update filter and table
            document.dispatchEvent(NMaker.updatedData);
            document.dispatchEvent(NMaker.updatedPageData);
        }, this.attributes.classes.button);
    }

    makeModifier(id) {
        //modifier is select box
        let modifier = document.createElement("select");
        modifier.id = id + "-modifier";
        modifier.onchange = () => {
            if (modifier.value == NMaker.filterOptions.dateRange) this.makeDateRangeInputGroup(id);
            else if (modifier.value == NMaker.filterOptions.select) this.makeSelectInput(id);
            else if (modifier.value == NMaker.filterOptions.numberRange) this.makeNumberRangeInputGroup(id);
            else this.makeSimpleInputGroup(id);
        }
        NMaker.addStylesToElement(modifier, this.attributes.classes.modifier);

        return modifier;
    }

    makeSelector(id = this.attributes.id) {
        let selector = document.createElement("select");
        selector.id = id + "-selector";
        let headings = NMaker.sort(Object.values(NMaker.headings), this.attributes.order);

        for (let displayHeading of headings) {
            let heading = Object.keys(NMaker.headings).find(heading => NMaker.headings[heading] === displayHeading);
            if (this.attributes.ignore && this.attributes.ignore.includes(heading)) continue;
            let opt = document.createElement("option");
            opt.value = heading;
            if (opt.value == this.memory[id].selection) opt.selected = true;
            opt.innerText = NMaker.headings[heading];
            selector.appendChild(opt);
        }
        NMaker.addStylesToElement(selector, this.attributes.classes.selector);

        selector.onchange = () => {
            NMaker.dom(id + "-col-filter").innerText = NMaker.hiddenHeadings.includes(selector.value) ? "Show" : "Hide";
            if (this.attributes.useModifier) this.makeModifierOptions(id);
            else this.makeSimpleInputGroup(id);
        }

        return selector;
    }

    makeModifierOptions(id = this.attributes.id) {
        //populate Modifier options
        let modifier = NMaker.dom(id + "-modifier");
        modifier.hidden = false;
        modifier.style.display = "block";

        //first clear old options
        while (modifier.firstChild) {
            modifier.removeChild(modifier.lastChild);
        }

        //then add options according to selected data type
        let value = NMaker.data[0][NMaker.dom(id + "-selector").value];

        switch (typeof value) {
            case "bigint":
            case "number":
                this.attachOptions(modifier, this.attributes.modifiers.number, this.memory[id].option);
                break;
            case "string":
                this.attachOptions(modifier, this.attributes.modifiers.string, this.memory[id].option);
                break;
            case "boolean":
                this.attachOptions(modifier, this.attributes.modifiers.boolean, this.memory[id].option);
                break;
            case "object":
                if (value instanceof Date) {
                    this.attachOptions(modifier, this.attributes.modifiers.date, this.memory[id].option);
                }
                else console.error("Invalid object value found");
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
        }

        if (modifier.childNodes.length <= 1) {
            modifier.hidden = true;
            modifier.style.display = "none";
        }

        modifier.onchange();
    }

    attachOptions(parent, values, selectedValue) {
        for (let i = 0; i < values.length; i++) {
            let option = document.createElement("option");
            option.value = values[i];
            option.innerText = values[i];
            if (option.value == selectedValue) option.selected = true;
            parent.appendChild(option);
        }
    }

    getDefaultFilterOption(value) {
        switch (typeof value) {
            case "bigint":
            case "number":
                return NMaker.filterOptions.equals;
            case "undefined":
                console.error("Value is undefined");
                return;
            case "string":
                return NMaker.filterOptions.match;
            case "boolean":
                return NMaker.filterOptions.boolean;
            case "object":
                if (value instanceof Date) {
                    return NMaker.filterOptions.date;
                }
                else console.error("Invalid object value found");
                return;
            default:
                throw new Error();
        }
    }

    makeSimpleInputGroup(id) {
        let type = typeof NMaker.data[0][NMaker.dom(id + "-selector").value];
        let value = NMaker.data[0][NMaker.dom(id + "-selector").value];

        //make / remake input group and therefore inputs
        let inputGroup = NMaker.replaceElement(id + "-input-group", "div", this.attributes.classes.inputGroup);

        //basic input is only one input element so make that
        let input = document.createElement("input");
        input.id = id + "-input";

        switch (type) {
            case "bigint":
            case "number":
                input.type = "number";
                input.placeholder = 0;
                if (Number(this.memory[id].lowerValue == "number") != NaN) input.value = this.memory[id].lowerValue;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
            case "string":
                input.type = "text";
                if (!this.memory[id].lowerValue || this.memory[id].lowerValue == "") input.placeholder = "Select...";
                else input.value = this.memory[id].lowerValue;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "boolean":
                input.type = "checkbox";
                input.checked = JSON.parse(this.memory[id].lowerValue ?? false);
                NMaker.addStylesToElement(input, this.attributes.classes.checkbox);
                break;
            case "object":
                if (value instanceof Date) {
                    input.type = "date";
                    if (NMaker.isDate(this.memory[id].lowerValue)) input.value = this.memory[id].lowerValue;
                    else input.value = new Date().toISOString().split('T')[0];
                    NMaker.addStylesToElement(input, this.attributes.classes.input);
                }
                else console.error("Invalid object value found");
                break;
            default:
                throw new Error();
        }

        //basic input should have enter-to-search capability
        input.onkeyup = ({ key }) => { if (key === "Enter") NMaker.dom(id + "-search").click() };

        //attach input
        inputGroup.appendChild(input);

        //attach to input container
        NMaker.dom(id + "-input-container").appendChild(inputGroup);
    }

    makeColToggleBtn(id, value) {
        //currently selected prop
        let prop = value;

        let btnName = NMaker.hiddenHeadings.includes(prop) ? "Show" : "Hide";

        let toggleColBtn = NMaker.makeBtn(id + "-col-filter", btnName, () => {
            //currently selected prop
            let prop = NMaker.dom(id + "-selector").value;

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

    makeDateRangeInputGroup(id) {
        let dateRangePicker = NMaker.makeDateRangePicker(id + "-input-group", this.attributes.classes, this.memory[id].lowerValue, this.memory[id].upperValue);

        //append input group to input container
        NMaker.dom(id + "-input-container").appendChild(dateRangePicker);
    }

    makeNumberRangeInputGroup(id) {
        let numberRangePicker = NMaker.makeNumberRangePicker(id + "-input-group", this.attributes.classes, this.memory[id].lowerValue, this.memory[id].upperValue);

        //append input group to input container
        NMaker.dom(id + "-input-container").appendChild(numberRangePicker);
    }

    makeSelectInput(id) {
        //remove old input / inputs by clearing input-group
        let inputGroup = NMaker.replaceElement(id + "-input-group", "div", this.attributes.classes.inputGroup);

        //basic input is only one input element so make that
        let input = document.createElement("select");
        input.id = id + "-input";
        NMaker.addStylesToElement(input, this.attributes.classes.selector);

        let option = NMaker.dom(id + "-selector").value;
        let options = Array.from(new Set(NMaker.data.map(datum => {
            if (NMaker.displayValues[option] && datum[option] == NMaker.displayValues[option].value) return NMaker.displayValues[option].displayValue;
            else return datum[option];
        })));

        options.sort();
        this.attachOptions(input, options, this.memory[id].lowerValue);

        if (this.memory[id].lowerValue == "") {
            let placeholderOption = document.createElement("option");
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            placeholderOption.value = "";
            placeholderOption.innerText = "Select one of...";
            input.insertBefore(placeholderOption, input.firstElementChild);
        }

        inputGroup.appendChild(input);

        //append input group to input container
        NMaker.dom(id + "-input-container").appendChild(inputGroup);
    }

    updateFilterSearchHistory(id, filterOption, lowerValue, upperValue = null) {
        let selector = NMaker.dom(id + "-selector");
        NMaker.searchHistory += `, ${selector.options[selector.selectedIndex].text} ${filterOption} ${lowerValue}`;
        if (upperValue) NMaker.searchHistory += ` + ${upperValue}`;
        if (NMaker.searchHistory[0] == ",") NMaker.searchHistory = NMaker.searchHistory.slice(2);
        let searchHistory = NMaker.dom("filter-search-history");
        if (searchHistory) searchHistory.innerText = NMaker.searchHistory;
    }

    filter(filterOption, col, lowerValue, upperValue = null) {
        //Get the correct data for the filter to filter by input or input group
        let prop = col;
        let lowerInputValue = lowerValue;
        let upperInputValue = upperValue;

        //correct input display value to actual data values
        if (NMaker.displayValues[prop] && lowerInputValue == NMaker.displayValues[prop].displayValue) lowerInputValue = NMaker.displayValues[prop].value;

        //new filtered data to fill in empty array
        let filteredData = [];

        for (let row of NMaker.filteredData) {
            //little null catching trickery
            if (row[prop] == null || lowerInputValue == null) {
                if (row[prop] == null && lowerInputValue == null) filteredData.push(row);
                continue;
            }

            //otherwise can do proper data comparison
            switch (filterOption) {
                case NMaker.filterOptions.contains:
                    if (row[prop].toString().toLowerCase().includes(lowerInputValue.toLowerCase())) filteredData.push(row);
                    break;
                case NMaker.filterOptions.boolean:
                    if (row[prop] == lowerValue) filteredData.push(row);
                    break;
                case NMaker.filterOptions.date:
                    if (Date.parse(row[prop]) == Date.parse(lowerInputValue)) filteredData.push(row);
                    break;
                case NMaker.filterOptions.match:
                case NMaker.filterOptions.equals:
                case NMaker.filterOptions.select:
                    if (row[prop].toString().toLowerCase() == lowerInputValue.toLowerCase()) filteredData.push(row);
                    break;
                case NMaker.filterOptions.not:
                case NMaker.filterOptions.excludes:
                    if (!row[prop].toString().toLowerCase().includes(lowerInputValue.toString().toLowerCase())) filteredData.push(row);
                    break;
                case NMaker.filterOptions.greaterThan:
                    if (Number(row[prop]) > Number(lowerInputValue)) filteredData.push(row);
                    break;
                case NMaker.filterOptions.lessThan:
                    if (Number(row[prop]) < Number(lowerInputValue)) filteredData.push(row);
                    break;
                case NMaker.filterOptions.startsWith:
                    if (row[prop].toString().toLowerCase().startsWith(lowerInputValue.toString().toLowerCase())) filteredData.push(row);
                    break;
                case NMaker.filterOptions.dateRange:
                    if (Date.parse(row[prop]) >= Date.parse(lowerInputValue) && Date.parse(row[prop]) <= Date.parse(upperInputValue)) filteredData.push(row);
                    break;
                case NMaker.filterOptions.before:
                    if (!(row[prop] instanceof Date)) {
                        console.error("Cannot sort Date, data is not date");
                        break;
                    }
                    if (Date.parse(row[prop]) < Date.parse(lowerInputValue)) filteredData.push(row);
                    break;
                case NMaker.filterOptions.after:
                    if (!(row[prop] instanceof Date)) {
                        console.error("Cannot sort Date, data is not date");
                        break;
                    }
                    if (Date.parse(row[prop]) > Date.parse(lowerInputValue)) filteredData.push(row);
                    break;
                case NMaker.filterOptions.numberRange:
                    if (row[prop] < upperInputValue && row[prop] > lowerInputValue) filteredData.push(row);
            }
        }

        NMaker.filteredData = filteredData;
        NMaker.pagedData = filteredData;
    }
}