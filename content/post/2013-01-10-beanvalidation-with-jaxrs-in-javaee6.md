---
title: Integrating Bean Validation with JAX-RS in Java EE 6
date: 2013-01-10 16:07:40+00:00
slug: beanvalidation-with-jaxrs-in-javaee6
categories:
  - Server-side
tags:
  - Bean Validation
  - Internationalization
  - Java
  - JAX-RS
  - JBoss
---

_This article was first published on [Java Advent Calendar](http://www.javaadvent.com/2012/12/jax-rs-bean-validation-error-message-internationalization.html)._

## Introduction to Bean Validation

> JavaBeans Validation (Bean Validation) is a new validation model available as part of Java EE 6 platform. The Bean Validation model is supported by constraints in the form of annotations placed on a field, method, or class of a JavaBeans component, such as a managed bean.

Several built-in constraints are available in the `javax.validation.constraints` package. [The Java EE 6 Tutorial](http://docs.oracle.com/javaee/6/tutorial/doc/gircz.html#gkagk) lists all the built-in constraints.

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

JAX-RS 1.0 provides great support for extracting request values and binding them into Java fields, properties and parameters using annotations such as `@HeaderParam`, `@QueryParam`, etc. It also supports binding of request entity bodies into Java objects via non-annotated parameters (i.e., parameters that are not annotated with any of the JAX-RS annotations). Currently, any additional validation on these values in a resource class must be performed programmatically.

The next release, JAX-RS 2.0, includes a proposal to enable validation annotations to be combined with JAX-RS annotations. For example, given the validation annotation `@Pattern`, the following example shows how form parameters could be validated.

<!--more-->

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

However, at the moment, the only solution is to use a proprietary implementation. What is presented next is a solution based on the [RESTEasy](http://www.jboss.org/resteasy) framework from JBoss that complies with the JAX-RS specification and adds a RESTful validation interface through the annotation `@ValidateRequest`.

The exported interface allows us to create our own implementation. However, there is already one widely used and to which RESTEasy also provides a seamless integration. This implementation is [Hibernate Validator](http://www.hibernate.org/subprojects/validator.html).
This provider can be added to the project through the following Maven dependencies:

```xml
<dependency>
    <groupId>org.jboss.resteasy</groupId>
    <artifactId>resteasy-jaxrs</artifactId>
    <version>2.3.2.Final</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>org.jboss.resteasy</groupId>
    <artifactId>resteasy-hibernatevalidator-provider</artifactId>
    <version>2.3.2.Final</version>
</dependency>
```

**Note:** without declaring the `@ValidateRequest` at class or method level, no validation will occur despite having applied constraint annotations on the method arguments.

```java
@GET
@Path("{id}")
@ValidateRequest
public Person getPerson(
        @PathParam("id")
        @Pattern(regexp = "[0-9]+", message = "The id must be a valid number")
        String id) {
    return persons.get(id);
}
```

After applying the annotation, the parameter `id` will be automatically validated when a request is made.

You can of course validate entire entities instead of single fields by using the annotation `@Valid`.

We could for example have one method that accepts a `Person` object and validates it.

```java
@POST
@Path("/validate")
@ValidateRequest
public Response validate(@Valid Person person) {
    // ...
}
```

**Note:** By default, when validation fails an exception is thrown by the container and a HTTP 500 status is returned to the client. This default behavior can/should be overridden, allowing us to customize the Response that is returned to the client through exception mappers.

## Internationalization

Until now we have been using the default or hard-coded error messages, but this is both a bad practice and not flexible at all. I18n is part of the Bean Validation specification and allows us to specify custom error messages using a resource property file. The default resource file name is `ValidationMessages.properties` and must include pairs of properties/values like:

```ini
person.id.pattern=The person id must be a valid number
person.name.size=The person name must be between {min} and {max} chars long
```

**Note:** `{min}`, `{max}` refer to properties of the constraint to which the message will be associated with.

Those defined messages can then be injected on the validation constraints as:

```java
@POST
@Path("create")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response createPerson(
        @FormParam("id")
        @Pattern(regexp = "[0-9]+", message = "{person.id.pattern}")
        String id,
        @FormParam("name")
        @Size(min = 2, max = 50, message = "{person.name.size}")
        String name) {
    Person person = new Person();
    person.setId(Integer.valueOf(id));
    person.setName(name);
    persons.put(Integer.valueOf(id), person);
    return Response.status(Response.Status.CREATED).entity(person).build();
}
```

To provide translations to other languages, one must create a new `ValidationMessages_XX.properties` file with the translated messages, where `XX` is the code of the language being provided.

Unfortunately Hibernate Validator provider doesn't support i18n based on a specific HTTP request. It does not take `Accept-Language` HTTP header into account and always uses the default `Locale` as provided by `Locale.getDefault()`. To be able to change the `Locale` using the `Accept-Language` HTTP header (e.g., changing the language in the browser options), a custom implementation must be provided.

### Custom validator provider

The code below intends to address this issue and has been tested with [JBoss AS 7.1](http://www.jboss.org/jbossas/).

The first thing to do is to remove the Maven `resteasy-hibernatevalidator-provider` dependency, since we are providing our own provider, and add Hibernate Validator dependency:

```xml
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>4.2.0.Final</version>
</dependency>
```

Next create a custom message interpolator to adjust the default `Locale` used.

```java
public class LocaleAwareMessageInterpolator extends
        ResourceBundleMessageInterpolator {

    private Locale defaultLocale = Locale.getDefault();

    public void setDefaultLocale(Locale defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

    @Override
    public String interpolate(final String messageTemplate,
            final Context context) {
        return interpolate(messageTemplate, context, defaultLocale);
    }

    @Override
    public String interpolate(final String messageTemplate,
            final Context context, final Locale locale) {
        return super.interpolate(messageTemplate, context, locale);
    }
}
```

The next step is to provide a `ValidatorAdapter`. This interface was introduced to decouple RESTEasy from the real validation API.

```java
public class RESTValidatorAdapter implements ValidatorAdapter {

    private final Validator validator;

    private final MethodValidator methodValidator;

    private final LocaleAwareMessageInterpolator interpolator = new LocaleAwareMessageInterpolator();

    public RESTValidatorAdapter() {
        Configuration<?> configuration = Validation.byDefaultProvider()
                .configure();
        this.validator = configuration.messageInterpolator(interpolator)
                .buildValidatorFactory().getValidator();
        this.methodValidator = validator.unwrap(MethodValidator.class);
    }

    @Override
    public void applyValidation(Object resource, Method invokedMethod,
            Object[] args) {
        // For the i8n to work, the first parameter of the method being validated must be a HttpHeaders
        if ((args != null) && (args[0] instanceof HttpHeaders)) {
            HttpHeaders headers = (HttpHeaders) args[0];
            List<Locale> acceptedLanguages = headers.getAcceptableLanguages();
            if ((acceptedLanguages != null) && (!acceptedLanguages.isEmpty())) {
                interpolator.setDefaultLocale(acceptedLanguages.get(0));
            }
        }

        ValidateRequest resourceValidateRequest = FindAnnotation
                .findAnnotation(invokedMethod.getDeclaringClass()
                        .getAnnotations(), ValidateRequest.class);

        if (resourceValidateRequest != null) {
            Set<ConstraintViolation<?>> constraintViolations = new HashSet<ConstraintViolation<?>>(
                    validator.validate(resource,
                            resourceValidateRequest.groups()));

            if (constraintViolations.size() > 0) {
                throw new ConstraintViolationException(constraintViolations);
            }
        }

        ValidateRequest methodValidateRequest = FindAnnotation.findAnnotation(
                invokedMethod.getAnnotations(), ValidateRequest.class);
        DoNotValidateRequest doNotValidateRequest = FindAnnotation
                .findAnnotation(invokedMethod.getAnnotations(),
                        DoNotValidateRequest.class);

        if ((resourceValidateRequest != null || methodValidateRequest != null)
                && doNotValidateRequest == null) {
            Set<Class<?>> set = new HashSet<Class<?>>();
            if (resourceValidateRequest != null) {
                for (Class<?> group : resourceValidateRequest.groups()) {
                    set.add(group);
                }
            }

            if (methodValidateRequest != null) {
                for (Class<?> group : methodValidateRequest.groups()) {
                    set.add(group);
                }
            }

            Set<MethodConstraintViolation<?>> constraintViolations = new HashSet<MethodConstraintViolation<?>>(
                    methodValidator.validateAllParameters(resource,
                            invokedMethod, args,
                            set.toArray(new Class<?>[set.size()])));

            if (constraintViolations.size() > 0) {
                throw new MethodConstraintViolationException(
                        constraintViolations);
            }
        }
    }
}
```

**Warn:** `@HttpHeaders` needs to be injected as the first parameter of the methods that are going to be validated:

```java
@POST
@Path("create")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public Response createPerson(
        @Context HttpHeaders headers,
        @FormParam("id")
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

Finally, create the provider that will select the classes above to be used to validate Bean Validation constraints:

```java
@Provider
public class RESTValidatorContextResolver implements
        ContextResolver<ValidatorAdapter> {

    private static final RESTValidatorAdapter adapter = new RESTValidatorAdapter();

    @Override
    public ValidatorAdapter getContext(Class<?> type) {
        return adapter;
    }
}
```

## Mapping Exceptions

The Bean Validation API reports error conditions using exceptions of type `javax.validation.ValidationException` or any of its subclasses. Applications can supply custom exception mapping providers for any exception. A JAX-RS implementation MUST always use the provider whose generic type is the nearest superclass of the exception, with application-defined providers taking precedence over built-in providers.

The exception mapper may look like:

```java
@Provider
public class ValidationExceptionMapper implements
        ExceptionMapper<MethodConstraintViolationException> {

    @Override
    public Response toResponse(MethodConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<String, String>();
        for (MethodConstraintViolation<?> methodConstraintViolation : ex
                .getConstraintViolations()) {
            errors.put(methodConstraintViolation.getParameterName(),
                    methodConstraintViolation.getMessage());
        }
        return Response.status(Status.PRECONDITION_FAILED).entity(errors)
                .build();
    }
}
```

The above example shows the implementation of an `ExceptionMapper` that maps exceptions of type `MethodConstraintViolationException`. This exception is thrown by Hibernate Validator implementation when the validation of one or more parameters of a method annotated with the `@ValidateRequest` fails. This ensures that the client receives a formatted response instead of just the exception being propagated from the resource.

## Source code

The source code used for this post is available on [GitHub](https://github.com/samaxes/jaxrs-beanvalidation-javaee6).

**Warn:** rename the resource property file `ValidationMessages.properties` (i.e., without any suffix) to map to the `Locale` as returned by `Locale.getDefault()`.
