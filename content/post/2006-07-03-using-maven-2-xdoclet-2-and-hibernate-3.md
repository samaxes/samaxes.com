---
title: Using Maven 2, XDoclet 2, and Hibernate 3
date: 2006-07-03 00:53:29+00:00
slug: using-maven-2-xdoclet-2-and-hibernate-3
categories:
  - Server-side
tags:
  - Build
  - Hibernate
  - Java
  - Maven
  - XDoclet
---

**Problem** - You want to use the last [Hibernate 3](http://www.hibernate.org) (Object to Relational Mapping Solution) with a code generation tool that automatically generates your Hibernate descriptor files, and build your project with an advanced build tool like Maven2.

**Solution** - Use [maven2-xdoclet2-plugin](http://xdoclet.codehaus.org/Maven2+plugin).

[Maven](http://maven.apache.org) is a popular open source build tool for enterprise Java projects; it can manage a project's build, reporting and documentation from a central piece of information (POM file).

[XDoclet](http://xdoclet.sourceforge.net) is an open source code generation engine with the goal of continuous integration. It enables **Attribute-Oriented Programming** for java. It uses custom JavaDoc-like tags to generate external resource files to support the main Java classes. XDoclet has mainly been used for the auto-generation of EJB descriptors (and related J2EE container technologies).
[XDoclet2](http://xdoclet.codehaus.org) is a rewrite of the XDoclet engine. It allows you to use Hibernate 3 features, Java5 language features in your model POJOs, and has substantially better error reporting than XDoclet.

<!--more-->

## Configuring Maven2 POM (Project Object Model) file for XDoclet2 Plugin

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.yourdomain.yourprojectname</groupId>
    <artifactId>xdoclet2Example</artifactId>
    <packaging>war</packaging>
    <name>XDoclet 2 Example Application</name>
    <version>1.0-SNAPSHOT</version>
    <build>
        <finalName>xdoclet2Example</finalName>
        <plugins>
            <plugin>
                <groupId>xdoclet</groupId>
                <artifactId>maven2-xdoclet2-plugin</artifactId>
                <version>2.0.5-SNAPSHOT</version>
                <executions>
                    <execution>
                        <id>xdoclet</id>
                        <phase>generate-sources</phase>
                        <goals>
                            <goal>xdoclet</goal>
                        </goals>
                    </execution>
                </executions>
                <dependencies>
                    <dependency>
                        <groupId>xdoclet-plugins</groupId>
                        <artifactId>xdoclet-plugin-hibernate</artifactId>
                        <version>1.0.4-SNAPSHOT</version>
                    </dependency>
                </dependencies>
                <configuration>
                    <configs>
                        <config>
                            <components>
                                <component>
                                    <classname>org.xdoclet.plugin.hibernate.HibernateMappingPlugin</classname>
                                    <params>
                                        <version>3.0</version>
                                        <destdir>${project.build.outputDirectory}</destdir>
                                    </params>
                                </component>
                            </components>
                        </config>
                    </configs>
                </configuration>
            </plugin>
        </plugins>
    </build>
    <pluginRepositories>
        <pluginRepository>
            <id>codehaus-plugins</id>
            <name>Codehaus Plugins</name>
            <url>http://dist.codehaus.org/</url>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
            <releases>
                <enabled>true</enabled>
            </releases>
        </pluginRepository>
        <pluginRepository>
            <id>codehaus-plugins-legacy</id>
            <name>Codehaus Plugins</name>
            <url>http://dist.codehaus.org/</url>
            <layout>legacy</layout>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
            <releases>
                <enabled>true</enabled>
            </releases>
        </pluginRepository>
    </pluginRepositories>
</project>
```

## Adding XDoclet Tags for declaration of Hibernate descriptor files examples

**`Client.java`**

```java
/**
 * Client POJO.
 *
 * @hibernate.class table = "client"
 * @hibernate.cache usage = "read-write"
 */
public class Client implements Serializable {

    private static final long serialVersionUID = -8361595011677919387L;

    /**
     *
     * @hibernate.id    generator-class = "increment"
     *                  column = "clientid"
     */
    private Integer clientId = null;

    /**
     *
     * @hibernate.many-to-one   column = "economicgroupid"
     *                          class = "com.yourdomain.yourprojectname.entities.hibernate.EconomicGroup"
     *                          foreign-key = "fk_client_to_economicgroup"
     *                          cascade = "none"
     *                          not-null = "false"
     *                          lazy = "false"
     */
    private EconomicGroup economicGroup = null;

    /**
     *
     * @hibernate.many-to-one   column = "activitysectorid"
     *                          class = "com.yourdomain.yourprojectname.entities.hibernate.ActivitySector"
     *                          foreign-key = "fk_client_to_activitysector"
     *                          cascade = "none"
     *                          not-null = "false"
     *                          lazy = "false"
     */
    private ActivitySector activitySector = null;

    /**
     *
     * @hibernate.property  column = "name"
     *                      length = "100"
     *                      not-null = "true"
     */
    private String name = null;

    /**
     *
     * @hibernate.property  column = "status"
     *                      not-null = "true"
     */
    private Boolean status = null;

    /**
     *
     * @hibernate.property  column = "changeuserid"
     *                      not-null = "true"
     */
    private Integer changeUserId = null;

    /**
     *
     * @hibernate.property  column = "changedate"
     *                      not-null = "true"
     */
    private Date changeDate = null;

    /**
     *
     * @hibernate.set           inverse = "true"
     *                          cascade = "none"
     *                          lazy = "true"
     *
     * @hibernate.key           column = "clientid"
     * @hibernate.one-to-many   class = "com.yourdomain.yourprojectname.entities.hibernate.Contact"
     */
    private Set contacts = new HashSet();

    /**
     *
     * @hibernate.set           table = "display"
     *                          cascade = "all"
     *                          inverse = "true"
     *                          lazy = "true"
     *
     * @hibernate.key           column = "userid"
     *
     * @hibernate.many-to-many  class = "com.yourdomain.yourprojectname.entities.hibernate.UserProfile"
     *                          column = "clientid"
     */
    private Set userProfiles = new HashSet();

    public ActivitySector getActivitySector() {
        return activitySector;
    }
    public void setActivitySector(ActivitySector activitySector) {
        this.activitySector = activitySector;
    }

    public Date getChangeDate() {
        return changeDate;
    }
    public void setChangeDate(Date changeDate) {
        this.changeDate = changeDate;
    }

    public Integer getChangeUserId() {
        return changeUserId;
    }
    public void setChangeUserId(Integer changeUserId) {
        this.changeUserId = changeUserId;
    }

    public Integer getClientId() {
        return clientId;
    }
    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }

    public EconomicGroup getEconomicGroup() {
        return economicGroup;
    }
    public void setEconomicGroup(EconomicGroup economicGroup) {
        this.economicGroup = economicGroup;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public Boolean getStatus() {
        return status;
    }
    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Set getContacts() {
        return contacts;
    }
    public void setContacts(Set contacts) {
        this.contacts = contacts;
    }

    public Set getUserProfiles() {
        return userProfiles;
    }
    public void setUserProfiles(Set userProfiles) {
        this.userProfiles = userProfiles;
    }
}
```

**`UserProfile.java`**

```java
/**
 * UserProfile POJO.
 *
 * @hibernate.class table = "userprofile"
 * @hibernate.cache usage = "read-write"
 */
public class UserProfile implements Serializable {

    private static final long serialVersionUID = -2103841533469690219L;

    /**
     *
     * @hibernate.id    generator-class = "assigned"
     *                  column = "userid"
     */
    private Integer userId = null;

    /**
     *
     * @hibernate.many-to-one   column = "commercialareaid"
     *                          class = "com.yourdomain.yourprojectname.entities.hibernate.CommercialArea"
     *                          foreign-key = "fk_userprofile_to_commercial"
     *                          cascade = "none"
     *                          not-null = "true"
     *                          lazy = "false"
     */
    private CommercialArea commercialArea = null;

    /**
     *
     * @hibernate.property  column = "status"
     *                      not-null = "true"
     */
    private Boolean status = null;

    /**
     *
     * @hibernate.property  column = "changeuserid"
     *                      not-null = "true"
     */
    private Integer changeUserId = null;

    /**
     *
     * @hibernate.property  column = "changedate"
     *                      not-null = "true"
     */
    private Date changeDate = null;

    /**
     *
     * @hibernate.set           table="display"
     *                          lazy = "true"
     *
     * @hibernate.key           column="clientid"
     *
     * @hibernate.many-to-many  class="com.yourdomain.yourprojectname.entities.hibernate.Client"
     *                          column="userid"
     */
    private Set clients = new HashSet();

    public Date getChangeDate() {
        return changeDate;
    }
    public void setChangeDate(Date changeDate) {
        this.changeDate = changeDate;
    }

    public Integer getChangeUserId() {
        return changeUserId;
    }
    public void setChangeUserId(Integer changeUserId) {
        this.changeUserId = changeUserId;
    }

    public CommercialArea getCommercialArea() {
        return commercialArea;
    }
    public void setCommercialArea(CommercialArea commercialArea) {
        this.commercialArea = commercialArea;
    }

    public Boolean getStatus() {
        return status;
    }
    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Set getClients() {
        return clients;
    }
    public void setClients(Set clients) {
        this.clients = clients;
    }
}
```

The generated files will look like:

**`Client.hbm.xml`**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">

<hibernate-mapping>
    <class table="client"
        name="com.yourdomain.yourprojectname.entities.hibernate.Client">

        <cache usage="read-write"/>

        <id
            column="clientid"
            access="field"
            name="clientId">

            <generator class="increment"/>
        </id>

        <many-to-one
            not-null="false"
            column="economicgroupid"
            foreign-key="fk_client_to_economicgroup"
            lazy="false"
            access="field"
            cascade="none"
            name="economicGroup"
            class="com.yourdomain.yourprojectname.entities.hibernate.EconomicGroup"/>

        <many-to-one
            not-null="false"
            column="activitysectorid"
            foreign-key="fk_client_to_activitysector"
            lazy="false"
            access="field"
            cascade="none"
            name="activitySector"
            class="com.yourdomain.yourprojectname.entities.hibernate.ActivitySector"/>

        <property
            name="name"
            not-null="true"
            length="100"
            access="field"
            column="name"/>

        <property
            name="status"
            not-null="true"
            access="field"
            column="status"/>

        <property
            name="changeUserId"
            not-null="true"
            access="field"
            column="changeuserid"/>

        <property
            name="changeDate"
            not-null="true"
            access="field"
            column="changedate"/>

        <set
            access="field"
            lazy="true"
            inverse="true"
            cascade="none"
            name="contacts">

            <key column="clientid"/>
            <one-to-many
                class="com.yourdomain.yourprojectname.entities.hibernate.Contact"/>
        </set>

        <set
            table="display"
            access="field"
            lazy="true"
            inverse="true"
            cascade="all"
            name="userProfiles">

            <key column="userid"/>
            <many-to-many
                column="clientid"
                class="com.yourdomain.yourprojectname.entities.hibernate.UserProfile"/>
        </set>

    </class>
</hibernate-mapping>
```

**`UserProfile.hbm.xml`**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE hibernate-mapping PUBLIC "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">

<hibernate-mapping>
    <class table="userprofile"
        name="com.yourdomain.yourprojectname.entities.hibernate.UserProfile">

        <cache usage="read-write"/>

        <id
            column="userid"
            access="field"
            name="userId">

            <generator class="assigned"/>
        </id>

        <many-to-one
            not-null="true"
            column="commercialareaid"
            foreign-key="fk_userprofile_to_commercial"
            lazy="false"
            access="field"
            cascade="none"
            name="commercialArea"
            class="com.yourdomain.yourprojectname.entities.hibernate.CommercialArea"/>

        <property
            name="status"
            not-null="true"
            access="field"
            column="status"/>

        <property
            name="changeUserId"
            not-null="true"
            access="field"
            column="changeuserid"/>

        <property
            name="changeDate"
            not-null="true"
            access="field"
            column="changedate"/>

        <set
            table="display"
            access="field"
            lazy="true"
            name="clients">

            <key column="clientid"/>
            <many-to-many
                column="userid"
                class="com.yourdomain.yourprojectname.entities.hibernate.Client"/>
        </set>

    </class>
</hibernate-mapping>
```

You can even generate the database tables automatically. If using [Spring Framework](http://www.springframework.org/) you just need to add the following line to your hibernate properties in the Spring XML configuration file:

```xml
<prop key="hibernate.hbm2ddl.auto">create</prop>
```

or

```xml
<prop key="hibernate.hbm2ddl.auto">update</prop>
```

## Resources

* [An introduction to Maven 2](http://www.javaworld.com/javaworld/jw-12-2005/jw-1205-maven.html)
* [Get the most out of Maven 2 site generation](http://www.javaworld.com/javaworld/jw-02-2006/jw-0227-maven.html)
* [The Maven 2 POM demystified](http://www.javaworld.com/javaworld/jw-05-2006/jw-0529-maven.html)
* [XDoclet2 @hibernate tags](http://xdoclet.codehaus.org/HibernateTags)
