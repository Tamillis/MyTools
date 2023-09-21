# NMaker Utilities
My own light JS Front End framework.

The use case is simply: given a single lump of tabular JSON data, have a bunch of tools to efficiently and effectively manipulate that data, giving me full control over it and also cutting down on server calls by a lot.

The `NMaker` static class contains some helper functions as well as doubling as the source of truth for the data under `NMaker.data`, `NMaker.filteredData` and `NMaker.pagedData`.

All components load from this data, and listen in on the `updatedData` and `updatedPagedData` events that the corresponding components set up on the `NMaker` object.

To use the system, first call `NMaker.init(data)` with your tabular JSON data and then create whatever components you want by instantiating an object of that component.

The objects create their corresponding HTML immediately, but calling `[component].make[Component](attributes)` will remake them, removing them from where they were.

The styling defaults make plentiful use of Bootstrap, but it is not required (all styling is provided via `attributes.classes` so any custom CSS classes can be used).

- [NMaker Utilities](#nmaker-utilities)
    - [Common Attributes](#common-attributes)
    - [Given tabular JSON](#given-tabular-json)
    - [When called (with optional options)](#when-called-with-optional-options)
    - [Then a Table is made](#then-a-table-is-made)
    - [Ideas:](#ideas)
  - [TableMaker](#tablemaker)
    - [TableMaker API](#tablemaker-api)
  - [PaginatorMaker](#paginatormaker)
    - [API](#api)
  - [FilterMaker](#filtermaker)
    - [Selector](#selector)
    - [Modifier](#modifier)
    - [Input](#input)
    - [API](#api-1)

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
 - PrintMaker - makes a print button that takes in the id of the div to print
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
| `hide` | an array of strings for the columns that you don't want to be in the table |
| `link` | an array of objects of two properties: `name` that denotes the column to be effected and `text` which denotes the text of the link. The actual link's `href` is the data of the column so that ought to be valid href data  |
| `conditionalClasses` | An object where each property is a header of your data, the value of which is an object with `condition` `target` and optional `classesIf` and `classesNot` properties used to tell TableMaker how to conditionally apply classes. The `condition` replaces the heading with the value for that row. |

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

## PaginatorMaker
For when you want to paginate data locally (so the data must already be loaded into the page).

To Explain, but the code and demo are up.

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
| `useModifier` | `true` or `false` |
| `modifier` | What modification options are available where each property on the object is a data type to present those options for. The currently supported data types are `number`, `string`, `date` & `boolean`. Options, to prevent errors, are kept in ap seudo-enum on `NMaker` called `modifierOptions`. See below |


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
NMaker.modifierOptions = Object.freeze({
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
    boolean: "Boolean",
    select: "Select"
});
```