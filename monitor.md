---
layout: vnc_connection
title: Remote Connection
description: 
background: '/img/bg-oscar.png'
---
<!-- Overwrites the styling so that vnc window can be positioned properly -->
<!--
<head>
   <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"> 
  



</head>
-->
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>

<style>
.page-heading {
  padding: 75px 0 !important;
}
.pie{
  display: block;
  margin-left: auto !important;
  margin-right: auto !important;
}
.container2{
  margin: auto !important;
  width: 100%; 
}
</style>

<div class="container2">
<center>
<iframe src="https://147.46.215.251:6081/" height="900" width="2000" title="vnc_session"></iframe>
<div class="pie">
    <img src="http://147.46.215.251:8885/ISAPI/Streaming/channels/102/httpPreview/" style="width:495px">   
    <img src="http://147.46.215.251:8886/ISAPI/Streaming/channels/102/httpPreview/" style="width:495px">
    <img src="http://147.46.215.251:8887/ISAPI/Streaming/channels/102/httpPreview/" style="width:495px">
    <img src="http://147.46.215.251:8888/ISAPI/Streaming/channels/102/httpPreview/" style="width:495px">
  </div>
</center>

   <p></p>
    <div class="row text-center">
      <div class="col-sm-12">
          <button onclick="launchCameras()" id="launchCamerasButton" class="btn btn-primary" >Load Cameras</button>
      </div>
    </div>

  <p></p>
  <p></p>
  <form action="https://rubis-lab.github.io/oscar-pages/userpage">
    <div class="row text-center">
      <div class="col-sm-12">
        <button type="submit" class="btn btn-primary">Return to User Homepage </button>
      </div>
    </div>
  </form>
  
  <!--
  <img src="http://oscar:rubis301@147.46.215.167:8885/ISAPI/Streaming/channels/102/httpPreview/" style="width:225px">
  -->

</div>

<script type="text/javascript" src="monitorprocessing.js"></script>


<!-- C310 streams MJPEG
<img src="http://[PUT IP ADDRESS / LOG-IN INFO HERE]?action=stream" width="100%"  height="500px">     -->   
