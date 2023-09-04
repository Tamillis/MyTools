# MyTools
A collection of the minor tools I've put together for professional use.

## The Memory Model
Used by myself and many other trainers during C# and Java lessons to demonstrate to trainees how data is handled in memory, what the Stack and the Heap are and how they're used.

![Memory Model](./Screenshots/Memory_Model.jpg)

[Memory Model](./Memory_Model)

## HTML Renderer
Used during my video production for Sparta Global, in particular the HTML Short, a 10 minute introduction to the basics of HTML, where instead of using potentially overly-complex free editors that are prone to change or paid-for solutions, I threw together this extremely simple HTML renderer, so that the basics could easily be focused on.

![HTML Renderer](./Screenshots/HTML_Renderer.jpg)

[HTML Renderer](./HTML_Renderer)

## Csv Downloader
A small JS utility class that allows you to create and download .csv files from JSON data.

No sexy screenshot for this one, just go see the file [here](./CsvDownloader/CsvDownloader.js) and the demo [here](./CsvDownloader/Demo.html).

## NMaker Utilities
My own light JS Front End framework.

The use case is simply: given a single lump of JSON data, have a bunch of tools to manipulate that data.

The `NMaker` static class contains some helper functions as well as doubling as the source of truth for the data under `NMaker.data`.

All components load from this data, and listen in on the `updateData` event that the `NMaker` sets up on the `document`.

The example makes plenty of use of Bootstrap, but it is not required (all styling is provided via `attributes.classes` so any custom CSS can be used)

Ideas:
 - LinkMaker - makes button-like link from given url string and `linkOptions`
 - ButtonMaker - makes button from given function (the onclick function) and `buttonOptions`
 - DropDownMaker - makes a dropdown list from given options
 - PrintMaker - makes a print button that takes in the id of the div to print
 - FileUploadMaker - I don't even know how
 - DynamicFilter - smart feature that allows you to filter the data based on criteria, the kinds of filter presented automatically selected by analysing the data
 - EventManager - ensures that different events communicate with each other and does computation for steps that need it, i.e. if a DropDownMaker's `optionSelected` event needs to cause a response in the data, the `EventManager` does that (this, then would be separate from the components inteded by end user). 

### TableMaker

The beginnings of my own front-end replacement to Telerik's Grid, giving me full control over it and also cutting down on server calls by a lot.

A `TableMaker` object creates the tables that it represents and manages the state of that table. Make a new `TableMaker` with appropriate json `data` and your desired `attributes`, the API that the TableMaker uses to configure the table, defaults and descrtiption below. On this object call `makeTable()` and violá.

#### Given well-formed JSON
![TableMakerDemo](./Screenshots/TableMakerInitial.png)

#### When called (with optional options)
![TableMakerCode](./Screenshots/TableMakerUsage.png)

#### Then a Table is made
![TableMakerResult](/Screenshots/TableMakerDemoResult.png)

#### TableMaker API
The tableMaker functions simply: through data provided to the `attributes` input, the table generated can be defined and customised.

| **Attribute** | **Effect** |
| --- | --- |
| `id` | The html id of the table generated, defaults to `"t" + Date.now()` |
| `classes` | the css style classes to apply. Must be an object where each parameter matches the HTML element that you want those classes to apply to, and the value an array of strings of the classes you want to apply. Note if no classes are defined for an element it defaults to the following bootstrap classes, but if any are defined for an element, all defaults for that element are lost:  |
```js 
{
    table : ["table", "table-striped", "table-bordered"],
    th : ["h5", "align-text-bottom"],
    td : ["text-body-secondary"]
}
```
| **Attribute** | **Effect** |
| --- | --- |
| `parentSelector` | the css selector for determining the parent element, defaults to `body` |
| `sorting` | an array of strings for the columns that you want sorting functionality on, by json parameter name. Uses `sortingOrientation` to track state. Defaults to `false` |
|  `currency` | an array of strings for the columns that you want to be displayed as currency, by json parameter name. Defaults to `false`|
| `hide` | an array of strings for the columns that you don't want to be in the table |


TODO:
- Add conditional formatting. Within classes, also have `[ClassName]If` i.e. `buttonIf` where the first string in the array is actually a boolean conditional, which can be `Eval()`ed and the rest of the array applied as classes if the eval was true. 

### PaginatorMaker

To Explain, but the code is up.

### FilterMaker
A dynamic filtering component.
