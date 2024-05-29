# NMaker Utilities
My own light JS Front End framework.

The use case is simply: given a single lump of tabular JSON data, have a bunch of tools to efficiently and effectively present and manipulate that data, giving me full control over it and also cutting down on server calls by a lot. This is the result of that. It might seem a bit messy at times, and this README is certainly lacking in documentation (please refer to the .html demo's for more illustrative examples as they double as my test beds, and also just the source code), I do plan on properly updating this at some point.

The `NMaker` static class contains some helper functions such as dom, a shortcut & convient combo of `document`'s `getElementById`, `querySelector` and `querySelectorAll`. It also includes some smaller maker functions, returning dom elements ready for appending: 
- makeBtn
- makeLink
- makeImg
- makeElement (using given id, attributes and classes)
- makeDateRangePicker (creates a double date input for 'from' and 'to' dates)
- makeNumberRangePicker (creates a double number input for 'from' and 'to' values)
- makeMultiSelector (a click based multi selector, see [MultiSelectorDemo.html](./MultiSelectorDemo.html))
- makeUpdater (a convenient shorthand for creating an updator)

The `Maker` class is used to build the paginator, filter and table tools, providing a contained point of reference and data store.

All components load from this data, and are dynamically updated through the Maker.

To use the system, initialise a Maker instance `new Maker(data)` with your tabular JSON data and then create whatever components you want by calling the Maker's `makeTable`, `makePaginator` and `makeFilter` functions. Lastly call `maker.build()` to create the dom.

The objects create their corresponding HTML, but calling `[component].make[Component](attributes)` will remake them, removing them from where they were.

### Styles
The styling defaults make plentiful use of Bootstrap, but it is not required (all styling is provided via `attributes.classes` so any custom CSS classes can be used).

- [TableMaker](#tablemaker)
  - [TableMaker API](#tablemaker-api)
- [PaginatorMaker](#paginatormaker)
  - [API](#api)
- [FilterMaker](#filtermaker)
  - [Selector](#selector)
  - [Modifier](#modifier)
  - [Input](#input)
  - [API](#api-1)
- [UpdaterMaker](#updatermaker)


### Data Attributes
Attributes that can be attached to the Data itself through `NMaker.init()`

| **Attribute** | **Effect** |
| --- | --- |
| `displayHeadings` | How data property names should be displayed vs how they are in data. See below or demo for example. |
| `displayValues` | How data values should be displayed vs how they are in data. See below or demo for example. |
| `hide` | an array of strings for the columns that you don't want to be in the table |
| `show` | alternatively put `"all"` into `hide` and use this attribute to list cols you wish to show |

### Common Attributes
Attributes don't have to be provided, they fall back on defaults.

All componenets make use of the following attributes:

| **Attribute** | **Effect** |
| --- | --- |
| `id` | The html id of the table generated, defaults to `"[componenet code]" + Date.now()` |
| `parentSelector` | the css selector for determining the parent element, defaults to `body` |
| `classes` | the css style classes to apply. Must be an object where each parameter matches the HTML element that you want those classes to apply to, and the value an array of strings of the classes you want to apply. Note if no classes are defined for an element it defaults to the following bootstrap classes, but if any are defined for an element, all defaults for that element are lost:  |

### Given tabular JSON
![TableMakerDemo](/Screenshots/TableMakerInitial.png)

### When called (with optional options)
![TableMakerCode](/Screenshots/TableMakerUsage.png)

### Then a Table is made
![TableMakerResult](/Screenshots/TableMakerDemoResult.png)

### Ideas:
 - DropDownMaker - makes a dropdown list from given options (currently a hardcoded part of `filterMaker`)
 - DynamicTextInputMaker - name tbc, but a text input whose size updates according to the amount of text input so you never lose track of what you're writing.

## TableMaker
The main component of `NMaker`.

A `TableMaker` object creates the tables that it represents and manages the state of that table. Make a new `TableMaker` with your desired `attributes`, the API that the TableMaker uses to configure the table, defaults and descrtiption below. 

### TableMaker API
The tableMaker functions simply: through data provided to the `attributes` input, the table generated can be defined and customised.

| **Attribute** | **Effect** |
| --- | --- |
| `sorting` | an array of strings for the columns that you want sorting functionality on, by json parameter name. Uses `sortingOrientation` to track state. Defaults to `false` |
|  `currency` | an array of strings for the columns that you want to be displayed as currency, by json parameter name. Defaults to `false`|
| `link` | an array of objects of two properties: `name` that denotes the column to be effected and `text` which denotes the text of the link. The actual link's `href` is the data of the column so that ought to be valid href data  |
| `conditionalClasses` | An object where each property is a header of your data, the value of which is an object with `condition` `target` and optional `classesIf` and `classesNot` properties used to tell TableMaker how to conditionally apply classes. The `condition` replaces the headings it finds in its string, with the data of the row for that heading. Targets are `row` `cell` and `link` |

Classes defaults: 

```js 
classes: {
    table: ["table", "table-striped", "table-bordered"],
    heading: ["h5", "align-text-bottom"],
    row: ["text-body-secondary"],
    button: ["btn", "btn-sm", "btn-outline-primary", "float-end"]
}
```

```js
// Conditional Classes example from demo
conditionalClasses : {
    gender : {
        condition : "gender == 'male'",
        target : "row",
        classesIf : ["table-info"],
        classesNot : ["table-danger"]
    },
    balance : {
        condition : "balance < 2000",
        target : "cell",
        classesIf : ["text-decoration-underline"]
    }
}
```

Display heading and value use:

```js
{
    displayHeadings : {
        phone : "Phone №"
    },
    displayValues : {
        address: {
            value: null,
            displayValue: "No address"
        },
        gender: {
            value: null,
            displayValue: "None specified"
        },
        phone: {
            value: null,
            displayValue: "No phone"
        }
    }
}
```

## PaginatorMaker
For when you want to paginate data locally (so the data must already be loaded into the page). Handy if you would otherwise be displaying a table with several thousand rows.

To Explain, but the code and demo are up.

```js
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
    buttons : NMaker.paginatorOptions.bookend
};
```

### API

| **Attribute** | **Effect** |
| --- | --- |
| `pageLength` | The number of rows per page. The paginator dynamically calculates the number of pages needed and presents buttons. |

## FilterMaker
A dynamic filtering component. It is in three parts:

### Selector
The selector is populated by the data headings, and is a simple select box. Depending on the type of data selected, the `Input` will be changed.

### Modifier
The modifier, if in use, presents different ways to filter the selected category. The modifier can also present a subset of its modifications if desired.

### Input
In what way the presented data will be filtered, depending on the modifier. If no modifier is present strings filter everything contained by the input, and numbers and dates are an exact match.

### API

| **Attribute** | **Effect** |
| --- | --- |
| `ignore` | Headings to not include in the filter. |
| `order` | How to order the headings selection, defaults to the data's original order. Other NMakerSortOptions accepted. |
| `useModifier` | `true` or `false` |
| `modifiers` | What modification options are available where each property on the object is a data type to present those options for. The currently supported data types are `number`, `string`, `date` & `boolean`. Options, to prevent errors, are kept in ap seudo-enum on `NMaker` called `filterOptions`. See below |
| `useColumnFilter` | `true` or `false`, enables the showing and hiding of hidden columns of the table |
| `defaultSettings` | Object with `selection` `modifier` `upperValue` and `lowerValue` properties that preload the filter with what you want it to hold initially. All non-range inputs just use the `lowerValue` property |
| `useMemory` | `true` or `false`, if true pulls information out of sessionStorage and loads the table pre-filtered |
|`useSubFilter` | `true` or `false`, enables the add and remove buttons meaning multiple filters can be added. |


``` js
// default classes for FilterMaker
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
}
```

```js
// modifier options pseudo-enum
NMaker.filterOptions = Object.freeze({
    equals: "=",
    greaterThan: ">",
    lessThan: "<",
    not: "Not",
    match: "Matches",
    contains: "Contains",
    startsWith: "Starts with",
    excludes: "Excludes",
    date: "Date",
    dateRange: "From -> To",
    numberRange: "Between",
    boolean: "Boolean",
    select: "Select"
});
```

## UpdaterMaker

See [the demo](./UpdateMakerDemo.html) for a better idea of how to use UpdateMaker.

I will update this README at some point, promise.

```js
id: "updater-" + Date.now(),
parentSelector: "body",
classes: {
    container: ["row"],
    title: ["h3"],
    form: [],
    input: ["form-control"],
    select: ["form-control"],
    inputContainer: ["input-group"],
    button: ["btn", "btn-sm", "btn-danger", "float-end"],
    label: ["input-group-text"],
    checkbox: ["form-check-input"]
},
blueprint: initial,
additional: false,  //kvp of hidden inputs for data you want to include in the form posting, such as API keys
title: "Updater",
hideTitle: false,
titleParentSelector: false,
endpoint: "undefined",
submitText: "Submit",
primaryKey: Object.keys(initial)[0],
showPrimaryKey: false,
editablePrimaryKey: false,
inputTypes: this.objKeysAndTypes(initial),
names: this.objKeysAndPascalkeys(initial),
labels: this.objKeysAndCapitalisedkeys(initial),
selections: false,  //array of strings for option innerText, or array of {value: value, text: innerText} objects
ignore: [],
defaults: initial,
attributes: {}
```