---
title: .htaccess - gzip and cache your site for faster loading and bandwidth saving
date: 2008-04-20 17:32:38+00:00
slug: htaccess-gzip-and-cache-your-site-for-faster-loading-and-bandwidth-saving
categories:
  - Performance
tags:
  - Apache
  - Cache
  - GZIP
  - HTTP
---

<ins datetime="2011-05-23T17:18:12+00:00">
  Please read [Improving web site performance with Apache .htaccess]({{< ref "post/2011-05-23-improving-web-performance-with-apache-and-htaccess.md" >}}) for an updated version of this article.
</ins>

Last week I changed my hosting provider from [Site5](http://www.site5.com/in.php?id=15543) to [NearlyFreeSpeech.NET](http://www.nearlyfreespeech.net/).
<del datetime="2009-01-01T23:00:43+00:00">Despite the fact that the first one is faster than the second, </del>NFSN is a lot more cheaper (I only pay for what I really use).

So in order to speed up my site and save bandwidth (the more I use the more I pay) I use `.htaccess` file to gzip my text based files and optimize cache HTTP headers.
Although this site is powered by [Wordpress](http://wordpress.org/) which has some really [great plugins](http://ocaoimh.ie/wp-super-cache/) to optimize PHP output I wanted a more generic solution which can be applied to all PHP web applications.

I also try to follow as much as I can the [rules for high performance web sites](http://developer.yahoo.com/performance/) so don't be surprised if some `Expires` header seems too long ([far future `Expires` header rule](http://developer.yahoo.com/performance/rules.html#expires) requires at least 172801 seconds).

<!--more-->

## Turn on compression

[`mod_gzip`](http://schroepl.net/projekte/mod_gzip/) is an external extension module for Apache that allows you to quickly and easily compress your files before you send them to the client. This speeds up your site like crazy!

If your hosting provider has mod_gzip module enabled, the best way to compress your content is to add the following lines to your `.htaccess` file:

```apache
<ifModule mod_gzip.c>
  mod_gzip_on Yes
  mod_gzip_dechunk Yes
  mod_gzip_item_include file .(html?|txt|css|js|php|pl)$
  mod_gzip_item_include handler ^cgi-script$
  mod_gzip_item_include mime ^text/.*
  mod_gzip_item_include mime ^application/x-javascript.*
  mod_gzip_item_exclude mime ^image/.*
  mod_gzip_item_exclude rspheader ^Content-Encoding:.*gzip.*
</ifModule>
```

unfortunately my provider doesn't have this module enabled. If you have the same problem, you can add the following line instead:

```apache
php_value output_handler ob_gzhandler
```

this makes PHP to compress your PHP files (be cautious, this is very CPU intensive).

To compress other static content you can use Ali Farhadi's JSmart Compressor which compress CSS and JavaScript files.

### Setup JSmart

<ins datetime="2010-12-06T01:00:20+00:00">
  **Note:** This section is outdated. JSmart Compressor has been renamed and updated as [SmartOptimizer](http://farhadi.ir/works/smartoptimizer).
</ins>

* Assuming your application resides in your web root, simply place the JSmart files into `/jsmart`.
* Edit `/jsmart/config.php` if you like, though the default settings should work fine. Mine looks like:

```php
<?php
//JSmart Configuration File

//Show error messages if any error occurs (true or false)
define('JSMART_DEBUG_ENABLED', false);

//Encoding of your js and css files. (utf-8 or iso-8859-1)
define('JSMART_CHARSET', 'utf-8');

//Base dir for javascript files
define('JSMART_JS_DIR', '../');

//Base dir for css files
define('JSMART_CSS_DIR', '../');

//Change it to false only for debugging purposes
define('JSMART_CACHE_ENABLED', true);

//JSmart cache dir
define('JSMART_CACHE_DIR', 'cache/');
?>
```

* Create and chmod 777 `/jsmart/cache`
* Add the following lines into your `.htaccess` in your web root:

```apache
<ifModule mod_rewrite.c>
  RewriteEngine on
  RewriteRule ^(.*.(js|css))$ jsmart/load.php?file=$1
</ifModule>
```

## Add future `Expires` and `Cache-Control` headers

A first-time visitor to your page will make several HTTP requests to download all your sites files, but using the `Expires` and `Cache-Control` headers you make those files cacheable. This avoids unnecessary HTTP requests on subsequent page views.

To set your `Expires` headers add these lines to your `.htaccess`:

```apache
<ifModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 seconds"
  ExpiresByType text/html "access plus 1 seconds"
  ExpiresByType image/gif "access plus 2592000 seconds"
  ExpiresByType image/jpeg "access plus 2592000 seconds"
  ExpiresByType image/png "access plus 2592000 seconds"
  ExpiresByType text/css "access plus 604800 seconds"
  ExpiresByType text/javascript "access plus 216000 seconds"
  ExpiresByType application/x-javascript "access plus 216000 seconds"
</ifModule>
```

and to set `Cache-Control` headers add:

```apache
<ifModule mod_headers.c>
  <filesMatch "\.(ico|pdf|flv|jpg|jpeg|png|gif|swf)$">
    Header set Cache-Control "max-age=2592000, public"
  </filesMatch>
  <filesMatch "\.(css)$">
    Header set Cache-Control "max-age=604800, public"
  </filesMatch>
  <filesMatch "\.(js)$">
    Header set Cache-Control "max-age=216000, private"
  </filesMatch>
  <filesMatch "\.(xml|txt)$">
    Header set Cache-Control "max-age=216000, public, must-revalidate"
  </filesMatch>
  <filesMatch "\.(html|htm|php)$">
    Header set Cache-Control "max-age=1, private, must-revalidate"
  </filesMatch>
</ifModule>
```

Now all your files must have the right headers and be cacheable except the CSS and JavaScript files processed by JSmart. This is because JSmart overrides the cache headers when gzipping these files.

To fix this you have to edit `/jsmart/load.php` file and change the block code

```php
if (JSMART_CACHE_ENABLED) {
  if (isset($headers['If-Modified-Since']) && $headers['If-Modified-Since'] == $mtimestr)
    header_exit('304 Not Modified');

  header("Last-Modified: " . $mtimestr);
  header("Cache-Control: must-revalidate", false);
} else header_nocache();
```

to

```php
if (JSMART_CACHE_ENABLED) {
  if (isset($headers['If-Modified-Since']) && $headers['If-Modified-Since'] == $mtimestr)
    header_exit('304 Not Modified');

  if ($file_type=='js') {
    header("Expires: " . gmdate("D, d M Y H:i:s", $mtime + 216000) . " GMT");
    header("Cache-Control: max-age=216000, private, must-revalidate", true);
  } else {
    header("Expires: " . gmdate("D, d M Y H:i:s", $mtime + 604800) . " GMT");
    header("Cache-Control: max-age=604800, public, must-revalidate", true);
  }
} else header_nocache();
```

## Turn off ETags

By removing the `ETag` header, you disable caches and browsers from being able to validate files, so they are forced to rely on your `Cache-Control` and `Expires` header.
Entity tags (ETags) are a mechanism to check for a newer version of a cached file.

Add these lines to `.htaccess`:

```apache
<ifModule mod_headers.c>
  Header unset ETag
</ifModule>
FileETag None
```

## Remove `Last-Modified` header

If you remove the `Last-Modified` and `ETag` header, you will totally eliminate `If-Modified-Since` and `If-None-Match` requests and their `304 Not Modified` responses, so a file will stay cached without checking for updates until the Expires header indicates new content is available!

Add these lines to `.htaccess`:

```apache
<ifModule mod_headers.c>
  Header unset Last-Modified
</ifModule>
```

## Notes

With these settings you should have your site a lot faster and your file's size greatly reduced.

## Resources

Some descriptions are based on [`.htaccess` (Hypertext Access) Articles](http://www.askapache.com/htaccess/) from [AskApache](http://www.askapache.com/).
`mod_gzip` settings are taken from [Highub - Web Development Blog](http://www.blog.highub.com/apache/htaccess-gzip-for-faster-loading-and-bandwidth-saving/).
