---
title: Run PHP on Google App Engine
date: 2009-12-14 15:24:44+00:00
slug: php-on-google-app-engine
categories:
  - Server-side programming
tags:
  - App Engine
  - Google
  - PHP
  - Quercus
---

> By adding Java to their App Engine, Google has opened the door for a whole slew of languages that have been implemented on the JVM, now including PHP via Quercus.

This weekend I decided to give it a try and deploy an old tutorial of mine - [PHP Tutorials](http://www.php-tutorials.info/) - on GAE.

I must admit that I was pleasantly surprised by how effortless it was. OK, it's a very rudimentary PHP application, the only PHP code used was to run the examples described on the code blocks and do some includes; nevertheless I didn't feel the need to change a single line of code.

<!--more-->

Also, deploying a Java application to GAE is simpler than a Python one. Not only because you have a very handy Eclipse plugin, but you will also find configuring the file `appengine-web.xml` a lot easier when compared to `app.yaml`.

All you need to do in order to deploy a PHP application, at least as simple as the one I've tried, is to follow these steps:

1. Install [Google Plugin for Eclipse](https://developers.google.com/eclipse/).

2. Create a Web Application Project in eclipse. The complete project directory looks like this:

    ```
    Guestbook/
      src/
        ...Java source code...
        META-INF/
          ...other configuration...
      war/
        ...JSPs, images, data files...
        WEB-INF/
          ...app configuration...
          lib/
            ...JARs for libraries...
          classes/
            ...compiled classes...
    ```

3. Copy all your PHP and static files to `your-project/war`.

4. Download [Quercus binary](http://quercus.caucho.com/) (WAR file).

5. Unzip it and copy all files inside `quercus.war/WEB-INF/lib` to `your-project/war/WEB-INF/lib`.

6. Edit your deployment descriptor file `web.xml`. Mine looks like this:

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns="http://java.sun.com/xml/ns/javaee" xmlns:web="http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
        xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
        version="2.5">
        <description>PHP Tutorial</description>

        <servlet>
            <servlet-name>Quercus Servlet</servlet-name>
            <servlet-class>com.caucho.quercus.servlet.GoogleQuercusServlet</servlet-class>
        </servlet>

        <servlet-mapping>
            <servlet-name>Quercus Servlet</servlet-name>
            <url-pattern>*.php</url-pattern>
        </servlet-mapping>

        <welcome-file-list>
            <welcome-file>index.php</welcome-file>
        </welcome-file-list>
    </web-app>
    ```

7. Edit your configuration file `appengine-web.xml`. Mine looks like this:

    ```xml
    <?xml version="1.0" encoding="utf-8"?>
    <appengine-web-app xmlns="http://appengine.google.com/ns/1.0">
      <application>php-tutorials</application>
      <version>1</version>

        <!-- Configure java.util.logging -->
        <system-properties>
            <property name="java.util.logging.config.file" value="WEB-INF/logging.properties" />
        </system-properties>

        <static-files>
            <include path="/**" expiration="600s" />
            <include path="/**.png" expiration="30d" />
            <include path="/**.jpg" expiration="30d" />
            <include path="/**.gif" expiration="30d" />
            <include path="/**.ico" expiration="30d" />
            <include path="/**.swf" expiration="30d" />
            <include path="/**.css" expiration="7d" />
            <include path="/**.js" expiration="2d 12h" />
            <exclude path="/**.php" />
            <exclude path="/**.inc" />
        </static-files>
        <resource-files>
            <include path="/**.php" />
            <include path="/**.inc" />
        </resource-files>
    </appengine-web-app>
    ```

The `application` element must match the application identifier of your application on Google App Engine.

Et voilà, you are done!

Now, run your application using the `Run As >> Web Application` command.

And finally, press the "Deploy App Engine Project" button to deploy to GAE.

<ins datetime="2010-11-01T17:09:19+00:00">
  **Update:** This article has been ported to the Miscellaneous section of my PHP Tutorial. Check [Run PHP on Google App Engine](http://www.php-tutorials.info/phpOnAppEngine.php) page for updates.
</ins>
