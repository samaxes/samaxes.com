---
title: IE Conditional comments
date: 2006-05-06 15:10:05+00:00
slug: ie-conditional-comments
categories:
  - Web Development
tags:
  - CSS
  - IE
---

When you're a web developer, you always keep running into annoying Internet Explorer bugs, so you need to hack your way around. Now with the IE7 out, a lot of the old CSS hacks don't work anymore, and those that do still work, can't be relied on to work in the future.

IE has a feature, called conditional comments, which could help us. As a hack it's quite useful. IE 7 will support this too, and it even allows you to detect different versions of IE.

Here's an example:

```html
<!--[if lte IE 6]>
    <style>
        @import "ie_hacks.css";
    </style>
<[endif]-->
```

`[if lte IE 6]` means "if less than or equal to IE 6". Other possibilities are:

`[if IE]`
: if Internet Explorer

`[if gte IE 5]`
: if greater than or equal to IE 5

`[if lte IE 5]`
: if less than or equal to IE 5

`[if IE 6]`
: if Internet Explorer 6

`[if IE 5.5]`
: will work too

`[if IE 7.0b]`
: as will this for IE 7 beta
