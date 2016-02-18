---
title: Java and UTF-8 encoding
date: 2006-12-31 19:36:17+00:00
slug: java-and-utf-8-encoding
categories:
  - Server-side
tags:
  - Encoding
  - Internationalization
  - Java
---

If the J2SE platform has come a long way in internationalization, entering non-ASCII text in the J2EE world isn't nearly as easy.

To achieve the same result you have to make some changes in your code and in your web server settings.

Firstly, to make sure that the right value in the `Content-Type` header precedes the `text/html` content so your browser correctly auto-detects the right encoding, place the following declaration at the beginning of the JSP:

```xml
<%@ page contentType="text/html; charset=utf-8" pageEncoding="UTF-8" %>
```

Next you have to create a filter that implements `javax.servlet.Filter` interface so you can have the request parameters encoded with UTF-8:

```java
package com.samaxes.filters;

import javax.servlet.*;
import java.io.IOException;

/**
 * Filter called before every action.
 *
 * @author : samaxes
 */
public class UTF8Filter implements Filter {

    public void init(FilterConfig filterConfig) {
    }

    public void destroy() {
    }

    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain)
            throws IOException, ServletException {
        servletRequest.setCharacterEncoding("UTF-8");
        filterChain.doFilter(servletRequest, servletResponse);
    }
}
```

Now, your server reads the URL POST parameters correctly...

But there still is an issue - during a GET operation.

The trouble is that none of the charset information gets sent back to the web server during a GET or POST operation. The server has no way of knowing how to interpret the url-encoded GET parameters, so it assumes ISO-8859-1.

Fortunately the solution to address this is pretty simple, just specify `URIEncoding="UTF-8"` in your Tomcat's connector settings within the `server.xml` file.

Your application shall now handle UTF-8 just fine.
