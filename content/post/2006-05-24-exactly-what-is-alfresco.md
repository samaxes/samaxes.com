---
title: Exactly what is Alfresco?
date: 2006-05-24 17:47:31+00:00
slug: exactly-what-is-alfresco
categories:
  - Tools
tags:
  - Alfresco
  - CMS
---

<ins datetime="2006-10-27T00:36:02+00:00">
  **Update:** Alfresco supports Web Content Management since [Alfresco 1.4.0](http://dev.alfresco.com/downloads/).
</ins>

A lot of people still misunderstand the purpose of [Alfresco](http://www.alfresco.org/). Alfresco is not yet a full WCM (Web Content Management) like [Joomla](http://www.joomla.org/) or [Drupal](http://drupal.org/), but an ECM (Enterprise Content Management).

Alfresco, at its core, is a general purpose content repository with content management services. It can be used to manage all your business documents and transform them in web-ready formats (HTML, PDF) and categorize them linking into overall site navigation and index pages. Alfresco can also be used to capture HTML pages using an included WYSIWYG editor.

All of this is easily configured by an end-user in the Alfresco web app and does not require a programmer. Because Alfresco is a standard JCR (Java Content Repository - basically a next generation CMS (Content Management System) that supports JSR170 Levels I and II), programmers can readily build web pages that call to Alfresco to retrieve content and render on a web page. To make this even easier for web developers building a web app that runs on multiple front-end load-balanced servers against a single database server with the content repository, Alfresco provides a web services interface. _Good just gets better._

There is an application surface, the web client, which at the moment is very document-centric. However, this will be changing this year, with WCM features arriving from about June onwards. There are features already there that people are using for managing content that is served to websites (e.g. transformations, content templates), but capabilities like site management are not there today.

<!--more-->

## Quick overview of Alfresco plans for WCM (Web Content Management)

Target:

* review release mid-summer
* release by end of year

Ten areas of functional enhancements we are actively investigating:

1. **Change set staging and in-context preview** Ability to add, edit, or delete multiple files and folders in sandboxed workspace and test those changes in a virtualized view of the entire website. Ability to integrate approved change sets into the main website and deploy for public consumption.
2. **XML data capture and transformation** Ability to access browser-based forms with configurable business logic to capture structured content and store as any arbitrary XML document. Ability to apply rules against capture XML to transform into any number of output format (multiple HTML page renditions, other XML formats, or PDF).
3. **Document publishing and transformation** Ability to publish documents from a collaboration space and promote PDF and HTML renditions to an internal or public-facing website. Ability to resync renditions upon document modification.
4. **Configurable editorial review processes** Ability to route web content through a configurable serial or read-only concurrent review process. Ability to route content for review and approval via HTML-formatted email messages (for reviewers unfamiliar with the Alfresco web client).
5. **Configurable metadata capture** Ability to capture arbitrary metadata on all published assets for purposes of run-time navigation, timed launch and expiration, search, entitlement, and personalization.
6. **Page components and component-based page assembly** Ability to create reusable web building blocks and repurpose across multiple pages and multiple sites (breadcrumbs, category browsers, navbars, indexes, teasers, etc.). Ability for web publishers to modify run-time behavior of components on a dynamic web page (which product to promote in a teaser, # of press releases highlighted in a list component, etc.).
7. **Site templating** Ability to templatize a website, including default directory structure, page templates, content forms, editorial review processes, deployment rules, and more. Ability for web content managers to create new websites based on existing site templating to quickly clone and publish a new website with minimal development and configuration.
8. **Site snapshoting and rollback** Site-level archival for purposes of rollback and recovery.
9. **Integrated deployment module** Ability to deploy approved sites, pages, and content to one or multiple front-end webservers. Includes support for timed launch and expiration and ability to deploy both static, generated HTML or XML to a run-time JCR for dynamic content delivery.
10. **Integrated run-time content delivery framework** Ability to host a run-time JCR outside the firewall with run-time generation of web pages.

In addition to the above, we are also looking to build a sample OOTB website (an information-orient internet website) that can be used OOTB or as a reference for people's own development efforts. This reference site will be packaged so that others can easily contribute additional templates and components so that other types of reference sites can be readily shared from Alfresco implementation to Alfresco implementation.

As noted, this is the preliminary targets that are under consideration right now. Alfresco wiki will be updated in the next coming week to reflect this information.

## Related Links

### Alfresco Wiki

* [Template Guide](http://wiki.alfresco.com/wiki/Template_Guide)
* [Data Dictionary Guide](http://wiki.alfresco.com/wiki/Data_Dictionary_Guide)
* [Security and Authentication](http://wiki.alfresco.com/wiki/Security_and_Authentication)
* [New Web Content Management Plan](http://wiki.alfresco.com/wiki/New_Web_Content_Management_Plan)
* [Collaborative Content Production](http://wiki.alfresco.com/wiki/Collaborative_Content_Production)
* [Versioned Directories](http://wiki.alfresco.com/wiki/Versioned_Directories)
* [Transparent Layers](http://wiki.alfresco.com/wiki/Transparent_Layers)

### Alfresco Forum

* [Web Content Management module availability](http://forums.alfresco.com/viewtopic.php?t=947)
* [Alresco functionality questions. Does it exist?](http://forums.alfresco.com/viewtopic.php?t=262)

### Other

* [What is Java Content Repository](http://www.onjava.com/pub/a/onjava/2006/10/04/what-is-java-content-repository.html)
