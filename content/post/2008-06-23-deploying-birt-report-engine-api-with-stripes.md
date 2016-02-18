---
title: Deploying BIRT Report Engine API with Stripes Framework
date: 2008-06-23 13:31:16+00:00
slug: deploying-birt-report-engine-api-with-stripes
categories:
  - Server-side
tags:
  - BIRT
  - Java
  - Reporting
  - Stripes Framework
---

A long time has passed since my previous BIRT example - [Deploying BIRT Report Engine API with Apache Struts]({{< ref "post/2006-08-15-deploying-birt-report-engine-api-with-apache-struts.md" >}}).
Now that I preferably use [Stripes Framework](http://www.stripesframework.org/) over [Apache Struts](http://struts.apache.org/), I've decided to port my last example to this framework.

<!--more-->

![BIRT WebReport Example](http://samaxes.appspot.com/images/birt-webreport-1.1.png)

Even though BIRT now supports HTML, Paginated HTML, PDF, Excel, Word, PowerPoint, and PostScript formats, images and charts are not embedded in Excel output. [Tribix XLS Emitter](http://sourceforge.net/projects/tribix/) 2.5.2 supports this and was used to generate Excel reports.

I've tried to follow some good practices that I think are important to use in a production application:

* There is a significant cost associated with creating an engine instance, due primarily to the cost of loading extensions. Therefore, each application should create just one ReportEngine instance and use it to run multiple reports. In this example the engine is started in the context listener and the same instance is always used.
* All texts in the report should be loaded from the resources so the application can be fully localizable and fully internationalized.
* You should use a JDBC data set to preview your report with BIRT designer but you must swap the data set in runtime to use data from your business logic.
* You should use predefined styles instead of custom styles as much as you can.
* Not a good practice but often a requirement, hide the master page when generating a HTML report, and change the visibility of elements so they are visible only to specified outputs.

Integrating BIRT Report Engine with your application is as easy as before:

1. Copy all the jars inside the `birt-runtime-2_5_2/ReportEngine/lib` folder from the Report Engine download into `/WEB-INF/lib`.
2. Next, create a folder named `platform` inside `/WEB-INF`.
3. Copy `birt-runtime-2_5_2/Report Engine/plugins` and `birt-runtime-2_5_2/ReportEngine/configuration` folders into the folder `/WEB-INF/platform` that you've just created.

**`BirtEngine.java`**

BIRT Report Engine configuration.

```java
/**
 * BIRT Report Engine configuration.
 *
 * @author Samuel Santos
 * @version $Revision$
 */
public class BirtEngine {

    private static final Logger logger = LoggerFactory.getLogger(BirtEngine.class);

    private static IReportEngine birtEngine = null;

    private static Level level = Level.OFF;

    private static String logDirectory = null;

    /**
     * Gets the BIRT Report Engine.
     *
     * @return the BIRT Report Engine
     */
    public static IReportEngine getBirtEngine() {
        return birtEngine;
    }

    /**
     * Initialize BIRT Report Engine configuration.
     *
     * @param servletContext the ServletContext
     */
    @SuppressWarnings("unchecked")
    public static synchronized void initBirtEngine(ServletContext servletContext) {
        if (birtEngine == null) {
            loadEngineProps();

            IPlatformContext context = new PlatformServletContext(servletContext);
            EngineConfig config = new EngineConfig();
            HashMap<String, Object> appContext = config.getAppContext();

            appContext.put(EngineConstants.APPCONTEXT_CLASSLOADER_KEY, BirtEngine.class.getClassLoader());
            config.setLogConfig(logDirectory, level);
            config.setEngineHome("");
            config.setPlatformContext(context);
            config.setResourcePath(BirtEngine.class.getResource("/").getPath());
            config.setAppContext(appContext);

            try {
                Platform.startup(config);
            } catch (BirtException e) {
                logger.error(e.getMessage(), e);
            }

            IReportEngineFactory factory = (IReportEngineFactory) Platform
                    .createFactoryObject(IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
            birtEngine = factory.createReportEngine(config);
            birtEngine.changeLogLevel(Level.WARNING);

            // setup XLS emitter configuration
            Map<String, Comparable> xlsConfig = new HashMap<String, Comparable>();
            // Check out constants in XlsEmitterConfig.java for more configuration detail.
            xlsConfig.put("fixed_column_width", new Integer(30));
            xlsConfig.put("show_grid_lines", new Boolean(false));
            // Associate the configuration with the XLS output format.
            config.setEmitterConfiguration("xls", xlsConfig);
        }
    }

    /**
     * Destroys the BIRT Report Engine.
     */
    public static synchronized void destroyBirtEngine() {
        if (birtEngine == null) {
            return;
        }
        birtEngine.destroy();
        Platform.shutdown();
        birtEngine = null;
    }

    /**
     * Creates and returns a copy of this object.
     *
     * @return a clone of this instance.
     * @exception CloneNotSupportedException if the object's class does not support the <code>Cloneable</code>
     *            interface. Subclasses that override the <code>clone</code> method can also throw this exception to
     *            indicate that an instance cannot be cloned.
     */
    public Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException();
    }

    /**
     * Loads the Engine properties.
     */
    private static void loadEngineProps() {
        try {
            // Config File must be in classpath
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            Properties configProps = new Properties();
            InputStream in = null;

            in = cl.getResourceAsStream("BirtConfig.properties");
            configProps.load(in);
            in.close();

            String logLevel = configProps.getProperty("logLevel");
            if ("SEVERE".equalsIgnoreCase(logLevel)) {
                level = Level.SEVERE;
            } else if ("WARNING".equalsIgnoreCase(logLevel)) {
                level = Level.WARNING;
            } else if ("INFO".equalsIgnoreCase(logLevel)) {
                level = Level.INFO;
            } else if ("CONFIG".equalsIgnoreCase(logLevel)) {
                level = Level.CONFIG;
            } else if ("FINE".equalsIgnoreCase(logLevel)) {
                level = Level.FINE;
            } else if ("FINER".equalsIgnoreCase(logLevel)) {
                level = Level.FINER;
            } else if ("FINEST".equalsIgnoreCase(logLevel)) {
                level = Level.FINEST;
            } else if ("ALL".equalsIgnoreCase(logLevel)) {
                level = Level.ALL;
            }
            logDirectory = configProps.getProperty("logDirectory");
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
        }
    }
}
```

**`WebReportActionBean.java`**

Actions related to the reports generation.

```java
/**
 * Actions related to the reports generation.
 *
 * @author Samuel Santos
 * @version $Revision$
 */
public class WebReportActionBean implements ActionBean {

    private ActionBeanContext context;

    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    /**
     * Generates the html report.
     *
     * @return forward to the jsp page
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    @DefaultHandler
    public Resolution htmlReport() throws EngineException, SemanticException {
        ByteArrayOutputStream reportOutput = new ByteArrayOutputStream();

        // set output options
        IHTMLRenderOption options = new HTMLRenderOption();
        options.setOutputFormat(IHTMLRenderOption.OUTPUT_FORMAT_HTML);
        options.setOutputStream(reportOutput);
        options.setEmbeddable(true);
        options.setBaseImageURL(context.getRequest().getContextPath() + "/images");
        options.setImageDirectory(context.getServletContext().getRealPath("/images"));
        options.setImageHandler(new HTMLServerImageHandler());
        options.setMasterPageContent(false);

        generateReport(options);

        return new StreamingResolution("text/html", new ByteArrayInputStream(reportOutput.toByteArray()));
    }

    /**
     * Generates the PDF report.
     *
     * @return PDF file with the report output
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    public Resolution pdfReport() throws EngineException, SemanticException {
        ByteArrayOutputStream reportOutput = new ByteArrayOutputStream();

        // set output options
        IPDFRenderOption options = new PDFRenderOption();
        options.setOutputFormat(IPDFRenderOption.OUTPUT_FORMAT_PDF);
        options.setOutputStream(reportOutput);

        generateReport(options);

        return new StreamingResolution("application/pdf", new ByteArrayInputStream(reportOutput.toByteArray()))
                .setFilename("WebReport.pdf");
    }

    /**
     * Generates the Excel report.
     *
     * @return Excel file with the report output
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    public Resolution xlsReport() throws EngineException, SemanticException {
        ByteArrayOutputStream reportOutput = new ByteArrayOutputStream();

        // set output options
        IExcelRenderOption options = new EXCELRenderOption();
        options.setOutputFormat("xls");
        options.setOutputStream(reportOutput);

        generateReport(options);

        return new StreamingResolution("application/vnd.ms-excel", new ByteArrayInputStream(reportOutput.toByteArray()))
                .setFilename("WebReport.xls");
    }

    /**
     * Generates the Word report.
     *
     * @return Excel file with the report output
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    public Resolution docReport() throws EngineException, SemanticException {
        ByteArrayOutputStream reportOutput = new ByteArrayOutputStream();

        // set output options
        IRenderOption options = new RenderOption();
        options.setOutputFormat("doc");
        options.setOutputStream(reportOutput);

        generateReport(options);

        return new StreamingResolution("application/vnd.ms-word", new ByteArrayInputStream(reportOutput.toByteArray()))
                .setFilename("WebReport.doc");
    }

    /**
     * Generates the Powerpoint report.
     *
     * @return Excel file with the report output
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    public Resolution pptReport() throws EngineException, SemanticException {
        ByteArrayOutputStream reportOutput = new ByteArrayOutputStream();

        // set output options
        IRenderOption options = new RenderOption();
        options.setOutputFormat("ppt");
        options.setOutputStream(reportOutput);

        generateReport(options);

        return new StreamingResolution("application/vnd.ms-powerpoint", new ByteArrayInputStream(reportOutput
                .toByteArray())).setFilename("WebReport.ppt");
    }

    /**
     * Generates the Postscript report.
     *
     * @return Excel file with the report output
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    public Resolution psReport() throws EngineException, SemanticException {
        ByteArrayOutputStream reportOutput = new ByteArrayOutputStream();

        // set output options
        IRenderOption options = new RenderOption();
        options.setOutputFormat("postscript");
        options.setOutputStream(reportOutput);

        generateReport(options);

        return new StreamingResolution("application/postscript", new ByteArrayInputStream(reportOutput.toByteArray()))
                .setFilename("WebReport.ps");
    }

    /**
     * Generates the report output.
     *
     * @throws EngineException when opening report design or reunning the report
     * @throws SemanticException when changing properties of DesignElementHandle
     */
    @SuppressWarnings("unchecked")
    private void generateReport(IRenderOption options) throws EngineException, SemanticException {
        // this list simulates a call to the application business logic
        List<WebReportEntity> webReportEntities = new ArrayList<WebReportEntity>();
        webReportEntities.add(new WebReportEntity(new Double(2), "Product1"));
        webReportEntities.add(new WebReportEntity(new Double(4), "Product2"));
        webReportEntities.add(new WebReportEntity(new Double(7), "Product3"));

        // get the engine
        IReportEngine birtReportEngine = BirtEngine.getBirtEngine();

        // open the report design
        IReportRunnable design = birtReportEngine.openReportDesign(context.getServletContext().getRealPath("/reports")
                + "/webReport.rptdesign");

        // create task to run and render report
        IRunAndRenderTask task = birtReportEngine.createRunAndRenderTask(design);
        Map<String, Object> appContext = task.getAppContext();
        DesignElementHandle reportChart = design.getDesignHandle().getModuleHandle().findElement("reportChart");

        appContext.put("webReportEntities", webReportEntities);
        reportChart.setProperty("dataSet", "Scripted Data Set"); // change the chart dataset

        task.setLocale(context.getLocale());
        task.setRenderOption(options);
        task.setAppContext(appContext);

        // run report
        task.run();
        task.close();
    }
}
```

If you checkout the source code from the source code repository, you need to rename `build.properties-sample` to `build.properties`.
Edit both `build.properties` and `BirtConfig.properties` files to correctly reflect your environment.

## Resources

* [Stripes BIRT WebReport project](http://code.google.com/p/stripes-birt-webreport/) Download the WAR file or get the source code from the SVN repository.
* [Report Engine API](http://www.eclipse.org/birt/phoenix/deploy/reportEngineAPI.php) Contains further information on BIRT RE API.
