---
title: Maven 2 Cobertura Plugin
date: 2007-06-23 23:23:00+00:00
slug: maven-2-cobertura-plugin
categories:
  - Tools
tags:
  - Build
  - Java
  - Maven
  - Testing
---

The [Maven 2 Cobertura Plugin web site](http://mojo.codehaus.org/cobertura-maven-plugin/) lacks information to successfully generate [Cobertura](http://cobertura.sourceforge.net/) reports. Worse, some of the [usage examples](http://mojo.codehaus.org/cobertura-maven-plugin/usage.html) are incorrect and don't work.

The most common problem when generating Cobertura reports is when the generated report shows 100% test coverage while in reality many of the classes don't even have tests.

The following example shows how to configure the reports so that it would reflect real test coverage and then check if the specified packages achieved the wanted test coverage:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>cobertura-maven-plugin</artifactId>
            <version>2.1</version>
            <configuration>
                <check>
                    <haltOnFailure>false</haltOnFailure>
                    <regexes>
                        <regex>
                            <pattern>com.samaxes.business.*</pattern>
                            <branchRate>90</branchRate>
                            <lineRate>90</lineRate>
                        </regex>
                        <regex>
                            <pattern>com.samaxes.persistence.*</pattern>
                            <branchRate>90</branchRate>
                            <lineRate>90</lineRate>
                        </regex>
                    </regexes>
                </check>
                <instrumentation>
                    <includes>
                        <include>com/samaxes/**/*.class</include>
                    </includes>
                </instrumentation>
            </configuration>
            <executions>
                <execution>
                    <id>clean</id>
                    <phase>pre-site</phase>
                    <goals>
                        <goal>clean</goal>
                    </goals>
                </execution>
                <execution>
                    <id>instrument</id>
                    <phase>site</phase>
                    <goals>
                        <goal>instrument</goal>
                        <goal>cobertura</goal>
                        <goal>check</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
<reporting>
    <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>cobertura-maven-plugin</artifactId>
        </plugin>
    </plugins>
</reporting>
```
