//Fills the textbox with the updated source code text



function Parameter(name, value, comment) {
    this.name = name;
    this.value = value;
    this.comment = comment;
}

//All parameters
var horizonDistance = new Parameter('horizonDistance', 7.5, "Horizon");
var maxLocalPlanDistance = new Parameter('maxLocalPlanDistance', 12.2, "Plan Distance");
var pathDensity = new Parameter('pathDensity', 0.02, "Path Density");
var rollOutDensity = new Parameter('rollOutDensity', 0.3, "Horizontal Density");
var rollOutsNumber = new Parameter('rollOutsNumber', 4, "Rollouts Number");
//12-23 Added
var maxVelocity = new Parameter('maxVelocity', 4, "Max Velocity");
var maxAcceleration = new Parameter('maxAcceleration', 1.4, "Acceleration");
var maxDeceleration = new Parameter('maxDeceleration', -1.4, "Deceleration");
var enableFollowing = new Parameter('enableFollowing', false, "Enable Following");
var enableSwerving = new Parameter('enableSwerving', false, "Enable Avoidance");
var minFollowingDistance = new Parameter('minFollowingDistance', 30.0, "Follow Distance");
var minDistanceToAvoid = new Parameter('minDistanceToAvoid', 0.5, "Avoiding Distance");
var maxDistanceToAvoid = new Parameter('maxDistanceToAvoid', 0.5, "Avoidance Limit");
var enableStopSignBehavior = new Parameter('enableStopSignBehavior', false, "Enable Stop Sign Stop");
var enableTrafficLightBehavior = new Parameter('enableTrafficLightBehavior', false, "Enable Traffic Light");
var enableLaneChange = new Parameter('enableLaneChange', false, "Enable Lane Change");
var horizontalSafetyDistance = new Parameter('horizontalSafetyDistance', 0.05, "Lateral Safety");
var verticalSafetyDistance = new Parameter('verticalSafetyDistance', 0.05, "Longitudinal Safety");
var velocitySource = new Parameter('velocitySource', 1, "Velocity Source");


var parameters_dict = {
    "horizonDistance"           : horizonDistance,
    "maxLocalPlanDistance"      : maxLocalPlanDistance,
    "pathDensity"               : pathDensity,
    "rollOutDensity"            : rollOutDensity,
    "rollOutsNumber"            : rollOutsNumber,
    //12-23 Added
    "maxVelocity"               : maxVelocity,
    "maxAcceleration"           : maxAcceleration,
    "maxDeceleration"           : maxDeceleration,
    "enableFollowing"           : enableFollowing,
    "enableSwerving"            : enableSwerving,
    "minFollowingDistance"      : minFollowingDistance,
    "minDistanceToAvoid"        : minDistanceToAvoid,
    "maxDistanceToAvoid"        : maxDistanceToAvoid,
    "enableStopSignBehavior"    : enableStopSignBehavior,
    "enableTrafficLightBehavior": enableTrafficLightBehavior,
    "enableLaneChange"          : enableLaneChange,
    "horizontalSafetyDistance"  : horizontalSafetyDistance,
    "verticalSafetyDistance"    : verticalSafetyDistance,
    "velocitySource"            : velocitySource,

};

let parameter_list = [horizonDistance, maxLocalPlanDistance, pathDensity, rollOutDensity, rollOutsNumber,
                      maxVelocity, maxAcceleration, maxDeceleration, enableFollowing, enableSwerving,
                      minFollowingDistance, minDistanceToAvoid, maxDistanceToAvoid, enableStopSignBehavior, enableTrafficLightBehavior,
                      enableLaneChange, horizontalSafetyDistance, verticalSafetyDistance, velocitySource];

