---
title: JBoss AS 5.0 is out!
date: 2008-12-05 16:18:50+00:00
slug: jboss-as-50-is-out
categories:
  - Server-side
tags:
  - Java
  - JBoss
---

JBoss announced the GA release of JBoss AS 5.0.

> JBoss 5 is the next generation of the JBoss Application Server build on top of the new JBoss Microcontainer. The JBoss Microcontainer is a lightweight container for managing POJOs, their deployment, configuration and lifecycle. It is a standalone project that replaces the famous JBoss JMX Microkernel of the 3.x and 4.x JBoss series. The Microcontainer integrates nicely with the JBoss framework for Aspect Oriented Programming, JBoss AOP. Support for JMX in JBoss 5 remains strong and MBean services written against the old Microkernel are expected to work.
>
> JBoss5 is designed around the advanced concept of a Virtual Deployment Framework (VDF), that takes the aspect oriented design of many of the earlier JBoss containers and applies it to the deployment layer. Aspectized Deployers operate in a chain over a Virtual File System (VFS), analyze deployments and produce metadata to be used by the JBoss Microcontainer, which in turn instantiates and wires together the various pieces of a deployment, controlling their lifecycle and dependencies.

See the full [release notes](http://sourceforge.net/project/shownotes.php?release_id=645033&group_id=22866) and [downloads page](http://www.jboss.org/jbossas/downloads/).

And good luck to get your J2EE applications working with this new version.
