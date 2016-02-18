---
title: Database Connection Pooling with Tomcat
date: 2006-04-20 09:37:41+00:00
slug: database-connection-pooling-with-tomcat
categories:
  - Server-side
tags:
  - Java
  - Tomcat
---

You know how to open and use database connections for each user, but what about optimizing for many concurrent users?

Rather than creating and destroying connections over and over again, established practice calls for use of a pool of connections that can be reused.

Kunal Jaggi shows how to implement this strategy in Tomcat and how to stress test the app with [JMeter](http://jakarta.apache.org/jmeter/), an open source tool for load testing with a drag-and-drop-style GUI.

Read the full article at [ONJava](http://www.onjava.com/pub/a/onjava/2006/04/19/database-connection-pooling-with-tomcat.html).
