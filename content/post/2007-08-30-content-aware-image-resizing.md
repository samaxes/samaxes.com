---
title: Content Aware Image Resizing
date: 2007-08-30 01:48:09+00:00
slug: content-aware-image-resizing
categories:
  - Graphics
tags:
  - Seam Carving
---

[Dr. Ariel Shamir](http://www.faculty.idc.ac.il/arik/) and [Dr. Shai Avidan](http://www.faculty.idc.ac.il/avidan/) of the Efi Arazi School of Computer Science have presented at [SIGGRAPH 2007](http://www.siggraph.org/s2007/) the greater digital image effect I've seen.

"Seam carving" allows an image to be resized non-uniformly, so you can change the height to width ratio in the image without cropping.

> The algorithm looks for seams (not simple columns or rows) of pixels with the 'least energy' (least contrast / change in detail) both vertically and horizontally in the image and then uses this to enable resizing without losing important image content such as human subjects or other detail.

This technique can also be used to manually remove items from the image which are not wanted as well as protect items that absolutely need to be preserved.

{{< youtube vIFCV2spKtg >}}

Get the [Seam Carving for Content-Aware Image Resizing](http://www.faculty.idc.ac.il/arik/imret.pdf) from Dr. Ariel Shamir and Dr. Shai Avidan. [20 MB PDF - very slow downloading]
Alternate locations at [Corel Cache](http://www.faculty.idc.ac.il.nyud.net:8090/arik/imret.pdf) and [ACM](http://portal.acm.org/citation.cfm?id=1276377.1276390).
