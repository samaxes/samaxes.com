---
title: Apache Struts 2 development build
date: 2006-10-20 00:25:24+00:00
slug: apache-struts-2-development-build
categories:
  - Server-side
tags:
  - Java
  - Struts
---

The [first development build (2.0.1)](http://cwiki.apache.org/WW/home.html#Home-Distributions) of [Apache Struts 2](http://struts.apache.org/2.x/) project has been released.

> Struts 2 was originally known as WebWork 2. After working independently for several years, the WebWork and Struts communities joined forces to create Struts 2. This new version of Struts is designed to be simpler to use and closer to how Struts was always meant to be. Some key changes are:
>
> * Smarter!
>   * **Improved Design** - All Struts 2 classes are based on interfaces. Core interfaces are HTTP independent.
>   * **Intelligent Defaults** - Most configuration elements have a default value that we can set and forget.
>   * **Enhanced Results** - Unlike ActionForwards, Struts 2 Results can actually help prepare the response.
>   * **Enhanced Tags** - Struts 2 tags don't just output data, but provide stylesheet-driven markup, so that we can create consistent pages with less code.
>   * **First-class AJAX support** - The AJAX theme gives interactive applications a significant boost.
>   * **Stateful Checkboxes** - Struts 2 checkboxes do not require special handling for false values.
>   * **QuickStart** - Many changes can be made on the fly without restarting a web container.
> * Easier!
>   * **Easy-to-test Actions** - Struts 2 Actions are HTTP independent and can be tested without resorting to mock objects.
>   * **Easy-to-customize controller** - Struts 1 lets us customize the request processor per module, Struts 2 lets us customize the request handling per action, if desired.
>   * **Easy-to-tweak tags** - Struts 2 tag markup can be altered by changing an underlying stylesheet. Individual tag markup can be changed by editing a FreeMarker template. No need to grok the taglib API! Both JSP and FreeMarker tags are fully supported.
>   * **Easy cancel handling** - The Struts 2 Cancel button can go directly to a different action.
>   * **Easy Spring integration** - Struts 2 Actions are Spring-aware. Just add Spring beans!
>   * **Easy plugins** - Struts 2 extensions can be added by dropping in a JAR. No manual configuration required!
> * POJO-ier!
>   * **POJO forms** - No more ActionForms! We can use any JavaBean we like or put properties directly on our Action classes. No need to use all String properties!
>   * **POJO Actions** - Any class can be used as an Action class. We don't even have to implement an interface!

## Struts 2 key features

* A flexible, plain old Java object (POJO)-based architecture to structure your code and pages, yet stay out of your way.
* A theme-enabled tag library supporting JSP, Velocity, and Freemarker.
* Built in support for complex Javascript and Ajax widgets.
* A simple plugin framework to integrate with third-party libraries like JavaServer Faces, JasperReports, and JFreeChart.
* Built-in debugging tools supporting profiling, problem reports, and interactive object model queries.
* Automatic portlet support allowing portal and servlet deployments with no code changes
* Quick start development tools like Maven archetypes, automatic reloading configuration files, and bootstrap tutorials.

## Other Resources

* [Apache Struts 2 Documentation](http://cwiki.apache.org/WW/home.html)
* [Migrating to Struts 2](http://www.strutsuniversity.org/Migrating%20Tutorial)
* [Migrating Struts Apps to Struts 2](http://www.infoq.com/articles/converting-struts-2-part1) from InfoQ
* [Migrating to Struts 2 - Part II](http://www.infoq.com/articles/migrating-struts-2-part2) from InfoQ
* [Migrating to Struts 2 - Part III](http://www.infoq.com/articles/migrating-struts-2-part3) from InfoQ
