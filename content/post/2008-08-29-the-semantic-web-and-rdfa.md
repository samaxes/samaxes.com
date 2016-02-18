---
title: The Semantic Web and RDFa
date: 2008-08-29 15:10:18+00:00
slug: the-semantic-web-and-rdfa
categories:
  - Web
tags:
  - HTML5
  - RDFa
  - Semantic Web
---

There is a lot of momentum around [Semantic Web](http://www.w3.org/2001/sw/) and [RDFa](http://rdfa.info/wiki/).
This may be caused by the big milestone reached for RDFa, a Candidate Recommendation of [RDFa in XHTML: Syntax and Processing](http://www.w3.org/TR/2008/CR-rdfa-syntax-20080620/).

Recently, [several discussion threads](http://lists.whatwg.org/pipermail/whatwg-whatwg.org/2008-August/thread.html) have been started on the [WHATWG](http://www.whatwg.org/) mailing list around the effort of integrating RDFa into the [HTML5](http://www.w3.org/TR/html5/) specification as [XHTML1.1](http://www.w3.org/TR/xhtml11/) and [XHTML2](http://www.w3.org/TR/xhtml2/) that will have it integrated.

While I was pretty aware of the [Microformats activity](http://microformats.org/), I can't say the same about RDFa. But [Manu Sporny](http://blog.digitalbazaar.com/) makes it a lot easier. In fact, this is by far the most comprehensive explanation of RDFa that I have ever seen.

<!--more-->

For those who have no idea what problem RDFa is trying to solve:

> [...], this is not an official response from the RDF in XHTML Task Force or the Semantic Web Deployment Workgroup. It  is a personal attempt to outline some of the problems that RDFa is addressing.
>
> Web browsers currently do not understand the meaning behind human statements or concepts on a web page. While this may seem academic, it has direct implications on website usability. If web browsers could understand that a particular page was describing a piece of music, a movie, an event, a person or a product, the browser could then help the user find more information about the particular item in question. It would help automate the browsing experience. Not only would the browsing experience be improved, but search engine indexing quality would be better due to a spider's ability to understand the data on the page with more accuracy.
>
> Currently, browsing is a very manual process, requiring a user to find information about a particular subject and then copy-paste that information from one page into another search page to explore information about the subject. If we are to automate the browsing experience and deliver a more usable web experience, we must provide a mechanism for describing, detecting and processing semantics. If we are to improve the search and indexing accuracy of web spiders, we must provide a mechanism to describe, detect and process semantics.
>
> Here's a really short intro video on why semantics are important (I'm sure you already know all this stuff, but it outlines why online communities are concerned about semantics and is meant to educate those that aren't familiar with the concept of web semantics):
>
> [http://www.youtube.com/watch?v=OGg8A2zfWKg](http://www.youtube.com/watch?v=OGg8A2zfWKg)
>
> The Microformats community has done a remarkable job of working on the web semantics problem, creating several different methods of expressing common human concepts (contact information (hCard), events (hCalendar), and audio recordings (hAudio)). The method employed by the Microformats community to embed semantics in web pages, using pre-existing HTML4 tags and re-purposing them, was taken because none of the standards bodies were effectively tackling the problem of embedded web semantics at the time. In short, the community did the best that they could with what was available to them at the time.
>
> The results of the first set of Microformats efforts were some pretty cool applications, like the following one demonstrating how a web browser could forward event information from your PC web browser to your phone via Bluetooth:
>
> [http://www.youtube.com/watch?v=azoNnLoJi-4](http://www.youtube.com/watch?v=azoNnLoJi-4)
>
> Here is another demonstration of how one could use music metadata embedded in a web page to find more information about your favorite band:
>
> [http://www.youtube.com/watch?v=oPWNgZ4peuI](http://www.youtube.com/watch?v=oPWNgZ4peuI)
>
> or how one could use movie metadata on a web page to find more information about a movie:
>
> [http://www.youtube.com/watch?v=PVGD9HQloDI](http://www.youtube.com/watch?v=PVGD9HQloDI)
>
> The Mozilla Labs Aurora demos also show that semantic web markup is necessary in order to execute upon some of the ideas demonstrated in their future browsers project:
>
> Aurora - Part 1 - Collaboration, History, Data Objects, Basic Navigation
>
> [http://www.vimeo.com/1450211](http://www.vimeo.com/1450211)
>
> Aurora - Part 2 - Geo-location-based browsing
>
> [http://www.vimeo.com/1476338](http://www.vimeo.com/1476338)
>
> Aurora - Part 3 - Integrating Web w/ Physical Environment
>
> [http://www.vimeo.com/1481810](http://www.vimeo.com/1481810)
>
> Aurora - Part 4 - Personal Data Portability
>
> [http://www.vimeo.com/1488633](http://www.vimeo.com/1488633)
>
> Both RDFa and Microformats enable these user interaction scenarios and make browsing the web a richer experience.
>
> If one understands web semantics to be an important part of the web's future, the question then becomes, why RDFa? Why not Microformats?
>
> While there are a number of technical merits that speak in favor of RDFa over Microformats (fully qualified vocabulary terms, prefix short-hand via CURIEs, accessibility-friendly, unified processing rules, etc.), this issue really boils down to one of centralized innovation vs. distributed innovation.
>
> The Microformats community, and all communities like it, require a group of people to come together, collaborate and create a standard vocabulary to express ALL semantics. A somewhat strained analogy would be bringing in representatives from all of the cultures of the world and having them agree on a universal vocabulary. It is an untenable prospect, there is too much diversity in the world to agree on one master vocabulary. This is, however, the approach that Microformats has taken, for better or worse.
>
> When you do not scope vocabularies, like the Microformats community has chosen to do, you force new vocabulary development through a design bottleneck. This isn't a theoretical bottleneck, it is one that we deal with each day in the Microformats community.
>
> The RDFa approach is to remove this vocabulary development bottleneck by addressing the problem of creating a method of semantics expression. The web has always relied on distributed innovation and RDFa allows that sort of innovation to continue by solving the tenable problem of a semantics expression mechanism. Microformats has no such general purpose solution.
>
> In short, RDFa addresses the problem of a lack of a standardized semantics expression mechanism in HTML family languages. RDFa not only enables the use cases described in the videos listed above, but all use cases that struggle with enabling web browsers and web spiders understand the context of the current page.
>
> -- manu

For those of you that are not familiar with how RDF and RDFa work, atke a loog at RDFa Basics:

{{< youtube ldl0m-5zLz4 >}}
