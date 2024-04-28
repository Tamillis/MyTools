# Pete's Templating Html Engine

Because the world needs another templating engine. Lol.

## The Idea

I find myself using primarily raw html, js and css quite a lot, but sometimes I'd like a simple build tool that can take markdown, json data and php-style imports / basic templating functionality, and full-blown tools like Hugo or JS Frameworks as far, far too much.

I want something where I can write something like this:

```html
<html>
<head> 
    (basic head stuff)
    <doc src="path-to-html-file-that-contains-the-re-used-html(inc js and css)-here" />
</head>
<body>
    <div id="title">
        <md src="path-to-md">Custom md</md>
    </div>

    <loop js="iterable-js-var-name" json="path-to-iterable-json">
        <html>as generated from values / objects of iterable</html>
    </loop>
</body>
</html>
```