---
title: "Stripes framework and jQuery: AJAX forms and HTTP Session Validation"
date: 2008-10-23 14:03:42+00:00
slug: stripes-and-jquery-ajax-forms-and-http-session-validation
categories:
- Server-side
tags:
- AJAX
- Java
- JavaScript
- jQuery
- Stripes Framework
---

_This example was greatly inspired by the [Stripes and jQuery AJAX Forms](http://www.stripesbook.com/blog/index.php?/archives/3-Stripes-and-jQuery-AJAX-Forms.html) article from Freddy Daoud, but with some nice improvements_

Last week I was working on a new Stripes / AJAX example. It involves having a table listing entities, being the last row of the table a form for adding new ones.
The form gets submitted via AJAX, using jQuery, and the response is validated in order to check if the HTTP session is still valid.

If everything is OK, the list is refreshed and a success message appears. On the other hand, if validation errors occur, the list is refreshed and an error message appears.
Also, if the user's session has expired on the server, an alert is shown to inform the user that his session is invalid, and the page is reloaded so the user can login once more.

<!--more-->

The initial page looks like this:

`ajax-example.jsp`

```jsp
<%@ include file="../../includes/taglibs.jsp" %>
<html>
    <head>
        <title><fmt:message key="example.title" /></title>
    </head>
    <body>
        <div id="listing">
            <c:import url="ajax-form.jsp"></c:import>
        </div>
    </body>
</html>
```

The page containing the form:

`ajax-form.jsp`

```jsp
<%@ include file="../../includes/taglibs.jsp" %>
<s:form beanclass="com.samaxes.framework.presentation.action.example.AjaxExampleActionBean" method="post"
        focus="exampleEntity.id">
    <s:errors/>
    <s:messages/>
    <table border="1" cellspacing="0" cellpadding="2">
        <thead>
            <tr>
                <th><fmt:message key="example.id" /></th>
                <th><fmt:message key="example.name" /></th>
                <th><fmt:message key="example.description" /></th>
                <th><fmt:message key="example.action" /></th>
            </tr>
        </thead>
        <tbody>
            <c:forEach items="${actionBean.exampleEntities}" var="exampleEntity">
                <tr>
                    <td>${exampleEntity.id}</td>
                    <td>${exampleEntity.name}</td>
                    <td>${exampleEntity.description}</td>
                    <td>
                      [<s:link beanclass="com.samaxes.framework.presentation.action.example.AjaxExampleActionBean"
                             event="ajaxRemove" class="ajaxRemove">
                        <s:param name="id">${exampleEntity.id}</s:param>
                        <fmt:message key="example.remove" />
                      </s:link>]
                     </td>
                </tr>
            </c:forEach>
            <tr>
                <td><s:text name="exampleEntity.id" size="30" maxlength="5" /></td>
                <td><s:text name="exampleEntity.name" size="30" maxlength="30" /></td>
                <td><s:textarea name="exampleEntity.description" rows="3" cols="30"></s:textarea></td>
                <td><s:submit id="ajaxSave" name="ajaxSave" /></td>
            </tr>
        </tbody>
    </table>
</s:form>
<script>
    $('a.ajaxRemove').click(function(e) {
        e.preventDefault();
        var href = this.href;
        var xhr = $.get(this.href, null, function(data) {
            if (xhr.getResponseHeader('Stripes-Success') == "OK") {
                $('#listing').html(data);
            } else {
                alert("Session has expired!");
                window.location.reload(true);
            }
        });
    });

    $('input#ajaxSave').click(function(e) {
        e.preventDefault();
        var action = this.form.action + '?_eventName=' + this.name;
        var params = $(this.form).serialize();
        var xhr = $.post(action, params, function(data) {
            if (xhr.getResponseHeader('Stripes-Success') == "OK") {
                $('#listing').html(data);
            } else {
                alert("Session has expired!");
                window.location.reload(true);
            }
        });
    });
</script>
```

The Action Bean is pretty standard:

`AjaxExampleActionBean.java`

```java
package com.samaxes.framework.presentation.action.example;

import java.util.Collection;

import javax.naming.NamingException;

import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.DontValidate;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.LocalizableMessage;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.security.action.Secure;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;

import com.samaxes.framework.business.ExampleService;
import com.samaxes.framework.business.exception.ExampleBusinessException;
import com.samaxes.framework.entities.ExampleEntity;
import com.samaxes.framework.presentation.FrameworkActionBeanContext;
import com.samaxes.stripes.integration.ejb.EJBBean;

/**
 * Example Action Bean.
 *
 * @author Samuel Santos
 * @version $Revision$
 */
public class AjaxExampleActionBean implements ActionBean {

    private FrameworkActionBeanContext context;

    private Collection<exampleEntity> exampleEntities;

    @ValidateNestedProperties({
        @Validate(field = "id", on = { "ajaxSave" }, required = true, maxlength = 5),
        @Validate(field = "name", on = { "ajaxSave" }, required = true, maxlength = 30),
        @Validate(field = "description", on = { "ajaxSave" }, required = true)
    })
    private ExampleEntity exampleEntity;

    @Validate(on = { "ajaxRemove" }, required = true)
    private String id;

    private ExampleService exampleService;

    public FrameworkActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = (FrameworkActionBeanContext) context;
    }

    public Collection<exampleEntity> getExampleEntities() {
        return exampleEntities;
    }

    public ExampleEntity getExampleEntity() {
        return exampleEntity;
    }

    public void setExampleEntity(ExampleEntity exampleEntity) {
        this.exampleEntity = exampleEntity;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @EJBBean
    public void setExampleService(ExampleService exampleService) {
        this.exampleService = exampleService;
    }

    /**
     * Goes to the AJAX example list page.
     *
     * @return Resolution
     * @throws NamingException
     */
    @DefaultHandler
    @DontValidate
    public Resolution main() {
        return new ForwardResolution("/WEB-INF/example/ajax-example.jsp");
    }

    /**
     * Saves a new example entity using AJAX.
     *
     * @return Resolution
     * @throws ExampleBusinessException
     */
    @Secure(roles = "frameworkadmin,frameworkadmin2")
    public Resolution ajaxSave() throws ExampleBusinessException {
        exampleService.insertExampleEntity(exampleEntity);

        context.getMessages().add(new LocalizableMessage("example.saved", exampleEntity.getId()));

        return new ForwardResolution("/WEB-INF/example/ajax-form.jsp");
    }

    /**
     * Removes an example entity using AJAX.
     *
     * @return Resolution
     * @throws ExampleBusinessException
     */
    @Secure(roles = "frameworkadmin")
    public Resolution ajaxRemove() throws ExampleBusinessException {
        exampleService.deleteExampleEntity(id);

        context.getMessages().add(new LocalizableMessage("example.removed", id));

        return new ForwardResolution("/WEB-INF/example/ajax-form.jsp");
    }

    /**
     * Fills all the needed data from the DB.
     */
    @Before(stages = { LifecycleStage.BindingAndValidation })
    public void fillData() {
        exampleEntities = exampleService.getExampleEntities();
        context.getResponse().setHeader("Stripes-Success", "OK");
    }

    /**
     * Refills all the needed data from the DB when ajaxSave or ajaxRemove events are successfully executed.
     */
    @After(stages = { LifecycleStage.EventHandling }, on = { "!ajax" })
    public void fillAjaxData() {
        exampleEntities = exampleService.getExampleEntities();
    }
}
```

As you can see the Action Bean includes `@Validate` annotations. This means that invalid input in the form will cause validation errors. Without doing anything, the default Stripes behavior will return to `ajax-form.jsp` with error messages instead of executing the `ajaxSave` or `ajaxRemove` methods.
Similary when these methods are successfully executed the default Stripes behavior is to return to `ajax-form.jsp` with the success messages.

But what if the user's HTTP session has expired? You don't want the server to return your login page instead of the `ajax-form.jsp`.
That's why you have to validate it before adding the data returned by the server to you page. To do this a validation is made in each AJAX request:

```js
if (xhr.getResponseHeader('Stripes-Success') == "OK") {
    $('#listing').html(data);
} else {
    alert("Session has expired!");
    window.location.reload(true);
}
```

It validates that the response has a `Stripes-Success` header with the value OK.

This header is added in the following method in the Action Bean:

```java
@Before(stages = { LifecycleStage.BindingAndValidation })
public void fillData() {
    exampleEntities = exampleService.getExampleEntities();
    context.getResponse().setHeader("Stripes-Success", "OK");
}
```

In this example, validation errors and success messages show up correctly. Using this solution is not only easier than returning JSON data and construct the HTML in JavaScript, but it also makes possible to easily enable the page to degrade gracefully.
