---
title: Unit Testing JBoss 5 Services
date: 2009-09-02 13:02:45+00:00
slug: test-jboss-microcontainer-services
categories:
  - Server-side
tags:
  - Java
  - JBoss
  - Testing
---

The [JBoss Microcontainer](http://jboss.org/jbossmc/) is a refactoring of JBoss's JMX Microkernel to support direct POJO deployment and standalone use outside the JBoss application server.

It allows the creation of services using simple Plain Old Java Objects (POJOs) to be deployed into a standard Java SE runtime environment.

> JBoss Microcontainer uses dependency injection to wire individual POJOs together to create services. Configuration is performed using either annotations or XML depending on where the information is best located.

The goal of this article is to show how easy it is to test these services using [TestNG](http://testng.org/) testing framework.

<!--more-->

## Configuring a service

`PersonService` is a simple POJO that doesn't implement any special interfaces.

It has two properties, `firstName` and `lastName`, that are inject through a XML deployment descriptor.

The public method that clients will call is `getName()` and returns the person full name.

```java
public class PersonService {
    private String firstName;
    private String lastName;

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getName() {
        return firstName + " " + lastName;
    }
}
```

Instances of this service are created by creating an XML deployment descriptor (`jboss-beans.xml`) that contains a list of beans representing individual instances.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<deployment xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="urn:jboss:bean-deployer:2.0 bean-deployer_2_0.xsd"
    xmlns="urn:jboss:bean-deployer:2.0">

    <bean name="PersonService" class="com.samaxes.jboss.service.plain.PersonService">
        <property name="firstName">Samuel</property>
        <property name="lastName">Santos</property>
    </bean>

</deployment>
```

We have just declared that we want to create an instance of the PersonService class and register it with the name `PersonService`. This file is passed to an XML deployer associated with the microcontainer at runtime to perform the actual deployment and instantiate the beans.

## Testing a service

JBoss Microcontainer makes it extremely easy to unit test services.
First, you need to create an `EmbeddedBootstrap` class and override the protected `bootstrap()` method.

This allows you to created an instance of JBoss Microcontainer together with an XML deployer.

```java
public class EmbeddedBootstrap extends BasicBootstrap {
    protected BasicXMLDeployer deployer;

    public EmbeddedBootstrap() throws Exception {
        super();
    }

    public void bootstrap() throws Throwable {
        super.bootstrap();
        deployer = new BasicXMLDeployer(getKernel());
        Runtime.getRuntime().addShutdownHook(new Shutdown());
    }

    public void deploy(URL url) {
        try {
            // Workaround the fact that the BasicXMLDeployer does not handle redeployment correctly
            if (deployer.getDeploymentNames().contains(url.toString())) {
                log.info("Service is already deployed.");
                return;
            }
            deployer.deploy(url);
        } catch (Throwable t) {
            log.warn("Error during deployment: " + url, t);
        }
    }

    public void undeploy(URL url) {
        if (!deployer.getDeploymentNames().contains(url.toString())) {
            log.info("Service is already undeployed.");
            return;
        }
        try {
            deployer.undeploy(url);
        } catch (Throwable t) {
            log.warn("Error during undeployment: " + url, t);
        }
    }

    protected class Shutdown extends Thread {
        public void run() {
            log.info("Shutting down");
            deployer.shutdown();
        }
    }
}
```

Next, you need to bootstrap the microcontainer. This is done in `BaseTest` class.

```java
public class BaseTest<T> {
    private URL url;
    private EmbeddedBootstrap bootstrap;
    private Kernel kernel;
    private KernelController controller;

    @BeforeSuite
    public void setUpSuite() throws Exception {
        // Start JBoss Microcontainer
        bootstrap = new EmbeddedBootstrap();
        bootstrap.run();

        kernel = bootstrap.getKernel();
        controller = kernel.getController();
    }

    @AfterSuite
    public void tearDownSuite() {
    }

    protected void deploy(String url) {
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        this.url = cl.getResource(url);

        bootstrap.deploy(cl.getResource(url));
    }

    protected void undeploy() {
        bootstrap.undeploy(url);
    }

    @SuppressWarnings( { "unchecked" })
    protected T getService(String name) {
        ControllerContext context = controller.getInstalledContext(name);

        return (context == null) ? null : (T) context.getTarget();
    }
}
```

All the test classes extend this one, this allows you to run the microcontainer only once before the test suite.

Another benefit is to have all the utility methods used in every test class in a central place.

Now we can proceed to the last part, and that is to deploy the Person service.

```java
public class PersonServiceTest extends BaseTest<PersonService> {
    private static final Logger LOGGER = LoggerFactory.getLogger(PersonServiceTest.class);
    private PersonService service;

    @BeforeClass
    public void setUp() {
        deploy("jboss-beans.xml");
        service = getService("PersonService");
    }

    @AfterClass
    public void tearDown() {
        undeploy();
    }

    @Test
    public void getName() {
        String name = service.getName();
        LOGGER.info("Name: {}", name);
        assertEquals("Samuel Santos", name);
    }
}
```

To see this in action, get this [example source code](http://samaxes.appspot.com/zip/pojo-service-1.0.zip) and run the following [Maven](http://maven.apache.org/) command:

```sh
$ mvn test
```
