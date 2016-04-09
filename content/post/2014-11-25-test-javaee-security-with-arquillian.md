---
title: Testing secured EJBs with Arquillian
date: 2014-11-25 15:01:16+00:00
slug: test-javaee-security-with-arquillian
categories:
  - Server-side
tags:
  - Arquillian
  - Java
  - JBoss
  - Testing
---

Testing secured EJBs has been historically hard to get right. Up until now, I have been using proprietary techniques like [JBossLoginContextFactory](https://github.com/sfcoy/demos/blob/master/arquillian-security-demo/src/test/java/org/jboss/arquillian/secureejb/JBossLoginContextFactory.java) described in the article [Testing secured EJBs on WildFly 8.1.x with Arquillian](https://developer.jboss.org/wiki/TestingSecuredEJBsOnWildFly81xWithArquillian) to test secured EJBs.

During this year [Devoxx](https://devoxx.be/), [David Blevins](https://twitter.com/dblevins), founder of the [Apache TomEE](http://tomee.apache.org/) project - a lightweight Java EE Application Server, brought to my knowledge a little trick we can use to deal with Java EE security in a standard way that works across all Java EE compliant servers.

<!--more-->

The example used in this post is available at [javaee-testing/security](https://github.com/javaee-testing/security) on GitHub.

## The code

The code to test includes an entity and an EJB service as follows.

**Book Entity**

```java
@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String isbn;
    private String title;

    public Book() {
    }

    public Book(String isbn, String title) {
        this.isbn = isbn;
        this.title = title;
    }

    // getters and setters omitted for brevity
}
```

**Bookshelf EJB Service**

```java
@Stateless
public class BookshelfService {

    @PersistenceContext(unitName = "bookshelfManager")
    private EntityManager entityManager;

    @RolesAllowed({ "User", "Manager" })
    public void addBook(Book book) {
        entityManager.persist(book);
    }

    @RolesAllowed({ "Manager" })
    public void deleteBook(Book book) {
        entityManager.remove(book);
    }

    @PermitAll
    @TransactionAttribute(TransactionAttributeType.SUPPORTS)
    public List<Book> getBooks() {
        TypedQuery<Book> query = entityManager.createQuery("SELECT b from Book as b", Book.class);
        return query.getResultList();
    }
}
```

The test class uses [Arquillian](http://arquillian.org/) for the integration tests and asserts that the security roles defined on our EJB are respected.

**Bookshelf Service Tests**

```java
@RunWith(Arquillian.class)
public class BookshelfServiceIT {

    @Inject
    private BookshelfService bookshelfService;
    @Inject
    private BookshelfManager manager;
    @Inject
    private BookshelfUser user;

    @Deployment
    public static JavaArchive createDeployment() throws IOException {
        return ShrinkWrap.create(JavaArchive.class, "javaee-testing-security.jar")
                .addClasses(Book.class, BookshelfService.class, BookshelfManager.class, BookshelfUser.class)
                .addAsManifestResource("META-INF/persistence.xml", "persistence.xml")
                .addAsManifestResource(EmptyAsset.INSTANCE, ArchivePaths.create("beans.xml"));
    }

    @Test
    public void testAsManager() throws Exception {
        manager.call(new Callable<Book>() {
            @Override
            public Book call() throws Exception {
                bookshelfService.addBook(new Book("978-1-4302-4626-8", "Beginning Java EE 7"));
                bookshelfService.addBook(new Book("978-1-4493-2829-0", "Continuous Enterprise Development in Java"));

                List<Book> books = bookshelfService.getBooks();
                Assert.assertEquals("List.size()", 2, books.size());

                for (Book book : books) {
                    bookshelfService.deleteBook(book);
                }

                Assert.assertEquals("BookshelfService.getBooks()", 0, bookshelfService.getBooks().size());
                return null;
            }
        });
    }

    @Test
    public void testAsUser() throws Exception {
        user.call(new Callable<Book>() {
            @Override
            public Book call() throws Exception {
                bookshelfService.addBook(new Book("978-1-4302-4626-8", "Beginning Java EE 7"));
                bookshelfService.addBook(new Book("978-1-4493-2829-0", "Continuous Enterprise Development in Java"));

                List<Book> books = bookshelfService.getBooks();
                Assert.assertEquals("List.size()", 2, books.size());

                for (Book book : books) {
                    try {
                        bookshelfService.deleteBook(book);
                        Assert.fail("Users should not be allowed to delete");
                    } catch (EJBAccessException e) {
                        // Good, users cannot delete things
                    }
                }

                // The list should not be empty
                Assert.assertEquals("BookshelfService.getBooks()", 2, bookshelfService.getBooks().size());
                return null;
            }
        });
    }

    @Test
    public void testUnauthenticated() throws Exception {
        try {
            bookshelfService.addBook(new Book("978-1-4302-4626-8", "Beginning Java EE 7"));
            Assert.fail("Unauthenticated users should not be able to add books");
        } catch (EJBAccessException e) {
            // Good, unauthenticated users cannot add things
        }

        try {
            bookshelfService.deleteBook(null);
            Assert.fail("Unauthenticated users should not be allowed to delete");
        } catch (EJBAccessException e) {
            // Good, unauthenticated users cannot delete things
        }

        try {
            // Read access should be allowed
            List<Book> books = bookshelfService.getBooks();
            Assert.assertEquals("BookshelfService.getBooks()", 0, books.size());
        } catch (EJBAccessException e) {
            Assert.fail("Read access should be allowed");
        }
    }
}
```

The trick is on two helper EJBs which allow our test code to execute in the desired security scope by using the `@RunAs` standard annotation.

**Bookshelf Manager role**

```java
@Stateless
@RunAs("Manager")
@PermitAll
public class BookshelfManager {
    public <V> V call(Callable<V> callable) throws Exception {
        return callable.call();
    }
}
```

**Bookshelf User role**

```java
@Stateless
@RunAs("User")
@PermitAll
public class BookshelfUser {
    public <V> V call(Callable<V> callable) throws Exception {
        return callable.call();
    }
}
```

## Running

```sh
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.samaxes.javaeetesting.security.BookshelfServiceIT
nov 23, 2014 2:44:48 AM org.xnio.Xnio <clinit>
INFO: XNIO version 3.2.0.Beta4
nov 23, 2014 2:44:48 AM org.xnio.nio.NioXnio <clinit>
INFO: XNIO NIO Implementation Version 3.2.0.Beta4
nov 23, 2014 2:44:49 AM org.jboss.remoting3.EndpointImpl <clinit>
INFO: JBoss Remoting version (unknown)
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 36.69 sec - in com.samaxes.javaeetesting.security.BookshelfServiceIT

Results :

Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
```

Happy tests!
