---
title: Internationalization of the File Upload Form Field
date: 2009-01-27 11:36:51+00:00
slug: internationalization-of-the-file-upload-form-field
categories:
  - Web
tags:
  - HTML5
  - Internationalization
---

> _Internationalization_, or i18n, is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language. _Localization_ refers to the adaptation of a product, application or document content to meet the language, cultural and other requirements of a specific target market (a "locale").

Adapting application to various languages is for me, as a Java and HTML developer, more than a common task. Usually the solution involves a set of supported locales, which is very often different from the system locale and/or browser configuration. Majority of such cases are covered by the scenario when user chooses particular language settings and the only place where the locale setting can be stored is the HTTP Session.

Support for this behavior is now handled by majority of frameworks; nevertheless there is still one HTML element that you can't effectively change - the file upload form field.

<!--more-->

And that's not the only issue related to this element; it's nearly completely inaccessible to CSS manipulation, making it impossible to style it as other form input fields (luckily there are some workarounds available - [SWFUpload](http://swfupload.org/) or [Styling an input type="file"](http://www.quirksmode.org/dom/inputfile.html)).

To tackle the internationalization issues should be quite straightforward. However after discussion with the [WHAT Working Group](http://www.whatwg.org/) members (community focused on development of the HTML 5 specification) I've recognized [their concerns](http://lists.whatwg.org/pipermail/whatwg-whatwg.org/2008-November/017030.html) about the styling of the upload field, mainly in regards to the security and privacy.

Following this, [Ian Hickson](http://ian.hixie.ch/) - the editor and spokesman for the WHAT Working Group - came with the surprisingly easy suggestion how to address this problem. It seems like browsers should already handle this based on the lang="" attribute:

> It seems like browsers should do this already based on the lang="" attribute. I recommend asking browser vendors to implement this.

And therefore I would like to endorse vendors to implement at least this behavior.

This way if user chooses the locale `pt` in his profile but the browser is configured only to support English (`en`), the developer can get the locale from the user's HTTP Session and propagate it through the `lang` attribute (e.g. `lang="pt"`) of the file upload field and have the button caption matching users preferences.

I would highly appreciate feedback on this topic, especially from the browser vendors willing to implement this feature.
