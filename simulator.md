---
layout: page
title: Scaled Platform
description: 1/10 scale autonomous car
background: '/img/bg-oscar.png'
---

Existing simulation methods cannot provide functionally and temporally correct simulation for the cyber-side of an automotive system since they do not correctly model temporal behaviours such as varying execution times and task preemptions. To address such limitation, our previous work proposes a novel simulation technique that guarantees the functional and temporal simulation correctness. However, the simulation technique is designed assuming a single core simulator. In this work, we extend the single core simulator targeting a multicore simulator to enhance the simulation capacity. In this multicore extension, a challenge is the inter-core interferences in the multicore environment, which causes unpredictability of simulated job execution times, which in turn makes it hard to model the timings of the real cyber-side of an automotive system. To overcome the challenge, this paper empirically analyzes the inter-core interferences for typical automotive workloads and proposes a practical multicore extension approach, which can still provide functionally and temporally correct simulation, without using complex inter-core isolation mechanisms. Our experimental study shows that the proposed multicore extension approach can significantly improve the simulation capacity over the previous single core simulator while still preserving the simulation correctness.

<img class="img-fluid" src="img/mcme.png">
<span class="caption text-muted">OSCAR scaled platform architecture</span>

On the software side, we are using the ROS middleware on top of the Linux operating system.  It offers a message passing interface that provides inter-process communication through a publishing/subscribe mechanism along with request/response procedure calls.  ROS system can be run on a heterogeneous group of computers allowing easy task distribution across different systems. It also provides packages to interface with our sensor selection. In our case, the on-board computer runs as the main node and manages other processors as control subsystems.  Remote command execution from a Linux server machine is achieved by using SSH protocol to wirelessly connect to the on-board computer through the same network.
