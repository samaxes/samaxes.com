---
title: Combine and minimize JavaScript and CSS files for faster loading
date: 2009-05-25 13:19:17+00:00
slug: combine-and-minimize-javascript-and-css-files-for-faster-loading
categories:
  - Development tools
tags:
  - Ant
  - Build
  - HTTP
  - Performance
---

## Reduce HTTP requests

On most sites, the major component of download time is not the base HTML file itself, but the number of subsequent HTTP requests to load the page's supporting files - CSS, JavaScript, images, etc.

Each of those are extra HTTP requests, and each unique request takes a relatively long time.
The fewer requests to the server that the browser has to make, the faster the page will load.

There is an inherent overhead in each HTTP request. It takes substantially less time to serve one 60K file than it does three 20K files and a lot less than it does six 10K files.

## Combine and minimize files

This post will explain how to combine and minimize CSS and JavaScript files using [YUI Compressor](http://developer.yahoo.com/yui/compressor/) and [Ant](http://ant.apache.org/).

This can be done by just concatenating all files into two combined files (one for CSS and one for JavaScript) and minimize them. You can quickly go from 10 or more files down to 2, and their size can be greatly reduced.

To keep the modularity that comes with splitting these files out by section (or business unit), keep them split in your development process, and combine them in your build process. A first Ant task will combine them and a second task will generate their minimized versions.

This technique has been successfully used in libraries such as jQuery, MooTools, Dojo, ExtJS, YUI, etc, allowing developers to better organize their code.

<!--more-->

## Tools

### Ant

> Ant is a Java-based build tool. In theory, it is kind of like Make, without Make's wrinkles and with the full portability of pure Java code.

### YUI Compressor

> The YUI Compressor is a JavaScript compressor which, in addition to removing comments and white-spaces, obfuscates local variables using the smallest possible variable name. This obfuscation is safe, even when using constructs such as 'eval' or 'with' (although the compression is not optimal in those cases). Compared to jsmin, the average savings is around 20%.
>
> The YUI Compressor is also able to safely compress CSS files. The decision on which compressor is being used is made on the file extension (js or css).

## Build

Download this build example [source code](http://samaxes.appspot.com/zip/minify-css-javascript.zip).

### Code example structure

This code example has the following file organization:

```
root
|-- build
|   `-- yuicompressor-2.4.2.jar
|-- src
|   |-- css
|   |   |-- base.css
|   |   |-- fonts.css
|   |   |-- reset.css
|   |   `-- style.css
|   |-- js
|   |   |-- samaxesjs.core.js
|   |   `-- samaxesjs.toc.js
|   `-- index.html
`-- build.xml
```

The `build` folder contains all the files needed to build the project.
The `src` folder contains all the project source files.

Finally, the `build.xml` file is the Ant build script. Here's where you configure your project build process.

#### Build script

Let's take a look at the project `build.xml` script.

```xml
<project name="Build example" default="all" basedir=".">
    <!-- Setup -->
    <property name="SRC_DIR" value="src" description="Source folder" />
    <property name="SRC_CSS_DIR" value="${SRC_DIR}/css" description="CSS source folder" />
    <property name="SRC_JS_DIR" value="${SRC_DIR}/js" description="JavaScript source folder" />
    <property name="DIST_DIR" value="dist" description="Output folder for build targets" />
    <property name="DIST_CSS_DIR" value="${DIST_DIR}/css" description="Output folder for CSS files" />
    <property name="DIST_JS_DIR" value="${DIST_DIR}/js" description="Output folder for JavaScript files" />
    <property name="BUILD_DIR" value="build" description="Files needed to build" />
    <property name="YUI" value="${BUILD_DIR}/yuicompressor-2.4.2.jar" description="YUICompressor" />

    <!-- Files names for distribution -->
    <property name="CSS" value="${DIST_CSS_DIR}/style.css" />
    <property name="CSS_MIN" value="${DIST_CSS_DIR}/style.min.css" />
    <property name="JS" value="${DIST_JS_DIR}/samaxesjs.js" />
    <property name="JS_MIN" value="${DIST_JS_DIR}/samaxesjs.min.js" />

    <!-- Targets -->
    <target name="html" description="Copy HTML files to the output folder">
        <mkdir dir="${DIST_DIR}" />
        <copy todir="${DIST_DIR}">
            <fileset dir="${SRC_DIR}">
                <include name="*.*" />
            </fileset>
        </copy>
    </target>

    <target name="css" depends="html" description="Concatenate CSS source files">
        <echo message="Building ${CSS}" />
        <concat destfile="${CSS}">
            <fileset dir="${SRC_CSS_DIR}" includes="reset.css" />
            <fileset dir="${SRC_CSS_DIR}" includes="fonts.css" />
            <fileset dir="${SRC_CSS_DIR}" includes="base.css" />
            <fileset dir="${SRC_CSS_DIR}" includes="style.css" />
        </concat>
        <echo message="${CSS} built." />
    </target>

    <target name="css.min" depends="css" description="Minimize CSS files">
        <echo message="Building ${CSS_MIN}" />
        <apply executable="java" parallel="false" verbose="true" dest="${DIST_CSS_DIR}">
            <fileset dir="${DIST_CSS_DIR}">
                <include name="style.css" />
            </fileset>
            <arg line="-jar" />
            <arg path="${YUI}" />
            <arg value="--charset" />
            <arg value="ANSI" />
            <arg value="-o" />
            <targetfile />
            <mapper type="glob" from="style.css" to="style.min.css" />
        </apply>
        <echo message="${CSS_MIN} built." />
    </target>

    <target name="js" depends="html" description="Concatenate JavaScript source files">
        <echo message="Building ${JS}" />
        <concat destfile="${JS}">
            <fileset dir="${SRC_JS_DIR}" includes="samaxesjs.core.js" />
            <fileset dir="${SRC_JS_DIR}" includes="samaxesjs.toc.js" />
        </concat>
        <echo message="${JS} built." />
    </target>

    <target name="js.min" depends="js" description="Minimize JavaScript files">
        <echo message="Building ${JS_MIN}" />
        <apply executable="java" parallel="false" verbose="true" dest="${DIST_JS_DIR}">
            <fileset dir="${DIST_JS_DIR}">
                <include name="samaxesjs.js" />
            </fileset>
            <arg line="-jar" />
            <arg path="${YUI}" />
            <arg value="--charset" />
            <arg value="ANSI" />
            <arg value="-o" />
            <targetfile />
            <mapper type="glob" from="samaxesjs.js" to="samaxesjs.min.js" />
        </apply>
        <echo message="${JS_MIN} built." />
    </target>

    <target name="clean">
        <delete dir="${DIST_DIR}" />
    </target>

    <target name="all" depends="clean, html, css, css.min, js, js.min">
        <echo message="Build complete." />
    </target>
</project>
```

The `html` target creates a `dist` (distribution) folder and copies all the files under `src` folder into it:

```xml
<target name="html" description="Copy HTML files to the output folder">
    <mkdir dir="${DIST_DIR}" />
    <copy todir="${DIST_DIR}">
        <fileset dir="${SRC_DIR}">
            <include name="*.*" />
        </fileset>
    </copy>
</target>
```

The `css` target concatenates all CSS files under `scr/css` folder into the file `dist/css/style.css`:

```xml
<target name="css" depends="html" description="Concatenate CSS source files">
    <echo message="Building ${CSS}" />
    <concat destfile="${CSS}">
        <fileset dir="${SRC_CSS_DIR}" includes="reset.css" />
        <fileset dir="${SRC_CSS_DIR}" includes="fonts.css" />
        <fileset dir="${SRC_CSS_DIR}" includes="base.css" />
        <fileset dir="${SRC_CSS_DIR}" includes="style.css" />
    </concat>
    <echo message="${CSS} built." />
</target>
```

The `css.min` target takes the `dist/css/style.css` file as the input, minimizes its content, and copies it to `dist/css/style.min.css`:

```xml
<target name="css.min" depends="css" description="Minimize CSS files">
    <echo message="Building ${CSS_MIN}" />
    <apply executable="java" parallel="false" verbose="true" dest="${DIST_CSS_DIR}">
        <fileset dir="${DIST_CSS_DIR}">
            <include name="style.css" />
        </fileset>
        <arg line="-jar" />
        <arg path="${YUI}" />
        <arg value="--charset" />
        <arg value="ANSI" />
        <arg value="-o" />
        <targetfile />
        <mapper type="glob" from="style.css" to="style.min.css" />
    </apply>
    <echo message="${CSS_MIN} built." />
</target>
```

The `js` target concatenates all JavaScript files under `scr/js` folder into the file `dist/js/samaxesjs.js`:

```xml
<target name="js" depends="html" description="Concatenate JavaScript source files">
    <echo message="Building ${JS}" />
    <concat destfile="${JS}">
        <fileset dir="${SRC_JS_DIR}" includes="samaxesjs.core.js" />
        <fileset dir="${SRC_JS_DIR}" includes="samaxesjs.toc.js" />
    </concat>
    <echo message="${JS} built." />
</target>
```

The `js.min` target takes the `dist/js/samaxesjs.js` file as the input, minimizes its content, and copies it to `dist/js/samaxesjs.min.js`:

```xml
<target name="js.min" depends="js" description="Minimize JavaScript files">
    <echo message="Building ${JS_MIN}" />
    <apply executable="java" parallel="false" verbose="true" dest="${DIST_JS_DIR}">
        <fileset dir="${DIST_JS_DIR}">
            <include name="samaxesjs.js" />
        </fileset>
        <arg line="-jar" />
        <arg path="${YUI}" />
        <arg value="--charset" />
        <arg value="ANSI" />
        <arg value="-o" />
        <targetfile />
        <mapper type="glob" from="samaxesjs.js" to="samaxesjs.min.js" />
    </apply>
    <echo message="${JS_MIN} built." />
</target>
```

The `clean` target removes the `dist` folder:

```xml
<target name="clean">
    <delete dir="${DIST_DIR}" />
</target>
```

`all` is the default target and executes all the previous by the order defined in its `depends` attribute:

```xml
<target name="all" depends="clean, html, css, css.min, js, js.min">
    <echo message="Build complete." />
</target>
```

### Execute script

Now that you know the file organization and the build script details; the next step is to execute the script and have the production code ready to be deployed into your hosting/server.

To execute the script make sure you have [Ant](http://ant.apache.org/) installed (requires [JRE](http://www.java.com/)), go to the project root folder (the folder that contains the `build.xml` file), and execute:

```sh
$ ant     # (executes the default target: `all`)
```

Your project structure should now have a new folder `dist`:

```
root
|-- build
|   `-- yuicompressor-2.4.2.jar
|-- dist
|   |-- css
|   |   |-- style.css
|   |   `-- style.min.jcss
|   |-- js
|   |   |-- samaxesjs.js
|   |   `-- samaxesjs.min.js
|   `-- index.html
|-- src
|   |-- css
|   |   |-- base.css
|   |   |-- fonts.css
|   |   |-- reset.css
|   |   `-- style.css
|   |-- js
|   |   |-- samaxesjs.core.js
|   |   `-- samaxesjs.toc.js
|   `-- index.html
`-- build.xml
```

## HTML file

If you take a look at the `header` section of the `index.html` file you'll see that I'm only using the `style.min.css` and `samaxesjs.min.js` files.

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Other header elements... -->

    <!-- CSS -->
    <link rel="stylesheet" href="css/style.min.css" />
    <!-- JavaScript -->
    <script src="js/samaxesjs.min.js"></script>
</head>
<body>
    <!-- Other body elements... -->
</body>
</html>
```

You don't need to worry about the number of CSS and JavaScript files you have. As long as you add them to the build script the code will be added to the combined file.

## Debug

Minimizing JavaScript files makes them nearly impossible to debug since the code will all be in one single line of code.

If you look carefully to the `dist/js` folder you will see two files there - `samaxesjs.min.js` and `samaxesjs.js`. So in order to debug your JavaScript just change the line `<script src="js/samaxesjs.min.js"></script>` in your HTML file to `<script src="js/samaxesjs.js"></script>`.

Easy!

## Compression results

The following images are screenshots taken from the [YSlow](http://developer.yahoo.com/yslow/) Statistics' report comparing the debug and minimized versions.

{{< figure src="http://samaxes.appspot.com/images/build-debug-statistics.png" class="side-by-side" caption="Debug version (combined but not minimized)" >}}
{{< figure src="http://samaxes.appspot.com/images/build-minimized-statistics.png" class="side-by-side" caption="Minimized version (combined and minimized)" >}}

In this example you have file size reduction gains of nearly **48%** for JavaScript files and **59%** for CSS files.

As you can see the compression gains are quite considerable.
