---
title: JBoss PojoCache configuration
date: 2009-03-17 15:17:01+00:00
slug: jboss-pojocache-configuration
categories:
  - Server-side
tags:
  - Cache
  - Java
  - JBoss
---

Everyone knows that documentation is not one of JBoss strengths.
This article is meant to fill this gap. It describes and exemplifies how to configure JBoss PojoCache as a MBean service, using loadtime transformations with JBossAop framework, so you don't need precompiled instrumentation.

<!--more-->

## Introduction

This section gives you an introduction about PojoCache and its advantages over TreeCache (a plain cache system).

> PojoCache is an in-memomy, transactional, and replicated POJO (plain old Java object) cache system that allows users to operate on a POJO transparently without active user management of either replication or persistency aspects. PojoCache, a component of JBossCache (uses PojoCache class as an internal implementation, the old implementation TreeCacheAop has been deprecated.), is the first in the market to provide a POJO cache functionality. JBossCache by itself is a 100% Java based library that can be run either as a standalone program or inside an application server.

TreeCache limitations:

> * Users will have to manage the cache specifically; e.g., when an object is updated, a user will need a corresponding API call to update the cache content.
> * If the object size is huge, even a single field update would trigger the whole object serialization. Thus, it can be unnecessarily expensive.
> * The object structure can not have a graph relationship. That is, the object can not have sub-objects that are shared (multiple referenced) or referenced to itself (cyclic). Otherwise, the relationship will be broken upon serialization.

PojoCache advantages:

> * No need to implement Serializable interface for the POJOs.
> * Replication (or even persistency) is done on a per-field basis (as opposed to the whole object binary level).
> * The object relationship and identity are preserved automatically in a distributed, replicated environment. It enables transparent usage behavior and increases software performance.

## Use case

