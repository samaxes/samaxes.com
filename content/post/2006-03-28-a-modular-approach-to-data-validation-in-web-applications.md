---
title: A Modular Approach to Data Validation in Web Applications
date: 2006-03-28 21:57:49+00:00
slug: a-modular-approach-to-data-validation-in-web-applications
categories:
  - Server-side
tags:
  - Java
  - Security
---

Data that is not validated or poorly validated is the root cause of a number of serious security vulnerabilities affecting applications, such as Cross Site Scripting and SQL Injection. A paper entitled [A Modular Approach to Data Validation in Web Applications](http://www.corsaire.com/white-papers/060116-a-modular-approach-to-data-validation.pdf) presents an approach to performing thorough data validation in modern web applications so that the benefits of modular component based design (extensibility, portability and re-use) can be realised.

It starts with an explanation of the vulnerabilities introduced through poor validation and then goes on to discuss the merits and drawbacks of a number of common data validation strategies such as:

* Validation in an external Web Application Firewall
* Validation performed in the web tier (e.g. Struts)
* Validation performed in the domain model

Finally, a modular approach is introduced together with practical examples of how to implement such a scheme in a web application, including such strategies as transformation of data to a canonical format, detecting attacks based on likely vectors, accepting only valid data (i.e., a name shouldn't contain angle brackets), and escaping meta-characters that might have specific meaning for specific contexts (i.e., watching for characters that might execute something unexpected in a SQL engine or LDAP).
