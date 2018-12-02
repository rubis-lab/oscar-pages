---
layout: page
title: OSCAR IDE
description: End-to-end design tool for autonomous driving
background: '/img/bg-oscar.png'
---

OSCAR IDE is an end-to-end design tool covering both hardware and software modules of an autonomous car. Using the model-based design methodology, users can describe the autonomous driving system as a block diagram. There, individual modules of the car are mapped to separate blocks. Relationships between modules are represented by linkages between blocks. 

<img class="img-fluid" src="img/oscar-ide.png">
<span class="caption text-muted">A block diagram representation of a sample autonomous driving system</span>

After the system model is fully defined, a user only needs to write code for individual modules, without having to care for the overall source code structure, dependencies or build mechanisms. Note that apart from the algorithm implementation, everything else is taken care of by the OSCAR IDE.
