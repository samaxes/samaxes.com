---
title: Offline web applications with Dojo Offline Toolkit
date: 2007-04-26 22:28:58+00:00
slug: offline-web-applications-with-dojo-offline-toolkit
categories:
  - Web Development
tags:
  - Dojo
  - Offline
---

Although I'm not a big fan of the [Dojo Toolkit](http://dojotoolkit.org/), I'm impressed with the the [Dojo Offline Toolkit](http://o.dojotoolkit.org/offline).

I'm confident that this will greatly improve the way some actual web applications work.

## What is the Dojo Offline Toolkit?

> Dojo Offline is a free, open source toolkit that makes it easy for web applications to work offline. It consists of two pieces: a JavaScript library bundled with your web page and a small (~300K) cross-platform, cross-browser download that helps to cache your web application's user-interface for use offline.

## How Dojo Offline Works?

> Dojo Offline uses a very small, standard web proxy that runs locally. Web proxies are perfect; they speak standard HTTP/1.1 between a web browser and a server, caching files that wish to be cached for later access without hitting the network. Many companies run a web proxy on their networks, caching commonly accessed pages for later access; why can't this web proxy run on a user's local machine, caching a web application's UI for offline access? A web server can simply turn on standard HTTP/1.1 caching headers on its user-interface files, which the proxy dutifully caches. If the browser comes up but the network is down, the local web proxy will simply hand back its cached UI files. Even better, the proxy will automatically update any of its cached files if they have been updated, based on their caching headers, which means the UI gains auto-update for free — no new standards are needed.
>
> How do we configure the web browser to talk to our local web proxy? We use a standard from the late nineties not known by many but which has deep and mature support in all browsers called Proxy AutoConfiguration (PAC). A PAC file is a small bit of JavaScript that is invoked on each browser request. This JavaScript can decide how to resolve the address, either by directly talking to the web site or by using a proxy. For Dojo Offline, we only want to talk to the local proxy and cache files for Dojo Offline web applications, not for all web sites so that that we don't fill up our hard drive. Our PAC file will therefore talk to the local web proxy for any domain names that want to work offline, and will ignore the proxy for all other addresses; this will be a simple JavaScript if/else statement in the PAC file. We programatically register our PAC file for a user's browser. This PAC file is actually generated dynamically by the local Dojo Offline proxy.
>
> How does a web application add itself to the PAC file so it can work offline? We have to be very careful here. We don't want to create an attack vector to the user's local computer by having the web application “talk” to localhost, such as “http://localhost:1234/add-web-app?url=mywebapp.com” or make it possible for one web application to spoof another one and have it be added to the PAC file if it doesn't want to be added. The entire focus of security for Dojo Offline is to keep the surface area of trust as narrow and small as possible, constraining privilege to just the small web proxy, which only runs on the loopback address and never touches the real network — everything else must use standard domain names, forcing them into the browser's standard, restricted web privilege level. Further, the Dojo Offline Toolkit's proxy is completely generic and does not have to be tailored for individual applications.
>
> Dojo Offline's PAC file comes bundled with a single, magical bootstrap domain name initially, “offline.dojo.web.app,” that a web application can invoke to add itself to the PAC file. The PAC file routes any request for this domain to the local proxy, and the Dojo Offline proxy checks the referer (sic) header for the domain name to be added offline. Normally the referer field can be spoofed, but there is no way for a web application to spoof the referer field from inside the web browser. The predefined offline.dojo.web.app domain name also exposes other services a web application can use, such as knowing whether it is on- or off-line. Access to these services is mediated by a thin, easy-to-use Dojo Offline JavaScript API, bundled with the web application itself.
>
> The web browser does not know the difference between whether you are on- or off-line, since the proxy serves up the UI either way. Dojo Storage can save hundreds of K or megabytes of application-level data, and is keyed off of the domain name for security; Dojo Storage is therefore “tricked” into not knowing the difference and is therefore accessible either way with the same data store. Applications can use this persistent, megabyte-capable store for all offline data needs, accessing the same information whether you are on- or off-line.
>
> The last step is to wrap the Dojo Offline Toolkit into a small installer for each target platform, and to have it start up silently on system startup. The download size will be only 100 to 300K, making it extremely easy to download and try; an uninstaller will also exist for each platform, bundled with the download. Everything is automated, hands-off, and easy.

Try out the [Moxie demo](http://codinginparadise.org/editor), and download the [Dojo Offline SDK](http://download.dojotoolkit.org/experimental/offline/dot_sdk_0.4.2_2.zip).

## Other frameworks implementing offline functionality

* <del datetime="2010-12-03T23:45:16+00:00">Apollo</del> [Adobe AIR](http://www.adobe.com/products/air/) - Proprietary framework by Adobe that enables you to create web applications that work seamlessly of whether a user is connected to Internet or not.
* [Dekoh](http://www.dekoh.com/) - Pretty much the same but open source and cross platform (written in Java).
* [Slingshot](http://www.joyent.com/developers/slingshot/) - Offline functionality to Rails apps.