We had a project at [Present Technologies](http://www.present-technologies.com/) where we needed to load small amounts of information from external resources and save it during short periods of time.
This information was read-only and could have a lot of concurrent read accesses. So we wanted a solution that was simpler, faster, and more scalable than saving the data in a traditional database.

Some thoughts we had before choosing PojoCache:

* The amount of information was really small, so keeping it in memory wasn't a problem.
* Since this data was mainly read-only, replication to other nodes wouldn't kill our network.
* We needed the object relationships and identities to be preserved automatically in a distributed, replicated environment. PojoCache enables transparent usage behavior and increases software performance.

So the idea was simple. When JBoss AS starts and every once in a while, a service (PojoCache MBean) will kick in, retrieve the data from the external resources, and put it into the cache. As soon as the transaction commits the cache is replicated to all the other nodes in the cluster.

## Requirements

This article is targeted to JBossCache version 1.4.1 "_Cayenne_", which comes bundle with JBoss AS 4.2.3, and to JDK 5.

## Configuration

How to configure PojoCache as a MBean service:

1. ### JBoss Cache with Java 5 annotations

    Copy the jar file `jboss-cache-jdk50.jar` from `<JBOSS_HOME>/server/all/lib` to `<JBOSS_HOME>/server/default/lib`.

2. ### PojoCache MBean service configuration

    Download the configuration file bellow into the folder `<JBOSS_HOME>/server/default/deploy`.

    `example-pojocache-service.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <server>
        <mbean code="org.jboss.cache.aop.PojoCache" name="jboss.cache:service=PojoCache">
            <depends>jboss:service=TransactionManager</depends>
            <!-- Configure the TransactionManager -->
            <attribute name="TransactionManagerLookupClass">org.jboss.cache.JBossTransactionManagerLookup</attribute>

            <!-- Isolation level : SERIALIZABLE
                                   REPEATABLE_READ (default)
                                   READ_COMMITTED
                                   READ_UNCOMMITTED
                                   NONE
            -->
            <attribute name="IsolationLevel">REPEATABLE_READ</attribute>

            <!-- Valid modes are LOCAL, REPL_ASYNC and REPL_SYNC -->
            <attribute name="CacheMode">REPL_SYNC</attribute>

            <!-- Just used for async repl: use a replication queue -->
            <attribute name="UseReplQueue">false</attribute>

            <!-- Replication interval for replication queue (in ms) -->
            <attribute name="ReplQueueInterval">0</attribute>

            <!-- Max number of elements which trigger replication -->
            <attribute name="ReplQueueMaxElements">0</attribute>

            <!-- Name of cluster. Needs to be the same for all clusters, in order to find each other -->
            <attribute name="ClusterName">TreeCache-Cluster</attribute>

            <!-- JGroups protocol stack properties. Can also be a URL, e.g. file:/home/bela/default.xml
                 <attribute name="ClusterProperties"></attribute> -->
            <attribute name="ClusterConfig">
                <config>
                    <!-- UDP: if you have a multihomed machine,
                         set the bind_addr attribute to the appropriate NIC IP address, e.g bind_addr="192.168.0.2"
                    -->
                    <!-- UDP: On Windows machines, because of the media sense feature
                         being broken with multicast (even after disabling media sense)
                         set the loopback attribute to true
                    -->
                    <udp mcast_addr="228.1.2.3" mcast_port="48866" ip_ttl="64" ip_mcast="true" mcast_send_buf_size="150000" mcast_recv_buf_size="80000" ucast_send_buf_size="150000" ucast_recv_buf_size="80000" loopback="false" />
                    <ping timeout="2000" num_initial_members="3" up_thread="false" down_thread="false" />
                    <merge2 min_interval="10000" max_interval="20000" />
                    <fd_SOCK />
                    <verify_SUSPECT timeout="1500" up_thread="false" down_thread="false" />
                    <pbcast.NAKACK gc_lag="50" retransmit_timeout="600,1200,2400,4800" max_xmit_size="8192" up_thread="false" down_thread="false" />
                    <unicast timeout="600,1200,2400" window_size="100" min_threshold="10" down_thread="false" />
                    <pbcast.STABLE desired_avg_gossip="20000" up_thread="false" down_thread="false" />
                    <frag frag_size="8192" down_thread="false" up_thread="false" />
                    <pbcast.GMS join_timeout="5000" join_retry_timeout="2000" shun="true" print_local_addr="true" />
                    <pbcast.STATE_TRANSFER up_thread="true" down_thread="true" />
                </config>
            </attribute>

            <!-- Whether or not to fetch state on joining a cluster -->
            <attribute name="FetchStateOnStartup">true</attribute>

            <!-- The max amount of time (in milliseconds) we wait until the
                 initial state (ie. the contents of the cache) are retrieved from
                 existing members in a clustered environment
            -->
            <attribute name="InitialStateRetrievalTimeout">5000</attribute>

            <!-- Number of milliseconds to wait until all responses for a synchronous call have been received. -->
            <attribute name="SyncReplTimeout">15000</attribute>

            <!-- Max number of milliseconds to wait for a lock acquisition -->
            <attribute name="LockAcquisitionTimeout">10000</attribute>

            <!-- Name of the eviction policy class. -->
            <attribute name="EvictionPolicyClass" />
        </mbean>
    </server>
    ```

    **Notes:**

    * This XML file was taken from [PojoCache User Documentation for Release 1.4.1 "_Cayenne_"](http://docs.jboss.org/jbosscache/1.4.1.SP4/PojoCache/en/html_single/index.html#xml).
    * A lot more examples can be found in the folder `etcMETA-INF` present in the [JBoss Cache releases](http://www.jboss.org/community/docs/DOC-12844).

3. ### Loadtime Instrumentation

    Copy the jar file `pluggable-instrumentor.jar` from `<JBOSS_HOME>/server/default/deploy/jboss-aop-jdk50.deployer` to `<JBOSS_HOME>/bin`.

4. ### Prepare your POJOs

    Declare your POJOs as "prepared" by adding the type level annotation `@org.jboss.cache.aop.annotation.PojoCacheable` to all that need to be put into cache management.

5. ### AspectManager service configuration

    Edit the `jboss-service.xml` file in `<JBOSS_HOME>/server/default/deploy/jboss-aop-jdk50.deployer/META-INF` to enable loadtime transformations.

    `jboss-service.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!-- ===================================================================== -->
    <!--  JBoss Server Configuration                                                                                         -->
    <!-- ===================================================================== -->
    <server>
       <!-- The code for the service is different for the different run scenarios
          *** JBoss 4.0
              * JDK 1.4 - org.jboss.aop.deployment.AspectManagerService
              * JDK 5 (not using -javaagent switch) - org.jboss.aop.deployment.AspectManagerService
              * JDK 5 (using -javaagent switch) - org.jboss.aop.deployment.AspectManagerServiceJDK5
              * BEA JRockit 1.4.2 - org.jboss.aop.deployment.AspectManagerService
          *** JBoss 3.2
              * JDK 1.4 - org.jboss.aop.deployment.AspectManagerService32
              * JDK 5 (not using -javaagent switch) - org.jboss.aop.deployment.AspectManagerService32
              * JDK 5 (using -javaagent switch) - org.jboss.aop.deployment.AspectManagerService32JDK5
              * BEA JRockit 1.4.2 - org.jboss.aop.deployment.AspectManagerService32
       -->
       <mbean code="org.jboss.aop.deployment.AspectManagerServiceJDK5"
          name="jboss.aop:service=AspectManager">
          <attribute name="EnableLoadtimeWeaving">true</attribute>
          <!-- only relevant when EnableLoadtimeWeaving is true.
               When transformer is on, every loaded class gets
               transformed.  If AOP can't find the class, then it
               throws an exception.  Sometimes, classes may not have
               all the classes they reference.  So, the Suppressing
               is needed.  (i.e. Jboss cache in the default configuration -->
          <attribute name="SuppressTransformationErrors">true</attribute>
          <attribute name="Prune">true</attribute>
          <!--attribute name="Include">org.jboss.test, org.jboss.injbossaop</attribute-->
          <attribute name="Include">com.samaxes.example</attribute>
          <attribute name="Exclude">org, com, net, bsh, javassist, antlr, com.arjuna</attribute>
          <!-- This avoids instrumentation of hibernate cglib enhanced proxies
          <attribute name="Ignore">*$$EnhancerByCGLIB$$*</attribute> -->
          <attribute name="Optimized">true</attribute>
          <attribute name="Verbose">false</attribute>
       </mbean>

       <mbean code="org.jboss.aop.deployment.AspectDeployer"
          name="jboss.aop:service=AspectDeployer">
       </mbean>
    </server>
    ```

    Be sure to only include the packages that contains the POJOs to be aspectized and exclude all others.

    **WARNING:** Not doing so can really slowdown your server startup!

6. ### AOP configuration

    Enable your POJOs to be aspectized copying the AOP configuration file bellow to `<JBOSS_HOME>/server/default/deploy`.

    `example-aop.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE aop PUBLIC
           "-//JBoss//DTD JBOSS AOP 1.0//EN"
           "http://labs.jboss.com/portal/jbossaop/dtd/jboss-aop_1_0.dtd">

    <aop>
        <!-- If a POJO has JDK5 PojoCacheable annotation, it will be aspectized. -->
        <prepare expr="field(* @org.jboss.cache.aop.annotation.PojoCacheable->*)" />

        <!-- If a POJO has JDK5 InstanceOfPojoCacheable annotation, it will be aspectized. -->
        <prepare expr="field(* $instanceof{@org.jboss.cache.aop.annotation.InstanceOfPojoCacheable}->*)" />
    </aop>
    ```

7. ### `JAVA_OPTS` environment variable

    Edit `run.sh` or `run.bat` (depending on what OS you're on) and add the following to the `JAVA_OPTS` environment variable:
        `set JAVA_OPTS=%JAVA_OPTS% -javaagent:pluggable-instrumentor.jar`.

## Usage

How to use and interact with PojoCache.

1. ### Sample POJO

    Create a simple POJO.

    `Person.java`

    ```java
    package com.samaxes.example;

    import org.jboss.cache.aop.annotation.PojoCacheable;

    @PojoCacheable
    public class Person {
        private String firstName;

        private String lastName;

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }
    ```

2. ### Cache Helper Singleton

    Create a singleton to interact with PojoCache.

    `CacheHelper.java`

    ```java
    package com.samaxes.example;

    import javax.management.MBeanServer;
    import javax.management.MalformedObjectNameException;

    import org.jboss.cache.aop.PojoCacheMBean;
    import org.jboss.mx.util.MBeanProxyExt;
    import org.jboss.mx.util.MBeanServerLocator;

    public class CacheHelper {
        public static final CacheHelper INSTANCE = new CacheHelper();

        private static PojoCacheMBean pojoCache;

        public PojoCacheMBean getPojoCache() {
            return pojoCache;
        }

        private CacheHelper() {
            try {
                MBeanServer server = MBeanServerLocator.locate();
                pojoCache = (PojoCacheMBean) MBeanProxyExt.create(PojoCacheMBean.class, "jboss.cache:service=PojoCache",
                        server);
            } catch (MalformedObjectNameException e) {
                // log exception...
            }
        }
    }
    ```

    **Note:** This step is optional but it allows to not have duplicated code and to have only one instance of the PojoCache MBean in the application context.

3. ### Using PojoCache

    And that's it! Give it a try.

    ```java
    // Puts Person object into cache management
    CacheHelper.INSTANCE.getPojoCache().putObject("/aop/person", person);

    // Gets Person object from cache
    CacheHelper.INSTANCE.getPojoCache().getObject("/aop/person");
    ```

    Every time you change a Person property, cache will manage its replication or persistency automatically.

    As cited in the introduction, this is done on a per-field basis.

## No MBean support

It's possible to use PojoCache without using MBeans.
The examples available in the [PojoCache User Documentation](http://docs.jboss.org/jbosscache/1.4.1.SP4/PojoCache/en/html_single/index.html) use the following strategy:

```java
cache = new PojoCache();
PropertyConfigurator config = new PropertyConfigurator(); // configure tree cache.
config.configure(cache, "META-INF/replSync-service.xml"); // Search under the classpath
cache.start();
...
cache.stop();
```

## Resources

* [JBoss AOP](http://www.jboss.org/jbossaop/)
* [JBoss Cache](http://www.jboss.org/jbosscache/)
* [PojoCache User Documentation for Release 1.4.1 "_Cayenne_"](http://docs.jboss.org/jbosscache/1.4.1.SP4/PojoCache/en/html_single/index.html)

**Note:** For questions about JBoss technologies please use [JBoss forums](http://www.jboss.org/index.html?module=bb).
