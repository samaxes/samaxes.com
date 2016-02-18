---
title: Picking an open source license
date: 2006-06-17 23:23:06+00:00
slug: picking-an-open-source-license
categories:
  - General
tags:
  - Open Source
---

In [HOWTO: Pick an open source license (part one)](http://www.zdnet.com/blog/burnette/howto-pick-an-open-source-license-part-1/130), Ed Burnette gives us a simple step-by-step approach for choosing an open source license.
It covers such concerns as: control over usage, use in closed-source environments, reciprocal code contributions, and monetary concerns.

Here is a resume of what you can find in the article:

* Do you want to relinquish any control over how your code is used and distributed?
  * NO: <del datetime="2006-06-30T23:57:15+00:00">put it in public domain and you're done, don't copyright it, and don't license it</del> <ins datetime="2006-06-30T23:57:15+00:00">"public domain" is is not a good choice because in many jurisdictions you can't give up your copyright. Use a liberal license like MIT/BSD instead</ins>.
  * YES: Copyright it, and ask: Do you want to allow people to use your code in non open-source programs?
    * NO: release it under the GPL.
    * YES: If somebody uses your code in their program and sells their program for money, do you want some of that money?
      * YES: Dual-license (Examples: MySQL, JBoss) or use a closed-source license.
      * NO: Use a "commercial-friendly" license, and ask: If somebody uses your code and improves it (fixes bugs or adds features) do you want to make them give you the improvements back so you can use them too?
        * YES: Use a reciprocal license (Examples: Eclipse (EPL), Solaris (CDDL), Firefox (MPL)).
        * NO: Use a non-reciprocal license (Example: FreeBSD (BSD)).

**Update:** [HOWTO: Pick an open source license (part two)](http://www.zdnet.com/blog/burnette/how-to-pick-an-open-source-license-part-2/131) is now available.
