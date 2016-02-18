---
title: JBoss - Stacking Login Modules
date: 2007-05-27 20:43:53+00:00
slug: jboss-stacking-login-modules
categories:
  - Server-side
tags:
  - Java
  - JBoss
  - Security
---

Sometimes no single login module is enough to meet our needs. Imagine the case of using an external LDAP server to provide the user authentication and a database server to provide the user authorization. A user would be in one repository or the other, and login should succeed if the user is found in either repository.

JBoss allows you to specify multiple login modules for a single security domain. But simple module stacking doesn't resolve the problem on its own. For that, you need to use password stacking.

Password stacking allows modules to skip the actual authentication and to provide supplemental roles. The modules require the `password-stacking` option to `useFirstPass` for this to work.

```xml
<application-policy name="myRealm">
  <authentication>
    <login-module code="org.jboss.security.auth.spi.LdapLoginModule" flag="optional">
      <module-option name="password-stacking">useFirstPass</module-option>
      <module-option name="java.naming.factory.initial">com.sun.jndi.ldap.LdapCtxFactory</module-option>
      <module-option name="java.naming.provider.url">ldap://LDAP_SERVER:LDAP_PORT/</module-option>
      <module-option name="java.naming.security.authentication">simple</module-option>
      <module-option name="principalDNPrefix">MY_DOMAIN</module-option>
    </login-module>
    <login-module code="org.jboss.security.auth.spi.DatabaseServerLoginModule" flag="required">
      <module-option name="password-stacking">useFirstPass</module-option>
      <module-option name="dsJndiName">java:myDS</module-option>
      <module-option name="principalsQuery">SELECT passwd FROM user WHERE login = ?</module-option>
      <module-option name="rolesQuery">SELECT role, 'Roles' FROM user_roles r, user u WHERE u.userid = r.userid AND u.login = ?</module-option>
    </login-module>
  </authentication>
</application-policy>
```

The option `principals` query is optional; it's a fallback in the case the authentication fails in the LDAP server. Notice that the LDAP configuration omits the `roles` query option set so the authorization is only provided by the database server module.
