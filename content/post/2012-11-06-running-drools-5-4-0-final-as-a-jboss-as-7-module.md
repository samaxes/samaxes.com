---
title: Running Drools 5.4.0 Final as a JBoss AS 7 module
date: 2012-11-06 14:50:22+00:00
slug: running-drools-5-4-0-final-as-a-jboss-as-7-module
categories:
  - Server-side programming
tags:
  - Drools
  - Java
  - JBoss
---

> Drools 5 introduces the Business Logic integration Platform which provides a unified and integrated platform for Rules, Workflow and Event Processing. It's been designed from the ground up so that each aspect is a first class citizen, with no compromises.

Drools 5 has splitted up into 4 main sub projects:

* Drools Guvnor (BRMS/BPMS)
* Drools Expert (rule engine)
* Drools Flow (process/workflow)
* Drools Fusion (cep/temporal reasoning)

In this example we will focus on how we can use Drools Expert inside JBoss Application Server 7.

<!--more-->

1. We are using JBoss AS 7.1.1.Final which can be downloaded from the following link: [http://www.jboss.org/jbossas/downloads](http://www.jboss.org/jbossas/downloads).

2. Download Drools 5.4.0.Final from the following link: [http://www.jboss.org/drools/downloads](http://www.jboss.org/drools/downloads).

3. Extract the downloaded Drools `drools-distribution-5.4.0.Final.zip` (87.7 MB).

4. Create a directory with the name `org/drools/main` inside the JBoss AS7 modules directory `jboss-as-7.1.1.Final/modules`.

5. Copy all the binaries (JAR) files from `drools-distribution-5.4.0.Final/binaries` and paste them inside the `jboss-as-7.1.1.Final/modules/org/drools/main`.

6. Create a file `module.xml` inside `jboss-as-7.1.1.Final/modules/org/drools/main` as the following:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <module xmlns="urn:jboss:module:1.1" name="org.drools">
      <resources>
        <resource-root path="antlr-2.7.7.jar"/>
        <resource-root path="antlr-3.3.jar"/>
        <resource-root path="antlr-runtime-3.3.jar"/>
        <resource-root path="bcmail-jdk14-138.jar"/>
        <resource-root path="bcprov-jdk14-138.jar"/>
        <resource-root path="dom4j-1.6.1.jar"/>
        <resource-root path="drools-clips-5.4.0.Final.jar"/>
        <resource-root path="drools-compiler-5.4.0.Final.jar"/>
        <resource-root path="drools-core-5.4.0.Final.jar"/>
        <resource-root path="drools-decisiontables-5.4.0.Final.jar"/>
        <resource-root path="droolsjbpm-introduction-docs-5.4.0.Final.jdocbook"/>
        <resource-root path="drools-jsr94-5.4.0.Final.jar"/>
        <resource-root path="drools-persistence-jpa-5.4.0.Final.jar"/>
        <resource-root path="drools-templates-5.4.0.Final.jar"/>
        <resource-root path="drools-verifier-5.4.0.Final.jar"/>
        <resource-root path="ecj-3.5.1.jar"/>
        <resource-root path="guava-r06.jar"/>
        <resource-root path="hibernate-jpa-2.0-api-1.0.1.Final.jar"/>
        <resource-root path="itext-2.1.2.jar"/>
        <resource-root path="javassist-3.14.0-GA.jar"/>
        <resource-root path="jsr94-1.1.jar"/>
        <resource-root path="jta-1.1.jar"/>
        <resource-root path="jxl-2.6.10.jar"/>
        <resource-root path="knowledge-api-5.4.0.Final.jar"/>
        <resource-root path="knowledge-internal-api-5.4.0.Final.jar"/>
        <resource-root path="log4j-1.2.14.jar"/>
        <resource-root path="mvel2-2.1.0.drools16.jar"/>
        <resource-root path="protobuf-java-2.4.1.jar"/>
        <resource-root path="slf4j-api-1.6.4.jar"/>
        <resource-root path="stringtemplate-3.2.1.jar"/>
        <resource-root path="xml-apis-1.3.04.jar"/>
        <resource-root path="xmlpull-1.1.3.1.jar"/>
        <resource-root path="xpp3_min-1.1.4c.jar"/>
        <resource-root path="xstream-1.4.1.jar"/>
      </resources>
      <dependencies>
        <module name="javax.api"/>
        <module name="javax.transaction.api"/>
        <module name="javax.persistence.api"/>
        <module name="org.hibernate"/>
      </dependencies>
    </module>
    ```

7. Make sure that your WAR file has the right dependencies defined. You can use `META-INF/MANIFEST.MF` as the following:

    ```java
    Dependencies: org.drools
    ```

    Or `META-INF/jboss-deployment-structure.xml` if you prefer:

    ```xml
    <jboss-deployment-structure xmlns="urn:jboss:deployment-structure:1.0">
        <deployment>
            <dependencies>
                <module name="org.drools" />
            </dependencies>
        </deployment>
    </jboss-deployment-structure>
    ```

    Where `org.drools` is the name of the module which we created in previous steps.