Blockly.Blocks['launch_tag'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Configuration File");
      this.appendStatementInput("param_s")
          .setCheck(null);
      this.setColour(0);
   this.setTooltip("creates the config file");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['launch_tag'] = function(block) {

    var statements_param_s = Blockly.JavaScript.statementToCode(block, 'param_s');

    // Adds the launch tag to the parameters.
    var code =  statements_param_s + //Changes the parameters_dict values to the user defined ones
                'var code_string = "";' +
                'code_string = code_string.concat("<pre>&lt;launch><br>");' +
                'parameter_list.forEach(function(element) {'  +
                'code_string = code_string.concat("    &lt;!-- " + element.comment + " --><br>" + "    &lt;arg name =\\"" + element.name + "\\"    default=\\"" + element.value + "\\" /><br>");'  +
                '});' +
                'code_string = code_string.concat("    &lt;!-- Unmodified Parameters --><br>");' +
                'code_string = code_string.concat("&lt;/launch><br></pre>");' +
                'document.getElementById("source_code_textbox").innerHTML = code_string;' + 
                //This variable is the actual launch file NOT the html formatted code.
                'var full_code =  "";' +
                'full_code = full_code.concat("<launch>");' +
                'parameter_list.forEach(function(element) {'  +
                'full_code = full_code.concat("<!-- " + element.comment + " -->" + "<arg name =\\"" + element.name + "\\"    default=\\"" + element.value + "\\" />");'  +
                '});' +
                'full_code = full_code.concat("' + 
                '	<!-- Parameters not in app --> ' + 
                ' <arg name=\\"mapSource\\"  default=\\"0\\" /> <!-- Autoware=0, Vector Map Folder=1, kml=2 --> ' +
                ' <arg name=\\"mapFileName\\" 			default=\\"\\" /> <arg name=\\"minVelocity\\" 				default=\\"0.1\\" /> '	+
                ' <arg name=\\"speedProfileFactor\\"		default=\\"1.2\\"  /> '	+
                ' <arg name=\\"smoothingDataWeight\\"			default=\\"0.45\\"  /> '	+
                ' <arg name=\\"smoothingSmoothWeight\\"		default=\\"0.4\\"  />	'	+
                ' <arg name=\\"width\\" 					default=\\"0.10\\"  /> <!-- Vehicle Size --> '	+
                ' <arg name=\\"length\\" 					default=\\"0.10\\"  /> <!-- Vehicle Size --> '	+
                ' <arg name=\\"wheelBaseLength\\" 			default=\\"0.1\\"  /> <!-- Vehicle Size -->'	+
                ' <arg name=\\"turningRadius\\"				default=\\"5.2\\"  /> '	+
                ' <arg name=\\"maxSteerAngle\\" 			default=\\"0.45\\" /> '	+
                ' <arg name=\\"steeringDelay\\" 			default=\\"1.2\\" /> '	+
                ' <arg name=\\"minPursuiteDistance\\" 	default=\\"3.0\\"  /> '	+
                ' <arg name=\\"additionalBrakingDistance\\" default=\\"5.0\\"  /> '	+
                ' <arg name=\\"giveUpDistance\\" 			default=\\"-4.0\\"  /> '	+
                '	<node pkg=\\"op_local_planner\\" type=\\"op_common_params\\" name=\\"op_common_params\\" output=\\"screen\\"> '	+
                ' <!-- Common Parameters --> '	+
                ' <param name=\\"mapSource\\" 				value=\\"$(arg mapSource)\\" /> <!-- Autoware=0, Vector Map Folder=1, kml=2 --> '	+
                ' <param name=\\"mapFileName\\" 				value=\\"$(arg mapFileName)\\" /> '	+
                ' <param name=\\"pathDensity\\" 			    value=\\"$(arg pathDensity)\\" /> '	+
                ' <param name=\\"rollOutDensity\\" 			value=\\"$(arg rollOutDensity)\\" /> '	+
                ' <param name=\\"rollOutsNumber\\" 			value=\\"$(arg rollOutsNumber)\\"    /> '	+
                ' <param name=\\"maxVelocity\\" 				value=\\"$(arg maxVelocity)\\" /> '	+
                ' <param name=\\"minVelocity\\" 				value=\\"$(arg minVelocity)\\" />	'	+
                ' <param name=\\"maxLocalPlanDistance\\" 		value=\\"$(arg maxLocalPlanDistance)\\" />	'	+
                ' <param name=\\"horizonDistance\\" 			value=\\"$(arg horizonDistance)\\" /> '	+
                
                ' <param name=\\"minFollowingDistance\\" 		value=\\"$(arg minFollowingDistance)\\"  /> <!-- should be bigger than Distance to follow -->	'	+
                ' <param name=\\"minDistanceToAvoid\\" 		value=\\"$(arg minDistanceToAvoid)\\" /> <!-- should be smaller than minFollowingDistance and larger than maxDistanceToAvoid --> '	+
                ' <param name=\\"maxDistanceToAvoid\\" 		value=\\"$(arg maxDistanceToAvoid)\\"  /> <!-- should be smaller than minDistanceToAvoid --> '	+
                ' <param name=\\"speedProfileFactor\\"		value=\\"$(arg speedProfileFactor)\\"  /> '	+
                
                ' <param name=\\"smoothingDataWeight\\"		value=\\"$(arg smoothingDataWeight)\\"  /> '	+
                ' <param name=\\"smoothingSmoothWeight\\"		value=\\"$(arg smoothingSmoothWeight)\\"  /> '	+
                
                ' <param name=\\"horizontalSafetyDistance\\"	value=\\"$(arg horizontalSafetyDistance)\\"  /> '	+
                ' <param name=\\"verticalSafetyDistance\\"	value=\\"$(arg verticalSafetyDistance)\\"  /> '	+
                ' <param name=\\"enableSwerving\\" 			value=\\"$(arg enableSwerving)\\"  /> '	+
                ' <param name=\\"enableFollowing\\" 			value=\\"$(arg enableFollowing)\\" />	'	+
                ' <param name=\\"enableTrafficLightBehavior\\" value=\\"$(arg enableTrafficLightBehavior)\\" /> '	+
                ' <param name=\\"enableStopSignBehavior\\" 	value=\\"$(arg enableStopSignBehavior)\\" />	'	+
                ' <param name=\\"enableLaneChange\\" 			value=\\"$(arg enableLaneChange)\\" />	'	+
                
                ' <param name=\\"width\\" 					value=\\"$(arg width)\\"  /> '	+
                ' <param name=\\"length\\" 					value=\\"$(arg length)\\"  /> '	+
                ' <param name=\\"wheelBaseLength\\" 			value=\\"$(arg wheelBaseLength)\\"  /> '	+
                ' <param name=\\"turningRadius\\"				value=\\"$(arg turningRadius)\\"  /> '	+
                ' <param name=\\"maxSteerAngle\\" 			value=\\"$(arg maxSteerAngle)\\" /> '	+
              
                ' <param name=\\"steeringDelay\\" 			value=\\"$(arg steeringDelay)\\" /> '	+
                ' <param name=\\"minPursuiteDistance\\" 		value=\\"$(arg minPursuiteDistance)\\"  />	'	+ 
                ' <param name=\\"additionalBrakingDistance\\" value=\\"$(arg additionalBrakingDistance)\\"  /> '	+
                
                ' <param name=\\"giveUpDistance\\" value=\\"$(arg giveUpDistance)\\"  /> '	+
                
                ' <param name=\\"maxAcceleration\\" 			value=\\"$(arg maxAcceleration)\\" /> '	+
                ' <param name=\\"maxDeceleration\\" 			value=\\"$(arg maxDeceleration)\\" /> '	+
                    
                ' <param name=\\"velocitySource\\"			value=\\"$(arg velocitySource)\\" /> <!-- read velocities from (0- Odometry, 1- autoware current_velocities, 2- car_info) \\"\\" -->'	+
                    
                ' </node>'	+	
                    
              '</launch>");';
    
    return code;
  };

  Blockly.Blocks['sethorizondistance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Horizon")
          .appendField(new Blockly.FieldNumber(7.5, 0, 10, 0.5), "horizonDistance");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['sethorizondistance'] = function(block) {
    var number_horizondistance = block.getFieldValue('horizonDistance');
    var code = 'parameters_dict["horizonDistance"].value =' + number_horizondistance + ';';
    return code;
  };

  Blockly.Blocks['setmaxlocalplandistance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Plan Distance")
          .appendField(new Blockly.FieldNumber(12.2, 0, 10, 0.5), "maxLocalPlanDistance");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };

  Blockly.JavaScript['setmaxlocalplandistance'] = function(block) {
    var number_maxlocalplandistance = block.getFieldValue('maxLocalPlanDistance');
    var code = 'parameters_dict["maxLocalPlanDistance"].value =' + number_maxlocalplandistance + ';';
    return code;
  }

  Blockly.Blocks['setpathdensity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Path Density")
          .appendField(new Blockly.FieldNumber(0.02, 0, 10), "pathDensity");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(170);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setpathdensity'] = function(block) {
    var number_pathdensity = block.getFieldValue('pathDensity');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["pathDensity"].value =' + number_pathdensity + ';';
    return code;
  };

  Blockly.Blocks['setrolloutdensity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Horizontal Density")
          .appendField(new Blockly.FieldNumber(0.3, 0, 10), "rollOutDensity");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(140);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setrolloutdensity'] = function(block) {
    var number_rolloutdensity = block.getFieldValue('rollOutDensity');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["rollOutDensity"].value =' + number_rolloutdensity + ';';
    return code;
  };

  Blockly.Blocks['setrolloutsnumber'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Rollouts Number")
          .appendField(new Blockly.FieldNumber(4, 0, 10), "rollOutsNumber");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(110);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setrolloutsnumber'] = function(block) {
    var number_rolloutsnumber = block.getFieldValue('rollOutsNumber');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["rollOutsNumber"].value =' + number_rolloutsnumber + ';';
    return code;
  };
//01-12 Added
  Blockly.Blocks['setMaxVelocity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Max Velocity")
          .appendField(new Blockly.FieldNumber(4, 0, 10), "maxVelocity");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(80);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setMaxVelocity'] = function(block) {
    var number_maxVelocity = block.getFieldValue('maxVelocity');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["maxVelocity"].value =' + number_maxVelocity + ';';
    return code;
  };

  Blockly.Blocks['setMaxAcceleration'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Max Acceleration")
          .appendField(new Blockly.FieldNumber(1.4, 0, 10), "maxAcceleration");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(50);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setMaxAcceleration'] = function(block) {
    var number_maxAcceleration = block.getFieldValue('maxAcceleration');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["maxAcceleration"].value =' + number_maxAcceleration + ';';
    return code;
  };

  Blockly.Blocks['setMaxDeceleration'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Max Deceleration")
          .appendField(new Blockly.FieldNumber(-1.4, -10, 0), "maxDeceleration");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setMaxDeceleration'] = function(block) {
    var number_maxDeceleration = block.getFieldValue('maxDeceleration');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["maxDeceleration"].value =' + number_maxDeceleration + ';';
    return code;
  };

  Blockly.Blocks['setEnableFollowing'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enable Following")
          .appendField(new Blockly.FieldDropdown([["False","opt_false"], ["True","opt_true"]]), "enableFollowing");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("This variable handles ----.");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setEnableFollowing'] = function(block) {
    var dropdown_enableFollowing  = block.getFieldValue("enableFollowing");
    // TODO: Assemble JavaScript into code variable.
    if(dropdown_enableFollowing == "opt_true" ){
      var dropdown_value = true;
    } else if (dropdown_enableFollowing == "opt_false"){
      var dropdown_value = false;
    }

    var code = 'parameters_dict["enableFollowing"].value =' + dropdown_value + ';';
    return code;
  };
  
  Blockly.Blocks['setEnableSwerving'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enable Swerving")
          .appendField(new Blockly.FieldDropdown([["False","opt_false"], ["True","opt_true"]]), "enableSwerving");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
   this.setTooltip("This variable handles ----.");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setEnableSwerving'] = function(block) {
    var dropdown_enableSwerving  = block.getFieldValue("enableSwerving");
    // TODO: Assemble JavaScript into code variable.
    if(dropdown_enableSwerving == "opt_true" ){
      var dropdown_value = true;
    } else if (dropdown_enableSwerving == "opt_false"){
      var dropdown_value = false;
    }

    var code = 'parameters_dict["enableSwerving"].value =' + dropdown_value + ';';
    return code;
  };

  Blockly.Blocks['setMinFollowingDistance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Min Following Distance")
          .appendField(new Blockly.FieldNumber(30, 0, 50), "minFollowingDistance");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(170);
   this.setTooltip("Should be bigger than Distance to follow. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setMinFollowingDistance'] = function(block) {
    var number_minFollowingDistance = block.getFieldValue('minFollowingDistance');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["minFollowingDistance"].value =' + number_minFollowingDistance + ';';
    return code;
  };

  Blockly.Blocks['setMinDistanceToAvoid'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Min Distance To Avoid")
          .appendField(new Blockly.FieldNumber(0.5, 0, 10), "minDistanceToAvoid");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(140);
   this.setTooltip("Should be smaller than minFollowingDistance and larger than maxDistanceToAvoid. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setMinDistanceToAvoid'] = function(block) {
    var number_minDistanceToAvoid = block.getFieldValue('minDistanceToAvoid');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["minDistanceToAvoid"].value =' + number_minDistanceToAvoid + ';';
    return code;
  };

  Blockly.Blocks['setMaxDistanceToAvoid'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Max Distance To Avoid")
          .appendField(new Blockly.FieldNumber(0.5, 0, 10), "maxDistanceToAvoid");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(110);
   this.setTooltip("Should be smaller than minDistanceToAvoid. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setMaxDistanceToAvoid'] = function(block) {
    var number_maxDistanceToAvoid = block.getFieldValue('maxDistanceToAvoid');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["maxDistanceToAvoid"].value =' + number_maxDistanceToAvoid + ';';
    return code;
  };
  
  Blockly.Blocks['setEnableStopSignBehavior'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enable Stop Sign Behavior")
          .appendField(new Blockly.FieldDropdown([["False","opt_false"], ["True","opt_true"]]), "enableStopSignBehavior");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(80);
   this.setTooltip("This variable handles ----.");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setEnableStopSignBehavior'] = function(block) {
    var dropdown_enableStopSignBehavior  = block.getFieldValue("enableStopSignBehavior");
    // TODO: Assemble JavaScript into code variable.
    if(dropdown_enableStopSignBehavior == "opt_true" ){
      var dropdown_value = true;
    } else if (dropdown_enableStopSignBehavior == "opt_false"){
      var dropdown_value = false;
    }
    var code = 'parameters_dict["enableStopSignBehavior"].value =' + dropdown_value + ';';
    return code;
  };

  Blockly.Blocks['setEnableTrafficLightBehavior'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enable Traffic Light Behavior")
          .appendField(new Blockly.FieldDropdown([["False","opt_false"], ["True","opt_true"]]), "enableTrafficLightBehavior");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(50);
   this.setTooltip("This variable handles ----.");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setEnableTrafficLightBehavior'] = function(block) {
    var dropdown_enableTrafficLightBehavior  = block.getFieldValue("enableTrafficLightBehavior");
    // TODO: Assemble JavaScript into code variable.
    if(dropdown_enableTrafficLightBehavior == "opt_true" ){
      var dropdown_value = true;
    } else if (dropdown_enableTrafficLightBehavior == "opt_false"){
      var dropdown_value = false;
    }
    var code = 'parameters_dict["enableTrafficLightBehavior"].value =' + dropdown_value + ';';
    return code;
  };

  Blockly.Blocks['setEnableLaneChange'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enable Lane Change")
          .appendField(new Blockly.FieldDropdown([["False","opt_false"], ["True","opt_true"]]), "enableLaneChange");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
   this.setTooltip("This variable handles ----.");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setEnableLaneChange'] = function(block) {
    var dropdown_enableLaneChange  = block.getFieldValue("enableLaneChange");
    // TODO: Assemble JavaScript into code variable.
    if(dropdown_enableLaneChange == "opt_true" ){
      var dropdown_value = true;
    } else if (dropdown_enableLaneChange == "opt_false"){
      var dropdown_value = false;
    }
    var code = 'parameters_dict["enableLaneChange"].value =' + dropdown_value + ';';
    return code;
  };

    Blockly.Blocks['setHorizontalSafetyDistance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Horizontal Safety Distance")
          .appendField(new Blockly.FieldNumber(0.05, 0, 1), "horizontalSafetyDistance");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setHorizontalSafetyDistance'] = function(block) {
    var number_horizontalSafetyDistance = block.getFieldValue('horizontalSafetyDistance');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["horizontalSafetyDistance"].value =' + number_horizontalSafetyDistance + ';';
    return code;
  };
  
  Blockly.Blocks['setVerticalSafetyDistance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Vertical Safety Distance")
          .appendField(new Blockly.FieldNumber(0.05, 0, 1), "verticalSafetyDistance");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
   this.setTooltip("This variable handles ----. Min: -- Max --");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setVerticalSafetyDistance'] = function(block) {
    var number_verticalSafetyDistance = block.getFieldValue('verticalSafetyDistance');
    // TODO: Assemble JavaScript into code variable.
    var code = 'parameters_dict["verticalSafetyDistance"].value =' + number_verticalSafetyDistance + ';';
    return code;
  };

  Blockly.Blocks['setVelocitySource'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Velocity Source")
          .appendField(new Blockly.FieldDropdown([["autoware current_velocities","1"], ["odometry","0"], ["car_info","2"]]), "velocitySource");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(170);
   this.setTooltip("Reads velocities from (0- Odometry, 1- autoware current_velocities, 2- car_info)");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['setVelocitySource'] = function(block) {
    var dropdown_velocitySource  = block.getFieldValue("velocitySource");
    // TODO: Assemble JavaScript into code variable.
    if(dropdown_velocitySource == "0" ){
      var dropdown_value = "0";
    } else if (dropdown_velocitySource == "1"){
      var dropdown_value = "1";
    } else if (dropdown_velocitySource == "2"){
      var dropdown_value = "2";
    }
    var code = 'parameters_dict["velocitySource"].value =' + dropdown_value + ';';
    return code;
  };

function getSourceCode(){
    runCode();
    // var new_code = showCode();
    // var encoded_code = new_code.replace(/;/g,'');
    // document.getElementById("source_code_textbox").innerHTML = encoded_code;
}
function pushCode(){
    //Ajax call to the server /generateCode
    var current_gen_code = localStorage.getItem("generated_code");
    var dup = false;
    alert(current_gen_code);
    var image_name = prompt("Please enter your new image name. No duplicate names, special characters, or spaces.");
    if (image_name != null){
      var sani_image_name = sanitizeString(image_name).toLowerCase();
      //Check for duplicate
      $.ajax({
        type          :'POST',
        url           :'http://uranium.snu.ac.kr:7780/readImage',
        data          :{
                          name: email,
                      },
        dataType      :'text',
        encode        :true,
        async         :false,
        error         :function(req, err){
                          console.log(err);
                      }
      })
      .done(function(response){
        // Parse the input into an array of json elements
        var data_split = response.replace("{","").replace("}","").split("',");
        for (var i = 0; i < data_split.length; i++) {
            data_split[i] = data_split[i].replace(/'/g,"");
        }
        var imageList = new Array();
        data_split.forEach(function(item){
          imageList.push(item);
        });
        imageList.forEach(function(item){
          if( sani_image_name == item){
            dup = true;   //duplicate name found
          }
        });
      });      
      
      if(dup){
        alert("No duplicate Docker Image names permitted.");
      }else{
        if (confirm("Are you sure you want to add a new Docker Image named [ " + sani_image_name + " ]?")){
            //ajax generateCode
            $.ajax({
              type          :'POST',
              url           :'http://uranium.snu.ac.kr:7780/addCode',
              data          :{
                                name       : email,
                                image_name : sani_image_name,
                                code       : current_gen_code
                            },
              dataType      :'text',
              encode        :true,
              async         :false,
              error         :function(req, err){
                                console.log(err + 'in ajax error..');
                            }
            })
            .done(function(response){
                //Success or failure message
                console.log(response + "in response..");
            }); 
        } else {
          alert("New Docker Image not added."); 
          }        
      }
    }


    //Send user defined path & launch file as a string?

    //include an alert where you can put the path the user wants?

    //we need the username, user inputted path, and code, then the ajax call to "/generateCode"
}

function sanitizeString(str){
    str = str.replace(/[^a-z0-9_-]/gim,"");
    return str.trim();
}

getSourceCode();

