---
title: Fresh Layout for 2009
date: 2009-01-05 14:00:50+00:00
slug: fresh-layout-for-2009
categories:
  - General
tags:
  - NearlyFreeSpeech
  - WordPress
---

With the new year starting, I decided to try some changes here at samaxes.com.

First, I've changed the blog theme to a slightly modified [Derek Punsalan's Grid Focus](http://5thirtyone.com/grid-focus).
Some of these modifications were mostly due to some complains about the size of the content column versus the sidebars columns on the previous theme. Since this is mainly a technical blog it makes it easily on the eye to have a wider content column.

<!--more-->

Another visual change was the code syntax highlighting plugin. I was using the [SyntaxHighlighter Plus](http://wordpress.org/extend/plugins/syntaxhighlighter-plus/) and now I'm using [WP-CodeBox](http://wordpress.org/extend/plugins/wp-codebox/).
SyntaxHighlighter Plus served me well in the past, but it has some disadvantages, such as:

* Escapes the code special characters, making it harder to edit code (also has a bug when escaping '&' ampersand characters);
* Require that a lot of JavaScript files are sent to the client in order to style the code.

Although I'm using browser caching, 70-80% of this blog visitors are new visitors, so the cache won't help them. This means that I should try to minimize the number of HTTP requests as much as I can.
WP-CodeBox is based on the [GeSHi](http://qbnz.com/highlighter/) syntax highlighter. All the parsing is executed on the server side and it supports a lot more languages than the [SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/).

I've been evaluating for some time to change my hosting provider. I've considered two well known companies, [Media Temple](http://mediatemple.net/) and [DreamHost](http://www.dreamhost.com/). But after a quick look to their reviews I've decided to kept my current provider [NearlyFreeSpeech.NET](https://www.nearlyfreespeech.net/).

I've also tried to optimize my `.htaccess` file. I was using too many plugins to GZIP and cache static files. But excessive plugins will make your [WordPress](http://wordpress.org/) slower, so I try to keep them to a minimum. I'll talk more about this in a next post.

All the images used on this blog have been moved to [Google App Engine](http://appengine.google.com/). The benefits of App Engine as a CDN are obvious: your own server doesn’t suck up the bandwidth, while your visitors will appreciate a faster site.

Please take a look at the following print screens and share your opinions about the changes made.

{{< figure src="http://samaxes.appspot.com/images/autocomplete-v1.png" link="http://samaxes.appspot.com/images/autocomplete-v1.png" class="side-by-side" caption="Previous theme" >}}
{{< figure src="http://samaxes.appspot.com/images/autocomplete-v2.png" link="http://samaxes.appspot.com/images/autocomplete-v2.png" class="side-by-side" caption="Actual theme" >}}

I think these are the most relevant changes for this blog's readers and I hope they are for the better.
