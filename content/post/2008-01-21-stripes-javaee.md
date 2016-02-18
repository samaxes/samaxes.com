---
title: Stripes framework and Java EE
date: 2008-01-21 02:10:43+00:00
slug: stripes-javaee
categories:
  - Server-side
tags:
  - CDI
  - EJB
  - Java
  - Stripes Framework
---

Inspired by the [Spring with Stripes](https://stripesframework.atlassian.net/wiki/display/STRIPES/Spring+with+Stripes) integration I decided to make one for Java EE: [Stripes Injection Enricher](https://stripesframework.atlassian.net/wiki/display/STRIPES/Stripes+Injection+Enricher).

Stripes Injection Enricher enriches [Stripes Framework](https://stripesframework.atlassian.net/wiki/display/STRIPES/Home) objects by satisfying injection points specified declaratively using annotations.
There are three injection-based enrichers provided by Stripes Injection Enricher out of the box:

* `@Resource` - Java EE resource injections
* `@EJB` - EJB session bean reference injections
* `@Inject` - CDI injections

The source code is available on GitHub at [StripesFramework/stripes-injection-enricher](https://github.com/StripesFramework/stripes-injection-enricher).
