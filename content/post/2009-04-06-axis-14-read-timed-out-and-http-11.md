---
title: Axis 1.4 Read timed out and HTTP 1.1
date: 2009-04-06 15:03:24+00:00
slug: axis-14-read-timed-out-and-http-11
categories:
  - Server-side programming
tags:
  - Axis
  - Java
---

For those getting a `SocketTimeoutException` when calling an Axis 1.4 Web Service.
This may be a solution for your problem.

<!--more-->

If your log show an error similar to this:

```text
12:38:51,693 ERROR [TerminalSessionHelper] ; nested exception is:
  java.net.SocketTimeoutException: Read timed out
AxisFault
 faultCode: {http://schemas.xmlsoap.org/soap/envelope/}Server.userException
 faultSubcode:
 faultString: java.net.SocketTimeoutException: Read timed out
 faultActor:
 faultNode:
 faultDetail:
  {http://xml.apache.org/axis/}stackTrace:java.net.SocketTimeoutException: Read timed out
...
```

And your call looks like this:

```java
TerminalSessionService terminalSessionService = new TerminalSessionServiceLocator();

TerminalSession_PortType terminalSession_PortType = terminalSessionService.getTerminalSession();

((TerminalSessionSOAPBindingStub) terminalSession_PortType).setTimeout(15000);
```

Try to use `CommonsHTTPSender` as the Transport Sender of the Axis client:

```java
BasicClientConfig basicClientConfig = new BasicClientConfig();
SimpleChain simpleChain = new SimpleChain();

simpleChain.addHandler(new CommonsHTTPSender());
basicClientConfig.deployTransport("http", simpleChain);

TerminalSessionService terminalSessionService = new TerminalSessionServiceLocator(basicClientConfig);

TerminalSession_PortType terminalSession_PortType = terminalSessionService.getTerminalSession();

((TerminalSessionSOAPBindingStub) terminalSession_PortType).setTimeout(15000);
```

This also has the advantage to use HTTP 1.1 instead of HTTP 1.0.

**Note:** You will need to add the `common-httpclient.jar` and `common.codec.jar` to the jar directory for this to work.

Still want to use HTTP 1.0? No problem, just add the following line of code:

```java
((TerminalSessionSOAPBindingStub) terminalSession_PortType)._setProperty(
        MessageContext.HTTP_TRANSPORT_VERSION, HTTPConstants.HEADER_PROTOCOL_V10);
```

Hope this can save your time. Axis can be really painful...
