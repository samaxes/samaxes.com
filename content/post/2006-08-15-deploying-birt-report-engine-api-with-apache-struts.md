---
title: Deploying BIRT Report Engine API with Apache Struts
date: 2006-08-15 22:59:55+00:00
slug: deploying-birt-report-engine-api-with-apache-struts
categories:
  - Server-side programming
tags:
  - BIRT
  - Java
  - Reporting
  - Struts
---

After reading the great article [Deploying BIRT](http://www.onjava.com/pub/a/onjava/2006/07/26/deploying-birt.html) from Jason Weathersby I decide to create a little example on how to use BIRT Report Engine API (RE API) with [Apache Struts](http://struts.apache.org/) framework.

<!--more-->

To do so I've followed Jason steps:

1. Create a `WebReport/WEB-INF/lib` directory underneath the Tomcat `webapps` directory.
2. Copy all the jars in the `birt-runtime-2_5_2/ReportEngine/lib` directory from the Report Engine download into your `WebReport/WEB-INF/lib` directory.
3. Next, create a directory named `platform` in your `WEB-INF` folder.
4. Copy the `birt-runtime-2_5_2/Report Engine/plugins` and `birt-runtime-2_5_2/ReportEngine/configuration` directories to the `platform` directory you just created. In this example the context is WebReport, so the folder structure is `/webapps/WebReport/platform/plugins` and `webapps/WebReport/platform/configuration`.
5. Additionally, create directories below `WebReport` for image location and report location.

And used the same directory structure:

![WebReport directory structure](http://samaxes.appspot.com/images/birt-engine-location.png)

The example allows you to generate reports in HTML, PDF, and XLS formats. For the last one I've used [Tribix XLS Emitter](http://sourceforge.net/projects/tribix/) 2.5.2.

To install Tribix XLS emitter just copy both `org.uguess.birt.report.engine.common_2.5.2.201107181644.jar` and `org.uguess.birt.report.engine.emitter.xls_2.5.2.201107181644.jar` files into your `/webapps/WebReport/platform/plugins` folder.

The following files are mean to replace the WebReportServlet class from Jason example.

<ins datetime="2007-03-25T22:43:21+00:00">
  Jason's source code has been updated so you can easily embed the report's HTML in your JSP pages and correctly render your images and charts in your HTML.
</ins>

Go to the Resources section to get the instructions on how to get this example source code.

## Struts integration

**`BirtInitializationPlugin.java`**

Struts Plugin to BIRT Report Engine initialization and shutdown.

```java
/**
 * BIRT Report Engine initialization and shutdown Plugin.
 *
 * @author : samaxes
 * @version : $Revision$
 */
public class BirtInitializationPlugin implements PlugIn {

    /**
     * Initialization of the servlet. <br />
     *
     * @param servlet ActionServlet
     * @param conf ModuleConfig
     * @throws ServletException if an error occure
     */
    public void init(ActionServlet servlet, ModuleConfig conf) throws ServletException {
        BirtEngine.initBirtConfig();
    }

    /**
     * Destruction of the servlet.
     */
    public void destroy() {
        BirtEngine.destroyBirtEngine();
    }

}
```

**`WebReportAction.java`**

Actions related to the reports generation.

```java
/**
 * Actions related to the reports generation.
 *
 * @author : samaxes
 * @version : $Revision$
 */
public class WebReportAction extends MappingDispatchAction {

    private IReportEngine birtReportEngine = null;

    protected static Logger logger = Logger.getLogger("org.eclipse.birt");

    /**
     * The html report action. <br />
     * Gets the report's html output stream.
     *
     * @param actionMapping ActionMapping
     * @param actionForm ActionForm
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @return ActionForward
     */
    public ActionForward htmlReportAction(ActionMapping actionMapping, ActionForm actionForm,
            HttpServletRequest request, HttpServletResponse response) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            out = renderReportPage(request);
        } catch (ServletException e) {
            logger.log(Level.SEVERE, e.getMessage(), e);
        }

        request.setAttribute("reportHTML", out);

        return actionMapping.findForward(Constants.FORWARD_SUCCESS);
    }

    /**
     * Generates the html report.
     *
     * @param request HttpServletRequest
     * @return ByteArrayOutputStreamwith the report generated
     * @throws ServletException
     */
    private ByteArrayOutputStream renderReportPage(HttpServletRequest request) throws ServletException {

        // get report name and launch the engine
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        String reportName = request.getParameter("ReportName");
        ServletContext sc = request.getSession().getServletContext();
        this.birtReportEngine = BirtEngine.getBirtEngine(sc);

        IReportRunnable design;
        try {
            // Open report design
            design = birtReportEngine.openReportDesign(sc.getRealPath("/reports") + "/" + reportName);
            // create task to run and render report
            IRunAndRenderTask task = birtReportEngine.createRunAndRenderTask(design);

            // set output options
            IHTMLRenderOption options = new HTMLRenderOption();
            options.setOutputFormat(IHTMLRenderOption.OUTPUT_FORMAT_HTML);
            options.setEmbeddable(true);
            options.setOutputStream(out);

            // set the image handler to a HTMLServerImageHandler if you plan on using the base image url.
            options.setImageHandler(new HTMLServerImageHandler());
            options.setBaseImageURL(request.getContextPath() + "/images");
            options.setImageDirectory(sc.getRealPath("/images"));

            // run report
            task.setRenderOption(options);
            task.run();
            task.close();
        } catch (Exception e) {
            logger.log(Level.SEVERE, e.getMessage(), e);
            throw new ServletException(e);
        }

        return out;
    }

    /**
     * The pdf report action. <br />
     * Generates the pdf report.
     *
     * @param actionMapping ActionMapping
     * @param actionForm ActionForm
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @throws ServletException
     */
    public void pdfReportAction(ActionMapping actionMapping, ActionForm actionForm, HttpServletRequest request,
            HttpServletResponse response) throws ServletException {

        // get report name and launch the engine
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "inline; filename=WebReport.pdf"); // inline, attachment
        String reportName = request.getParameter("ReportName");
        ServletContext sc = request.getSession().getServletContext();
        this.birtReportEngine = BirtEngine.getBirtEngine(sc);

        IReportRunnable design;
        try {
            // Open report design
            design = birtReportEngine.openReportDesign(sc.getRealPath("/reports") + "/" + reportName);
            // create task to run and render report
            IRunAndRenderTask task = birtReportEngine.createRunAndRenderTask(design);

            // set output options
            IPDFRenderOption options = new PDFRenderOption();
            options.setOutputFormat(IPDFRenderOption.OUTPUT_FORMAT_PDF);
            options.setOutputStream(response.getOutputStream());

            // run report
            task.setRenderOption(options);
            task.run();
            task.close();
        } catch (Exception e) {
            logger.log(Level.SEVERE, e.getMessage(), e);
            throw new ServletException(e);
        }
    }

    /**
     * The excel report action. <br />
     * Generates the excel report.
     *
     * @param actionMapping ActionMapping
     * @param actionForm ActionForm
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @throws ServletException
     */
    public void xlsReportAction(ActionMapping actionMapping, ActionForm actionForm, HttpServletRequest request,
            HttpServletResponse response) throws ServletException {

        // get report name and launch the engine
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition", "inline; filename=WebReport.xls"); // inline, attachment
        String reportName = request.getParameter("ReportName");
        ServletContext sc = request.getSession().getServletContext();
        this.birtReportEngine = BirtEngine.getBirtEngine(sc);

        IReportRunnable design;
        try {
            // Open report design
            design = birtReportEngine.openReportDesign(sc.getRealPath("/reports") + "/" + reportName);
            // create task to run and render report
            IRunAndRenderTask task = birtReportEngine.createRunAndRenderTask(design);

            // set output options
            IExcelRenderOption options = new EXCELRenderOption();
            options.setOutputFormat(Constants.XLS_FORMAT);
            options.setOutputStream(response.getOutputStream());

            // run report
            task.setRenderOption(options);
            task.run();
            task.close();
        } catch (Exception e) {
            logger.log(Level.SEVERE, e.getMessage(), e);
            throw new ServletException(e);
        }
    }

}
```

All you need to get this sample running is to copy the WAR file to your server deploy dir and configure the BIRT Report Engine logging in `BirtConfig.properties` file:

```ini
logDirectory=C:/work/logs/birt
logLevel=CONFIG
```

If you are building the application from the source code you must also configure the application server deployment directory.
In order to do so, rename the file `build.properties-sample` to `build.properties` and edit the following line:

```ini
deploy.dir=C:/work/jboss/server/default/deploy
```

Designing the report is out of the scope of this article, you can found lots of good tutorials on the Web and on [BIRT](http://www.eclipse.org/birt) Website.

## Resources

* [Struts BIRT WebReport project](http://code.google.com/p/struts-birt-webreport/) Download the WAR file or get the source code from the SVN repository.
* [Report Engine API](http://www.eclipse.org/birt/documentation/integrating/reapi.php) Contains further information on BIRT RE API.
