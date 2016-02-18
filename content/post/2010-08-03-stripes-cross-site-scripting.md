---
title: Stripes Framework XSS Interceptor
date: 2010-08-03 14:08:54+00:00
slug: stripes-cross-site-scripting
categories:
  - Server-side
tags:
  - Java
  - Security
  - Stripes Framework
  - XSS
---

I have created a new project named [Stripes XSS Interceptor](https://github.com/StripesFramework/stripes-xss).

This project escapes all the parameters that [Stripes Framework](http://www.stripesframework.org) binds during its Validation & Binding phase using a wrapped request object (a convenient implementation of the `HttpServletRequest` interface).

The code follows the XSS (Cross Site Scripting) security guidance posted at [OWASP](http://www.owasp.org/) (Open Web Application Security Project).

Please feel free to report any bug you find in the project's [Issue Tracker](https://github.com/StripesFramework/stripes-xss/issues).
