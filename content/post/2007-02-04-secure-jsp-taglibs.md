---
title: Secure JSP Taglibs
date: 2007-02-04 16:12:14+00:00
slug: secure-jsp-taglibs
categories:
  - Server-side programming
tags:
  - Java
  - JSP
  - Security
  - Taglib
---

I've created the project [Secure JSP Taglibs](https://github.com/samaxes/javaee-secure-taglib) with the ambition to fill some gaps in the security of the presentation layer in a Java web application.

This Taglib allows you to evaluate the nested body content of the tag to test if the user has the specified roles.
This is equivalent to the `isUserInRole()` method, but you can evaluate multiple roles (comma separated) at the same time.

```xml
<secure:one roles="role1toevaluate, role2toevaluate">
    Show this content if the user has one of the specified roles.
</secure:one>
```

```xml
<secure:all roles="role1toevaluate, role2toevaluate">
    Show this content if the user has all the specified roles.
</secure:all>
```

```xml
<secure:none roles="role1toevaluate, role2toevaluate">
    Show this content if the user has none of the specified roles.
</secure:none>
```
