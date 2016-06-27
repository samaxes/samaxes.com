---
title: Gantt Charts with JFreeChart
date: 2006-11-04 04:30:29+00:00
slug: gantt-charts-with-jfreechart
categories:
  - Server-side programming
tags:
  - Gantt
  - Java
  - JFreeChart
---

If you have ever tried to draw gantt charts with [JFreeChart](http://www.jfree.org/jfreechart) you have already noticed that it's a very simplistic implementation - it doesn't have the facility to display dependency lines or milestones.

Gantt chart demo from JFreeChart samples:

![Orginal Gantt Chart](http://samaxes.appspot.com/images/gantt-chart.png)

In a recent project I needed some additional features like:

1. Summary tasks
2. Milestones/deliverables
3. Dependencies between task and milestones/deliverables

So I modified `BarRenderer.java`, `GanttRenderer.java`, `GanttCategoryDataset.java`, `Task.java`, and `TaskSeriesCollection.java` appropriately and also created my own class called `LineAndShapeGanttRenderer.java`.

Gantt chart with JFreeChart after files modification:

![Modified Gantt Chart](http://samaxes.appspot.com/images/gantt-chart-modified.png)

The base version of JFreeChart was 1.0.2, and the modified files were:

* [BarRenderer.java](http://samaxes.appspot.com/code/jfreechart/BarRenderer.java)
* [GanttRenderer.java](http://samaxes.appspot.com/code/jfreechart/GanttRenderer.java)
* [GanttCategoryDataset.java](http://samaxes.appspot.com/code/jfreechart/GanttCategoryDataset.java)
* [Task.java](http://samaxes.appspot.com/code/jfreechart/Task.java)
* [TaskSeriesCollection.java](http://samaxes.appspot.com/code/jfreechart/TaskSeriesCollection.java)
* [LineAndShapeGanttRenderer.java](http://samaxes.appspot.com/code/jfreechart/LineAndShapeGanttRenderer.java) (New)
