---
title: Changing URL parameters with jQuery
date: 2011-09-20 14:32:39+00:00
slug: change-url-parameters-with-jquery
categories:
  - Web Development
tags:
  - JavaScript
  - jQuery
---

You can find plenty of resources about this topic just by googling the web, most of which will point to jQuery plugins.

But the fact is that it's so easy to achieve this by simply using jQuery that you do not need a plugin.

<!--more-->

The code is pretty much self explanatory:

```js
/*
 * queryParameters -> handles the query string parameters
 * queryString -> the query string without the fist '?' character
 * re -> the regular expression
 * m -> holds the string matching the regular expression
 */
var queryParameters = {}, queryString = location.search.substring(1),
    re = /([^&=]+)=([^&]*)/g, m;

// Creates a map with the query string parameters
while (m = re.exec(queryString)) {
    queryParameters[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}

// Add new parameters or update existing ones
queryParameters['newParameter'] = 'new parameter';
queryParameters['existingParameter'] = 'new value';

/*
 * Replace the query portion of the URL.
 * jQuery.param() -> create a serialized representation of an array or
 *     object, suitable for use in a URL query string or Ajax request.
 */
location.search = $.param(queryParameters); // Causes page to reload
```

You can clearly improve the regular expression, but the one above meet my needs.
