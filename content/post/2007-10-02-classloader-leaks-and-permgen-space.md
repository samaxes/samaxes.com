---
title: Classloader leaks and PermGen space
date: 2007-10-02 15:27:02+00:00
slug: classloader-leaks-and-permgen-space
categories:
  - Server-side programming
tags:
  - Java
  - JVM
  - PermGen
---

After googling a bit for error "`java.lang.OutOfMemoryError: PermGen space`" I found many sites talking about that problem. Some tried [passing command line arguments to the JVM](http://my.opera.com/karmazilla/blog/2007/03/13/good-riddance-permgen-outofmemoryerror) or [changing the size of the PermGen space](http://my.opera.com/karmazilla/blog/2007/03/15/permgen-strikes-back), others end up [recommending using a VM from BEA or IBM](http://dertompson.com/2007/09/11/outofmemory-permgen-with-sun-jdk/), all without success.

But after a closer look at their comments I ended up at Frank Kieviet blog.
Frank explains [what really is a PermGen error](http://blogs.sun.com/fkieviet/entry/classloader_leaks_the_dreaded_java)

> ## The problem in a nutshell
>
> Application servers such as Glassfish allow you to write an application (.ear, .war, etc) and deploy this application with other applications on this application server. Should you feel the need to make a change to your application, you can simply make the change in your source code, compile the source, and redeploy the application without affecting the other still running applications in the application server: you don't need to restart the application server. This mechanism works fine on Glassfish and other application servers (e.g. Java CAPS Integration Server).
>
> The way that this works is that each application is loaded using its own Classloader. Simply put, a Classloader is a special class that loads `.class` files from jar files. When you undeploy the application, the Classloader is discarded and it and all the classes that it loaded, should be garbage collected sooner or later.
>
> Somehow, something may hold on to the Classloader however, and prevent it from being garbage collected. And that's what's causing the `java.lang.OutOfMemoryError: PermGen space` exception.
>
> ## PermGen space
>
> What is `PermGen space` anyways? The memory in the Virtual Machine is divided into a number of regions. One of these regions is `PermGen`. It's an area of memory that is used to (among other things) load class files. The size of this memory region is fixed, i.e. it does not change when the VM is running. You can specify the size of this region with a commandline switch: `-XX:MaxPermSize`. The default is 64 Mb on the Sun VMs.
>
> If there's a problem with garbage collecting classes and if you keep loading new classes, the VM will run out of space in that memory region, even if there's plenty of memory available on the heap. Setting the `-Xmx` parameter will not help: this parameter only specifies the size of the total heap and does not affect the size of the `PermGen` region.

... and how to [use new profiling tools in Java 6 to fix Classloader leaks](http://blogs.sun.com/fkieviet/entry/how_to_fix_the_dreaded).
Resuming, the steps are:

1. start your application server
2. deploy and run your application
3. undeploy the application that is leaking (just the application not the server)
4. trigger a memory dump `jmap -dump:format=b,file=leak <PID>`
5. run jhat (with modification, **Java SE SDK 6.0 update 1 has the updated code**) `jhat -J-Xmx512m leak`
6. go to jhat report http://localhost:7000/ (http://localhost:7000/oql/ if you need the **OQL** (Object Query Language))
7. find a leaked class (any class of your application since you shouldn't see any objects of the classes that you deployed)
8. locate the Classloader
9. find the "Reference chains from root set"
10. inspect the chains, locate the accidental reference, and fix the code

Some try even to go further on [finding Orphaned Classloaders](http://blogs.sun.com/edwardchou/entry/find_orphaned_classloaders) others try to [nicely present the leaking classes in a form of a HTML table histogram](http://blogs.sun.com/sundararajan/entry/jhat_s_javascript_interface).

These tools can really help, use them!

## Resources

* [Monitor and diagnose performance in Java SE 6](http://www.ibm.com/developerworks/java/library/j-java6perfmon/) from IBM developerWorks
* [The java.lang.OutOfMemoryError: PermGen Space error demystified](http://mediacast.sun.com/share/fkieviet/JavaOne07-BOF9982-PermGen.pdf) JavaOne07 presentation by Edward Chou and Frank Kieviet
* [Troubleshooting Guide for Java SE 6 with HotSpot VM](http://www.oracle.com/technetwork/java/javase/tsg-vm-149989.pdf) pdf version
