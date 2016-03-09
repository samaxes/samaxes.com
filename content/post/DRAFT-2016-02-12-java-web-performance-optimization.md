---
title: Java tools for Web Performance Optimization
date: 2016-02-12
draft: true
slug: java-web-performance-optimization
categories:
  - Tools
tags:
  - Build
  - Cache
  - GZIP
  - HTTP
  - Java
  - Maven
  - Performance
---

This blog already counts several posts about [web performance](/categories/performance), although none of them is about Java tools I developed and tools I use for web performance optimization.

If you are not aware about the benefits of Web Performance Optimization (WPO), read [Website Performance Optimization case studies](http://www.strangeloopnetworks.com/web-performance-optimization-hub/research-type/case-study/) from Strangeloop, showing how web performance affects everything from page views to revenue to search ranking.

This post will focus on two open source projects that can greatly improve your application performance:

* [Minify Maven Plugin](https://github.com/samaxes/minify-maven-plugin), combines and minimizes JavaScript and CSS files using [YUI Compressor](http://developer.yahoo.com/yui/compressor/) for faster page loading.
* [Java EE Cache Filter](https://github.com/samaxes/javaee-cache-filter), provides a collection of common Servlet filters for Java web applications based on the [Servlet specification](https://jcp.org/en/jsr/detail?id=315) that allows you to transparently set HTTP cache headers in order to enable browser caching.

And will also cover how you can enable gzip compression in Tomcat-enable servers.

<!--more-->

## Testing tools

YSlow is a browser plugin that grades web pages based on testable rules for high performance web pages (see [Performance Rules](http://developer.yahoo.com/yslow/help/index.html#guidelines)).

By using these tools and techniques you can easily achieve an YSlow grade A by having a score of 100% on the following rules:

1. [Minimize HTTP Requests](http://developer.yahoo.com/performance/rules.html#num_http)
2. [Add an Expires or a Cache-Control Header](http://developer.yahoo.com/performance/rules.html#expires)
3. [Gzip Components](http://developer.yahoo.com/performance/rules.html#gzip)
4. [Minify JavaScript and CSS](http://developer.yahoo.com/performance/rules.html#minify)

For most of the other rules you don't need any special tools, just follow Yahoo's [Best Practices for Speeding Up Your Web Site](http://developer.yahoo.com/performance/rules.html).

## Minimize HTTP Requests and minify JavaScript and CSS

Reduce HTTP Requests
: 80% of the end-user response time is spent on the front-end. Most of this time is tied up in downloading all the components in the page: images, stylesheets, scripts, Flash, etc. Reducing the number of components in turn reduces the number of HTTP requests required to render the page. This is the key to faster pages.

    Combined files are a way to reduce the number of HTTP requests by combining all scripts into a single script, and similarly combining all CSS into a single stylesheet. Combining files is more challenging when the scripts and stylesheets vary from page to page, but making this part of your release process improves response times.

Minify JavaScript and CSS
: Minification is the practice of removing unnecessary characters from code to reduce its size thereby improving load times. When code is minified all comments are removed, as well as unneeded white space characters (space, newline, and tab). In the case of JavaScript, this improves response time performance because the size of the downloaded file is reduced. Two popular tools for minifying JavaScript code are [JSMin](http://crockford.com/javascript/jsmin) and [YUI Compressor](http://developer.yahoo.com/yui/compressor/). The YUI compressor can also minify CSS.

	  Obfuscation is an alternative optimization that can be applied to source code. It's more complex than minification and thus more likely to generate bugs as a result of the obfuscation step itself. In a survey of ten top U.S. web sites, minification achieved a 21% size reduction versus 25% for obfuscation. Although obfuscation has a higher size reduction, minifying JavaScript is less risky.

### Minify Maven Plugin

[Minify Maven Plugin](https://github.com/samaxes/minify-maven-plugin) is a [Maven](http://maven.apache.org/) plugin that combines and minimizes JavaScript and CSS files using [YUI Compressor](http://developer.yahoo.com/yui/compressor/) for faster page loading.

#### Configuration

All you need to do to have the plugin working, is to configure it in your project's `pom.xml`:

```xml
<project>
  [...]
  <build>
    <plugins>
      [...]
      <plugin>
        <groupId>com.samaxes.maven</groupId>
        <artifactId>minify-maven-plugin</artifactId>
        <version>1.4</version>
        <configuration>
          <cssSourceFiles>
            <cssSourceFile>file-1.css</cssSourceFile>
            [...]
            <cssSourceFile>file-n.css</cssSourceFile>
          </cssSourceFiles>
          <jsSourceFiles>
            <jsSourceFile>file-1.js</jsSourceFile>
            [...]
            <jsSourceFile>file-n.js</jsSourceFile>
          </jsSourceFiles>
        </configuration>
      </plugin>
      [...]
    </plugins>
  </build>
  [...]
</project>
```

Please read [Minify Maven Plugin documentation](http://samaxes.github.com/minify-maven-plugin) for more information.

## Add an Expires or a Cache-Control Header

Browser caching
: Web page designs are getting richer and richer, which means more scripts, stylesheets, images, and Flash in the page. A first-time visitor to your page may have to make several HTTP requests, but by using the Expires header you make those components cacheable. This avoids unnecessary HTTP requests on subsequent page views. Expires headers are most often used with images, but they should be used on all components including scripts, stylesheets, and Flash components.

	  Browsers (and proxies) use a cache to reduce the number and size of HTTP requests, making web pages load faster.

### Java EE Cache Filter

[Java EE Cache Filter](https://github.com/samaxes/javaee-cache-filter) provides a collection of common Servlet filters for Java web applications based on the Servlet specification that allows you to transparently set HTTP cache headers in order to enable browser caching.

#### Configuration

Add the dependency to your project's `pom.xml`:

```xml
<dependency>
    <groupId>com.samaxes.filter</groupId>
    <artifactId>cachefilter</artifactId>
    <version>2.0</version>
</dependency>
```

And configure the filter in your web deployment descriptor file `web.xml`:

```xml
<filter>
    <filter-name>imagesCache</filter-name>
    <filter-class>com.samaxes.filter.CacheFilter</filter-class>
    <init-param>
        <param-name>static</param-name>
        <param-value>true</param-value>
    </init-param>
    <init-param>
        <param-name>expirationTime</param-name>
        <param-value>2592000</param-value>
    </init-param>
</filter>

<filter>
    <filter-name>cssCache</filter-name>
    <filter-class>com.samaxes.filter.CacheFilter</filter-class>
    <init-param>
        <param-name>expirationTime</param-name>
        <param-value>604800</param-value>
    </init-param>
</filter>

<filter>
    <filter-name>jsCache</filter-name>
    <filter-class>com.samaxes.filter.CacheFilter</filter-class>
    <init-param>
        <param-name>private</param-name>
        <param-value>true</param-value>
    </init-param>
    <init-param>
        <param-name>expirationTime</param-name>
        <param-value>216000</param-value>
    </init-param>
</filter>

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

## Gzip text based components

Compress content
: Compression reduces response times by reducing the size of the HTTP response.
	It's worthwhile to gzip your HTML documents, scripts and stylesheets. In fact, it's worthwhile to compress any text response including XML and JSON.

    Image and PDF files should not be gzipped because they are already compressed. Trying to gzip them not only wastes CPU but can potentially increase file sizes.

### Apache Tomcat HTTP Connector

The [Tomcat HTTP Connector](http://tomcat.apache.org/tomcat-7.0-doc/config/http.html) element represents a Connector component that supports the HTTP/1.1 protocol.

#### Configuration

Add the `compressableMimeType` and `compression` options to your HTTP connector in Tomcat's `server.xml`:

```xml
<Connector protocol="HTTP/1.1" port="${jboss.web.http.port}" address="${jboss.bind.address}"
  redirectPort="${jboss.web.https.port}"
  compressableMimeType="application/xhtml+xml,text/html,text/xml,application/xml,text/plain,text/css,text/javascript,application/javascript"
  compression="on" URIEncoding="UTF-8" />
```
