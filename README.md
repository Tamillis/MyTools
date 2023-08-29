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

The `TableMaker.makeTable(data, tableAttributes)` method is the only entry point so far. 
- `data` must be valid JSON in the form of an array of objects that all have the same properties.
- `tableAttributes` is the API that the TableMaker uses to configure the table, see below

### TableMaker API
The tableMaker functions simply: through data provided to the `tableAttributes` input, the table generated can be defined and customised.

| **Attribute** | **Effect** |
| --- | --- |
| `id` | The html id of the table generated, defaults to `"t" + Date.now()` |
| `classes` | the css style classes to apply. Must be an object where each parameter matches the HTML element that you want those classes to apply to, and the value an array of strings of the classes you want to apply. Note if no classes are defined for an element it defaults to the following bootstrap classes:  |
```js 
{
    table : ["table", "table-striped", "table-bordered"],
    th : ["h5"],
    td : ["text-body-secondary"]
}
```
| **Attribute** | **Effect** |
| --- | --- |
| `parentSelector` | the css selector for determining the parent element, defaults to `body` |

TODO:
- Add filter conditions and ordering buttons
- Add pagination
- manner to flag certain rows with classes / custom functionality (passed in function?)
- flag to convert dates to short strings