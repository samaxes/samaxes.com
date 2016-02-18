---
title: "Google Web Toolkit: AJAX applications in Java"
date: 2006-05-17 11:40:49+00:00
slug: google-web-toolkit-ajax-applications-in-java
categories:
  - Server-side
tags:
  - AJAX
  - GWT
  - Java
---

Google has released [Google Web Toolkit (GWT)](http://www.gwtproject.org/), a code generation framework that lets you code Ajax apps in pure Java.

> Google Web Toolkit (GWT) is a Java development framework that lets you escape the matrix of technologies that make writing AJAX applications so difficult and error prone. With GWT, you can develop and debug AJAX applications in the Java language using the Java development tools of your choice. When you deploy your application to production, the GWT compiler to translates your Java application to browser-compliant JavaScript and HTML.
>
> Here's the GWT development cycle:
>
> 1. Use your favorite Java IDE to write and debug an application in the Java language, using as many (or as few) GWT libraries as you find useful.
> 2. Use GWT's Java-to-JavaScript compiler to distill your application into a set of JavaScript and HTML files that you can serve with any web server.
> 3. Confirm that your application works in each browser that you want to support, which usually takes no additional work.

A widget like `tree` has methods to manipulate the structure (e.g. `addItem()`) and event handlers (e.g. `addFocusListener`). Here's how a [tree](http://www.gwtproject.org/javadoc/latest/com/google/gwt/user/client/ui/Tree.html) is created:

**CSS Style Rules**

```css
.gwt-Tree { the tree itself }
.gwt-Tree .gwt-TreeItem { a tree item }
.gwt-Tree .gwt-TreeItem-selected { a selected tree item }
```

**Example**

```java
public class TreeExample implements EntryPoint {

    public void onModuleLoad() {
        // Create a tree with a few items in it.
        TreeItem root = new TreeItem("root");
        root.addItem("item0");
        root.addItem("item1");
        root.addItem("item2");

        Tree t = new Tree();
        t.addItem(root);

        // Add it to the root panel.
        RootPanel.get().add(t);
    }
}
```
