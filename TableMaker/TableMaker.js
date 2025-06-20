class NMaker {
    static filterOptions = Object.freeze({
        equals: "=",
        greaterThan: ">",
        lessThan: "<",
        not: "is not",
        numberRange: "is in the range",
        match: "matches",
        contains: "contains",
        startsWith: "starts with",
        excludes: "excludes",
        date: "is the date",
        dateRange: "is between",
        before: "is before",
        after: "is after",
        boolean: "is",
        select: "is one of",
        empty: "is empty"
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

    static buildEvent = new Event("build");

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

    static removeSecondsFromISOString(str) {
        let val = str.split(":");
        return `${val[0]}:${val[1]}:00`;
    }

    //courtesy of https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
    static toKebabCase(str) {
        return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
    }

    //courtesy of https://stackoverflow.com/questions/21147832/convert-camel-case-to-human-readable-string
    static toCapitalizedWords(name) {
        var words = name.match(/[A-Za-z][a-z]*|[0-9]+/g) || [];
        return words.map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
    }

    //couresy of https://stackoverflow.com/questions/4068573/convert-string-to-pascal-case-aka-uppercamelcase-in-javascript
    static toPascalCase(str) {
        if (/^[\p{L}\d]+$/iu.test(str)) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return str.replace(
            /([\p{L}\d])([\p{L}\d]*)/giu,
            (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()
        ).replace(/[^\p{L}\d]/giu, '');
    }

    //courtesy of https://stackoverflow.com/questions/16242449/regex-currency-validation
    static isPoundCurrency(data) {
        return /(?=.*?\d)^£?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/.test(data);
    }

    //checks data is tabular
    static isCompatible(data) {
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
            let props = Object.keys(data[i]).sort().join(",");

            //if the properties of the previous row don't match this one
            if (i > 0 && prevProps !== props) {
                console.warn(prevProps, props);
                console.error("Row of data doesn't fit columns");
                return false;
            }
            prevProps = props;
        }

        return true;
    }

    //compare using NMaker sortOptions
    static compare = (sortOption, a, b) => {
        if (sortOption == NMaker.sortOptions.original) return 1;
        if (sortOption == NMaker.sortOptions.numeric || sortOption == NMaker.sortOptions.date) return a - b;
        if (sortOption == NMaker.sortOptions.numericReverse || sortOption == NMaker.sortOptions.dateReverse) return b - a;
        if (sortOption == NMaker.sortOptions.alphabetical) {
            if (a === null) return 1;
            else return a.localeCompare(b);
        }
        if (sortOption == NMaker.sortOptions.alphabeticalReverse) {
            if (b === null) return 1;
            else return b.localeCompare(a);
        }
        return 1;
    };

    //sort using NMaker sortOptions
    static sort(data, sortOption) {
        return data.slice().sort((a, b) => NMaker.compare(sortOption, a, b));
    }

    //produce a range of numeric values in an array
    static range(lower, upper, step = 1) {
        let arr = []
        for (let i = lower; i <= upper; i += step) {
            arr.push(i);
        }
        return arr;
    }

    static addStylesToElement(el, styles) {
        if (!(el instanceof Element)) return;
        if (Array.isArray(styles)) for (let style of styles) el.classList.add(style);
    }

    static removeStylesFromElement(el, styles) {
        if (Array.isArray(styles)) for (let style of styles) el.classList.remove(style);
    }

    static replaceElement(id, kind, styles = null) {
        let el = NMaker.dom(id);
        if (el) el.parentElement.removeChild(el);
        el = document.createElement(kind);
        el.id = id;
        if (styles) NMaker.addStylesToElement(el, styles);
        return el;
    }

    static makeBtn(id, text, fn, classes = null, tooltip = null) {
        let btn = document.createElement("button");
        btn.id = id;
        btn.innerText = text;
        btn.onclick = fn;
        btn.type = "button";
        if (classes) NMaker.addStylesToElement(btn, classes);
        if (tooltip) btn.title = tooltip;
        return btn;
    }

    static makeLink(text, link, classes = null) {
        let a = document.createElement("a");
        a.innerText = text;
        a.href = link;
        if (classes) NMaker.addStylesToElement(a, classes);
        return a;
    }

    static makeImg(src, alt, classes = null) {
        let img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        if (classes) NMaker.addStylesToElement(img, classes);
        return img;
    }

    static makeElement(element, attributes, classes) {
        let el = document.createElement(element);
        NMaker.addStylesToElement(el, classes)

        for (let attr in attributes) {
            el[attr] = attributes[attr];
        }

        //and tweaks based on element
        if (element == "textarea") el.innerText = el.value != undefined ? el.value : "";
        else if (element == "input" && attributes.type && attributes.type == "datetime-local" && attributes.value) {
            el.value = NMaker.removeSecondsFromISOString(attributes.value);
        }

        return el;
    }

    static makeNullableDateInput(id, classes = { container: [], input: [], button: [] }, value = null) {

        let container = NMaker.makeElement("div", {}, classes.container);
        let input = NMaker.makeElement("input", { type: "date", id: id, name: NMaker.toPascalCase(id) }, classes.input);
        input.value = value;
        let btn = NMaker.makeBtn(id + "-btn", "X", () => input.value = "", classes.button, "Clear date");
        container.appendChild(input);
        container.appendChild(btn);

        return container;
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
        toDateLabel.htmlFor = toDateInput.id;
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
        lowerNumberInput.pattern = "^-?(0|[1-9]\d*)(\.\d+)?$"; //by default number input considers any valid number valid
        lowerNumberInput.step = "any";
        if (lower === null) lowerNumberInput.placeholder = 0;
        else lowerNumberInput.value = Number(lower);
        lowerNumberInput.id = id + "-lower";
        NMaker.addStylesToElement(lowerNumberInput, classes.input);

        //make upper number input
        let upperNumberInput = document.createElement("input");
        upperNumberInput.type = "number";
        upperNumberInput.pattern = "^-?(0|[1-9]\d*)(\.\d+)?$";
        upperNumberInput.step = "any";
        if (upper === null) upperNumberInput.placeholder = 1;
        else upperNumberInput.value = Number(upper);
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

    static makeMultiSelector(options, id, name, classes = {}, label = null) {
        let defaultClasses = {
            label: [],
            container: ["container"],
            display: ["form-control"],
            selector: ["form-control"]
        };

        classes = {
            ...defaultClasses, ...classes
        }

        if (options == null || options.length == 0) {
            console.warn("makeMultiSelector() called without options, failed to make.");
            return;
        }
        if (id == null || name == null) console.warn("makeMultiSelector() called without an id or name")

        let container = document.createElement("div");
        container.id = id + "-container";
        NMaker.addStylesToElement(container, classes.container);

        //hidden input of csv's
        let input = document.createElement("input");
        input.id = id;
        input.name = name;
        input.type = "hidden";
        container.appendChild(input);

        //label
        let labelEl = document.createElement("label");
        labelEl.id = id + "-label";
        if (label == null) label = NMaker.toCapitalizedWords(name);
        labelEl.innerText = label;
        NMaker.addStylesToElement(labelEl, classes.label);
        container.appendChild(labelEl);

        //display output
        let output = document.createElement("input");
        output.id = id + "-output";
        output.readOnly = true;
        output.type = "text";
        NMaker.addStylesToElement(output, classes.display);
        container.appendChild(output);

        //selection box of options
        let selector = document.createElement("select");
        selector.multiple = true;
        selector.style.overflowY = "auto";  //its a multiple select box, don't need scroll bars unless its too big
        NMaker.addStylesToElement(selector, classes.selector);
        for (let option of options) {
            let opt = document.createElement("option");
            opt.innerText = option;
            selector.appendChild(opt);
            //cheeky use of the obj representing the select node for tracking state
            opt.addEventListener("mousedown", () => {
                if (selector["NMaker_" + opt.innerText]) {
                    delete selector["NMaker_" + opt.innerText];
                    opt.style.background = "rgba(0,0,0,0)";
                } else {
                    selector["NMaker_" + opt.innerText] = opt.innerText;
                    opt.style.background = "rgba(0,0,0,0.1)";
                }
                output.value = getSelected().join(", ");
                input.value = getSelected().join("|");
                ;
            });
        }

        container.appendChild(selector);

        let getSelected = () => {
            let selected = [];
            for (let option of options) {
                if (selector["NMaker_" + option]) selected.push(option);
            }
            return selected;
        }

        return container;
    }

    static makeTextSelect(datalist, attributes = {}) {
        let defaultAttributes = {
            id: "ts-" + new Date().getTime(),
            name: attributes.id ? NMaker.toPascalCase(attributes.id) : 'TextSelector',
            label: "",
            placeholder: false,
            autocomplete: true,
            allowOtherInput: false, //if the user is allowed to input something that is not in the given datalist
            classes: {
                input: ["form-control"],
                container: [],
                label: [],
                warning: ["text-danger"]
            },
            value: false,
            defaultValue: false //what to use if a user enters something that doesn't exist
        }

        attributes = {
            ...defaultAttributes,
            ...attributes
        };


        attributes.classes = {
            ...defaultAttributes.classes,
            ...attributes.classes
        }

        //make container
        let container = NMaker.replaceElement(attributes.id + "-container", "div", attributes.classes.container);

        let data = [];

        //check datalist is a string id of valid datalists
        if (typeof datalist == "string") {
            if (NMaker.dom(datalist) && NMaker.dom(datalist).tagName == "DATALIST") {
                //construct data from identified datalist
                for (let opt of NMaker.dom(datalist).children) {
                    if (!(opt.dataset.hasOwnProperty("id") || opt.value == "")) {
                        console.warn("Datalist lacking 'value' or 'data-id' attribute.");
                        return;
                    }
                    data.push({ value: opt.value, id: opt.dataset.id })
                }

                //set datalist to the datalist element
                datalist = NMaker.dom(datalist);
            }
            else {
                console.warn(datalist + " is not the id of a datalist.");
                return;
            }
        }
        //or an array of valid composition ([{id: X, value: Y}, ...]), so an associated datalist has to be made for browser datalist suggestions to work
        else if (Array.isArray(datalist)) {
            for (let datum of datalist) {
                if (typeof datum == "object" && datum.hasOwnProperty("id") && datum.hasOwnProperty("value")) {
                    data.push({ value: datum.value, id: datum.id })
                }
                else {
                    console.warn("Data provided in datalist has invalid properties, make sure datalist is an array of objects with the properties 'id' and 'value'", datalist);
                    return;
                }
            }

            //construct datalist
            datalist = document.createElement("datalist");
            datalist.id = attributes.id + "-datalist";
            for (let datum of data) {
                let opt = document.createElement("option");
                opt.value = datum.value;
                opt.dataset.id = datum.id;
                datalist.appendChild(opt);
            }
            container.appendChild(datalist);
        }

        //make backing input
        let backingInput = NMaker.makeElement("input", { id: attributes.id, name: attributes.name, type: "hidden" });
        container.appendChild(backingInput);

        //if label
        if (attributes.label != "") {
            let label = NMaker.makeElement("label", { htmlFor: attributes.id + "-text-input" }, attributes.classes.label);
            label.innerText = attributes.label;
            container.appendChild(label);
        }

        //make text input
        let textInput = NMaker.makeElement("input", { id: attributes.id + "-text-input", type: "text" }, attributes.classes.input);
        if (attributes.placeholder) textInput.placeholder = attributes.placeholder;
        if (attributes.placeholder) textInput.placeholder = attributes.placeholder;
        textInput.setAttribute("list", datalist.id);

        //save prior input to reset with if necessary
        let priorInput = "";
        textInput.addEventListener("beforeinput", (e) => priorInput = e.target.value);

        //check input matches text, put that text's associated value in the backingInput
        textInput.addEventListener("input", (e) => {
            let possibilities = data.filter(datum => datum.value.toLowerCase().includes(textInput.value.toLowerCase()));

            if (possibilities.length == 0) {
                if (!attributes.allowOtherInput) {
                    textInput.value = priorInput;
                    NMaker.addStylesToElement(textInput, attributes.classes.warning);
                }
                else {
                    backingInput.value = textInput.value;
                }
            }
            else {
                backingInput.value = possibilities[0].id;
                NMaker.removeStylesFromElement(textInput, attributes.classes.warning);
            }
        });

        //remove danger highlight on focusout
        textInput.addEventListener("focusout", () => NMaker.removeStylesFromElement(textInput, attributes.classes.warning), true);

        //autocomplete ensures that when the user clicks off, a full list value is overwritten into the target input
        //set id input to corresponding list value
        if (attributes.autocomplete && !attributes.allowOtherInput) {
            let update = () => {
                let matchingOptions = data.filter(datum => datum.value.toLowerCase().includes(textInput.value.toLowerCase()));
                if (matchingOptions.length == 0) console.warn(`No matching datalist options found for TextSelector's value ${textInput.value}`);
                textInput.value = matchingOptions.length == 0 ?
                    (attributes.defaultValue ? attributes.defaultValue : data[0].value) :
                    textInput.value = matchingOptions.length == 0 ?
                        (attributes.defaultValue ? attributes.defaultValue : data[0].value) :
                        matchingOptions[0].value;
            }
            textInput.addEventListener("focusout", update, true);
            textInput.addEventListener("keydown", (e) => {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    update();
                }
            }, true);
        }

        container.appendChild(textInput);

        //if there's an initial value, set that
        if (attributes.value) {
            //find
            textInput.value = attributes.value;
        }

        //and autofill if autocompleting
        if (attributes.autocomplete) {
            textInput.dispatchEvent(new Event("input"));
            textInput.dispatchEvent(new Event("focusout"));
        }

        return container;
    }

    // two overlapping range inputs, with two spans to display the values, to function as a bounding input
    static makeDoubleSlider(attributes = {}) {
        const defaultAttributes = {
            id: "double-slider",
            parentSelector: "body",
            max: 1,
            min: 0,
            step: 0.01,
            lower: 0,
            lowerLabel: "",
            upper: 1,
            upperLabel: "",
            labelPosition: "above",
            lowerRangeName: "LowerRange",
            upperRangeName: "UpperRange",
            sliderColour: "#000",
            sliderBackground: "#ccc"
        };

        let defaultClasses = {
            input: ["form-control", "w-fit"],
            slider: ["double-slider"],
            container: ["f-col"],
            displayContainer: ["f-row"],
            numberContainer: ["input-group", "input-group-sm"],
            numberLabel: ["input-group-text"],
            btn: ["btn", "btn-sm", "btn-danger"],
            useUpperBtn: ["btn-info"],
            ignoreUpperBtn: ["btn-danger"]
        }

        attributes = {
            ...defaultAttributes, ...attributes
        };
        attributes.classes = {
            ...defaultClasses,
            ...attributes.classes
        };

        //Create Functionality
        let makeInput = (id, name, type) => {
            let input = NMaker.makeElement("input", { id: id, type: type, min: attributes.min, max: attributes.max, step: attributes.step }, attributes.classes.input);
            input.name = name;
            return input;
        }

        let lowerSliderInput = makeInput(attributes.id + "-lower-slider", attributes.lowerRangeName, "range");
        lowerSliderInput.className = attributes.classes.slider.join(" ");
        let upperSliderInput = makeInput(attributes.id + "-upper-slider", attributes.upperRangeName, "range");
        upperSliderInput.className = attributes.classes.slider.join(" ");

        let sliderTrack = document.createElement("div");
        sliderTrack.className = "double-slider-track";

        let lowerNumberInput = makeInput(attributes.id + "-lower-number-input", attributes.lowerRangeName, "number");
        lowerNumberInput.style.width = "5em";
        let upperNumberInput = makeInput(attributes.id + "-upper-number-input", attributes.lowerRangeName, "number");
        upperNumberInput.style.width = "5em";
        let useUpperToggle = NMaker.makeElement("button", { id: attributes.id + "-use-upper-toggle", innerText: "Ignore" }, attributes.classes.btn);

        let useUpper = true;
        let priorupper = Number.MIN_SAFE_INTEGER;
        let priorlower = Number.MAX_SAFE_INTEGER;
        let lower = attributes.lower < attributes.min ? attributes.min : attributes.lower;
        let upper = attributes.upper > attributes.max ? attributes.max : attributes.upper;

        let setSliderTrack = () => {
            if (useUpper) {
                let per1 = (lower / attributes.max) * 100;
                let per2 = (upper / attributes.max) * 100;
                sliderTrack.style.background = `linear-gradient(to right, ${attributes.sliderBackground} ${per1}% , ${attributes.sliderColour} ${per1}% , ${attributes.sliderColour} ${per2}%, ${attributes.sliderBackground} ${per2}%)`;
            }
            else {
                sliderTrack.style.background = attributes.sliderBackground;
            }
        }
        let setLower = (val) => {
            if (val == priorlower) return;
            lower = Number(val);
            priorlower = lower;

            if (lower >= upper) {
                upper = lower + attributes.step;
                if (upper > attributes.max) {
                    upper = attributes.max;
                    lower = attributes.max - attributes.step;
                }
                setUpper(upper);
            }
            lowerSliderInput.value = lower;
            lowerNumberInput.value = val;   //retains non numeric number characters like decimal point
            setSliderTrack();
        }
        let setUpper = (val) => {
            if (val == priorupper) return;
            upper = Number(val);
            priorupper = upper;
            if (upper <= lower) {
                lower = upper - attributes.step;
                if (lower < attributes.min) {
                    lower = attributes.min;
                    upper = attributes.min + attributes.step;
                }
                setLower(lower);
            }
            upperSliderInput.value = upper;
            upperNumberInput.value = val;
            setSliderTrack();
        }

        //init lower and upper
        setLower(lower);
        setUpper(upper);

        lowerSliderInput.addEventListener("input", (e) => setLower(e.target.value));
        upperSliderInput.addEventListener("input", (e) => setUpper(e.target.value));

        lowerNumberInput.addEventListener("input", (e) => setLower(e.target.value));
        upperNumberInput.addEventListener("input", (e) => setUpper(e.target.value));

        useUpperToggle.addEventListener("click", (e) => {
            useUpper = !useUpper;
            useUpperToggle.dataset.useUpper = useUpper;

            if (useUpper) {
                upperSliderInput.classList.remove("hidden");
                upperSliderInput.value = attributes.max;
                upperNumberInput.classList.remove("hidden");
                upperNumberInput.value = attributes.max;
                upper = attributes.max;
                e.target.innerText = "Ignore";
                NMaker.removeStylesFromElement(e.target, attributes.classes.useUpperBtn);
                NMaker.addStylesToElement(e.target, attributes.classes.ignoreUpperBtn);
            }
            else {
                upperSliderInput.classList.add("hidden");
                upperNumberInput.classList.add("hidden");
                upperNumberInput.value = "";
                e.target.innerText = "Use Upperbound";
                NMaker.addStylesToElement(e.target, attributes.classes.useUpperBtn);
                NMaker.removeStylesFromElement(e.target, attributes.classes.ignoreUpperBtn);
            }
            setSliderTrack();
        });

        //And Structure DOM
        let container = document.createElement("div");
        container.id = attributes.id;
        container.className = attributes.classes.container.join(" ");

        let inputContainer = document.createElement("div");
        inputContainer.style.position = "relative";
        inputContainer.style.width = "100%";
        let displayContainer = document.createElement("div");
        NMaker.addStylesToElement(displayContainer, attributes.classes.displayContainer);

        let upperContainer = document.createElement("div");
        upperContainer.className = attributes.classes.numberContainer.join(" ");
        upperContainer.style.width = "unset";
        let lowerContainer = document.createElement("div");
        lowerContainer.className = attributes.classes.numberContainer.join(" ");
        lowerContainer.style.width = "unset";

        let upperLabel = document.createElement("label");
        upperLabel.innerText = attributes.upperLabel;
        upperLabel.className = attributes.classes.numberLabel.join(" ");
        let lowerLabel = document.createElement("label");
        lowerLabel.innerText = attributes.lowerLabel;
        lowerLabel.className = attributes.classes.numberLabel.join(" ");

        let makeSpacer = () => {
            let spacer = document.createElement("div");
            spacer.style.flexGrow = "2";
            return spacer;
        }

        inputContainer.appendChild(sliderTrack);
        inputContainer.appendChild(lowerSliderInput);
        inputContainer.appendChild(upperSliderInput);

        lowerContainer.appendChild(lowerNumberInput);
        lowerContainer.appendChild(lowerLabel);

        upperContainer.appendChild(useUpperToggle);
        upperContainer.appendChild(upperNumberInput);
        upperContainer.appendChild(upperLabel);

        displayContainer.appendChild(lowerContainer);
        displayContainer.appendChild(makeSpacer());
        displayContainer.appendChild(upperContainer);

        if (attributes.labelPosition == "above") {
            container.appendChild(displayContainer);
            container.appendChild(inputContainer);
        }
        else {
            container.appendChild(inputContainer);
            container.appendChild(displayContainer);
        }
        NMaker.dom(attributes.parentSelector).appendChild(container);
    }

    //all NMaker stored data start with their attribute plus -etc so this removes all storage kvp assocaited with element of id 'id'
    static clearStorageOfId(id) {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            if (sessionStorage.key(i).startsWith(id)) {
                sessionStorage.removeItem(sessionStorage.key(i));
            }
        }
    }

    //A convenience wrapper when you wish to build an updater from a blueprint and not bother with other Maker capabilities
    static makeUpdater(blueprint, attributes) {
        let maker = new Maker([blueprint]);
        maker.makeUpdater(attributes);
        maker.build();
        return;
    }

    //parse datalist into the format used by tablemaker in various locations: an array of kvp {value, text} for options <option value="x" data-id="y" />
    static parseKvpDatalist(id) {
        return Array.from(dom(id).children).map(opt => {
            return {
                value: opt.dataset.id,
                text: opt.value
            }
        });
    }
}

class Maker {
    constructor(data, attributes = {}) {
        if (!NMaker.isCompatible(data)) throw new Error("No or invalid JSON provided");

        this.activeData = [...data];
        this.initialData = Object.freeze(data);
        this.data = data;
        this.filterNone = false;

        this.headings = [];
        this.hiddenHeadings = false;
        this.initialHiddenHeadings = false;
        this.showHeadings = null;
        this.hide = false;
        this.noHide = false;
        this.ignoreHideBtns = attributes.ignoreHideBtns ? attributes.ignoreHideBtns : false;

        //initial hidden headings as set by attributes
        this.hiddenHeadings = attributes.hide ? attributes.hide : false;
        this.noHide = attributes.noHide ? attributes.noHide : false;

        //if using hide "all" and show attribute, calculate the hiddenHeadings
        if (this.hiddenHeadings && this.hiddenHeadings.includes("all") && attributes.show) {
            this.hiddenHeadings = [];
            for (let heading in this.data[0]) {
                if (attributes.show.includes(heading)) continue;
                else this.hiddenHeadings.push(heading);
            }
            this.initialHiddenHeadings = this.hiddenHeadings;
        }

        //save initial hidden headings for reset purposes
        if (this.hiddenHeadings) this.initialHiddenHeadings = [...this.hiddenHeadings];

        //generate initial coltypes from first row of data, accepting attribute overrides after
        this.colTypes = { ...this.data[0] }
        for (let prop in this.colTypes) {
            let type = typeof this.colTypes[prop];
            if (type == 'object' && this.colTypes[prop] instanceof Date) type = 'date';
            this.colTypes[prop] = type;
        }
        this.colTypes = { ...this.colTypes, ...attributes.colTypes }

        for (let key of Object.keys(data[0])) this.headings[key] = NMaker.toCapitalizedWords(key);

        this.displayHeadings = {};
        if (attributes.displayHeadings) {
            for (let heading of Object.keys(attributes.displayHeadings)) {
                if (!Object.keys(this.headings).includes(heading)) continue;
                this.headings[heading] = attributes.displayHeadings[heading];
            }
        }

        this.displayValues = {};
        if (attributes.displayValues) {
            for (let displayValue in attributes.displayValues) {
                this.displayValues[displayValue] = attributes.displayValues[displayValue];
            }
        }
    }

    makeTable(attributes = {}) {
        this.table = new TableMaker(this, attributes);
    }

    makeFilter(attributes = {}) {
        this.filter = new FilterMaker(this, attributes);
    }

    makePaginator(attributes = {}) {
        this.paginator = new PaginatorMaker(this, attributes);
    }

    makeUpdater(attributes = {}) {
        this.updater = new UpdaterMaker(this, attributes);
    }

    build() {
        if (!this.table && !this.updater) throw new Error("Cannot build without either an instance of TableMaker or UpdaterMaker");

        if (this.table) {
            //rebuild active data
            this.activeData = this.getFilteredData();

            if (this.filter) this.filter.makeFilter();

            if (this.paginator) {
                //if there's less than a page of active data just clear the paginator from the screen
                if (this.paginator.attributes.pageLength >= this.activeData.length) {
                    NMaker.dom(this.paginator.attributes.parentSelector).innerHTML = '';
                }
                else {
                    //else reduce active data down to the data of this page
                    this.activeData = this.paginator.getPagedData(this.activeData);
                    this.paginator.makePaginator();
                }
            }

            this.table.makeTable(this.activeData);
        }

        if (this.updater) {
            this.updater.makeUpdater();
        }

        //to allow for external elements to hook into rebuild events, fire a rebuild event
        document.dispatchEvent(NMaker.buildEvent);
    }

    //seems like this ought to be part of filter, no?
    //seems like this ought to be part of filter, no?
    getFilteredData() {
        let data = this.data;

        if (this.filter && !this.filterNone) {
            this.filter.setMemoryFromStorage();
            for (let filter of Object.values(this.filter.memory)) {
                data = this.filter.filter(data, filter.option, filter.selection, filter.lowerValue, filter.upperValue);
            }
            if (this.filter.attributes.additionalFilters) {
                for (let filter of this.filter.attributes.additionalFilters) {
                    data = this.filter.filter(data, filter.option, filter.selection, filter.lowerValue, filter.upperValue);
                }
            }
        }

        return data;
    }
}

class TableMaker {
    constructor(Maker, attributes = {}) {
        //Defaults
        this.attributeDefaults = {
            id: "t-" + Date.now(),
            classes: {
                table: ["table", "table-bordered"],
                tr: [],
                th: [],
                heading: ["h6", "text-center", "flex-fill", "me-2"],
                headingContainer: ["d-flex", "flex-row", "justify-content-between"],
                td: ["text-secondary"],
                button: ["btn", "btn-sm", "btn-outline-primary", "height-auto"],
                buttonGroup: ["btn-group"],
                removeBtn: ["btn-outline-danger"],
                controlsContainer: ["d-flex", "mx-2"],
                controls: ["btn-group"],
                controlBtn: ["btn", "btn-sm", "btn-outline-light"],
                resetIcon: ["bi", "bi-reply-all"],
                link: ["btn", "btn-sm", "btn-outline-info"]
            },
            conditionalClasses: false,
            parentSelector: "body",
            sorting: false,
            noSorting: false,
            sortingOrientation: {},
            useReset: true,
            useShow: true,
            currency: false,
            link: false
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        };

        this.attributes.classes = {
            ...this.attributeDefaults.classes,
            ...attributes.classes
        }

        this.Maker = Maker;
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

            //sort the data based on its type
            let data = this.Maker.data;
            data = data.slice().sort((prevRow, currRow) => {
                let sortOption = null;
                switch (this.Maker.colTypes[column]) {
                    case "number":
                        sortOption = btnKind == "asc" ? NMaker.sortOptions.numeric : NMaker.sortOptions.numericReverse;
                        break;
                    case "string":
                        sortOption = btnKind == "asc" ? NMaker.sortOptions.alphabetical : NMaker.sortOptions.alphabeticalReverse;
                        break;
                    case "date":
                    case "datetime":
                    case "boolean":
                        sortOption = btnKind == "asc" ? NMaker.sortOptions.numeric : NMaker.sortOptions.numericReverse;
                        break;
                    default:
                        sortOption = NMaker.sortOptions.alphabetical;
                }

                return NMaker.compare(sortOption, prevRow[column], currRow[column]);
            });

            this.Maker.data = data;

            this.Maker.build();
        }, this.attributes.classes.button);
    }

    makeTableHead() {
        let thead = this.table.createTHead();
        let row = thead.insertRow();
        NMaker.addStylesToElement(row, this.attributes.classes.tr);
        for (let heading of Object.keys(this.Maker.headings)) {
            if (this.attributes.hide && this.attributes.hide.includes(heading)) continue;

            let th = document.createElement("th");
            th.value = heading;
            NMaker.addStylesToElement(th, this.attributes.classes.th);

            let headingContainer = document.createElement("div");
            NMaker.addStylesToElement(headingContainer, this.attributes.classes.headingContainer);

            let span = document.createElement("span");
            NMaker.addStylesToElement(span, this.attributes.classes.heading);
            span.innerText = this.Maker.headings[heading];
            headingContainer.appendChild(span);

            let btnContainer = document.createElement("div");
            NMaker.addStylesToElement(btnContainer, this.attributes.classes.buttonGroup);
            //sort btn
            if ((this.attributes.sorting && this.attributes.sorting.includes(heading)) ||
                (this.attributes.sorting && this.attributes.sorting.includes("all") && !(this.attributes.noSorting && this.attributes.noSorting.includes(heading)))) {
                //record the state of the sort button
                if (this.attributes.sortingOrientation[heading] == null) this.attributes.sortingOrientation[heading] = "unset";

                let btn = this.addSortBtn(heading);
                btn.title = "Click to sort by this column";
                NMaker.addStylesToElement(btn, this.attributes.classes.button);
                btnContainer.appendChild(btn);
            }

            //hide btn
            if (!this.Maker.ignoreHideBtns) {
                if (this.Maker.hiddenHeadings && (this.Maker.noHide ? !this.Maker.noHide.includes(heading) : true)) {
                    let hideBtn = NMaker.makeBtn(this.attributes.id + "-" + heading + "-hide-btn", "✕", () => {
                        this.Maker.hiddenHeadings.push(heading);
                        this.Maker.build();
                    }, this.attributes.classes.button.concat(this.attributes.classes.removeBtn));
                    hideBtn.title = "Click to hide this columns, show again with the 👁 Cols button";
                    btnContainer.appendChild(hideBtn);
                }
            }

            headingContainer.appendChild(btnContainer);

            th.appendChild(headingContainer);
            row.appendChild(th);
        }
        return thead;
    }


    makeTableBody(data) {
        let tbody = this.table.createTBody();
        NMaker.addStylesToElement(tbody, this.attributes.classes.tbody);

        for (let rowData of data) {
            this.generateRow(tbody, rowData);
        }
        return tbody;
    }

    getDisplayValue(dv, content, data, key) {
        //only match null with null
        if (dv.value === null && data[key] === null) {
            content = dv.displayValue;
        }
        else if (dv.value !== null && data[key] !== null && dv.value.toString() == data[key].toString()) {
            content = dv.displayValue;
        }

        return content;
    }

    generateRow(tbody, rowData) {
        let tr = tbody.insertRow();

        for (let prop in rowData) {
            if (this.attributes.hide && this.attributes.hide.includes(prop)) continue;

            let td = document.createElement("td");

            NMaker.addStylesToElement(td, this.attributes.classes.td);

            //FORMAT DATA
            let cellData = rowData[prop];

            //check if displayValues exist for key
            if (this.Maker.displayValues.hasOwnProperty(prop)) {
                if (Array.isArray(this.Maker.displayValues[prop])) {
                    for (let dv of this.Maker.displayValues[prop]) {
                        cellData = this.getDisplayValue(dv, cellData, rowData, prop);
                    }
                } else {
                    cellData = this.getDisplayValue(this.Maker.displayValues[prop], cellData, rowData, prop);
                }
            }

            //Dates
            if (cellData instanceof Date) {
                if (this.Maker.colTypes[prop] == "date") cellData = document.createTextNode(cellData.toLocaleDateString());
                else if (["datetime", "datetime-local"].includes(this.Maker.colTypes[prop])) cellData = document.createTextNode(cellData.toLocaleString());
                else {
                    //type has not been correctly set, just print
                    cellData = document.createTextNode(cellData);
                }
            }

            //Currency
            else if (this.attributes.currency && this.attributes.currency.includes(prop)) {
                const formatter = new Intl.NumberFormat('en-UK', {
                    style: 'currency',
                    currency: 'GBP',
                });
                cellData = document.createTextNode(formatter.format(cellData));
            }

            //Link
            else if (this.attributes.link && this.attributes.link.hasOwnProperty(prop)) {
                let linkData = this.attributes.link[prop];

                //if linkData is the name of another property, use the data in there instead for variable link text
                for (let otherProp in rowData) {
                    if (linkData.includes(otherProp) && otherProp !== prop) linkData = linkData.replace(otherProp, rowData[otherProp]);
                }

                //skip if this row has null or blank data
                if (cellData == null || cellData == "") cellData = document.createTextNode("");
                else cellData = NMaker.makeLink(linkData, cellData, this.attributes.classes.link);
            }

            //Image
            else if (this.attributes.img && this.attributes.img.hasOwnProperty(prop)) {
                let imgData = this.attributes.img[prop];
                if (cellData == null) cellData = document.createTextNode("[No image]");
                else cellData = NMaker.makeImg(cellData, imgData, this.attributes.classes.img);
            }

            //HTML
            else if (this.Maker.colTypes[prop].toLowerCase() == "html") {
                //parse cellData to html nodes
                var wrapper = document.createElement('div');
                wrapper.innerHTML = cellData;
                cellData = wrapper.firstChild == null ? document.createTextNode(cellData) : wrapper.firstChild;
            }

            //Text node
            else {
                cellData = document.createTextNode(cellData);
            }

            td.appendChild(cellData);

            // Apply conditional class to tr of td if condition is met against the cell's data
            // condition must be stated as boolean expression of values and boolean operators and the heading of the cell under evaluation, key, which will be replaced with the actual value of the cell
            if (this.attributes.conditionalClasses.hasOwnProperty(prop)) {
                if (Array.isArray(this.attributes.conditionalClasses[prop])) {
                    for (let cc of this.attributes.conditionalClasses[prop]) {
                        this.addConditionalClass(rowData, tr, td, { ...cc });
                    }
                }
                else this.addConditionalClass(rowData, tr, td, { ...this.attributes.conditionalClasses[prop] });
            }

            tr.appendChild(td);
        }
    }

    addConditionalClass(data, tr, td, cc) {
        // TODO: Fix replacing prop with prop where the beginning is the same (i.e. replacing ViewLinkNotFound being replaced by ViewLink, leaving NotFound floating...)
        //Replace any prop in the condition with the value of that prop
        for (let prop in data) {
            //check for dates
            if (data[prop] !== null && this.Maker.colTypes[prop].includes("date")) cc.condition = cc.condition.replaceAll(prop + ' ', "new Date(" + JSON.stringify(data[prop]) + ")");
            else cc.condition = cc.condition.replaceAll(prop + ' ', JSON.stringify(data[prop]));
        }

        if (eval?.(`"use strict";(${cc.condition})`) && cc.classesIf) {
            this.addStylesToTarget(cc.target, tr, td, cc.classesIf);
        }
        else if (cc.classesNot) {
            this.addStylesToTarget(cc.target, tr, td, cc.classesNot);
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

    makeShowBtn() {
        //show button, which is a select box whose first option is the btn icon, and whose selections get put into the hiddenHeadings list, the select box itself resetting.
        let showBtn = NMaker.makeElement(
            "select",
            {
                id: this.attributes.id + "-show",
                title: "Select hidden columns to show"
            },
            this.attributes.classes.controlBtn);

        let defaultOption = document.createElement("option");
        defaultOption.innerText = "👁 Cols";
        defaultOption.style.display = "none";
        defaultOption.selected = true;
        showBtn.appendChild(defaultOption);

        for (let heading of NMaker.sort(this.Maker.hiddenHeadings, this.attributes.order)) {
            let opt = document.createElement("option");
            opt.value = heading;
            opt.innerText = this.Maker.headings[heading];
            showBtn.appendChild(opt);
        }
        showBtn.onchange = () => {
            this.Maker.hiddenHeadings = this.Maker.hiddenHeadings.filter(h => h !== showBtn.value);
            showBtn.value = showBtn.firstElementChild.value;
            this.Maker.build();
        }

        return showBtn;
    }

    makeShowAllBtn() {
        let btn = NMaker.makeBtn(
            this.attributes.id + "-reset-btn", "",
            () => {
                //set maker to filter nothing
                this.Maker.filterNone = true;
                this.Maker.build();
            },
            this.attributes.classes.controlBtn,
            "Show all data");
        btn.innerHTML = '&#x21ba; Show All';
        return btn;
    }

    makeButtonControls() {
        let controlBtnsContainer = NMaker.replaceElement(this.attributes.id + "-controls-container", "div", this.attributes.classes.controlsContainer);
        let controlBtnsGroup = NMaker.replaceElement(this.attributes.id + "-controls-btn-group", "div", this.attributes.classes.controls);

        //tabular reset button to show all rows regardless of any filter
        if (this.Maker.filter && this.attributes.useReset && !this.showingAll()) controlBtnsGroup.appendChild(this.makeShowAllBtn());

        if (this.Maker.hiddenHeadings && this.attributes.useShow) controlBtnsGroup.appendChild(this.makeShowBtn());

        controlBtnsContainer.appendChild(controlBtnsGroup);
        NMaker.dom(this.attributes.parentSelector).appendChild(controlBtnsContainer);
    }

    makeTable(data) {
        this.table = NMaker.replaceElement(this.attributes.id, "table", this.attributes.classes.table);

        this.attributes.hide = this.Maker.hiddenHeadings;
        this.makeButtonControls();
        this.makeTableHead();
        this.makeTableBody(data);

        NMaker.dom(this.attributes.parentSelector).appendChild(this.table);
    }

    showingAll() {
        return this.Maker.initialData.length == this.Maker.getFilteredData().length
    }
}

class PaginatorMaker {
    constructor(Maker, attributes = {}) {
        // Defaults
        this.attributeDefaults = {
            id: "paginatorMaker-" + Date.now(),
            parentSelector: "body",
            pageLength: 50,
            fullDisplay: false,
            classes: {
                container: ["navbar", "navbar-expand-sm"],
                displayContainer: ["flex"],
                button: ["btn", "btn-sm", "btn-outline-primary"],
                p: ["navbar-brand", "mx-2", "my-0", "text-center"],
                small: ["w-100", "small", "text-center"]
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

        this.Maker = Maker;
        this.page = 1;
    }

    /// produce a new array to prevent mutation
    getPagedData(data) {
        //update pages based on passed in data
        this.pages = Math.ceil(data.length / this.attributes.pageLength);
        if (this.page > this.pages) this.page = 1;

        let pagedData = [];
        //pages are 1-indexed
        //this.page is the current page, this.attributes.pages is the total number of pages, this.pageLength is the number of entries per page
        for (let i = 0; i < this.attributes.pageLength; i++) {
            let j = (this.page - 1) * this.attributes.pageLength + i;
            if (j < data.length) pagedData[i] = data[j];
            else break;
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
            this.Maker.build();
        }, this.attributes.classes.button);
        container.appendChild(prevBtn);

        //create current page display
        let pageDisplay = this.getDisplay();
        container.appendChild(pageDisplay);

        //next button
        let nextBtn = NMaker.makeBtn("nextBtn", "→", () => {
            this.page++;
            if (this.page > this.pages) {
                if (this.attributes.buttons == NMaker.paginatorOptions.bookend) this.page = this.pages;
                else if (this.attributes.buttons == NMaker.paginatorOptions.cycle) this.page = 1;
                else throw new Error("Invalid PaginatorMaker buttons option");
            }
            this.Maker.build();
        }, this.attributes.classes.button);
        container.appendChild(nextBtn);

        //attach
        NMaker.dom(this.attributes.parentSelector).appendChild(container);

        //toggle paginator display if 1 / 1 pages
        this.togglePaginator();
    }

    togglePaginator() {
        if (this.pages <= 1) NMaker.dom(this.attributes.id).hidden = true;
        else NMaker.dom(this.attributes.id).hidden = false;
    }

    getDisplay() {
        //get text
        let mainDisplay = document.createTextNode(`Page ${this.page} / ${this.pages}`);
        let subDisplay = "";
        if (this.attributes.fullDisplay) {
            subDisplay = `${this.Maker.getFilteredData().length} / ${this.Maker.initialData.length} rows`;
        }
        subDisplay += ` (${this.Maker.activeData.length} shown)\n`;
        subDisplay = document.createTextNode(subDisplay);

        //create html structure & apply styles
        let container = document.createElement("div");
        container.id = this.attributes.id + "-display";
        NMaker.addStylesToElement(container, this.attributes.classes.displayContainer);
        let pMain = document.createElement("p");
        NMaker.addStylesToElement(pMain, this.attributes.classes.p);
        pMain.appendChild(mainDisplay);
        let pSub = document.createElement("p");
        NMaker.addStylesToElement(pSub, this.attributes.classes.small);
        pSub.appendChild(subDisplay);

        container.appendChild(pMain);
        container.appendChild(pSub);

        return container;
    }
}

class FilterMaker {
    constructor(Maker, attributes = {}) {
        this.attributeDefaults = {
            id: "filter-" + Date.now(),
            parentSelector: "body",
            classes: {
                container: ["mb-2", "d-flex", "g-2"],
                filterContainer: ["flex-grow-1"],
                button: ["btn", "btn-sm"],
                utilityBtn: ["btn-outline-secondary"],
                searchBtn: [],
                resetBtn: [],
                removeBtn: ["btn-danger"],
                addBtn: ["btn-success"],
                buttonGroup: ["btn-group", "px-2"],
                checkbox: ["form-check-input"],
                selectionContainer: ["mx-2", "d-flex", "g-2", "align-items-baseline"],
                selectionGroup: [],
                selector: ["form-select", "col"],
                modifierGroup: [],
                modifier: ["form-select"],
                label: ["mx-2"],
                inputContainer: ["flex-grow-1"],
                input: ["form-control", "flex-grow-1"],
                inputGroup: ["mx-1", "d-flex", "align-items-baseline"],
                dateRange: ["input-group"]
            },
            ignore: false,
            order: NMaker.sortOptions.original,
            verbose: false, //accepts the object {col: ColumntTextHere, mod: ModifierTextHere}
            useModifier: false,
            modifiers: {
                number: [NMaker.filterOptions.equals, NMaker.filterOptions.greaterThan, NMaker.filterOptions.lessThan, NMaker.filterOptions.not, NMaker.filterOptions.numberRange],
                string: [NMaker.filterOptions.contains, NMaker.filterOptions.select, NMaker.filterOptions.startsWith, NMaker.filterOptions.match, NMaker.filterOptions.excludes, NMaker.filterOptions.empty],
                date: [NMaker.filterOptions.date, NMaker.filterOptions.dateRange, NMaker.filterOptions.before, NMaker.filterOptions.after, NMaker.filterOptions.empty],
                boolean: [NMaker.filterOptions.boolean]
            },
            useSubFilter: false,
            useReset: false,
            defaultSettings: {
                selection: Object.keys(Maker.data[0])[0],
                option: NMaker.filterOptions.contains,
                upperValue: "",
                lowerValue: ""
            },
            additionalFilters: false
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        }

        //set reset settings to default settings
        if (!attributes.resetSettings) {
            this.attributes.resetSettings = Array.isArray(this.attributes.defaultSettings) ?
                [...this.attributes.defaultSettings] :
                { ...this.attributes.defaultSettings };
        }

        this.attributes.classes = {
            ...this.attributeDefaults.classes,
            ...attributes.classes
        };

        this.attributes.modifiers = {
            ...this.attributeDefaults.modifiers,
            ...attributes.modifiers
        }

        this.attributes.defaultSettings = attributes.defaultSettings ?? this.attributeDefaults.defaultSettings;

        this.Maker = Maker;
    }

    setMemoryFromStorage() {
        this.memory = {};

        //make filterIds from storage if using memory, 
        this.filterIds = [];
        let storedFilterIds = sessionStorage.getItem(this.attributes.id + "-ids");
        if (storedFilterIds !== null) {
            //if using subfilter, multiple storedFilerIds is ok            
            if (this.attributes.useSubFilter) {
                this.filterIds = storedFilterIds.split(",");
            }
            else {
                //else use an array of only the first found result, should somehow more than one be found
                this.filterIds = [storedFilterIds.split(",")[0]];
            }
        }

        //if stored filters found, set memory from associated stored values
        if (this.filterIds.length > 0) {
            for (let i = 0; i < this.filterIds.length; i++) {
                this.memory[this.filterIds[i]] = {
                    selection: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-selection") ?? Object.keys(this.Maker.data[0])[0],
                    option: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-modifier") ?? NMaker.filterOptions.contains,
                    upperValue: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-upper-value") ?? "",
                    lowerValue: sessionStorage.getItem(this.filterIds[i] + "-filter-memory-lower-value") ?? ""
                };

                //boolean checking, otherwise would remain as strings 'true' or 'false'
                if (this.memory[this.filterIds[i]].option == NMaker.filterOptions.boolean) {
                    this.memory[this.filterIds[i]].lowerValue = this.memory[this.filterIds[i]].lowerValue !== 'false';
                }
            }
        } else {
            //storage memory should override defaults, but if none are found those defaults need to be kept.
            this.setMemoryFromSettings();
            this.saveMemoryToStorage();
        }
    }

    setMemoryFromSettings(settings) {
        if (settings == null) settings = this.attributes.defaultSettings;

        //assuming no memory, so need to reset filterids as well
        this.filterIds = [];
        this.memory = {};

        //if defaultSettings is array, for multiple filter defaults
        if (Array.isArray(settings)) {
            //Check if SubFilters are also in use, if not these defaults are not OK
            if (!this.attributes.useSubFilter) throw new Error("Cannot use multiple filter default unless useSubFilter is true");

            for (let set of settings) {
                this.filterIds.push(this.makeNewFilterId());
                this.memory[this.filterIds[this.filterIds.length - 1]] = set;
            }
        }
        //else for a single filter default
        else {
            this.filterIds = [this.getNextFilterId()];
            this.memory[this.filterIds[0]] = settings;
        }
    }

    getNextFilterId() {
        //this method should be the only way to handle getting this.filterIdsNext so that this is properly contained to avoid issues
        if (!this.hasOwnProperty('filterIdsNext')) {
            this.filterIdsNext = 0;

            //if using memory get next filter id after stored ids, if such exist
            let storedFilterIds = sessionStorage.getItem(this.attributes.id + "-ids");
            if (storedFilterIds !== null) {
                storedFilterIds = storedFilterIds.split(',');
                //get the value at the end of the last filter id
                let prevfilterIdParts = storedFilterIds[storedFilterIds.length - 1].split("-");
                let numberPart = prevfilterIdParts[prevfilterIdParts.length - 1];
                this.filterIdsNext = Number(numberPart) + 1;
            }
        }
        return this.attributes.id + "-" + this.filterIdsNext;
    }

    makeNewFilterId() {
        if (!this.hasOwnProperty('filterIdsNext')) {
            let parts = this.getNextFilterId().split("-");
            this.filterIdsNext = Number(parts[parts.length - 1]);
        }
        else this.filterIdsNext++;
        return this.attributes.id + "-" + this.filterIdsNext;
    }

    makeFilter() {
        //create memory from storage or defaults
        this.setMemoryFromStorage();

        //make outer container
        let container = NMaker.replaceElement(this.attributes.id, "div", this.attributes.classes.container);
        //attach container to DOM
        NMaker.dom(this.attributes.parentSelector).appendChild(container);

        //make filter container
        let filterContainer = NMaker.replaceElement(this.attributes.id + "-filters", "div", this.attributes.classes.filterContainer);
        container.appendChild(filterContainer);

        //make the button controls (add subfilter, reset button, search button)
        let btnControls = this.makeBtnControls();
        container.appendChild(btnControls);

        this.makeSubFilters();
    }

    makeSubFilters() {
        //create subfilters if memory calls for them && subfilters are in use
        if (this.attributes.useSubFilter && this.filterIds.length > 0) {
            for (let i = 0; i < this.filterIds.length; i++) {
                this.makeSubFilter(this.filterIds[i]);
            }
        }
        //else main filter is now just a new sub filter like any other
        else this.makeSubFilter();

        if (this.attributes.useSubFilter) this.toggleRemoveBtns();
    }

    makeSubFilter(id = null) {
        //a sub filter has only its own selection section and input section (no search box, reset btn, etc)
        //the subfilter has its own ID and uses that to piggy back on all the other filter maker functions

        //if id is null, subfilters aren't in use, so id should be this.filterIds[0]
        if (id == null) {
            if (this.filterIds.length > 1) console.warn("this.filterIds should be of length 1, but is greater");
            id = this.filterIds[0];
        }

        //make subfilter container
        let container = NMaker.replaceElement(id, "div", this.attributes.classes.container);

        //make remove button, that removes subfilter & removes that id from filterIds array 
        if (this.attributes.useSubFilter) {
            let removeBtn = NMaker.makeBtn(id + "-remove-btn", "-", () => {
                if (this.filterIds.length == 1) return;
                this.filterIds = this.filterIds.filter(filterId => filterId !== id);
                NMaker.dom(id).remove();
                this.toggleRemoveBtns();
            }, this.attributes.classes.button.concat(this.attributes.classes.removeBtn), "Remove filter");
            container.appendChild(removeBtn);
        }

        //make selection container (selector, & modifier if in use)
        let selection = this.makeSelectionContainer(id);
        container.appendChild(selection);

        //make the input container
        let input = NMaker.replaceElement(id + "-input-container", "div", this.attributes.classes.inputContainer);
        container.appendChild(input);

        //attach container to DOM
        NMaker.dom(this.attributes.id + "-filters").appendChild(container);

        //create the initial modifier options, if in use
        if (this.attributes.useModifier) {
            this.makeModifierOptions(id);
        }
        else {
            this.makeSimpleInputGroup(id);
        }
    }

    toggleRemoveBtns() {
        //show/hide removeBtns based on filterIds length
        for (let filter of NMaker.dom(this.attributes.id + "-filters").childNodes) {
            let btn = NMaker.dom(filter.id + "-remove-btn");
            if (this.filterIds.length == 1) {
                btn.hidden = true;
                btn.style.display = "none";
            }
            else {
                btn.hidden = false;
                btn.style.display = "inline-block";
            }
        }
    }

    makeSelectionContainer(id = this.attributes.id) {
        //selection container
        let selectionContainer = NMaker.replaceElement(id + "-selection-container", "div", this.attributes.classes.selectionContainer);

        //label
        if (this.attributes.verbose) {
            //make col label
            let colLabel = NMaker.makeElement("label", { htmlFor: id + "-selector", innerText: "Column" }, this.attributes.classes.label);
            if (this.attributes.verbose.hasOwnProperty("col")) {
                colLabel.innerText = this.attributes.verbose.col;
            }
            selectionContainer.appendChild(colLabel);
        }

        //selector input group
        let selectionInputGroup = NMaker.replaceElement(id + "-selection-group", "div", this.attributes.classes.selectionGroup);

        //property dropdown 'selector'
        let selector = this.makeSelector(id);
        selectionInputGroup.appendChild(selector);


        selectionContainer.appendChild(selectionInputGroup);

        //don't create the modifier if not wanted
        if (!this.attributes.useModifier) return selectionContainer;

        //label
        if (this.attributes.verbose) {
            //make modifier label
            let modLabel = NMaker.makeElement("label", { htmlFor: id + "-modifier", innerText: "which" }, this.attributes.classes.label);
            if (this.attributes.verbose.hasOwnProperty("mod")) modLabel.innerText = this.attributes.verbose.mod;
            selectionContainer.appendChild(modLabel);
        }

        let modifierInputGroup = NMaker.replaceElement(id + "-modifier-group", "div", this.attributes.classes.modifierGroup);
        modifierInputGroup.appendChild(this.makeModifier(id));

        selectionContainer.appendChild(modifierInputGroup);

        return selectionContainer;
    }

    makeBtnControls() {
        //btn group container
        let btnControlsContainer = NMaker.replaceElement(this.attributes.id + "-btn-controls-container", "div", this.attributes.classes.buttonGroup);

        //add filter button
        if (this.attributes.useSubFilter) {
            let addBtn = NMaker.makeBtn(this.attributes.id + "-add", "+", () => {
                //generate new id
                this.filterIds.push(this.makeNewFilterId());

                //make memory entry for that new filter
                this.memory[this.filterIds[this.filterIds.length - 1]] = {
                    selection: Object.keys(this.Maker.data[0])[0],
                    option: NMaker.filterOptions.contains,
                    upperValue: "",
                    lowerValue: ""
                }

                //create that subfilter
                this.makeSubFilter(this.filterIds[this.filterIds.length - 1]);

                //saveToStorage to propogate new subfilter
                this.saveMemoryToStorage();

                //toggle presence of remove btns
                this.toggleRemoveBtns();

            }, this.attributes.classes.button.concat(this.attributes.classes.addBtn), "Add filter");
            btnControlsContainer.appendChild(addBtn);
        }

        //reset button - resets filters to resetSettings, which defaults to defaultSettings
        if (this.attributes.useReset) {
            let resetBtn = NMaker.makeBtn(
                this.attributes.id + "-reset",
                "↺",
                () => {
                    //clear sessionStorage of relevant items
                    NMaker.clearStorageOfId(this.attributes.id);
                    // //hard reset data
                    // this.Maker.activeData = this.Maker.initialData;

                    //set filter to blank
                    this.setMemoryFromSettings(this.attributes.resetSettings);
                    this.saveMemoryToStorage();

                    //build reset filters from storage
                    this.Maker.build();
                },
                [...this.attributes.classes.button, ...this.attributes.classes.utilityBtn, ...this.attributes.classes.resetBtn],
                "Reset filters to settings")
            btnControlsContainer.appendChild(resetBtn);
        }

        //make the search button
        let searchBtn = this.makeSearchBtn();
        btnControlsContainer.appendChild(searchBtn);

        return btnControlsContainer;
    }

    setMemoryFromFilters() {
        //set memory from current filters
        this.memory = {};
        for (let filterId of this.filterIds) {
            let selection = NMaker.dom(filterId + "-selector").value;
            let lowerValue = NMaker.dom(filterId + "-input") == null ? "" : NMaker.dom(filterId + "-input").value;
            let option = this.attributes.useModifier ? NMaker.dom(filterId + "-modifier").value : this.getDefaultFilterOption(this.Maker.colTypes[selection]);
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
        }
    }

    saveMemoryToStorage() {
        //clear sessionStorage of any items starting with the id, i.e. of this filter
        NMaker.clearStorageOfId(this.attributes.id);

        for (let filterId of this.filterIds) {
            //record in memory
            sessionStorage.setItem(filterId + "-filter-memory-selection", this.memory[filterId].selection);
            sessionStorage.setItem(filterId + "-filter-memory-modifier", this.memory[filterId].option);
            sessionStorage.setItem(filterId + "-filter-memory-lower-value", this.memory[filterId].lowerValue);
            sessionStorage.setItem(filterId + "-filter-memory-upper-value", this.memory[filterId].upperValue);
        }
        sessionStorage.setItem(this.attributes.id + "-ids", this.filterIds.reduce((acc, curr) => acc + "," + curr));
    }

    makeSearchBtn() {
        return NMaker.makeBtn(this.attributes.id + "-search", "Search", () => {

            //update memory with what's in the filters
            this.setMemoryFromFilters();

            //save memory to storage for rebuild post-search
            this.saveMemoryToStorage();
            this.Maker.filterNone = false;
            this.Maker.build();
        }, [...this.attributes.classes.button, ...this.attributes.classes.utilityBtn, ...this.attributes.classes.searchBtn], "Search in the table");
    }

    makeModifier(id) {
        //modifier is select box
        let modifier = document.createElement("select");
        modifier.id = id + "-modifier";
        modifier.title = "How to filter by";
        modifier.onchange = () => {
            //this is the 'MakeModifiedInput' pair to 'MakeSimpleInput'
            if (modifier.value == NMaker.filterOptions.dateRange) this.makeDateRangeInputGroup(id);
            else if (modifier.value == NMaker.filterOptions.select) this.makeSelectInput(id);
            else if (modifier.value == NMaker.filterOptions.numberRange) this.makeNumberRangeInputGroup(id);
            else if (modifier.value == NMaker.filterOptions.empty) this.emptyInput(id);
            else this.makeSimpleInputGroup(id);
        }
        NMaker.addStylesToElement(modifier, this.attributes.classes.modifier);

        return modifier;
    }

    makeSelector(id = this.attributes.id) {
        let selector = document.createElement("select");
        selector.id = id + "-selector";
        selector.title = "What column to filter by";
        let headings = NMaker.sort(Object.values(this.Maker.headings), this.attributes.order);

        for (let displayHeading of headings) {
            let heading = Object.keys(this.Maker.headings).find(heading => this.Maker.headings[heading] === displayHeading);
            if (this.attributes.ignore && this.attributes.ignore.includes(heading)) continue;
            let opt = document.createElement("option");
            opt.value = heading;
            if (opt.value == this.memory[id].selection) opt.selected = true;
            opt.innerText = this.Maker.headings[heading];
            selector.appendChild(opt);
        }
        NMaker.addStylesToElement(selector, this.attributes.classes.selector);

        selector.onchange = () => {
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

        //then add options according to the attributes (defaulting to work by data type)
        let col = NMaker.dom(id + "-selector").value;

        if (this.attributes.modifiers.hasOwnProperty(col)) {
            //set modifiers to that list
            this.attachOptions(modifier, this.attributes.modifiers[col], this.memory[id].option);
        }
        else {

            //then add options according to selected data type
            let type = this.Maker.colTypes[col];

            switch (type) {
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
                case "date":
                case "datetime":
                    this.attachOptions(modifier, this.attributes.modifiers.date, this.memory[id].option);
                    break;
                case "object":
                    console.warn("Invalid object value found");
                    this.Maker.colTypes[NMaker.dom(id + "-selector").value] = "string";
                    this.attachOptions(modifier, this.attributes.modifiers.string, NMaker.filterOptions.contains);
                    break;
                case "undefined":
                    console.error("Value is undefined");
                    break;
            }
        }

        let modGroup = NMaker.dom(id + "-modifier-group");
        if (modifier.children.length <= 1) {
            modGroup.style.hidden = true;
            modGroup.style.display = "none";
            modifier.labels.forEach(l => {
                l.style.hidden = true;
                l.style.display = "none";
            });
        } else {
            modGroup.style.hidden = false;
            modGroup.style.display = "inline-block";
            modifier.labels.forEach(l => {
                l.style.hidden = false;
                l.style.display = "inline-block";
            });
        }

        //calling on change here is to get inputs to be generated, if I'm not mistaken, but surely they should be generated externally?
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
        switch (value) {
            case "bigint":
            case "number":
                return NMaker.filterOptions.equals;
            case "undefined":
                console.error("Value is undefined");
                return;
            case "string":
                return NMaker.filterOptions.contains;
            case "boolean":
                return NMaker.filterOptions.boolean;
            case "date":
                if (value instanceof Date) {
                    return NMaker.filterOptions.date;
                }
                else console.error("Invalid object value found");
                return;
            default:
                console.warn("No valid type identified for " + value + ", assuming string.")
                return NMaker.filterOptions.contains;
        }
    }

    makeSimpleInputGroup(id) {
        let type = this.Maker.colTypes[NMaker.dom(id + "-selector").value];
        if (type == undefined) {
            this.Maker.colTypes[NMaker.dom(id + "-selector").value] = "string";
            type = "string"
        }

        //make / remake input group and therefore inputs
        let inputGroup = NMaker.replaceElement(id + "-input-group", "div", this.attributes.classes.inputGroup);

        //basic input is only one input element so make that
        let input = document.createElement("input");
        input.id = id + "-input";
        input.title = "What to filter by"

        switch (type) {
            case "bigint":
            case "number":
                input.type = "number";
                input.placeholder = 0;
                input.pattern = "^-?(0|[1-9]\d*)(\.\d+)?$"; //by default number input considers any valid number valid
                input.step = "any"; //stops non-whole numbers being considered "invalid" despite the pattern above!!
                if (Number(this.memory[id].lowerValue == "number") != NaN) input.value = this.memory[id].lowerValue;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "undefined":
                console.error("Value is undefined");
                break;
            case "string":
                input.type = "text";
                if (!this.memory[id].lowerValue || this.memory[id].lowerValue == "") input.placeholder = "Search...";
                else input.value = this.memory[id].lowerValue;
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "boolean":
                input.type = "checkbox";
                input.checked = this.memory[id].lowerValue == "on";
                NMaker.addStylesToElement(input, this.attributes.classes.checkbox);
                break;
            case "date":
            case "datetime":
                input.type = "date";
                if (NMaker.isDate(this.memory[id].lowerValue)) input.value = this.memory[id].lowerValue;
                else input.value = new Date().toISOString().split('T')[0];
                NMaker.addStylesToElement(input, this.attributes.classes.input);
                break;
            case "object":
                console.error("Invalid object value found, did you define correct colTypes?");
                break;
            default:
                console.warn("Invalid type " + type + " found.");
                throw new Error();
        }

        //basic input should have enter-to-search capability
        input.onkeyup = ({ key }) => { if (key === "Enter") NMaker.dom(this.attributes.id + "-search").click() };

        //attach input
        inputGroup.appendChild(input);

        //attach to input container
        NMaker.dom(id + "-input-container").appendChild(inputGroup);
    }

    emptyInput(id) {
        NMaker.dom(id + "-input-container").appendChild(NMaker.replaceElement(id + "-input-group", "div", this.attributes.classes.inputContainer));
    }

    makeDateRangeInputGroup(id) {
        let dateRangePicker = NMaker.makeDateRangePicker(id + "-input-group", this.attributes.classes, this.memory[id].lowerValue, this.memory[id].upperValue);
        dateRangePicker.title = "What to filter by"
        //append input group to input container
        NMaker.dom(id + "-input-container").appendChild(dateRangePicker);
    }

    makeNumberRangeInputGroup(id) {
        let numberRangePicker = NMaker.makeNumberRangePicker(id + "-input-group", this.attributes.classes, this.memory[id].lowerValue, this.memory[id].upperValue);
        numberRangePicker.title = "What to filter by"
        //append input group to input container
        NMaker.dom(id + "-input-container").appendChild(numberRangePicker);
    }

    makeSelectInput(id) {
        //remove old input / inputs by clearing input-group
        let inputGroup = NMaker.replaceElement(id + "-input-group", "div", this.attributes.classes.inputGroup);
        inputGroup.title = "What to filter by"
        //basic input is only one input element so make that
        let input = document.createElement("select");
        input.id = id + "-input";
        NMaker.addStylesToElement(input, this.attributes.classes.selector);

        let option = NMaker.dom(id + "-selector").value;
        let options = Array.from(new Set(this.Maker.data.map(datum => {
            if (this.Maker.displayValues[option] && datum[option] == this.Maker.displayValues[option].value) return this.Maker.displayValues[option].displayValue;
            else return datum[option];
        })));

        options.sort();
        this.attachOptions(input, options, this.memory[id].lowerValue);

        if (this.memory[id].lowerValue == "") {
            let placeholderOption = document.createElement("option");
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            placeholderOption.value = "";
            placeholderOption.innerText = "Select...";
            placeholderOption.innerText = "Select...";
            input.insertBefore(placeholderOption, input.firstElementChild);
        }

        inputGroup.appendChild(input);

        //append input group to input container
        NMaker.dom(id + "-input-container").appendChild(inputGroup);
    }

    filter(data, filterOption, col, lowerValue, upperValue = null) {
        //Get the correct data for the filter to filter by input or input group
        let prop = col;
        let lowerInputValue = lowerValue;
        let upperInputValue = upperValue;

        //correct input display value to actual data values
        if (this.Maker.displayValues[prop] && lowerInputValue == this.Maker.displayValues[prop].displayValue) lowerInputValue = this.Maker.displayValues[prop].value;

        //new filtered data to fill in empty array
        let filteredData = [];

        for (let row of data) {
            //little null catching trickery
            if (row[prop] == null || lowerInputValue == null) {
                if (row[prop] == null && (lowerInputValue == null || filterOption == NMaker.filterOptions.empty)) filteredData.push(row);
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
                    let rowDate = new Date(row[prop]);
                    let searchDate = new Date(lowerInputValue);
                    if (rowDate.getFullYear() === searchDate.getFullYear() &&
                        rowDate.getMonth() === searchDate.getMonth() &&
                        rowDate.getDate() === searchDate.getDate()) filteredData.push(row);
                    break;
                case NMaker.filterOptions.match:
                case NMaker.filterOptions.equals:
                case NMaker.filterOptions.select:
                    if (row[prop].toString().toLowerCase() == lowerInputValue.toLowerCase()) filteredData.push(row);
                    break;
                case NMaker.filterOptions.not:
                case NMaker.filterOptions.excludes:
                    let inputs = lowerInputValue.toString().toLowerCase().split(",");
                    inputs = inputs.map(str => str.trim());
                    let exclude = false;
                    for (let input of inputs) {
                        if (row[prop].toString().toLowerCase().includes(input)) exclude = true;
                    }
                    if (!exclude) filteredData.push(row);
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
                    break;
                case NMaker.filterOptions.empty:
                    //for getting only null or empty values
                    if (row[prop] == null || row[prop] == "") filteredData.push(row);
                    break;
            }
        }

        return filteredData;
    }
}

class UpdaterMaker {
    /*
    Taking the Maker data and generate a form to enable Create Update or Delete

    and a config with sections; 
    - primaryKey, 
    - show primary key - whether to show it
    - inputtypes (by data prop), 
    - names (for posting, defaults to pascal case),
    - labels (defaults to none)
    - attributes by prop with each having an object of attribute-value pairs
    - selections is an object of key - arrays where the key is the input that'll be a selection, and the array is of like-type values that are the options of the selection

    that generates clean html ouput of a headered section with appropriate label-input pairs for given data structure
    */

    constructor(Maker, attributes) {
        // the blueprint is the pojo that will be used to generate the inputs desired, change that and change how updater maker works
        let initial = attributes.blueprint ? attributes.blueprint : Maker.data[0];
        this.attributeDefaults = {
            id: "updater-" + Date.now(),
            parentSelector: "body",
            classes: {
                container: ["row"],
                btnContainer: ["btn-group"],
                title: ["h3"],
                form: [],
                input: ["form-control"],
                select: ["form-control"],
                inputContainer: ["input-group"],
                button: ["btn", "btn-sm", "float-end"],
                submit: ["btn-danger"],
                cancel: ["btn-warning"],
                label: ["input-group-text"],
                checkbox: ["form-check-input"],
                textarea: ["form-control"]
            },
            blueprint: initial,
            additional: false,  //any key-value pairs of data you want to submit in addition to the shown form, all as hidden inputs
            title: "Updater",
            hideTitle: false,
            titleParentSelector: false,
            endpoint: "undefined",
            submitText: "Submit",
            cancelText: "Cancel",
            useCancelConfirmation: false,
            primaryKey: Object.keys(initial)[0],
            showPrimaryKey: false,
            editablePrimaryKey: false,
            inputTypes: this.objKeysAndTypes(initial),
            names: this.objKeysAndPascalkeys(initial),
            labels: this.objKeysAndCapitalisedkeys(initial),
            selections: false,
            ignore: [],
            readonly: [],
            defaults: initial,
            attributes: {}
        };

        this.attributes = {
            ...this.attributeDefaults,
            ...attributes
        }

        let defaults = ["classes", "inputTypes", "names", "labels", "defaults"];
        for (let def of defaults) {
            this.attributes[def] = {
                ...this.attributeDefaults[def],
                ...attributes[def]
            };
        }

        this.Maker = Maker;
    }

    //dang you gotta love the j-scrip
    objKeysAndTypes(obj) {
        return Object.keys(obj).reduce((okt, prop) => {
            okt[prop] = obj[prop] === null ? "null" : typeof obj[prop];
            return okt;
        }, {});
    }

    objKeysAndPascalkeys(obj) {
        return Object.keys(obj).reduce((okp, prop) => {
            okp[prop] = NMaker.toPascalCase(prop);
            return okp;
        }, {});
    }

    objKeysAndCapitalisedkeys(obj) {
        return Object.keys(obj).reduce((okc, prop) => {
            okc[prop] = NMaker.toCapitalizedWords(prop);
            return okc;
        }, {});
    }

    makeUpdater() {
        //container
        let updaterContainer = NMaker.replaceElement(this.attributes.id, "div", this.attributes.classes.container);

        //title
        if (!this.attributes.hideTitle && this.attributes.title != "") {
            let title = NMaker.replaceElement(this.attributes.id + "-title", "h3", this.attributes.classes.title);
            title.innerText = this.attributes.title;
            if (this.attributes.titleParentSelector) {
                NMaker.dom(this.attributes.titleParentSelector).appendChild(title);
            }
            else updaterContainer.appendChild(title);
        }

        //form
        let form = document.createElement("form");
        form.id = this.attributes.id + "-form";
        NMaker.addStylesToElement(form, this.attributes.classes.form);
        form.method = "post";
        form.action = this.attributes.endpoint;

        //each key's input
        for (let key in this.attributes.blueprint) {
            if (this.attributes.ignore.includes(key)) continue;

            let input;
            if (this.attributes.selections[key]) {
                input = this.makeSelection(
                    key,
                    this.attributes.selections[key],
                    this.attributes.labels[key],
                    this.attributes.names[key],
                    this.attributes.attributes[key],
                    this.attributes.defaults[key]
                );
            }
            else if (["bigtext", "bigstring", "textarea"].includes(this.attributes.inputTypes[key])) {
                input = this.makeTextArea(
                    key,
                    this.attributes.labels[key],
                    this.attributes.names[key],
                    this.attributes.attributes[key],
                    this.attributes.defaults[key]);
            }
            else input = this.makeInput(
                key,
                this.attributes.inputTypes[key],
                this.attributes.labels[key],
                this.attributes.names[key],
                this.attributes.attributes[key],
                this.attributes.defaults[key]
            )

            form.appendChild(input);
        }

        //additional
        //key-value pairs of hidden inputs required to be submitted alongside user-input form data
        if (this.attributes.additional) {
            let data = this.attributes.additional;
            for (let key in data) {
                let input = NMaker.makeElement("input", { id: this.attributes.id + "-" + NMaker.toKebabCase(key), name: key, value: data[key] });
                input.type = "hidden";
                form.appendChild(input);
            }
        }

        //Add buttons
        let btnContainer = NMaker.replaceElement(this.attributes.id + "-btn-container", "div", this.attributes.classes.btnContainer);

        //add submit button
        let submitBtn = document.createElement("input");
        submitBtn.id = this.attributes.id + "-submit";
        submitBtn.type = "submit";
        submitBtn.value = this.attributes.submitText;
        NMaker.addStylesToElement(submitBtn, this.attributes.classes.button);
        NMaker.addStylesToElement(submitBtn, this.attributes.classes.submit);
        btnContainer.appendChild(submitBtn);

        //add cancel button
        let cancelBtn = document.createElement("button");
        cancelBtn.id = this.attributes.id + "-cancel";
        cancelBtn.type = "button";
        cancelBtn.innerText = this.attributes.cancelText;
        NMaker.addStylesToElement(cancelBtn, this.attributes.classes.button);
        NMaker.addStylesToElement(cancelBtn, this.attributes.classes.cancel);
        cancelBtn.onclick = () => {
            if (this.attributes.useCancelConfirmation && !confirm("Are you sure you wish to cancel?")) return;

            NMaker.dom(this.attributes.parentSelector).innerHTML = "";
            if (this.attributes.titleParentSelector) NMaker.dom(this.attributes.titleParentSelector).innerHTML = "";
        }
        btnContainer.appendChild(cancelBtn);

        form.appendChild(btnContainer);

        updaterContainer.appendChild(form);

        NMaker.dom(this.attributes.parentSelector).appendChild(updaterContainer);
    }

    makeTextArea(key, labelText, name, attributes, defaultVal) {
        //input container
        let inputContainer = document.createElement("div");
        inputContainer.id = this.idForInput(key) + "-container";
        NMaker.addStylesToElement(inputContainer, this.attributes.classes.inputContainer);

        //label
        let label = document.createElement("label");
        label.id = this.idForInput(key) + "-label";
        NMaker.addStylesToElement(label, this.attributes.classes.label);
        label.innerText = labelText;

        //text area
        let input = NMaker.makeElement("textarea",
            {
                ...attributes,
                id: this.attributes.id + "-" + key,
                name: name,
                value: defaultVal
            }, this.attributes.classes.textarea);

        if (this.attributes.readonly.includes(key)) input.readOnly = true;

        if (this.attributes.primaryKey == key) {
            input.readOnly = !this.attributes.editablePrimaryKey;
            if (this.attributes.showPrimaryKey == false) {
                input.hidden = true;
                inputContainer.classList.add("hidden");
                inputContainer.hidden = true;
            }
        }

        inputContainer.appendChild(label);
        inputContainer.appendChild(input);

        return inputContainer;
    }

    makeSelection(key, options, labelText, name, attributes, defaultVal) {
        if (!Array.isArray(options)) throw new Error("UpdaterMaker makeSelection called with non array: " + options);
        if (options.length == 0) throw new Error("UpdaterMaker makeSelection options array is empty.");

        //options could be an array of values, or array of {value: ... , text: ...} objects.
        //check options are valid
        let optionType = "value";   //or "option.innerText" or "option.value"
        if (typeof options[0] !== 'object') {
            if (!options.includes(defaultVal)) throw new Error("UpdaterMaker makeSelection default value " + defaultVal + " not one of the given options");
        }
        else {
            //options are objects, check whether we are working with innerText or values
            optionType = "option.value";
            if (options.map(opt => opt.text).includes(defaultVal)) optionType = "innerText";
            else if (!options.map(opt => String(opt.value)).includes(String(defaultVal))) {
                throw new Error("UpdaterMaker makeSelection default value " + defaultVal + " not one of the given option text or values");
            }
        }

        //select container
        let selectContainer = document.createElement("div");
        selectContainer.id = this.idForInput(key) + "-container";
        NMaker.addStylesToElement(selectContainer, this.attributes.classes.inputContainer);

        //label
        let label = document.createElement("label");
        label.id = this.idForInput(key) + "-label";
        NMaker.addStylesToElement(label, this.attributes.classes.label);
        label.innerText = labelText;
        selectContainer.appendChild(label);

        //and the select box itself
        let select = NMaker.makeElement("select",
            {
                id: this.attributes.id + "-" + key,
                name: name, ...attributes,
                value: defaultVal
            }, this.attributes.classes.select);

        for (let opt of options) {
            let option = document.createElement("option");
            if (optionType != "value") {
                option.value = opt.value;
                option.innerText = opt.text;
            }
            else option.innerText = opt;
            select.appendChild(option);
        }

        //can't set selection values until after options are added
        if (optionType == "option.innerText") defaultVal = options.filter(opt => opt.text == defaultVal)[0].value;
        select.value = defaultVal;

        selectContainer.appendChild(select);

        return selectContainer;
    }

    makeInput(key, type, labelText, name, attributes, defaultVal) {
        //input container
        let inputContainer = document.createElement("div");
        inputContainer.id = this.idForInput(key) + "-container";
        NMaker.addStylesToElement(inputContainer, this.attributes.classes.inputContainer);

        //label
        let label = document.createElement("label");
        label.id = this.idForInput(key) + "-label";
        NMaker.addStylesToElement(label, this.attributes.classes.label);
        label.innerText = labelText;

        //switch on type
        let input = NMaker.makeElement("input",
            {
                id: this.attributes.id + "-" + NMaker.toKebabCase(key),
                name: name, ...attributes, value: defaultVal
            },
            this.attributes.classes.input);
        switch (type) {
            case "string":
            case "text":
            case "null":
                input.type = "text";
                break;

            case "email":
                input.type = "email";
                break;

            case "password":
                input.type = "password"
                break;

            case "number":
            case "bigint":
                input.type = "number";
                break;

            case "date":
                input.type = "date";
                break;
            case "datetime":
            case "datetime-local":
                input.type = "datetime-local"
                input.value = NMaker.removeSecondsFromISOString(input.value);
                break;

            case "checkbox": s
            case "boolean":
                input.type = "checkbox";
                input.checked = String(defaultVal) == "true";
                input.onchange = () => input.value = Boolean(input.checked);
                input.classList.remove(...input.classList);
                NMaker.addStylesToElement(input, this.attributes.classes.checkbox);
                break;
            default:
                console.warn("Invalid type " + type + " passed to UpdaterMaker makeInput()");
                break;
        }

        if (this.attributes.readonly.includes(key)) input.readOnly = true;

        if (this.attributes.primaryKey == key) {
            input.readOnly = !this.attributes.editablePrimaryKey;
            if (this.attributes.showPrimaryKey == false) {
                input.hidden = true;
                inputContainer.classList.add("hidden");
                inputContainer.hidden = true;
            }
        }

        inputContainer.appendChild(label);
        inputContainer.appendChild(input);

        return inputContainer;
    }

    idForInput(key) {
        return this.attributes.id + "-" + NMaker.toKebabCase(key);
    }
}