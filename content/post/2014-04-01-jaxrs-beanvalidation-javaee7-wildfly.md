---
title: Validating JAX-RS resource data with Bean Validation in Java EE 7 and WildFly
date: 2014-04-01 13:50:38+00:00
slug: jaxrs-beanvalidation-javaee7-wildfly
categories:
  - Server-side programming
tags:
  - Bean Validation
  - Internationalization
  - Java
  - JAX-RS
  - JBoss
---

I have already approached this subject twice in the past. First, on my post [Integrating Bean Validation with JAX-RS in Java EE 6]({{< ref "post/2013-01-10-beanvalidation-with-jaxrs-in-javaee6.md" >}}), describing how to use Bean Validation with JAX-RS in JBoss AS 7, even before this was defined in the [Java EE Platform Specification](https://javaee-spec.java.net/). And later, on an article written for [JAX Magazine](https://jaxenter.com/jax-magazine/JAX-Magazine-2013-06) and posteriorly posted on [JAXenter](https://jaxenter.com/integrating-bean-validation-with-jax-rs-2-106887.html), using the new standard way defined in Java EE 7 with Glassfish 4 server (the first Java EE 7 certified server).

Now that [WildFly 8](http://wildfly.org/), previously know as JBoss Application Server, has finally reached the final version and has joined the Java EE 7 certified servers club, it's time for a new post highlighting the specificities and differences between these two application servers, GlassFish 4 and WildFly 8.

<!--more-->

## Specs and APIs

Java EE 7 is the long-awaited major overhaul of Java EE 6. With each release of Java EE, new features are added and existing specifications are enhanced. Java EE 7 builds on top of the success of Java EE 6 and continues to focus on increasing developer productivity.

[JAX-RS](https://jax-rs-spec.java.net/), the Java API for RESTful Web Services, is one of the fastest-evolving APIs in the Java EE landscape. This is, of course, due to the massive adoption of REST-based Web services and the increasing number of applications that consume those services.

This post will go through the steps required to configure REST endpoints to support a JavaScript client and to handle validation exceptions to send localized error messages to the client in addition to HTTP error status codes.

## Source code

The source code accompanying this article is available on [GitHub](https://github.com/samaxes/jaxrs-beanvalidation-javaee7).

## Introduction to Bean Validation

>JavaBeans Validation ([Bean Validation](http://beanvalidation.org/)) is a new validation model available as part of Java EE 6 platform. The Bean Validation model is supported by constraints in the form of annotations placed on a field, method, or class of a JavaBeans component, such as a managed bean.

Several built-in constraints are available in the `javax.validation.constraints` package. [The Java EE 7 Tutorial](https://docs.oracle.com/javaee/7/tutorial/bean-validation001.htm) contains a list with all those constraints.

Constraints in Bean Validation are expressed via Java annotations:

```java
public class Person {
    @NotNull
    @Size(min = 2, max = 50)
    private String name;
    // ...
}
```

## Bean Validation and RESTful web services

JAX-RS provides great support for extracting request values and binding them into Java fields, properties and parameters using annotations such as `@HeaderParam`, `@QueryParam`, etc. It also supports binding of request entity bodies into Java objects via non-annotated parameters (i.e., parameters not annotated with any of the JAX-RS annotations). However, prior to JAX-RS 2.0, any additional validation on these values in a resource class had to be performed programmatically.

The last release, JAX-RS 2.0, includes a solution to enable validation annotations to be combined with JAX-RS annotations.

The following example shows how path parameters can be validated using the `@Pattern` validation annotation:

```java
@GET
@Path("{id}")
public Person getPerson(
        @PathParam("id")
        @Pattern(regexp = "[0-9]+", message = "The id must be a valid number")
        String id) {
    return persons.get(id);
}
```

Besides validating single fields, you can also validate entire entities with the `@Valid` annotation.
As an example, the method below receives a `Person` object and validates it:

```java
@POST
public Response validatePerson(@Valid Person person) {
    // ...
}
```

## Internationalization

In the previous example we used the default or hard-coded error messages, but this is both a bad practice and not flexible at all. I18n is part of the Bean Validation specification and allows us to specify custom error messages using a resource property file. The default resource file name is `ValidationMessages.properties` and must include pairs of properties/values like:

```ini
person.id.notnull=The person id must not be null
person.id.pattern=The person id must be a valid number
person.name.size=The person name must be between {min} and {max} chars long
```

**Note:** `{min}`, `{max}` refer to the properties of the constraint to which the message will be associated with.

Once defined, these messages can then be injected on the validation constraints such as:

```java
@POST
@Path("create")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response createPerson(
        @FormParam("id")
        @NotNull(message = "{person.id.notnull}")
        @Pattern(regexp = "[0-9]+", message = "{person.id.pattern}")
        String id,
        @FormParam("name")
        @Size(min = 2, max = 50, message = "{person.name.size}")
        String name) {
    Person person = new Person();
    person.setId(Integer.valueOf(id));
    person.setName(name);
    persons.put(id, person);
    return Response.status(Response.Status.CREATED).entity(person).build();
}
```

To provide translations to other languages, one must create a new file `ValidationMessages_XX.properties` with the translated messages, where `XX` is the code of the language being provided.

Unfortunately, with some application servers, the default Validator provider doesn't support i18n based on a specific HTTP request. They do not take `Accept-Language` HTTP header into account and always use the default `Locale` as provided by `Locale.getDefault()`. To be able to change the `Locale` using the `Accept-Language` HTTP header (which maps to the language configured in your browser options), you must provide a custom implementation.

### Custom Validator provider

Although WildFly 8 correctly uses the `Accept-Language` HTTP header to choose the correct resource bundle, other servers like GlassFish 4 do not use this header. Therefore, for completeness and easier comparison with the GlassFish code (available under the same [GitHub project](https://github.com/samaxes/jaxrs-beanvalidation-javaee7)), I've also implemented a custom Validator provider for WildFly.

If you want to see a GlassFish example, please visit [Integrating Bean Validation with JAX-RS](https://jaxenter.com/integrating-bean-validation-with-jax-rs-2-106887.html) on JAXenter.

1. Add RESTEasy dependency to Maven

    WildFly uses [RESTEasy](http://www.jboss.org/resteasy), the JBoss implementation of the JAX-RS specification.

    RESTEasy dependencies are required for the Validator provider and Exception Mapper discussed later on in this post. Lets add it to Maven:

    ```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.jboss.resteasy</groupId>
                <artifactId>resteasy-bom</artifactId>
                <version>3.0.6.Final</version>
                <scope>import</scope>
                <type>pom</type>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.jboss.resteasy</groupId>
            <artifactId>resteasy-jaxrs</artifactId>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.jboss.resteasy</groupId>
            <artifactId>resteasy-validator-provider-11</artifactId>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    ```

2. Create a ThreadLocal to store the `Locale` from the `Accept-Language` HTTP header

    [ThreadLocal](http://docs.oracle.com/javase/7/docs/api/java/lang/ThreadLocal.html) variables differ from their normal counterparts in that each thread that accesses one has its own, independently initialized copy of the variable.

    ```java
    /**
     ** A {@link ThreadLocal} to store the Locale to be used in the message interpolator.
     */
    public class LocaleThreadLocal {

        public static final ThreadLocal<Locale> THREAD_LOCAL = new ThreadLocal<Locale>();

        public static Locale get() {
            return (THREAD_LOCAL.get() == null) ? Locale.getDefault() : THREAD_LOCAL.get();
        }

        public static void set(Locale locale) {
            THREAD_LOCAL.set(locale);
        }

        public static void unset() {
            THREAD_LOCAL.remove();
        }
    }
    ```

3. Create a request filter to read the `Accept-Language` HTTP header

    The request filter is responsible for reading the first language sent by the client in the `Accept-Language` HTTP header and store the `Locale` in our `ThreadLocal`:

    ```java
    /**
     ** Checks whether the {@code Accept-Language} HTTP header exists and creates a {@link ThreadLocal} to store the
     ** corresponding Locale.
     */
    @Provider
    public class AcceptLanguageRequestFilter implements ContainerRequestFilter {

        @Context
        private HttpHeaders headers;

        @Override
        public void filter(ContainerRequestContext requestContext) throws IOException {
            if (!headers.getAcceptableLanguages().isEmpty()) {
                LocaleThreadLocal.set(headers.getAcceptableLanguages().get(0));
            }
        }
    }
    ```

4. Create a custom message interpolator to enforce a specific `Locale`

    Next create a custom message interpolator to enforce a specific `Locale` value by bypassing or overriding the default `Locale` strategy:

    ```java
    /**
     ** Delegates to a MessageInterpolator implementation but enforces a given Locale.
     */
    public class LocaleSpecificMessageInterpolator implements MessageInterpolator {

        private final MessageInterpolator defaultInterpolator;

        public LocaleSpecificMessageInterpolator(MessageInterpolator interpolator) {
            this.defaultInterpolator = interpolator;
        }

        @Override
        public String interpolate(String message, Context context) {
            return defaultInterpolator.interpolate(message, context, LocaleThreadLocal.get());
        }

        @Override
        public String interpolate(String message, Context context, Locale locale) {
            return defaultInterpolator.interpolate(message, context, locale);
        }
    }
    ```

5. Configure the Validator provider

    RESTEasy obtains a Bean Validation implementation by looking for a Provider implementing `ContextResolver<GeneralValidator>`.

    To configure a new Validation Service Provider to use our custom message interpolator add the following:

    ```java
    /**
     ** Custom configuration of validation. This configuration can define custom:
     ** <ul>
     ** <li>MessageInterpolator - interpolates a given constraint violation message.</li>
     ** <li>TraversableResolver - determines if a property can be accessed by the Bean Validation provider.</li>
     ** <li>ConstraintValidatorFactory - instantiates a ConstraintValidator instance based off its class.
     ** <li>ParameterNameProvider - provides names for method and constructor parameters.</li> *
     ** </ul>
     */
    @Provider
    public class ValidationConfigurationContextResolver implements ContextResolver<GeneralValidator> {

        /**
         * Get a context of type {@code GeneralValidator} that is applicable to the supplied type.
         *
         * @param type the class of object for which a context is desired
         * @return a context for the supplied type or {@code null} if a context for the supplied type is not available from
         *         this provider.
         */
        @Override
        public GeneralValidator getContext(Class<?> type) {
            Configuration<?> config = Validation.byDefaultProvider().configure();
            BootstrapConfiguration bootstrapConfiguration = config.getBootstrapConfiguration();

            config.messageInterpolator(new LocaleSpecificMessageInterpolator(Validation.byDefaultProvider().configure()
                    .getDefaultMessageInterpolator()));

            return new GeneralValidatorImpl(config.buildValidatorFactory(),
                    bootstrapConfiguration.isExecutableValidationEnabled(),
                    bootstrapConfiguration.getDefaultValidatedExecutableTypes());
        }
    }
    ```

## Mapping Exceptions

By default, when validation fails an exception is thrown by the container and a HTTP error is returned to the client.

Bean Validation specification defines a small hierarchy of exceptions (they all inherit from [`ValidationException`](http://docs.jboss.org/hibernate/beanvalidation/spec/1.1/api/javax/validation/ValidationException.html)) that could be thrown during initialization of validation engine or (for our case more importantly) during validation of input/output values ([`ConstraintViolationException`](http://docs.jboss.org/hibernate/beanvalidation/spec/1.1/api/javax/validation/ConstraintViolationException.html)). If a thrown exception is a subclass of `ValidationException` except `ConstraintViolationException` then this exception is mapped to a HTTP response with status code 500 (Internal Server Error). On the other hand, when a `ConstraintViolationException` is throw two different status code would be returned:

* 500 (Internal Server Error)

    If the exception was thrown while validating a method return type.

* 400 (Bad Request)

    Otherwise.

Unfortunately, WildFly instead of throwing the exception `ConstraintViolationException` for invalid input values, throws a `ResteasyViolationException`, which implements the `ValidationException` interface.

This behavior can be customized to allow us to add error messages to the response that is returned to the client:

```java
/**
 * {@link ExceptionMapper} for {@link ValidationException}.
 * <p>
 * Send a {@link ViolationReport} in {@link Response} in addition to HTTP 400/500 status code. Supported media types
 * are: {@code application/json} / {@code application/xml} (if appropriate provider is registered on server).
 * </p>
 *
 * @see org.jboss.resteasy.api.validation.ResteasyViolationExceptionMapper The original WildFly class:
 *      {@code org.jboss.resteasy.api.validation.ResteasyViolationExceptionMapper}
 */
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ValidationException> {

    @Override
    public Response toResponse(ValidationException exception) {
        if (exception instanceof ConstraintDefinitionException) {
            return buildResponse(unwrapException(exception), MediaType.TEXT_PLAIN, Status.INTERNAL_SERVER_ERROR);
        }
        if (exception instanceof ConstraintDeclarationException) {
            return buildResponse(unwrapException(exception), MediaType.TEXT_PLAIN, Status.INTERNAL_SERVER_ERROR);
        }
        if (exception instanceof GroupDefinitionException) {
            return buildResponse(unwrapException(exception), MediaType.TEXT_PLAIN, Status.INTERNAL_SERVER_ERROR);
        }
        if (exception instanceof ResteasyViolationException) {
            ResteasyViolationException resteasyViolationException = ResteasyViolationException.class.cast(exception);
            Exception e = resteasyViolationException.getException();
            if (e != null) {
                return buildResponse(unwrapException(e), MediaType.TEXT_PLAIN, Status.INTERNAL_SERVER_ERROR);
            } else if (resteasyViolationException.getReturnValueViolations().size() == 0) {
                return buildViolationReportResponse(resteasyViolationException, Status.BAD_REQUEST);
            } else {
                return buildViolationReportResponse(resteasyViolationException, Status.INTERNAL_SERVER_ERROR);
            }
        }
        return buildResponse(unwrapException(exception), MediaType.TEXT_PLAIN, Status.INTERNAL_SERVER_ERROR);
    }

    protected Response buildResponse(Object entity, String mediaType, Status status) {
        ResponseBuilder builder = Response.status(status).entity(entity);
        builder.type(MediaType.TEXT_PLAIN);
        builder.header(Validation.VALIDATION_HEADER, "true");
        return builder.build();
    }

    protected Response buildViolationReportResponse(ResteasyViolationException exception, Status status) {
        ResponseBuilder builder = Response.status(status);
        builder.header(Validation.VALIDATION_HEADER, "true");

        // Check standard media types.
        MediaType mediaType = getAcceptMediaType(exception.getAccept());
        if (mediaType != null) {
            builder.type(mediaType);
            builder.entity(new ViolationReport(exception));
            return builder.build();
        }

        // Default media type.
        builder.type(MediaType.TEXT_PLAIN);
        builder.entity(exception.toString());
        return builder.build();
    }

    protected String unwrapException(Throwable t) {
        StringBuffer sb = new StringBuffer();
        doUnwrapException(sb, t);
        return sb.toString();
    }

    private void doUnwrapException(StringBuffer sb, Throwable t) {
        if (t == null) {
            return;
        }
        sb.append(t.toString());
        if (t.getCause() != null && t != t.getCause()) {
            sb.append('[');
            doUnwrapException(sb, t.getCause());
            sb.append(']');
        }
    }

    private MediaType getAcceptMediaType(List<MediaType> accept) {
        Iterator<MediaType> it = accept.iterator();
        while (it.hasNext()) {
            MediaType mt = it.next();
            /*
             * application/xml media type causes an exception:
             * org.jboss.resteasy.core.NoMessageBodyWriterFoundFailure: Could not find MessageBodyWriter for response
             * object of type: org.jboss.resteasy.api.validation.ViolationReport of media type: application/xml
             */
            /*if (MediaType.APPLICATION_XML_TYPE.getType().equals(mt.getType())
                    && MediaType.APPLICATION_XML_TYPE.getSubtype().equals(mt.getSubtype())) {
                return MediaType.APPLICATION_XML_TYPE;
            }*/
            if (MediaType.APPLICATION_JSON_TYPE.getType().equals(mt.getType())
                    && MediaType.APPLICATION_JSON_TYPE.getSubtype().equals(mt.getSubtype())) {
                return MediaType.APPLICATION_JSON_TYPE;
            }
        }
        return null;
    }
}
```

The above example is an implementation of the `ExceptionMapper` interface which maps exceptions of the type `ValidationException`. This exception is thrown by the Validator implementation when the validation fails. If the exception is an instance of `ResteasyViolationException` we send a `ViolationReport` in the response in addition to HTTP 400/500 status code. This ensures that the client receives a formatted response instead of just the exception being propagated from the resource.

The produced output looks just like the following (in JSON format):

```json
{
    "exception": null,
    "fieldViolations": [],
    "propertyViolations": [],
    "classViolations": [],
    "parameterViolations": [
        {
            "constraintType": "PARAMETER",
            "path": "getPerson.id",
            "message": "The id must be a valid number",
            "value": "test"
        }
    ],
    "returnValueViolations": []
}
```

## Running and testing

To run the application used for this article, build the project with Maven, deploy it into a WildFly 8 application server, and point your browser to [http://localhost:8080/jaxrs-beanvalidation-javaee7/](http://localhost:8080/jaxrs-beanvalidation-javaee7/).

Alternatively, you can run the tests from the class `PersonsIT` which are built with [Arquillian](http://arquillian.org/) and [JUnit](http://junit.org/). Arquillian will start an embedded WildFly 8 container automatically, so make sure you do not have another server running on the same ports.

## Suggestions and improvements

1. We are dependent on application server code in order to implement a custom Validator provider. On GlassFish 4 `ContextResolver<ValidationConfig>` needs to be implemented, while on WildFly 8 we need to implement `ContextResolver<GeneralValidator>`. Why not defined an interface on the Java EE 7 spec that both `ValidationConfig` and `GeneralValidator` must implement instead of relying on the application server specific code?

2. Make WildFly 8 Embedded easier to use and configure with Maven. Currently, for it to be available to Arquillian, one needs to download the WildFly distribution (org.wildfly:wildfly-dist), unzip it into the `target` folder, and configure the system properties on Surefire/Failsafe Maven plugins:

    ```xml
    <systemPropertyVariables>
        <java.util.logging.manager>org.jboss.logmanager.LogManager</java.util.logging.manager>
        <jboss.home>${wildfly.home}</jboss.home>
        <module.path>${wildfly.home}/modules</module.path>
    </systemPropertyVariables>
    ```

    Whereas for Glassfish you just need to define the correct dependency (org.glassfish.main.extras:glassfish-embedded-all).

3. Make RESTEasy a transitive dependency of WildFly Embedded. Having all the WildFly modules available on compile time just by defining a `provided` WildFly Embedded dependency would be a nice productive boost.

4. It is currently not possible to use the option `Run As` >> `JUnit Test` on Eclipse since a system property named `jbossHome` must exist. This property is not read from Surefire/Failsafe configuration by Eclipse. Is there a workaround for this?

5. When using RESTEasy default implementation of `ExceptionMapper<ValidationException>`, requesting the data in `application/xml` media type and having validation errors,  will throw the following exception:

    ```
    org.jboss.resteasy.core.NoMessageBodyWriterFoundFailure:
        Could not find MessageBodyWriter for response object of type:
            org.jboss.resteasy.api.validation.ViolationReport of media type:
                application/xml
    ```

    <ins datetime="2014-04-28">
      **Update:** issue [RESTEASY-1054](https://issues.jboss.org/browse/RESTEASY-1054) created by [Ron Sigal](https://community.jboss.org/people/ron_sigal).
    </ins>
