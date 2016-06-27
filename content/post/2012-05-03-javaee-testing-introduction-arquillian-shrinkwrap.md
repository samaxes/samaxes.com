---
title: Java EE 6 Testing Part II - Introduction to Arquillian and ShrinkWrap
date: 2012-05-03 13:51:55+00:00
slug: javaee-testing-introduction-arquillian-shrinkwrap
categories:
  - Server-side programming
tags:
  - Arquillian
  - Java
  - JBoss
  - Testing
---

In [Java EE 6 Testing Part I]({{< ref "post/2011-12-06-javaee-testing-ejb31-embeddable.md" >}}) I briefly introduced the EJB 3.1 Embeddable API using Glassfish embedded container to demonstrate how to start the container, lookup a bean in the project classpath and run a very simple integration test.

This post focus on [Arquillian](https://github.com/arquillian) and [ShrinkWrap](https://github.com/shrinkwrap) and why they are awesome tools for integration testing of enterprise Java applications.

<!--more-->

The source code used for this post is available on [GitHub](https://github.com/samaxes/java-ee-testing) under the folder `arquillian-shrinkwrap`.

## The tools

### Arquillian

> Arquillian brings test execution to the target runtime, alleviating the burden on the developer of managing the runtime from within the test or project build. To invert this control, Arquillian wraps a lifecycle around test execution that does the following:
>
> * Manages the lifecycle of one or more containers
> * Bundles the test case, dependent classes and resources as ShrinkWrap archives
> * Deploys the archives to the containers
> * Enriches the test case with dependency injection and other declarative services
> * Executes the tests inside (or against) the containers
> * Returns the results to the test runner for reporting

### ShrinkWrap

> ShrinkWrap, a central component of Arquillian, provides a simple mechanism to assemble archives like JARs, WARs, and EARs with a friendly, fluent API.

One of the major benefits of using Arquillian is that you run the tests in a remote container (i.e. application server). That means you'll be testing the _real deal_. No mocks. Not even embedded runtimes!

## Agenda

The following topics will be covered on this post:

* Configure the Arquillian infrastructure in a Maven-based Java project
* Inject EJBs and Managed Beans (CDI) directly in test instances
* Test Java Persistence API (JPA) layer
* Run Arquillian in client mode
* Run and debug Arquillian tests inside your IDE

## Configure Maven to run integration tests

To run integration tests with Maven we need a different approach. By different approach I mean a different plugin: the [Maven Failsafe Plugin](http://maven.apache.org/plugins/maven-failsafe-plugin/).

The Failsafe Plugin is a fork of the [Maven Surefire Plugin](http://maven.apache.org/plugins/maven-surefire-plugin/) designed to run integration tests.

The Failsafe plugin goals are designed to run after the package phase, on the integration-test phase.

The Maven lifecycle has four phases for running integration tests:

* **pre-integration-test:** on this phase we can start any required service or do any action, like starting a database, or starting a webserver, anything...
* **integration-test:** failsafe will run the test on this phase, so after all required services are started.
* **post-integration-test:** time to shutdown all services...
* **verify:** failsafe runs another goal that interprets the results of tests here, if any tests didn't pass failsafe will display the results and exit the build.

Configuring Failsafe in `pom.xml`:

```xml
<!-- clip -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.12</version>
    <configuration>
        <skipTests>true</skipTests>
    </configuration>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>2.12</version>
    <configuration>
        <encoding>UTF-8</encoding>
    </configuration>
    <executions>
        <execution>
            <id>integration-test</id>
            <goals>
                <goal>integration-test</goal>
            </goals>
        </execution>
        <execution>
            <id>verify</id>
            <goals>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<!-- clip -->
```

By default, the Surefire plugin executes `**/Test*.java`, `**/*Test.java`, and `**/*TestCase.java` test classes. The Failsafe plugin will look for `**/IT*.java`, `**/*IT.java`, and `**/*ITCase.java`. If you are using both the Surefire and Failsafe plugins, make sure that you use this naming convention to make it easier to identify which tests are being executed by which plugin.

## Configure Arquillian infrastructure in Maven

Configure your Maven project descriptor to use Arquillian by appending the following XML fragment:

```xml
<!-- clip -->
<repositories>
    <repository>
        <id>jboss-public-repository-group</id>
        <name>JBoss Public Repository Group</name>
        <url>http://repository.jboss.org/nexus/content/groups/public/</url>
    </repository>
</repositories>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.jboss.arquillian</groupId>
            <artifactId>arquillian-bom</artifactId>
            <version>1.0.1.Final</version>
            <scope>import</scope>
            <type>pom</type>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.jboss.arquillian.testng</groupId>
        <artifactId>arquillian-testng-container</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testng</groupId>
        <artifactId>testng</artifactId>
        <version>6.4</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.jboss.spec</groupId>
        <artifactId>jboss-javaee-6.0</artifactId>
        <version>3.0.1.Final</version>
        <scope>provided</scope>
        <type>pom</type>
    </dependency>
</dependencies>

<profiles>
    <profile>
        <id>jbossas-remote-7</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <dependencies>
            <dependency>
                <groupId>org.jboss.as</groupId>
                <artifactId>jboss-as-arquillian-container-remote</artifactId>
                <version>7.1.1.Final</version>
                <scope>test</scope>
            </dependency>
        </dependencies>
    </profile>
</profiles>
<!-- clip -->
```

Arquillian has a vast list of [container adapters](https://docs.jboss.org/author/display/ARQ/Container+adapters). An Arquillian test can be executed in any container that is compatible with the programming model used in the test. However, throughout this post, only JBoss AS 7 is used.

Similarly to [Java EE 6 Testing Part I]({{< ref "post/2011-12-06-javaee-testing-ejb31-embeddable.md" >}}), I chose to use [TestNG](http://testng.org/) testing framework, but again, [JUnit](http://www.junit.org/) should work just as well.

## Create testable components

Before looking at how to write integration tests with Arquillian we first need to have a component to test.

A [Session Bean](http://docs.oracle.com/javaee/6/tutorial/doc/gipjg.html) is a common component in Java EE stack and will serve as test subject. In this post, I'll be creating a very basic backend for adding new users to a database.

```java
@Stateless
public class UserServiceBean {

    @PersistenceContext
    private EntityManager em;

    public User addUser(User user) {
        em.persist(user);
        return user;
    }

    // Annotation says that we do not need to open a transaction
    @TransactionAttribute(TransactionAttributeType.SUPPORTS)
    public User findUserById(Long id) {
        return em.find(User.class, id);
    }
}
```

In the code above I use [JPA](http://docs.oracle.com/javaee/6/tutorial/doc/bnbpz.html) and so we need a persistence unit.

A [persistence unit](http://docs.oracle.com/javaee/6/tutorial/doc/bnbqw.html#bnbrj) defines a set of all entity classes that are managed by `EntityManager` instances in an application. This set of entity classes represents the data contained within a single data store.

Persistence units are defined by the `persistence.xml` configuration file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://java.sun.com/xml/ns/persistence"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://java.sun.com/xml/ns/persistence
        http://java.sun.com/xml/ns/persistence/persistence_2_0.xsd"
    version="2.0">
    <persistence-unit name="example">
        <jta-data-source>java:jboss/datasources/ExampleDS</jta-data-source>
        <properties>
            <property name="hibernate.hbm2ddl.auto" value="create-drop" />
            <property name="hibernate.show_sql" value="true" />
        </properties>
    </persistence-unit>
</persistence>
```

In this example I'm using an example data source that uses H2 database and comes already configured with JBoss AS 7.

Finally, we also need an entity that maps to a table in the database:

```java
@Entity
public class User {

    @Id
    @GeneratedValue
    private Long id;

    @NotNull
    private String name;

    // Removed constructors, getters and setters for brevity

    @Override
    public String toString() {
        return "User [id=" + id + ", name=" + name + "]";
    }
}
```

## Test JPA with Arquillian

We are now all set to write our first Arquillian test.
An Arquillian test case looks just like a unit test with some extras. It must have three things:

* Extend Arquillian class (this is specific to TestNG, with JUnit you need a `@RunWith(Arquillian.class)` annotation on the class)
* A public static method annotated with `@Deployment` that returns a ShrinkWrap archive
* At least one method annotated with `@Test`

```java
public class UserServiceBeanIT extends Arquillian {

    private static final Logger LOGGER = Logger.getLogger(UserServiceBeanIT.class.getName());

    @Inject
    private UserServiceBean service;

    @Deployment
    public static JavaArchive createTestableDeployment() {
        final JavaArchive jar = ShrinkWrap.create(JavaArchive.class, "example.jar")
                .addClasses(User.class, UserServiceBean.class)
                .addAsManifestResource("META-INF/persistence.xml", "persistence.xml")
                // Enable CDI
                .addAsManifestResource(EmptyAsset.INSTANCE, ArchivePaths.create("beans.xml"));

        LOGGER.info(jar.toString(Formatters.VERBOSE));

        return jar;
    }

    @Test
    public void callServiceToAddNewUserToDB() {
        final User user = new User("Ike");
        service.addUser(user);
        assertNotNull(user.getId(), "User id should not be null!");
    }
}
```

This test is straightforward, it inserts a new user and checks that the `id` property has been filled with the generated value from the database.

Since the test is enriched by Arquillian, you can inject EJBs and managed beans normally using `@EJB` or `@Inject` annotations.

The method annotated with `@Deployment` uses ShrinkWrap to build a JAR archive which will be deployed to the container and to which your tests will be run against. ShrinkWrap isolates the classes and resources which are needed by the test from the remainder of the classpath, you should include every component needed for the test to run inside the deployment archive.

## Client mode

Arquillian supports three test run modes:

* **In-container mode** is to test your application internals. This gives Arquillian the ability to communicate with the test, enrich the test and run the test remotely. In this mode, the test executes in the remote container; Arquillian uses this mode by default.
* **Client mode** is to test how your application is used by clients. As opposed to in-container mode which repackages and overrides the test execution, the client mode does as little as possible. It does not repackage your `@Deployment` nor does it forward the test execution to a remote server. Your test case is running in your JVM as expected and you're free to test the container from the outside, as your clients see it. The only thing Arquillian does is to control the lifecycle of your `@Deployment`.
* **Mixed mode** allows to mix the two run modes within the same test class.

To run Arquillian in client mode lets first build a servlet to be tested:

```java
@WebServlet("/User")
public class UserServlet extends HttpServlet {

    private static final long serialVersionUID = -7125652220750352874L;

    @Inject
    private UserServiceBean service;

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");

        PrintWriter out = response.getWriter();
        out.println(service.addUser(new User("Ike")).toString());
        out.close();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
            IOException {
        doGet(request, response);
    }
}
```

And now lets test it:

```java
public class UserServletIT extends Arquillian {

    private static final Logger LOGGER = Logger.getLogger(UserServletIT.class.getName());

    // Not managed, should be used for external calls (e.g. HTTP)
    @Deployment(testable = false)
    public static WebArchive createNotTestableDeployment() {
        final WebArchive war = ShrinkWrap.create(WebArchive.class, "example.war")
                .addClasses(User.class, UserServiceBean.class, UserServlet.class)
                .addAsResource("META-INF/persistence.xml")
                // Enable CDI
                .addAsWebInfResource(EmptyAsset.INSTANCE, ArchivePaths.create("beans.xml"));

        LOGGER.info(war.toString(Formatters.VERBOSE));

        return war;
    }

    @RunAsClient // Same as @Deployment(testable = false), should only be used in mixed mode
    @Test(dataProvider = Arquillian.ARQUILLIAN_DATA_PROVIDER)
    public void callServletToAddNewUserToDB(@ArquillianResource URL baseURL) throws IOException {
        // Servlet is listening at <context_path>/User
        final URL url = new URL(baseURL, "User");
        final User user = new User(1L, "Ike");

        StringBuilder builder = new StringBuilder();
        BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()));
        String line;

        while ((line = reader.readLine()) != null) {
            builder.append(line);
        }
        reader.close();

        assertEquals(builder.toString(), user.toString());
    }
}
```

Although this test is very simple, it allows you to test multiple layers of your application with a single method call.

## Run tests inside Eclipse

You can run an Arquillian test from inside your IDE just like a unit test.

### Run an Arquillian test

_(Click on the images to enlarge)_

1. Install [TestNG](http://testng.org/) and [JBoss Tools](http://www.jboss.org/tools) Eclipse plugins.

2. Add a new JBoss AS server to Eclipse:

    [![Add JBoss AS server to Eclipse](http://samaxes.appspot.com/images/arquillian/add-jboss-server.png)](http://samaxes.appspot.com/images/arquillian/add-jboss-server-big.png)

3. Start JBoss AS server:

    [![Start JBoss AS server](http://samaxes.appspot.com/images/arquillian/start-jboss.png)](http://samaxes.appspot.com/images/arquillian/start-jboss-big.png)

4. Run the test case from Eclipse, right click on the test file on the Project Explorer and select `Run As > TestNG Test`:

    [![Run TestNG Arquillian test](http://samaxes.appspot.com/images/arquillian/arquillian-testng-eclipse-test.png)](http://samaxes.appspot.com/images/arquillian/arquillian-testng-eclipse-test-big.png)

The result should look similar to this:

[![TestNG Arquillian test result](http://samaxes.appspot.com/images/arquillian/arquillian-testng-eclipse-result.png)](http://samaxes.appspot.com/images/arquillian/arquillian-testng-eclipse-result-big.png)

### Debug an Arquillian test

_(Click on the images to enlarge)_

Since we are using a remote container `Debug As >> TestNG Test` does not cause breakpoints to be activated.

Instead, we need to start the container in debug mode and attach the debugger. That's because the test is run in a different JVM than the original test runner.

The only change you need to make to debug your test is to start JBoss AS server in debug mode:

1. Start JBoss AS server debug mode:

    [![Debug JBoss AS server](http://samaxes.appspot.com/images/arquillian/debug-jboss.png)](http://samaxes.appspot.com/images/arquillian/debug-jboss-big.png)

2. Add the breakpoints you need to your code.

3. And debug it by right clicking on the test file on the Project Explorer and selecting `Run As >> TestNG Test`:

    [![Debug Arquillian test](http://samaxes.appspot.com/images/arquillian/debug-arquillian-test.png)](http://samaxes.appspot.com/images/arquillian/debug-arquillian-test-big.png)

## More resources

I hope to have been able to highlight some of the benefits of Arquillian.
For more Arquillian awesomeness take a look at the following resources:

* [Arquillian Guides](http://arquillian.org/guides/)
* [Arquillian Community](http://arquillian.org/community/)
* [Arquillian Git Repository](https://github.com/arquillian)
