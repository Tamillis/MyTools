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

## TableMaker

The beginnings of my own front-end replacement to Telerik's Grid, giving me full control over it and also cutting down on server calls by a lot.

A `TableMaker` object creates the tables that it represents and manages the state of that table. Make a new `TableMaker` with appropriate json `data` and your desired `tableAttributes`, the API that the TableMaker uses to configure the table, defaults and descrtiption below. On this object call `makeTable()` and violá.

### TableMaker API
The tableMaker functions simply: through data provided to the `tableAttributes` input, the table generated can be defined and customised.

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


TODO:
- Add conditional formatting
- Add pagination