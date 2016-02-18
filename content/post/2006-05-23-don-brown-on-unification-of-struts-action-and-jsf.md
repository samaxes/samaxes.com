---
title: Don Brown on Unification of Struts Action and JSF
date: 2006-05-23 16:59:24+00:00
slug: don-brown-on-unification-of-struts-action-and-jsf
categories:
  - Server-side
tags:
  - Java
  - JSF
  - Struts
---

In [Unification: Struts Action and JSF](http://jroller.com/mrdon/entry/unification_struts_action_and_jsf), Don Brown show us how to use Struts Action 2 and JSF as one framework.

> Struts Action 2, based on the WebWork 2.2 code, has builtin support for JSF, using an approach that smoothly combines both frameworks into one configuration file, one framework. Struts Action takes the familiar Action-based approach to page logic and navigation, and sprinkles in optional support for JSF components. The result is a framework that lets the developer easily incorporate component-driven pages as application needs dictate.

The JSF components still have access to the entire JSF lifecycle while retaining the action-based paradigm.

JSF / Struts Action configuration file example:

```xml
<action name="employee" class="org.apache.struts.action2.showcase.jsf.EmployeeAction">
    <interceptor-ref name="basicStack" />
    <interceptor-ref name="jsfStack" />
    <result name="success" type="jsf" />
    <result name="index" type="redirect-action">index</result>
</action>
```
