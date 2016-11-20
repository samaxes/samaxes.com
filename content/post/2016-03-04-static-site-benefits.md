---
title: "Moving to a Static Website, part 4: Benefits"
date: 2016-03-04
slug: static-site-benefits
categories:
  - Web Development
tags:
  - Amazon
  - Hugo
  - Performance
  - Security
  - Speed
---

This is the last part of a four-part blog post covering my move from WordPress to Hugo, a static website generator. This post outlines some of the benefits from moving to a static website and to [Amazon AWS](https://aws.amazon.com/).

If you haven't read the first three parts, you may find them at [Moving to a Static Website, part 1: From WordPress to Hugo]({{< ref "post/2016-02-18-static-site-from-wordpress-to-hugo.md" >}}), [Moving to a Static Website, part 2: Hosting]({{< ref "post/2016-02-25-static-site-hosting.md" >}}) and [Moving to a Static Website, part 3: Automated deployment with Wercker]({{< ref "post/2016-02-29-static-site-automated-deployment.md" >}}).

<!--more-->
---

## Site speed

Speed is considered by many as the [#1 principle for successful web apps](http://carsonified.com/blog/business/fred-wilsons-10-golden-principles-of-successful-web-apps/).

The benefits from moving from [WordPress](https://wordpress.org/) to [Hugo](https://gohugo.io/) are evident:

<div>
{{< figure src="/img/static-site-benefits/pagespeed-insights-desktop-wordpress-digitalocean.png" link="/img/static-site-benefits/pagespeed-insights-desktop-wordpress-digitalocean.png" class="side-by-side" caption="PageSpeed Insights for the desktop with WordPress hosted on DigitalOcean." >}}
{{< figure src="/img/static-site-benefits/pagespeed-insights-desktop-hugo-amazon.png" link="/img/static-site-benefits/pagespeed-insights-desktop-hugo-amazon.png" class="side-by-side" caption="PageSpeed Insights for the desktop with Hugo hosted on Amazon AWS." >}}
</div>

<div>
{{< figure src="/img/static-site-benefits/pagespeed-insights-mobile-wordpress-digitalocean.png" link="/img/static-site-benefits/pagespeed-insights-mobile-wordpress-digitalocean.png" class="side-by-side" caption="PageSpeed Insights for the mobile with WordPress hosted on DigitalOcean." >}}
{{< figure src="/img/static-site-benefits/pagespeed-insights-mobile-hugo-amazon.png" link="/img/static-site-benefits/pagespeed-insights-mobile-hugo-amazon.png" class="side-by-side" caption="PageSpeed Insights the the mobile with Hugo hosted on Amazon AWS." >}}
</div>

<div>
{{< figure src="/img/static-site-benefits/webpagetest-wordpress-digitalocean.png" link="/img/static-site-benefits/webpagetest-wordpress-digitalocean.png" class="side-by-side" caption="Website's performance with WordPress hosted on DigitalOcean." >}}
{{< figure src="/img/static-site-benefits/webpagetest-hugo-amazon.png" link="/img/static-site-benefits/webpagetest-hugo-amazon.png" class="side-by-side" caption="Website's performance with Hugo hosted on Amazon AWS." >}}
</div>

## Latency

A content delivery network (CDN) is a collection of web servers distributed across multiple locations to deliver content more efficiently to users. The server selected for delivering content to a specific user is typically based on a measure of network proximity. For example, the server with the fewest network hops or the server with the quickest response time is chosen.

The following images illustrate the latency benefits from using [CloudFront](https://aws.amazon.com/cloudfront/) (Amazon's CDN):

<div>
{{< figure src="/img/static-site-benefits/ping-wordpress-digitalocean.png" link="/img/static-site-benefits/ping-wordpress-digitalocean.png" class="side-by-side" caption="Ping response time for a site hosted on DigitalOcean UK without a CDN." >}}
{{< figure src="/img/static-site-benefits/ping-hugo-amazon.png" link="/img/static-site-benefits/ping-hugo-amazon.png" class="side-by-side" caption="Ping response time for a site hosted on Amazon AWS using CloudFront CDN." >}}
</div>

## Security

A free benefit of moving to Amazon AWS is the ability to very easily generate SSL/TLS certificates to add support for HTTPS.

Currently, [ACM](https://aws.amazon.com/certificate-manager/) supports the RSA-2048 encryption and SHA-256 hashing algorithms which are considered secure by [SSL Server Test (from Qualys SSL Labs)](https://www.ssllabs.com/ssltest/):

<div>
{{< figure src="/img/static-site-benefits/ssl-test.png" link="/img/static-site-benefits/ssl-test.png" caption="Analysis of the configuration of the SSL/TLS web server." >}}
</div>
