---
layout: page
title: Simulator
description: Funtionally and temporally correct simulation
background: '/img/bg-oscar.png'
---
<div class="shadow-sm p-3 mt-3 mb-3 bg-light rounded"><h3 class="text-center">Singlecore Simulator</h3></div>
<div class="alert alert-secondary" role="alert">
Kyoung-Soo We, Seunggon Kim, Wonseok Lee, and Chang-Gun Lee, Functionally and Temporally Correct Simulation of Cyber-Systems for Automotive Systems, in IEEE Real-Time Systems Symposium (RTSS), to be appeared, Dec. 2017.
</div>
The current simulation tools used in the automotive industry do not correctly model timing behaviors of cybersystems such as varying execution times and preemptions. Thus, they cannot correctly predict the real control performance. Motivated by this limitation, this paper proposes functionally and temporally correct simulation for the cyber-side of an automotive system. The key idea is to keep the data and time correctness only at physical interaction points and enjoy freedom of scheduling simulated jobs for all other cases. This way, the proposed approach significantly improves the real-time simulation capacity of the state-of-the-art simulation methods while keeping the functional and temporal correctness.
<img class="img-fluid" src="img/functem.png">
<span class="caption text-muted">Execution scenario</span>
<div class="alert alert-secondary" role="alert">
Wonseok Lee, Kyoung-Soo We, Seunggon Kim, Sangyoun Paik, Jonathon Soulis, and and Chang-Gun Lee, An ECU-Close Design/Verification Tool for Automotive Systems, in IEEE Real-Time Systems Symposium, Paris, France, Dec. 2017 (RTSS@Work).
</div>
<div class="alert alert-secondary" role="alert">
Seunggon Kim, Kyoung-Soo We, Chang-Gun Lee, and Kyongsu Yi, 자동차 제어 시스템의 실시간 성능 검증을 위한 효율적인 실시간 시뮬레이션 기법, in Journal of Institute of Control, Robotics and Systems, Vol. 21, No. 3, Mar. 2015.
</div>

<div class="shadow-sm p-3 mt-3 mb-3 bg-light rounded"><h3 class="text-center">Multicore Simulator</h3></div>
<div class="alert alert-secondary" role="alert">
Wonseok Lee, Jaehwan Jeong, Seonghyeon Park, and Chang-Gun Lee, Practical Multicore Extension of Functionally and Temporally Correct Real-Time Simulation for Automotive Systems, in Workshop on Model-Based Design of Cyber Physical Systems(CyPhy), New York, USA, Oct. 2019.
</div>
Existing simulation methods cannot provide functionally and temporally correct simulation for the cyber-side of an automotive system since they do not correctly model temporal behaviours such as varying execution times and task preemptions. To address such limitation, our previous work proposes a novel simulation technique that guarantees the functional and temporal simulation correctness. However, the simulation technique is designed assuming a single core simulator. In this work, we extend the single core simulator targeting a multicore simulator to enhance the simulation capacity. In this multicore extension, a challenge is the inter-core interferences in the multicore environment,  which causes unpredictability of simulated job execution times, which in turn makes it hard to model the timings of the real cyber-side of an automotive system. To overcome the challenge, this paper empirically analyzes the inter-core interferences for typical automotive workloads and proposes a practical multicore extension approach, which can still provide functionally and temporally correct simulation, without using complex inter-core isolation mechanisms. Our experimental study shows that the proposed multicore extension approach can significantly improve the simulation capacity over the previous single core simulator while still preserving the simulation correctness.

<img class="img-fluid" src="img/mcme.png">
<span class="caption text-muted">Weighted intervals and task-wise blocking values</span>
