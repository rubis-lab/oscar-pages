---
layout: page
title: OSCAR IDE
description: End-to-end design tool for autonomous driving
background: '/img/bg-oscar.png'
---

OSCAR IDE is an end-to-end design tool covering both hardware and software modules of an autonomous car. Using the model-based design methodology, users can describe the autonomous driving system as a block diagram. There, individual modules of the car are mapped to separate blocks. Relationships between modules are represented by linkages between blocks. 

After the system model is fully defined, a user only needs to write code for individual modules, without having to care for the overall source code structure, dependencies or build mechanisms. Note that apart from the algorithm implementation, everything else is taken care of by the OSCAR IDE.

<img class="img-fluid" src="img/oscar-ide.png">
<span class="caption text-muted">A block diagram representation of a sample autonomous driving system</span>

The goal of the OSCAR IDE is to provide the necessary tools to easily model algorithms and hardware components (such as sensors and actuators) for autonomous driving:
-	Graphical editor with block diagram environment for the ROS model-based design of autonomous driving systems
-	Customizable templates of common autonomous driving systems 
-	Automatic ROS source code generator
-	Source code editor synchronized with a model specification and its graphical representation
-	Source code and model validation tools
-	ROS build automation tools that create and builds ROS packages (local or remote)
-	ROS diagnostic tools and parameter tuning

OSCAR IDE adopts the model-based design methodology to describe an autonomous driving system. Using blocks and lines, users create a block diagram of the entire system, and based on it OSCAR IDE generates a ROS package and handles all dependencies. Finally, OSCAR IDE builds the generated package on a target device and creates ready-to-launch executable ROS nodes. 

### Technical overview:
-	ROS-based system can be viewed as a graph, where nodes are computational processes that communicate with each other by passing messages through topics with publish/subscribe semantics. 
-	In a block diagram, nodes and topics are represented by blocks, and the message passing interface is represented by connections between blocks. 
-	Nodes and topics are defined as classes using EMF (Eclipse Modeling Framework). 
-	GEF (Graphical Editing Framework) is used to easily make and edit instances of defined classes. 
-	The actual visual representation of the classes is shown using Draw2D.

### Development process:
1. The graphical editor provides a drag-and-drop interface for creating instances of ROS publisher/subscriber nodes and topics. 
2. The model description is saved as an XML (Extensible Markup Language) file, from which the skeleton code is generated. 
3. Skeleton code of each module can be modified in the source code editor. All changes are simultaneously reflected in a model description and its graphical representation.
4. Build automation tools generate a ROS package in compliance with the ROS Filesystem and transfer it to the target’s workspace directory via FTP (File Transfer Protocol). It checks for dependency issues, handles them, and builds the package.
