---
layout: page
title: Scaled Platform
description: 1/10 scale autonomous car
background: '/img/bg-oscar.png'
---

OSCAR scaled platform is based on the 1/10-scale Traxxas Slash 4X4 Platinum race truck, fully assembled with VESC unit, a brushless motor, and a steering servo. The sensor suite has been carefully selected to facilitate a wide range of autonomous driving algorithms. LIDAR obtains positions of objects in a wide field of view up to a distance of 10 meters with millimeter resolution. IMU features three 3-axis sensors — an accelerometer, gyroscope, and magnetometer — to sense linear acceleration, angular rotation velocity, and magnetic field vectors. Stereo camera with a high-resolution and high frame-rate 3D video capture is used not only for computer vision but also for SLAM. The on-board Jetson TX2 supercomputer performs all the computations on incoming sensor data to produce motion control commands and sends steering angle and speed signals to corresponding actuators via VESC that processes the odometry feedback.

<img class="img-fluid" src="img/oscar-arch.png">
<span class="caption text-muted">OSCAR scaled platform architecture</span>

On the software side, we are using the ROS middleware on top of the Linux operating system.  It offers a message passing interface that provides inter-process communication through a publishing/subscribe mechanism along with request/response procedure calls.  ROS system can be run on a heterogeneous group of computers allowing easy task distribution across different systems. It also provides packages to interface with our sensor selection. In our case, the on-board computer runs as the main node and manages other processors as control subsystems.  Remote command execution from a Linux server machine is achieved by using SSH protocol to wirelessly connect to the on-board computer through the same network.
