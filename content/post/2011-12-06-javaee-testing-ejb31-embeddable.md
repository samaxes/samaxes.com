---
title: Java EE 6 Testing Part I - EJB 3.1 Embeddable API
date: 2011-12-06 14:32:27+00:00
slug: javaee-testing-ejb31-embeddable
categories:
  - Server-side programming
tags:
  - EJB
  - Java
  - Testing
---

One of the most common requests we hear from Enterprise JavaBeans developers is for improved unit/integration testing support.

[EJB 3.1 Specification](http://jcp.org/en/jsr/detail?id=318) introduced the EJB 3.1 Embeddable API for executing EJB components within a Java SE environment.

> Unlike traditional Java EE server-based execution, embeddable usage allows client code and its corresponding enterprise beans to run within the same JVM and class loader. This provides better support for testing, offline processing (e.g. batch), and the use of the EJB programming model in desktop applications.
> [...]
> The embeddable EJB container provides a managed environment with support for the same basic services that exist within a Java EE runtime: injection, access to a component environment, container-managed transactions, etc. In general, enterprise bean components are unaware of the kind of managed environment in which they are running. This allows maximum reusability of enterprise components across a wide range of testing and deployment scenarios without significant rework.

<!--more-->

Let's look at an example.

Start by creating a Maven project and add the embeddable GlassFish dependency.

I chose to use [TestNG](http://testng.org/) testing framework, but [JUnit](http://www.junit.org/) should work just as well.

```xml
<dependencies>
    <dependency>
        <groupId>org.glassfish.main.extras</groupId>
        <artifactId>glassfish-embedded-all</artifactId>
        <version>3.1.2</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>6.4</version>
        <scope>test</scope>
    </dependency>
    <!--
        The javaee-api is stripped of any code and is just used to
        compile your application. The scope provided in Maven means
        that it is used for compiling, but is also available when
        testing. For this reason, the javaee-api needs to be below
        the embedded Glassfish dependency. The javaee-api can actually
        be omitted when the embedded Glassfish dependency is included,
        but to keep your project Java-EE 6 rather than GlassFish,
        specification is important.
    -->
    <dependency>
        <groupId>javax</groupId>
        <artifactId>javaee-api</artifactId>
        <version>6.0</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

Here's a simple `Stateless` session bean:

```java
@Stateless
public class HelloWorld {
    public String hello(String message) {
        return "Hello " + message;
    }
}
```

It exposes business methods through a [no-interface view](http://java.sun.com/developer/technicalArticles/JavaEE/JavaEE6Overview_Part3.html#noiview).

There is no special API it must use to be capable of embeddable execution.

Here is some test code to execute the bean in an embeddable container:

```java
public class HelloWorldTest {
    private static EJBContainer ejbContainer;

    private static Context ctx;

    @BeforeClass
    public static void setUpClass() throws Exception {
        // Instantiate an embeddable EJB container and search the
        // JVM class path for eligible EJB modules or directories
        ejbContainer = EJBContainer.createEJBContainer();

        // Get a naming context for session bean lookups
        ctx = ejbContainer.getContext();
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
        // Shutdown the embeddable container
        ejbContainer.close();
    }

    @Test
    public void hello() throws NamingException {
        // Retrieve a reference to the session bean using a portable
        // global JNDI name
        HelloWorld helloWorld = (HelloWorld)
                ctx.lookup("java:global/classes/HelloWorld");

        // Do your tests
        assertNotNull(helloWorld);
        String expected = "World";
        String hello = helloWorld.hello(expected);
        assertNotNull(hello);
        assertTrue(hello.endsWith(expected));
    }
}
```

The source code is available on [GitHub](https://github.com/samaxes/java-ee-testing) under the folder `ejb31-embeddable`.

For a step by step tutorial with a JPA example take a look at [Using the Embedded EJB Container to Test Enterprise Applications](http://netbeans.org/kb/docs/javaee/javaee-entapp-junit.html) from NetBeans docs.

While this new API is a step forward, I still have an issue with this approach: you are bringing the container to the test. This requires a specialized container which is different from your production environment.

In [Java EE 6 Testing Part II]({{< ref "post/2012-05-03-javaee-testing-introduction-arquillian-shrinkwrap.md" >}}), I will introduce [Arquillian](https://github.com/arquillian) and [ShrinkWrap](https://github.com/shrinkwrap).

Arquillian, a powerful container-oriented testing framework layered atop TestNG and JUnit, gives you the ability to create the production environment on the container of your choice and just execute tests in that environment (using the datasources, JMS destinations, and a whole lot of other configurations you expect to see in production environment). Instead of bringing your runtime to the test, Arquillian brings your test to the runtime.
