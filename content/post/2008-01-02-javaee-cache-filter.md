---
title: Java EE Cache Filter
date: 2008-01-02 03:42:19+00:00
slug: javaee-cache-filter
categories:
  - Server-side
tags:
  - Cache
  - Java
---

In my current web project I was having some performance issues, I needed a tool that allowed me to do some testing so I can see what's wrong and what I can do better so my application perform faster.

My search lead me to [High Performance Web Sites and YSlow](http://www.youtube.com/watch?v=BTHvs3V8DBA), a very good talk by Steve Souders the Chief Performance Yahoo! at Yahoo!

[YSlow](http://developer.yahoo.com/yslow/) is an easy-for-use plugin that allows you to inspect any web page just clicking a button.

> YSlow analyzes web pages and tells you why they're slow based on the [rules for high performance web sites](http://developer.yahoo.com/performance/index.html#rules). YSlow is a [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/5369/) integrated with the popular [Firebug](http://www.getfirebug.com/) web development tool. YSlow gives you:
>
> * Performance report card
> * HTTP/HTML summary
> * List of components in the page
> * Tools including [JSLint](http://jslint.com/)

A good way to reduce the number of Http Connections required to load a web page is to store images and other resources in the [browser cache](http://www.procata.com/cachetest/).

`Expires` is a HTTP header that allows you to define when a resource (image, css, javascript, ...) will need to be reloaded. It is a String representation of a Date in the format `EEE, dd MMM yyyy HH:mm:ss z`.
`Cache-Control` response headers give Web publishers more control over their content and address the limitations of `Expires`.

To correctly produce these headers I implemented a Java cache filter.
Check out the project on GitHub at [samaxes/javaee-cache-filter](https://github.com/samaxes/javaee-cache-filter) or read the docs on the [wiki](https://github.com/samaxes/javaee-cache-filter/wiki).

Sample configuration:

```xml
<!-- Declare the filter in your web descriptor file `web.xml` -->

<filter>
    <filter-name>imagesCache</filter-name>
    <filter-class>com.samaxes.filter.CacheFilter</filter-class>
    <init-param>
        <param-name>expiration</param-name>
        <param-value>2592000</param-value>
    </init-param>
</filter>

<filter>
    <filter-name>cssCache</filter-name>
    <filter-class>com.samaxes.filter.CacheFilter</filter-class>
    <init-param>
        <param-name>expiration</param-name>
        <param-value>604800</param-value>
    </init-param>
    <init-param>
        <param-name>vary</param-name>
        <param-value>Accept-Encoding</param-value>
    </init-param>
</filter>

<filter>
    <filter-name>jsCache</filter-name>
    <filter-class>com.samaxes.filter.CacheFilter</filter-class>
    <init-param>
        <param-name>expiration</param-name>
        <param-value>216000</param-value>
    </init-param>
    <init-param>
        <param-name>private</param-name>
        <param-value>true</param-value>
    </init-param>
</filter>

<!-- Map the filter to serve your static resources -->

<filter-mapping>
    <filter-name>imagesCache</filter-name>
    <url-pattern>/img/*</url-pattern>
</filter-mapping>

<filter-mapping>
    <filter-name>cssCache</filter-name>
    <url-pattern>*.css</url-pattern>
</filter-mapping>

<filter-mapping>
    <filter-name>jsCache</filter-name>
    <url-pattern>*.js</url-pattern>
</filter-mapping>
```
