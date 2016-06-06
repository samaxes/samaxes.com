---
title: Speed up your site by compressing and caching your content with .htaccess
date: 2009-01-06 14:00:46+00:00
slug: more-on-compressing-and-caching-your-site-with-htaccess
categories:
  - Web
tags:
  - Apache
  - Cache
  - GZIP
  - HTTP
  - Performance
---

<ins datetime="2011-05-23T17:18:12+00:00">
  Please read [Improving web site performance with Apache .htaccess]({{< ref "post/2011-05-23-improving-web-performance-with-apache-and-htaccess.md" >}}) for an updated version of this article.
</ins>

[.htaccess - gzip and cache your site for faster loading and bandwidth saving]({{< ref "post/2008-04-20-htaccess-gzip-and-cache-your-site-for-faster-loading-and-bandwidth-saving.md" >}}) is one of the most popular posts on samaxes.
It's basically on how to compress and cache your site content with [Apache](http://httpd.apache.org/) and `.htaccess` file.

It works like a charm, but it's not yet the perfect configuration for me.
I wanted something that I can use out-of-the-box without having to rely on external [extension modules](http://schroepl.net/projekte/mod_gzip/) or [tools](http://farhadi.ir/works/smartoptimizer).

<!--more-->

If you are lucky enough to have Apache 2 with your hosting provider you can use the [mod_deflate](http://httpd.apache.org/docs/2.2/mod/mod_deflate.html) module that comes bundled with it.

In order to compress your text files with this Apache's module you just have to add the following lines to your `.htaccess` file:

```apache
<ifModule mod_deflate.c>
  <filesMatch "\.(css|js|x?html?|php)$">
    SetOutputFilter DEFLATE
  </filesMatch>
</ifModule>
```

This will gzip all your `_.css`, `_.js`, `_.html`, `_.html`, `_.xhtml`, and `_.php` files.

A great `.htaccess` file example that will gzip your text files and cache all your static files, may look like:

```apache
# BEGIN Compress text files
<ifModule mod_deflate.c>
  <filesMatch "\.(css|js|x?html?|php)$">
    SetOutputFilter DEFLATE
  </filesMatch>
</ifModule>
# END Compress text files

# BEGIN Expire headers
<ifModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 seconds"
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
    Header set Cache-Control "max-age=2592000, public"
  </filesMatch>
  <filesMatch "\.(css)$">
    Header set Cache-Control "max-age=604800, public"
  </filesMatch>
  <filesMatch "\.(js)$">
    Header set Cache-Control "max-age=216000, private"
  </filesMatch>
  <filesMatch "\.(x?html?|php)$">
    Header set Cache-Control "max-age=600, private, must-revalidate"
  </filesMatch>
</ifModule>
# END Cache-Control Headers

# BEGIN Turn ETags Off
<ifModule mod_headers.c>
  Header unset ETag
</ifModule>
FileETag None
# END Turn ETags Off

# BEGIN Remove Last-Modified Header
<ifModule mod_headers.c>
  Header unset Last-Modified
</ifModule>
# END Remove Last-Modified Header
```

This will surely improve your site performance by one order of magnitude. Try it!
