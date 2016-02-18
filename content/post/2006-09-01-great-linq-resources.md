---
title: Great LINQ Resources
date: 2006-09-01 01:09:26+00:00
slug: great-linq-resources
categories:
  - Server-side
tags:
  - .NET
  - LINQ
---

Right now there are two extensions for .NET that I find very interesting.

The first one is [Language INtegrated Query (LINQ)](http://msdn.microsoft.com/data/ref/linq/) and the other one is the [Atlas Toolkit](http://www.asp.net/ajax).

For those looking for more information about LINQ, visit [LINQ Project Overview at MSDN](http://msdn.microsoft.com/library/en-us/dndotnet/html/linqprojectovw.asp), and [Scott Guthrie's last post](http://weblogs.asp.net/scottgu/archive/2006/08/27/Slides-_2B00_-Samples-Posted-from-my-TechEd-LINQ-Talk.aspx) where he shares the code samples and slides from his TechEd LINQ Talk in Australia.

<!--more-->

LINQ's benefits

> LINQ's benefits include, most significantly, a standardised way to query not just tables in a relational database but also text files, XML files, and other data sources using identical syntax. A second benefit is the ability to use this standardised method from any .NET-compliant language such as C#, VB.NET, and others.

LINQ in action

> The following snippet illustrates (in C#) a simple LINQ code block, using the Northwind database as its target. To see LINQ at work, we'll use a simple C# 3.0 program that uses the standard query operators to process the contents of an array.
>
> ```cs
> using System;
> using System.Query;
> using System.Collections.Generic;
>
> class app {
>   static void Main() {
>     string[] names = { "Alpha", "Brian", "Connie", "David",
>                        "Frank", "George",
>                        "Harry", "Inigo" };
>
>     IEnumerable<string> expr = from s in names
>                                where s.Length == 5
>                                orderby s
>                                select s.ToUpper();
>
>     foreach (string item in expr)
>         Console.WriteLine(item);
>   }
> }
> ```
>
> This program delivers this output:
>
> ALPHA  
> BRIAN  
> DAVID  
> FRANK  
> HARRY  
> INIGO
