---
title: Maven 2 Cobertura Plugin - Updated
date: 2010-04-14 16:10:12+00:00
slug: maven-2-cobertura-plugin-updated
categories:
  - Tools
tags:
  - Build
  - Java
  - Maven
  - Testing
---

My previous [Maven 2 Cobertura Plugin]({{< ref "post/2007-06-23-maven-2-cobertura-plugin.md" >}}) article gives a workaround for the very buggy version 2.1 of the [Cobertura Maven Plugin](http://mojo.codehaus.org/cobertura-maven-plugin/).

This bug is fixed on versions 2.2 or higher, and consequently, that workaround does not work anymore.

<!--more-->

For those reading my previous article and having difficulties configuring the plugin, this is my actual configuration:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>2.5</version>
            <configuration>
                <systemPropertyVariables>
                    <net.sourceforge.cobertura.datafile>target/cobertura/cobertura.ser</net.sourceforge.cobertura.datafile>
                </systemPropertyVariables>
                <!-- for JDK6 Support -->
                <argLine>-Dsun.lang.ClassLoader.allowArraySyntax=true</argLine>
            </configuration>
        </plugin>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>cobertura-maven-plugin</artifactId>
            <version>2.3</version>
            <configuration>
                <check>
                    <haltOnFailure>false</haltOnFailure>
                    <regexes>
                        <regex>
                            <pattern>com.samaxes.business.*</pattern>
                            <branchRate>80</branchRate>
                            <lineRate>80</lineRate>
                        </regex>
                        <regex>
                            <pattern>com.samaxes.persistence.*</pattern>
                            <branchRate>80</branchRate>
                            <lineRate>80</lineRate>
                        </regex>
                    </regexes>
                </check>
                <instrumentation>
                    <includes>
                        <include>com/samaxes/business/**/*.class</include>
                        <include>com/samaxes/persistence/**/*.class</include>
                    </includes>
                </instrumentation>
            </configuration>
        </plugin>
    </plugins>
</build>
<reporting>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-report-plugin</artifactId>
            <version>2.5</version>
            <reportSets>
                <reportSet>
                    <reports>
                        <report>report-only</report>
                    </reports>
                </reportSet>
            </reportSets>
        </plugin>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>cobertura-maven-plugin</artifactId>
            <version>2.3</version>
        </plugin>
    </plugins>
</reporting>
```
