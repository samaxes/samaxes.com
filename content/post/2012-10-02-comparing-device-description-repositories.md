---
title: Comparing Device Description Repositories
date: 2012-10-02 13:41:58+00:00
slug: comparing-device-description-repositories
categories:
  - Mobile
tags:
  - Java
  - DDR
---

Web content delivered to mobile devices can benefit from being tailored to take into account a range of factors such as screen size, markup language support and image format support. Such information is stored in "Device Description Repositories" (DDRs).

Until recently [WURFL](http://wurfl.sourceforge.net/) was the de facto DDR standard for mobile capabilities, but its license changed to [AGPL (Affero GPL) v3](http://www.gnu.org/licenses/agpl-3.0.html), meaning it is not free to be used commercially anymore. Consequently some free open source alternatives to WURFL have recently started to show up and are improving quickly.

[OpenDDR](http://www.openddr.org/) and [51Degrees.mobi](http://51degrees.mobi) are candidate substitutes to WURFL that also provide an API to access DDRs.

These tools ease and promote the development of Web content that adapts to its delivery context. This post summarizes the installation and configuration of these tools and analyzes how they compare in terms of image adaptation.

<!--more-->

The source code used for this post is available on [GitHub](https://github.com/samaxes/ddr-compare).

## Build configuration

This section describes how to add the dependencies to a Maven project.

### WURFL

WURFL is really straightforward since it is available on Maven central repository. All you have to do is to include the dependency on your project:

```xml
<dependency>
    <groupId>net.sourceforge.wurfl</groupId>
    <artifactId>wurfl</artifactId>
    <version>1.2.2</version><!-- the latest free version -->
</dependency>
```

### 51Degrees.mobi

51Degrees.mobi configuration is very similar to WURFL. Just add the dependency to your project's `pom.xml` file:

```xml
<dependency>
    <groupId>net.sourceforge.fiftyone-java</groupId>
    <artifactId>51Degrees.mobi.detection.core</artifactId>
    <version>2.2.9.1</version>
</dependency>
```

### OpenDDR

OpenDDR is a bit harder to configure. Follow these steps to include OpenDDR in your project:

1. Download [OpenDDR-Simple-API](https://github.com/OpenDDRdotORG/OpenDDR-Java/wiki/Download) zip package and unzip it.

2. From the resulting folder, install `bin/OpenDDR-Simple-API-1.0.0.24.jar` and `lib/DDR-Simple-API.jar` into your local Maven repository:

    ```bash
    $ mvn install:install-file -DgroupId=org.w3c.ddr.simple -DartifactId=DDR-Simple-API -Dversion=2008-03-30 -Dpackaging=jar -Dfile=DDR-Simple-API.jar -DgeneratePom=true -DcreateChecksum=true
    $ mvn install:install-file -DgroupId=org.openddr.simpleapi.oddr -DartifactId=OpenDDR-Simple-API -Dversion=1.0.0.24 -Dpackaging=jar -Dfile=OpenDDR-Simple-API-1.0.0.24.jar -DgeneratePom=true -DcreateChecksum=true
    ```

3. Add the dependencies to your project `pom.xml` file:

    ```xml
    <dependency>
        <groupId>org.w3c.ddr.simple</groupId>
        <artifactId>DDR-Simple-API</artifactId>
        <version>2008-03-30</version>
    </dependency>
    <dependency>
        <groupId>org.openddr.simpleapi.oddr</groupId>
        <artifactId>OpenDDR-Simple-API</artifactId>
        <version>1.0.0.24</version>
    </dependency>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-jexl</artifactId>
        <version>2.1.1</version>
    </dependency>
    <dependency>
        <groupId>commons-lang</groupId>
        <artifactId>commons-lang</artifactId>
        <version>2.6</version>
    </dependency>
    ```

## Loading repository/capabilities file

This section describes how to load repository files and import them into your project.

### WURFL

Copy [wurfl-2.1.1.xml.gz](https://github.com/samaxes/ddr-compare/blob/master/src/main/resources/wurfl/wurfl-2.1.1.xml.gz?raw=true) file (the latest free version) into your project `src/main/resources` folder and import it using:

```java
WURFLHolder wurflHolder = new CustomWURFLHolder(getClass().getResource("/wurfl-2.1.1.xml.gz").toString());
```

### 51Degrees.mobi

51Degrees.mobi does not use a separate repository file.

### OpenDDR

Copy `oddr.properties` from the OpenDDR-Simple-API `src` folder and all files inside OpenDDR-Simple-API `resources` folder into your project `src/main/resources` folder. Import them using:

```java
Service identificationService = null;
try {
    Properties initializationProperties = new Properties();
    initializationProperties.load(getClass().getResourceAsStream("/oddr.properties"));
    identificationService = ServiceFactory
            .newService("org.openddr.simpleapi.oddr.ODDRService",
                    initializationProperties.getProperty(ODDRService.ODDR_VOCABULARY_IRI),
                    initializationProperties);
} catch (IOException e) {
    LOGGER.error(e.getMessage(), e);
} catch (InitializationException e) {
    LOGGER.error(e.getMessage(), e);
} catch (NameException e) {
    LOGGER.error(e.getMessage(), e);
}
```

## Using the API

This section describes how use WURFL and OpenDDR Java APIs to access the device capabilities.

### WURFL

WURFL API is very easy to use and has the greatest advantage of providing a powerful fallback hierarchy, inferring capabilities for devices not yet in its repository file.

```java
Device device = wurflHolder.getWURFLManager().getDeviceForRequest(getContext().getRequest());
int resolutionWidth = Integer.valueOf(device.getCapability("resolution_width"));
int resolutionHeight = Integer.valueOf(device.getCapability("resolution_height"));
```

There's no need to validate `device.getCapability("resolution_width")` against `null` value when no data is available.

### 51Degrees.mobi

Similarly to OpenDDR, 51Degrees.mobi does not provide a fallback hierarchy. The developer must always validate each property value.

```java
// Create a Provider object
Provider provider = Reader.create();

// Read in a User Agent String
BaseDeviceInfo deviceInfo = provider.getDeviceInfo(request.getHeader("User-Agent"));

// Get the value of a property
Integer screenPixelsWidth = 320; // Default value
Integer screenPixelsHeight = 480; // Default value
try {
    screenPixelsWidth = Integer.valueOf(deviceInfo.getFirstPropertyValue("ScreenPixelsWidth"));
} catch (NumberFormatException e) {
}
try {
    screenPixelsHeight = Integer.valueOf(deviceInfo.getFirstPropertyValue("ScreenPixelsHeight"));
} catch (NumberFormatException e) {
}
```

### OpenDDR

OpenDDR API is very cumbersome. It does not have a fallback hierarchy, instead it assumes 800px as the default value for `displayWidth` and 600px as the default value for `displayHeight`.

```java
PropertyRef displayWidthRef;
PropertyRef displayHeightRef;

try {
    displayWidthRef = identificationService.newPropertyRef("displayWidth");
    displayHeightRef = identificationService.newPropertyRef("displayHeight");
} catch (NameException e) {
    throw new RuntimeException(e);
}

PropertyRef[] propertyRefs = new PropertyRef[] { displayWidthRef, displayHeightRef };
Evidence evidence = new ODDRHTTPEvidence();
evidence.put("User-Agent", getContext().getRequest().getHeader("User-Agent"));

int displayWidth = 320; // Default value
int displayHeight = 480; // Default value
try {
    PropertyValues propertyValues = identificationService.getPropertyValues(evidence, propertyRefs);
    PropertyValue displayWidthProperty = propertyValues.getValue(displayWidthRef);
    PropertyValue displayHeightProperty = propertyValues.getValue(displayHeightRef);

    if (displayWidthProperty.exists()) { // Don't really need to validate. Returns 800 as the default value.
        displayWidth= displayWidthProperty.getInteger();
    }
    if (displayHeightProperty .exists()) { // Don't really need to validate. Returns 600 as the default value.
        displayHeight = displayHeightProperty.getInteger();
    }
} catch (NameException e) {
    throw new RuntimeException(e);
} catch (ValueException e) {
    throw new RuntimeException(e);
}
```

## Results

The following table shows the results of the tests run against an application for server-side image adaptation. The tests were performed on real physical devices.

Feel free to run the tests for yourself using the source code available on [GitHub](https://github.com/samaxes/ddr-compare).

<table>
  <tr>
    <th>Platform</th>
    <th>Device</th>
    <th>Property</th>
    <th>WURFL <code>max_image_width</code><sup>(1)</sup> / <code>max_image_height</code></th>
    <th>WURFL <code>resolution_width</code> / <code>resolution_height</code></th>
    <th>51Degrees.mobi <code>ScreenPixelsWidth</code> / <code>ScreenPixelsHeight</code></th>
    <th>OpenDDR <code>displayWidth</code> / <code>displayHeight</code></th>
  </tr>
  <tr>
    <th rowspan="2">Windows</th>
    <th rowspan="2">Firefox desktop</th>
    <th>width</th>
    <td>600</td>
    <td>640</td>
    <td><em>Unknown</em></td>
    <td>800</td>
  </tr>
  <tr>
    <th>height</th>
    <td>600</td>
    <td>480</td>
    <td><em>Unknown</em></td>
    <td>600</td>
  </tr>
  <tr>
    <th rowspan="2">iOS</th>
    <th rowspan="2">iPhone 4S</th>
    <th>width</th>
    <td>320</td>
    <td>320</td>
    <td>320</td>
    <td>320</td>
  </tr>
  <tr>
    <th>height</th>
    <td>480</td>
    <td>480</td>
    <td>480</td>
    <td>480</td>
  </tr>
  <tr>
    <th rowspan="6">Android</th>
    <th rowspan="2">Samsung Galaxy S II</th>
    <th>width</th>
    <td>240</td>
    <td>240</td>
    <td class="best">480</td>
    <td class="best">480</td>
  </tr>
  <tr>
    <th>height</th>
    <td>320</td>
    <td>320</td>
    <td class="best">800</td>
    <td class="best">800</td>
  </tr>
  <tr>
    <th rowspan="2">HTC One V</th>
    <th>width</th>
    <td>600</td>
    <td>640</td>
    <td class="best">480</td>
    <td class="best">480</td>
  </tr>
  <tr>
    <th>height</th>
    <td>600</td>
    <td>480</td>
    <td class="best">800</td>
    <td class="best">800</td>
  </tr>
  <tr>
    <th rowspan="2">HTC Hero</th>
    <th>width</th>
    <td class="best">300</td>
    <td>320</td>
    <td>320</td>
    <td>320</td>
  </tr>
  <tr>
    <th>height</th>
    <td class="best">460</td>
    <td>480</td>
    <td>480</td>
    <td>480</td>
  </tr>
  <tr>
    <th rowspan="2">Windows Phone 7.5</th>
    <th rowspan="2">Nokia Lumia 710</th>
    <th>width</th>
    <td>600</td>
    <td>640</td>
    <td class="best">480</td>
    <td class="best">480</td>
  </tr>
  <tr>
    <th>height</th>
    <td>600</td>
    <td>480</td>
    <td class="best">800</td>
    <td class="best">800</td>
  </tr>
  <tr>
    <th rowspan="2">BlackBerry</th>
    <th rowspan="2">BlackBerry Bold 9900</th>
    <th>width</th>
    <td>228</td>
    <td>480</td>
    <td class="best">640</td>
    <td class="best">640</td>
  </tr>
  <tr>
    <th>height</th>
    <td>280</td>
    <td>640</td>
    <td class="best">480</td>
    <td class="best">480</td>
  </tr>
  <tr>
    <th rowspan="4">Symbian S60</th>
    <th rowspan="2">Nokia E52 (Webkit)</th>
    <th>width</th>
    <td class="best">234</td>
    <td>240</td>
    <td>240</td>
    <td>240</td>
  </tr>
  <tr>
    <th>height</th>
    <td class="best">280</td>
    <td>320</td>
    <td>320</td>
    <td>320</td>
  </tr>
  <tr>
    <th rowspan="2">Nokia E52 (Opera Mobile)</th>
    <th>width</th>
    <td class="best">240</td>
    <td>240</td>
    <td><em>Unknown</em></td>
    <td class="worse">800</td>
  </tr>
  <tr>
    <th>height</th>
    <td class="best">280</td>
    <td>320</td>
    <td><em>Unknown</em></td>
    <td class="worse">600</td>
  </tr>
  <tr>
    <th rowspan="2">Bada 2.0</th>
    <th rowspan="2">Samsung Wave 3</th>
    <th>width</th>
    <td>600</td>
    <td>640</td>
    <td class="best">480</td>
    <td class="best">480</td>
  </tr>
  <tr>
    <th>height</th>
    <td>600</td>
    <td>480</td>
    <td class="best">800</td>
    <td class="best">800</td>
  </tr>
  <tr>
    <th rowspan="2">Windows Mobile 6.1</th>
    <th rowspan="2">HTC Touch HD T8282</th>
    <th>width</th>
    <td class="best">440</td>
    <td>480</td>
    <td>480</td>
    <td>480</td>
  </tr>
  <tr>
    <th>height</th>
    <td class="best">700</td>
    <td>800</td>
    <td>800</td>
    <td>800</td>
  </tr>
</table>

<sup>(1)</sup> `max_image_width` capability is very handy:

> Width of the images viewable (usable) width expressed in pixels. This capability refers to the image when used in "mobile mode", i.e. when the page is served as XHTML MP, or it uses meta-tags such as "viewport", "handheldfriendly", "mobileoptimised" to disable "web rendering" and force a mobile user-experience.

## Pros and Cons

<table>
  <tr>
    <th>&nbsp;</th>
    <th>Pros</th>
    <th>Cons</th>
  </tr>
  <tr>
    <th>WURFL</th>
    <td>
      <ul>
        <li>Upgradable to newer versions by only replacing its database file.</li>
        <li>A Device Hierarchy that yields a high-chance that the value of capabilities is inferred correctly even when the device is not yet recognized.</li>
        <li>Lots and lots of <a href="http://wurfl.sourceforge.net/help_doc.php" title="WURFL Devices and WURFL Capabilities" target="\_blank">capabilities</a>.</li>
        <li>Very easy to configure.</li>
        <li>Clean API.</li>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="http://www.scientiamobile.com/pricing" title="WURFL Pricing and Licensing" target="\_blank">Pricing and Licensing</a>.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>51Degrees.mobi</th>
    <td>
      <ul>
        <li>Has a <a href="http://51degrees.mobi/Products/DeviceData.aspx" title="51Degrees Feature Comparison" target="\_blank">Lite</a> version licensed under the Mozilla Public Licence, free to use, even commercially.</li>
        <li>Easier to install and configure than OpenDDR.</li>
        <li>Decent <a href="http://51degrees.mobi/Products/DeviceData/PropertyDictionary.aspx" title="51Degrees.mobi Property Dictionary" target="\_blank">list of capabilities</a>.</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Even though the list of capabilities is better than OpenDDR's it still cannot compete with WURFL's.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <th>OpenDDR</th>
    <td>
      <ul>
        <li>Free to use, even commercially.</li>
        <li>Growing community.</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Limited capabilities. OpenDDR seems to be limited to <a href="http://www.w3.org/TR/ddr-core-vocabulary/" title="Device Description Repository Core Vocabulary" target="\_blank">W3C DDR Core Vocabulary</a>.</li>
        <li>Returns 800 for <code>displayWidth</code> and 600 for <code>displayHeight</code> when the User-Agent does not exist in its database. It should let the developer choose which values result better for each particular application.</li>
      </ul>
    </td>
  </tr>
</table>

Let me stress how advantageous is to be able to upgrade WURFL by just replacing its XML database file. For the changes to take effect, there is no need to restart the application server or change the application source code. WURFL is also the only one supporting [Opera Mobile](http://www.opera.com/mobile) browser.

## Ending note

Keep in mind that while OpenDDR and 51Degrees.mobi test results may improve over time as I update the tests to use newer versions of them, WURFL will not be updated due to its new restrictive license. However, if a DDR solution is crucial to your business, you should really consider new versions of WURFL. It has improved a lot since the version used in this post making it is probably the best DDR money can buy.
