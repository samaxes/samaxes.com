---
title: Improving web site performance with Apache .htaccess
date: 2011-05-23 14:44:40+00:00
slug: improving-web-performance-with-apache-and-htaccess
categories:
  - Web Development
tags:
  - Apache
  - Cache
  - GZIP
  - HTTP
  - Performance
---

Web performance is getting more and more attention from web developers and is one of the hottest topic in web development.

[Fred Wilson](http://www.avc.com/) considered it at [10 Golden Principles of Successful Web Apps](http://vimeo.com/10510576) as the #1 principle for successful web apps:

> First and foremost, we believe that speed is more than a feature. Speed is the most important feature. If your application is slow, people won’t use it.

Faster website means more revenue and traffic:

* Amazon: 100 ms of extra load time caused a 1% drop in sales (source: Greg Linden, Amazon).
* Google: 500 ms of extra load time caused 20% fewer searches (source: Marrissa Mayer, Google).
* Yahoo!: 400 ms of extra load time caused a 5–9% increase in the number of people who clicked "back" before the page even loaded (source: Nicole Sullivan, Yahoo!).

<!--more-->

[Google experiments](http://googleresearch.blogspot.com/2009/06/speed-matters.html) reached similar results:

> Our experiments demonstrate that slowing down the search results page by 100 to 400 milliseconds has a measurable impact on the number of searches per user of -0.2% to -0.6% (averaged over four or six weeks depending on the experiment). That's 0.2% to 0.6% fewer searches for changes under half a second!

And speed is now a factor contributing to Google Page Rank:

> Google, in their [ongoing effort to make the Web faster](https://developers.google.com/speed/), [blogged](http://googlewebmastercentral.blogspot.com/2010/04/using-site-speed-in-web-search-ranking.html) last month that “we’ve decided to take site speed into account in our search rankings.” This is yet another way in which improving web performance will have a positive impact on the bottom line.

The good news is that some of the most important speed optimizations can be easily done with simple [`.htaccess`](http://httpd.apache.org/docs/current/howto/htaccess.html) rules.

These rules can make any website faster by compressing content and enabling browser cache. They also follow the [Best Practices for Speeding Up Your Web Site](http://developer.yahoo.com/performance/rules.html) from Yahoo!'s Exceptional Performance team.

## Compress content

Compression reduces response times by reducing the size of the HTTP response.

It's worthwhile to gzip your HTML documents, scripts and stylesheets. In fact, it's worthwhile to compress any text response including XML and JSON.

Image and PDF files should not be gzipped because they are already compressed. Trying to gzip them not only wastes CPU but can potentially increase file sizes.

To compress your content, Apache 2 comes bundled with the [mod_deflate](http://httpd.apache.org/docs/current/mod/mod_deflate.html) module:

> The `mod_deflate` module provides the `DEFLATE` output filter that allows output from your server to be compressed before being sent to the client over the network.

Enable gzip compression for text responses:

```apache
<ifModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/xml text/css text/plain
  AddOutputFilterByType DEFLATE image/svg+xml application/xhtml+xml application/xml
  AddOutputFilterByType DEFLATE application/rdf+xml application/rss+xml application/atom+xml
  AddOutputFilterByType DEFLATE text/javascript application/javascript application/x-javascript application/json
  AddOutputFilterByType DEFLATE application/x-font-ttf application/x-font-otf
  AddOutputFilterByType DEFLATE font/truetype font/opentype
</ifModule>
```

In previous versions of Apache, you can use [mod_gzip](http://schroepl.net/projekte/mod_gzip/).

## Enable browser cache

Web page designs are getting richer and richer over time, which means more scripts, stylesheets and images in the page. A first-time visitor to your page will make several HTTP requests to download all your sites files, but by using the `Expires` and `Cache-Control` headers you make those files cacheable. This avoids unnecessary HTTP requests on subsequent page views.

Apache enables those headers thanks to [mod_expires](http://httpd.apache.org/docs/current/mod/mod_expires.html) and [mod_headers](http://httpd.apache.org/docs/current/mod/mod_headers.html) modules.

> The `mod_expires` module controls the setting of the `Expires` HTTP header and the `max-age` directive of the `Cache-Control` HTTP header in server responses.
To modify `Cache-Control` directives other than `max-age`, you can use the `mod_headers` module.

> The `mod_headers` module provides directives to control and modify HTTP request and response headers. Headers can be merged, replaced or removed.

Rule for setting `Expires` headers:

```apache
# BEGIN Expire headers
<ifModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 5 seconds"
  ExpiresByType image/x-icon "access plus 2592000 seconds"
  ExpiresByType image/jpeg "access plus 2592000 seconds"
  ExpiresByType image/png "access plus 2592000 seconds"
  ExpiresByType image/gif "access plus 2592000 seconds"
  ExpiresByType application/x-shockwave-flash "access plus 2592000 seconds"
  ExpiresByType text/css "access plus 604800 seconds"
  ExpiresByType text/javascript "access plus 216000 seconds"
  ExpiresByType application/javascript "access plus 216000 seconds"
  ExpiresByType application/x-javascript "access plus 216000 seconds"
  ExpiresByType text/html "access plus 600 seconds"
  ExpiresByType application/xhtml+xml "access plus 600 seconds"
</ifModule>
# END Expire headers
```

Rule for setting `Cache-Control` headers:

```apache
# BEGIN Cache-Control Headers
<ifModule mod_headers.c>
  <filesMatch "\.(ico|jpe?g|png|gif|swf)$">
    Header set Cache-Control "public"
  </filesMatch>
  <filesMatch "\.(css)$">
    Header set Cache-Control "public"
  </filesMatch>
  <filesMatch "\.(js)$">
    Header set Cache-Control "private"
  </filesMatch>
  <filesMatch "\.(x?html?|php)$">
    Header set Cache-Control "private, must-revalidate"
  </filesMatch>
</ifModule>
# END Cache-Control Headers
```

**Note 1:** There is no need to set `max-age` directive with `Cache-Control` header since it is already set by `mod_expires` module.

**Note 2:** `must-revalidate` means that _once a response becomes stale_ it has to be revalidated; it doesn’t mean that it has to be checked every time.

## Disable HTTP ETag header

ETags were added to provide a mechanism for validating entities that is more flexible than the last-modified date.

The problem with ETags is that they typically are constructed using attributes that make them unique to a specific server hosting a site.

ETags won't match when a browser gets the original component from one server and later tries to validate that component on a different server.

In Apache, this is done by simply adding the `FileETag` directive to your configuration file:

```apache
# BEGIN Turn ETags Off
FileETag None
# END Turn ETags Off
```

## Last-Modified header

In a [previous post]({{< ref "post/2008-04-20-htaccess-gzip-and-cache-your-site-for-faster-loading-and-bandwidth-saving.md" >}}) I stated that:

> If you remove the `Last-Modified` and `ETag` header, you will totally eliminate `If-Modified-Since` and `If-None-Match` requests and their `304 Not Modified` responses, so a file will stay cached without checking for updates until the Expires header indicates new content is available!

Well, I was wrong and this is why: we still want `Last-Modified` header for static files. If a user presses the _refresh_ button, then browser will send a conditional request and server will respond a `304 Not Modified`. If you disable both `Last-Modified` and `ETag`, the browser will have to download the whole content again whenever a user presses _refresh_.

## Merge and minify your static files

Reducing the number of components in turn reduces the number of HTTP requests required to render the page. This is the key to faster pages.

Minification is the practice of removing unnecessary characters from code to reduce its size thereby improving load times.

See [Combine and minimize JavaScript and CSS files for faster loading]({{< ref "post/2009-05-25-combine-and-minimize-javascript-and-css-files-for-faster-loading.md" >}}) for more information on this topic.

## Web performance tools

Always check your changes. Use either [YSlow](http://yslow.org/) or [Page Speed](https://developers.google.com/speed/pagespeed/) browser plugins.

They are super easy to use and the best tools currently available for the job.

## Final file

Copy the following `.htaccess` file into the root directory of your site and enjoy the performance improvements.

```apache
# BEGIN Compress text files
<ifModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/xml text/css text/plain
  AddOutputFilterByType DEFLATE image/svg+xml application/xhtml+xml application/xml
  AddOutputFilterByType DEFLATE application/rdf+xml application/rss+xml application/atom+xml
  AddOutputFilterByType DEFLATE text/javascript application/javascript application/x-javascript application/json
  AddOutputFilterByType DEFLATE application/x-font-ttf application/x-font-otf
  AddOutputFilterByType DEFLATE font/truetype font/opentype
</ifModule>
# END Compress text files

# BEGIN Expire headers
<ifModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 5 seconds"
  ExpiresByType image/x-icon "access plus 2592000 seconds"
  ExpiresByType image/jpeg "access plus 2592000 seconds"
  ExpiresByType image/png "access plus 2592000 seconds"
  ExpiresByType image/gif "access plus 2592000 seconds"
  ExpiresByType application/x-shockwave-flash "access plus 2592000 seconds"
  ExpiresByType text/css "access plus 604800 seconds"
  ExpiresByType text/javascript "access plus 216000 seconds"
  ExpiresByType application/javascript "access plus 216000 seconds"
  ExpiresByType application/x-javascript "access plus 216000 seconds"
  ExpiresByType text/html "access plus 600 seconds"
  ExpiresByType application/xhtml+xml "access plus 600 seconds"
</ifModule>
# END Expire headers

# BEGIN Cache-Control Headers
<ifModule mod_headers.c>
  <filesMatch "\.(ico|jpe?g|png|gif|swf)$">
    Header set Cache-Control "public"
  </filesMatch>
  <filesMatch "\.(css)$">
    Header set Cache-Control "public"
  </filesMatch>
  <filesMatch "\.(js)$">
    Header set Cache-Control "private"
  </filesMatch>
  <filesMatch "\.(x?html?|php)$">
    Header set Cache-Control "private, must-revalidate"
  </filesMatch>
</ifModule>
# END Cache-Control Headers

# BEGIN Turn ETags Off
FileETag None
# END Turn ETags Off
```
