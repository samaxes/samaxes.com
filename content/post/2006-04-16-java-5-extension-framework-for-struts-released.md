---
title: Java 5 extension framework for Struts released
date: 2006-04-16 01:40:49+00:00
slug: java-5-extension-framework-for-struts-released
categories:
  - Server-side programming
tags:
  - Java
  - Struts
---

[Strecks](http://strecks.sourceforge.net/), a set of open source extensions to the Struts framework aimed at Java 5 users, has been released. Strecks (which stands for "Struts Extensions") is built on the existing Struts 1.2.x code base.

Read Phil Zoio's article on Strecks, titled [Building on Struts for Java 5 Users](http://www.theserverside.com/news/1364367/Building-on-Struts-for-Java-5-Users).

Strecks contains a range of features aimed to streamline the Struts programming model. Some key features include:

* POJO action beans with no framework dependencies
* action vs. controller separation. Request processing logic is encapsulated into Action controllers, simplifying action implementations
* annotation-based dependency injection (typed request parameters, session attributes, Spring beans, and others)
* annotation-based form validators (XML and code-free)
* annotation-based data binding from form properties to domain model
* annotations for additional per-field control over type conversion
* simplified mechanisms to support navigation and redirecting after posts
* pluggable navigation using annotations
* pre- and post-action interceptors, with access to dependency resolved action beans as well as full runtime context

For a more complete list, see [http://strecks.sourceforge.net/features.php](http://strecks.sourceforge.net/features.php).
