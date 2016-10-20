// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.test.TestViewerApp');

goog.require('goog.array');
goog.require('myphysicslab.lab.app.RigidBodyEventHandler');
goog.require('myphysicslab.lab.app.SimController');
goog.require('myphysicslab.lab.app.SimRunner');
goog.require('myphysicslab.lab.controls.CheckBoxControl');
goog.require('myphysicslab.lab.controls.ChoiceControl');
goog.require('myphysicslab.lab.controls.GroupControl');
goog.require('myphysicslab.lab.controls.LabControl');
goog.require('myphysicslab.lab.controls.NumericControl');
goog.require('myphysicslab.lab.engine2D.CollisionHandling');
goog.require('myphysicslab.lab.engine2D.ContactSim');
goog.require('myphysicslab.lab.model.DampingLaw');
goog.require('myphysicslab.lab.engine2D.ExtraAccel');
goog.require('myphysicslab.lab.model.Gravity2Law');
goog.require('myphysicslab.lab.model.GravityLaw');
goog.require('myphysicslab.lab.engine2D.RigidBodySim');
goog.require('myphysicslab.lab.graph.EnergyBarGraph');
goog.require('myphysicslab.lab.graph.DisplayAxes');
goog.require('myphysicslab.lab.model.CollisionAdvance');
goog.require('myphysicslab.lab.model.ConstantForceLaw');
goog.require('myphysicslab.lab.model.CoordType');
goog.require('myphysicslab.lab.model.DiffEqSolverSubject');
goog.require('myphysicslab.lab.util.Clock');
goog.require('myphysicslab.lab.util.AbstractSubject');
goog.require('myphysicslab.lab.util.DoubleRect');
goog.require('myphysicslab.lab.util.GenericObserver');
goog.require('myphysicslab.lab.util.ParameterBoolean');
goog.require('myphysicslab.lab.util.ParameterNumber');
goog.require('myphysicslab.lab.util.ParameterString');
goog.require('myphysicslab.lab.util.ScriptParser');
goog.require('myphysicslab.lab.util.Subject');
goog.require('myphysicslab.lab.util.SubjectList');
goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.lab.util.Vector');
goog.require('myphysicslab.lab.view.DisplayClock');
goog.require('myphysicslab.lab.view.DisplayShape');
goog.require('myphysicslab.lab.view.SimView');
goog.require('myphysicslab.sims.engine2D.ElasticitySetter');
goog.require('myphysicslab.sims.engine2D.RigidBodyObserver');
goog.require('myphysicslab.sims.layout.CommonControls');
goog.require('myphysicslab.sims.layout.StandardGraph1');
goog.require('myphysicslab.sims.layout.VerticalLayout');
goog.require('myphysicslab.sims.roller.PathObserver');
goog.require('myphysicslab.test.CircleCircleTest');
goog.require('myphysicslab.test.CircleStraightTest');
goog.require('myphysicslab.test.DoNothingTest');
goog.require('myphysicslab.test.JointTest');
goog.require('myphysicslab.test.MiscellanyTest');
goog.require('myphysicslab.test.MultipleCollisionTest');
goog.require('myphysicslab.test.PileTest');
goog.require('myphysicslab.test.RopeTest');
goog.require('myphysicslab.test.SpeedTest');
goog.require('myphysicslab.test.StraightStraightTest');

goog.scope(function() {

var lab = myphysicslab.lab;
var sims = myphysicslab.sims;

var CheckBoxControl = lab.controls.CheckBoxControl;
var ChoiceControl = lab.controls.ChoiceControl;
var Clock = lab.util.Clock;
var CollisionAdvance = lab.model.CollisionAdvance;
var CollisionHandling = lab.engine2D.CollisionHandling;
var CommonControls = sims.layout.CommonControls;
var AbstractSubject = lab.util.AbstractSubject;
var ConstantForceLaw = lab.model.ConstantForceLaw;
var ContactSim = lab.engine2D.ContactSim;
var CoordType = lab.model.CoordType;
var DampingLaw = lab.model.DampingLaw;
var DebugLevel = lab.model.CollisionAdvance.DebugLevel;
var DiffEqSolverSubject = lab.model.DiffEqSolverSubject;
var DisplayClock = lab.view.DisplayClock;
var DisplayShape = lab.view.DisplayShape;
var DoubleRect = lab.util.DoubleRect;
var ElasticitySetter = sims.engine2D.ElasticitySetter;
var EnergyBarGraph = lab.graph.EnergyBarGraph;
var ExtraAccel = lab.engine2D.ExtraAccel;
var GenericObserver = lab.util.GenericObserver;
var Gravity2Law = lab.model.Gravity2Law;
var GravityLaw = lab.model.GravityLaw;
var GroupControl = lab.controls.GroupControl;
var LabControl = lab.controls.LabControl;
var NumericControl = lab.controls.NumericControl;
var ParameterBoolean = lab.util.ParameterBoolean;
var ParameterNumber = lab.util.ParameterNumber;
var ParameterString = lab.util.ParameterString;
var PathObserver = sims.roller.PathObserver;
var RigidBodyEventHandler = lab.app.RigidBodyEventHandler;
var RigidBodyObserver = sims.engine2D.RigidBodyObserver;
var RigidBodySim = lab.engine2D.RigidBodySim;
var ScriptParser = lab.util.ScriptParser;
var SimController = lab.app.SimController;
var SimRunner = lab.app.SimRunner;
var SimView = lab.view.SimView;
var DisplayAxes = lab.graph.DisplayAxes;
var StandardGraph1 = sims.layout.StandardGraph1;
var Subject = lab.util.Subject;
var SubjectList = lab.util.SubjectList;
var UtilityCore = lab.util.UtilityCore;
var Vector = lab.util.Vector;
var VerticalLayout = sims.layout.VerticalLayout;
var WayPoint = lab.model.CollisionAdvance.WayPoint;

/** Interactively run and view various engine2D tests after selecting the
test to run from a set of menus. This lets us see what a test is doing; it uses the
'_setup' method of the test to configure the simulation -- creating and arranging the
initial state of objects. What you see should be exactly the same as what happens when
running the test.

TestViewerApp examines a certain set of test classes and finds methods whose
names end with '_setup' and adds the name of those tests to the menus. So it is only the
'setup' methods for the various tests that can be run here, not the actual tests.

In most cases, TestViewerApp should show the exact same results as the tests. There
are a few tests that make changes outside of the _setup function for the test.

TestViewerApp has two levels of menus: a group menu for each group of tests,
and another menu for individual tests. Selecting from the group menu changes what tests
are available in the individual tests menu. Selecting from the individual tests menu
starts that test running.

The main difference between how tests are run here in TestViewerApp versus
how they are run in Engine2DTests is: in Engine2DTests we make a new
ContactSim for each test, whereas in TestViewerApp we reuse the
ContactSim. This is necessary because of the complex web of connections between
controls, simulation, builder, etc. In future, it might be better to copy how
Engine2DTests works and make a new ContactSim for each test.

WARNING: when trying to debug a test: check whether the options on the ContactSim and
CollisionAdvance are different than the Engine2DTests options; such as
ImpulseSim.setCollisionHandling, CollisionAdvance.setJointSmallImpacts,
ContactSim.setExtraAccel, ContactSim.setExtraAccelTimeStep, the DiffEqSolver,
the timeStep, etc.


## How TestViewerApp Works

+ In setupSimControls, look in a set of specified classes (e.g. StraightStraightTest,
    CircleStraightTest, etc.)

+ Iterate over all methods in each class, looking for any methods that end with
    '_setup'

+ Make a list of '_setup' methods and their names

+ Make a set of menus, one menu item for each '_setup' method

+ When the menu item selected:  reset the sim;  run the selected '_setup' method.


## Does Not Work With Advanced Compile

Under advanced compile the compiler decides that we
don't need any of the tests so all of the static test classes are empty functions.
This is because we find test functions to call by looking at properties of
a test group object like `myphysicslab.test.StraightStraightTest` and then we
form a menu of the functions whose name ends with `_setup`.  But we never actually
call those functions in a way that the compiler would see.


## Communicating the Time Step

The reason for storing the time step in AdvanceStrategy is
so that TestViewer produces same results as running a test.  This is a way to
communicate the time step to the TestViewer.  VERY IMPORTANT for reproducing
results.  See `TestViewer.startTest_` where we set the timestep on the `SimRunner`.


## Communicating the Sim Rect

If a test sets a specific simulation rectangle on the ContactSim then we use that.
Otherwise we try to find a rectangle that encloses all the objects and then some.
See {@link #setSimRect_}.


## Gravity and Damping Get Special Treatment

Because GravityLaw and DampingLaw get recreated for each test we search for them after
building each test and connect the respective gravity and damping controls to them.

Another consequence is that we don't provide GravityLaw or DampingLaw to the
ScriptParser, so these aren't as easily scriptable as in other apps. However, there are
short names defined for them, so it is still relatively easy to add JavaScript to a URL
script like this:

    gravityLaw.setGravity(7);

The gravity and damping controls are 'built-in' to the HTML, and there is special
code for finding the HTML controls and connecting them. There is also a special
method for inserting a control before these built-in gravity and damping controls,
see {@link #prependControl}.

@todo rename to reflect this is the test viewer for engine2D tests only?

* @param {!VerticalLayout.elementIds} elem_ids specifies the names of the HTML
*    elementId's to look for in the HTML document; these elements are where the user
*    interface of the simulation is created.
* @constructor
* @final
* @struct
* @extends {myphysicslab.lab.util.AbstractSubject}
* @implements {SubjectList}
* @export
*/
myphysicslab.test.TestViewerApp = function(elem_ids) {
  UtilityCore.setErrorHandler();
  AbstractSubject.call(this, 'TEST_VIEWER_APP');

  /**  The test classes in which test functions are found.
  * @type {!Array<!Object>}
  * @private
  */
  this.groups_ = [];

  /** Name of each group, to display in menu of group choices.
  * @type {!Array<string>}
  * @private
  */
  this.groupNames_ = [];

  /** Which group is currently selected.
  * @type {number}
  * @private
  */
  this.groupSelected_ = -1;

  /**  The 'setup' test functions.  They create and arrange the set of objects
  * that comprise the test.
  * @type {!Array<function(!ContactSim, !CollisionAdvance)>}
  * @private
  */
  this.tests_ = [];

  /** Name of each test, to display in menu of test functions.
  * @type {!Array<string>}
  * @private
  */
  this.testNames_ = [];

  /** Which test is currently selected.
  * @type {number}
  * @private
  */
  this.testSelected_ = -1;

  /** Whether tests should start when loaded.
  * @type {boolean}
  * @private
  */
  this.startOnLoad_ = true;

  /** @type {!VerticalLayout} */
  this.layout = new VerticalLayout(elem_ids);
  var sim_controls = this.layout.sim_controls;
  // keep reference to terminal to make for shorter 'expanded' names
  this.terminal = this.layout.terminal;
  var simCanvas = this.layout.simCanvas;
  var graphCanvas = this.layout.graphCanvas;
  var div_sim = this.layout.div_sim;
  /** @type {!myphysicslab.lab.engine2D.ContactSim} */
  this.sim = new ContactSim();
  this.terminal.setAfterEval(goog.bind(this.sim.modifyObjects, this.sim));
  // Ensure that changes to parameters or variables cause display to update
  new GenericObserver(this.sim, goog.bind(function(evt) {
    this.sim.modifyObjects();
  }, this), 'modifyObjects after parameter or variable change');
  // note that each test should be setting these various parameters.
  this.sim.setShowForces(true);
  this.sim.setCollisionHandling(CollisionHandling.SERIAL_GROUPED_LASTPASS);
  this.sim.setExtraAccel(ExtraAccel.VELOCITY_AND_DISTANCE);
  this.simList = this.sim.getSimList();
  /** @type {!myphysicslab.lab.model.CollisionAdvance} */
  this.advance = new CollisionAdvance(this.sim);
  this.advance.setJointSmallImpacts(true);
  this.advance.setDebugLevel(DebugLevel.OPTIMAL);
  //this.advance.addWayPoints([WayPoint.NEXT_STEP_ESTIMATE, WayPoint.NEXT_STEP_BINARY]);
  /** @type {!myphysicslab.lab.util.DoubleRect} */
  this.simRect = new DoubleRect(-6, -6, 6, 6);
  /** @type {!myphysicslab.lab.view.SimView} */
  this.simView = new SimView('simView', this.simRect);
  this.displayList = this.simView.getDisplayList();
  simCanvas.addView(this.simView);
  /** @type {!myphysicslab.lab.view.SimView} */
  this.statusView = new SimView('status', new DoubleRect(-10, -10, 10, 10));
  simCanvas.addView(this.statusView);
  /** @type {!myphysicslab.lab.graph.DisplayAxes} */
  this.axes = CommonControls.makeAxes(this.simView);
  /** @type {!myphysicslab.lab.app.SimRunner} */
  this.simRun = new SimRunner(this.advance);
  this.simRun.setTimeStep(0.025);
  this.simRun.addCanvas(simCanvas);
  this.simRun.getParameterNumber(SimRunner.en.TIME_STEP).setSignifDigits(7);
  this.clock = this.simRun.getClock();
  this.clock.getParameterNumber(Clock.en.TIME_RATE).setSignifDigits(5);
  /** @type {!myphysicslab.lab.app.RigidBodyEventHandler} */
  this.rbeh = new RigidBodyEventHandler(this.sim, this.clock);
  /** @type {!myphysicslab.lab.app.SimController} */
  this.simCtrl = new SimController(simCanvas, this.rbeh);
  /** @type {!RigidBodyObserver} */
  this.rbo = new RigidBodyObserver(this.simList, this.simView.getDisplayList());
  this.pathObserve = new PathObserver(this.simList, this.simView,
      /*simRectSetter=*/null);
  //this.advance.setDebugPaint(goog.bind(this.simRun.paintAll, this.simRun));

   /** @type {!DampingLaw} */
  this.dampingLaw;
  /** @type {!GravityLaw} */
  this.gravityLaw;

  // make the group test menu
  this.addGroup_(myphysicslab.test.StraightStraightTest, 'Straight/Straight');
  this.addGroup_(myphysicslab.test.CircleStraightTest, 'Circle/Straight');
  this.addGroup_(myphysicslab.test.CircleCircleTest, 'Circle/Circle');
  this.addGroup_(myphysicslab.test.DoNothingTest, 'DoNothingGrinder');
  this.addGroup_(myphysicslab.test.MiscellanyTest, 'Miscellany');
  this.addGroup_(myphysicslab.test.PileTest, 'Pile');
  this.addGroup_(myphysicslab.test.MultipleCollisionTest, 'Multiple Collision');
  this.addGroup_(myphysicslab.test.JointTest, 'Joints');
  this.addGroup_(myphysicslab.test.RopeTest, 'Ropes');
  this.addGroup_(myphysicslab.test.SpeedTest, 'Speed');

  /** @type {!ParameterNumber} */
  var pn;
  /** @type {!ParameterString} */
  var ps;
  /** @type {!ParameterBoolean} */
  var pb;

  var pbc = CommonControls.makePlaybackControls(this.simRun);
  this.prependControl(pbc);
  // insert a <BR> element to break up long lines of controls into logical groups
  var br = new GroupControl('BR', document.createElement('BR'), []);
  this.prependControl(br);

  this.addParameter(pn = new ParameterNumber(this, TestViewerApp.en.GROUP,
      TestViewerApp.i18n.GROUP, this.getGroup, this.setGroup,
      this.groupNames_, goog.array.range(this.groupNames_.length)));
  // The menu showing the available groups of tests.
  this.prependControl(new ChoiceControl(pn, /*label=*/''));

  /** individual test parameter
  * @type {!ParameterNumber}
  * @private
  */
  this.testParam_ = new ParameterNumber(this, TestViewerApp.en.TEST,
      TestViewerApp.i18n.TEST, this.getTest, this.setTest,
      this.testNames_, goog.array.range(this.testNames_.length));
  this.addParameter(this.testParam_);
  // The menu showing the available test functions for the current group.
  this.prependControl(new ChoiceControl(this.testParam_, /*label=*/''));

  this.addParameter(pb = new ParameterBoolean(this, TestViewerApp.en.START_ON_LOAD,
      TestViewerApp.i18n.START_ON_LOAD, this.getStartOnLoad, this.setStartOnLoad));
  this.prependControl(new CheckBoxControl(pb));

  br = new GroupControl('BR', document.createElement('BR'), []);
  this.prependControl(br);

  // The damping and gravity controls appear here in the list of controls.

  this.elasticity = new ElasticitySetter(this.sim);
  pn = this.elasticity.getParameterNumber(ElasticitySetter.en.ELASTICITY);
  this.addControl(new NumericControl(pn));

  br = new GroupControl('BR', document.createElement('BR'), []);
  this.addControl(br);

  pb = this.sim.getParameterBoolean(RigidBodySim.en.SHOW_FORCES);
  this.addControl(new CheckBoxControl(pb));

  /** @type {!EnergyBarGraph} */
  this.energyGraph = new EnergyBarGraph(this.sim);
  /** @type {!ParameterBoolean} */
  this.showEnergyParam = CommonControls.makeShowEnergyParam(this.energyGraph,
      this.statusView, this);
  this.addControl(new CheckBoxControl(this.showEnergyParam));

  /** @type {!DisplayClock} */
  this.displayClock = new DisplayClock(goog.bind(this.sim.getTime, this.sim),
      goog.bind(this.clock.getRealTime, this.clock), /*period=*/2, /*radius=*/2);
  this.displayClock.setPosition(new Vector(8, 4));
  /** @type {!ParameterBoolean} */
  this.showClockParam = CommonControls.makeShowClockParam(this.displayClock,
      this.statusView, this);
  this.addControl(new CheckBoxControl(this.showClockParam));

  var panzoom = CommonControls.makePanZoomControls(this.simView,
      /*overlay=*/true,
      goog.bind(function () { this.simView.setSimRect(this.simRect); }, this));
  this.layout.div_sim.appendChild(panzoom);
  /** @type {!ParameterBoolean} */
  this.panZoomParam = CommonControls.makeShowPanZoomParam(panzoom, this);
  this.panZoomParam.setValue(true);
  this.addControl(new CheckBoxControl(this.panZoomParam));

  br = new GroupControl('BR', document.createElement('BR'), []);
  this.addControl(br);

  pn = this.simRun.getParameterNumber(SimRunner.en.TIME_STEP);
  this.addControl(new NumericControl(pn));
  pn = this.simRun.getClock().getParameterNumber(Clock.en.TIME_RATE);
  this.addControl(new NumericControl(pn));

  /** @type {!DiffEqSolverSubject} */
  this.diffEqSolver = new DiffEqSolverSubject(this.sim, this.sim, this.advance);
  ps = this.diffEqSolver.getParameterString(DiffEqSolverSubject.en.DIFF_EQ_SOLVER);
  this.addControl(new ChoiceControl(ps));

  /** @type {!StandardGraph1} */
  this.graph = new StandardGraph1(this.sim.getVarsList(), this.layout.graphCanvas,
      this.layout.graph_controls, this.layout.div_graph, this.simRun, 'inline');

  DisplayShape.nameColor = 'gray';
  DisplayShape.nameFont = '12pt sans-serif';
  DisplayShape.nameRotate = 0;

  /** @type {!ScriptParser} */
  this.scriptParser = this.makeScriptParser();
  this.terminal.setParser(this.scriptParser);
  this.addControl(CommonControls.makeURLScriptButton(this.scriptParser, this.simRun));
};
var TestViewerApp = myphysicslab.test.TestViewerApp;
goog.inherits(TestViewerApp, AbstractSubject);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  TestViewerApp.prototype.toString = function() {
    return this.toStringShort().slice(0, -1)
        + TestViewerApp.superClass_.toString.call(this);
  };
};

/** @inheritDoc */
TestViewerApp.prototype.getClassName = function() {
  return 'TestViewerApp';
};

/** Define short-cut name replacement rules.  For example 'sim' is replaced
* by 'myApp.sim' when myName is 'myApp'.
* @param {string} myName  the name of this object, valid in global Javascript context.
* @export
*/
TestViewerApp.prototype.defineNames = function(myName) {
  if (UtilityCore.ADVANCED)
    return;
  this.terminal.addWhiteList(myName);
  this.terminal.addRegex('advance|axes|clock|diffEqSolver|displayClock'
      +'|energyGraph|graph|layout|sim|simCtrl|simList|simRect|simRun'
      +'|simView|statusView|terminal',
      myName);
  this.terminal.addRegex('simCanvas',
      myName+'.layout');
  this.terminal.addRegex('gravityLaw|dampingLaw|scriptParser|elasticity',
       myName);
};

/** @inheritDoc */
TestViewerApp.prototype.getSubjects = function() {
  // Important that sim.getVarsList() come after app (=this) and sim, because they
  // might have parameters that change the configuration which changes the set of
  // variables.
  var subjects = [
    this,
    this.sim,
    this.diffEqSolver,
    this.simRun,
    this.simRun.getClock(),
    this.simView,
    this.statusView,
    this.layout.simCanvas,
    this.layout.graphCanvas,
    this.elasticity,
    this.sim.getVarsList()
  ];
  return goog.array.concat(subjects, this.graph.getSubjects());
};

/** Creates the ScriptParser for this app, and adds a 'URL script' button.
*
* If any volatile Subjects are specified, then when a new configuration is set up
* `ScriptParser.update()` will re-memorize those volatile Subjects.
* This helps the resulting `ScriptParser.script()` be much smaller.
* @param {!Array<!Subject>=} opt_volatile additional volatile Subjects
* @return {!ScriptParser}
*/
TestViewerApp.prototype.makeScriptParser = function(opt_volatile) {
  var subjects = this.getSubjects();
  var volatile = [ this.sim.getVarsList(), this.simView, this.elasticity ];
  if (goog.isArray(opt_volatile)) {
    volatile = goog.array.concat(opt_volatile, volatile);
  }
  return CommonControls.makeScriptParser(subjects, volatile, this.simRun);
};

/** Returns index of current group within group menu
* @return {number} index of current group within group menu
*/
TestViewerApp.prototype.getGroup = function() {
  return this.groupSelected_;
};

/** Change to the given group menu, and run the first test of that group
* @param {number} groupIndex index of group within group menu
*/
TestViewerApp.prototype.setGroup = function(groupIndex) {
  if (groupIndex < 0 || groupIndex >= this.groupNames_.length) {
    throw new Error('setGroup: groupIndex='+groupIndex
        +' range=' +this.groupNames_.length);
  }
  if (this.groupSelected_ != groupIndex) {
    this.groupSelected_ = groupIndex;
    this.testSelected_ = -1;
    goog.array.clear(this.tests_);
    goog.array.clear(this.testNames_);
    this.addTestsFrom_(this.groups_[groupIndex]);
    this.testParam_.setChoices(this.testNames_,
        goog.array.range(this.testNames_.length));
    this.testParam_.setValue(0);
    this.broadcastParameter(TestViewerApp.en.GROUP);
  }
};

/** Returns index of current test within test menu
* @return {number} index of current test within test menu
*/
TestViewerApp.prototype.getTest = function() {
  return this.testSelected_;
};

/** Change to run the given test.
* @param {number} index index of test within test menu of current group
*/
TestViewerApp.prototype.setTest = function(index) {
  if (index < 0 || index >= this.testNames_.length) {
    throw new Error('setTest: index='+index+' range='+this.testNames_.length);
  }
  if (this.testSelected_ != index) {
    this.testSelected_ = index;
    this.startTest_(index);
    //this.testMenu_.setChoice(index);
    this.broadcastParameter(TestViewerApp.en.TEST);
  }
};

/**
* @param {!Object} c
* @param {string} name
* @private
*/
TestViewerApp.prototype.addGroup_ = function(c, name) {
  //console.log('addGroup_ '+c+' name='+name);
  this.groups_.push(c);
  this.groupNames_.push(name);
};

/**
* @return {boolean}
*/
TestViewerApp.prototype.getStartOnLoad = function() {
  return this.startOnLoad_;
};

/**
* @param {boolean} value
*/
TestViewerApp.prototype.setStartOnLoad = function(value) {
  if (this.startOnLoad_ != value) {
    this.startOnLoad_ = value;
    this.broadcastParameter(TestViewerApp.en.START_ON_LOAD);
  }
};

/** Adds tests from the given class to the menu of available tests.
Tests are static methods that take a parameter of type ContactSim
and return `undefined`.
The test added must end with '_setup';  the menu name is generated from
the test method name by changing all underscores to blanks, and removing
the '_setup' suffix.
* @param {!Object} c the class whose tests will be added to the menu of available tests.
* @private
*/
TestViewerApp.prototype.addTestsFrom_ = function(c) {
  //console.log('addTestsFrom_ '+c);
  for (var p in c) {
    //console.log('addTestsFrom_ p='+p);
    if (!c.hasOwnProperty(p)) continue;  // skip inherited properties
    if (typeof c[p] !== 'function') continue;  // skip non-functions
    if (!p.match(/.*_setup$/)) continue;  // skip non-setup functions
    var nm = p.replace(/_setup$/, '').replace(/_/g, ' ');
    //console.log('testName='+nm);
    this.testNames_.push(nm);
    this.tests_.push(c[p]);
  }
};

/**  Loads and runs the selected test.
*
Note: Previously, TestViewerApp was rebuilding the entire world (controls, canvas, sim,
display, etc.) and this was causing a lot of confusion. A symptom was that the test
menus were being left behind when switching to a different Builder. Now TestViewerApp’s
reset method is re-using the ContactSim and not rebuilding controls etc.
*
* @param {number} testIndex
* @private
*/
TestViewerApp.prototype.startTest_ = function(testIndex) {
  goog.asserts.assert(goog.isNumber(testIndex));
  DisplayShape.drawCenterOfMass = true;
  DisplayShape.drawDragPoints = true;

  this.sim.setDistanceTol(0.01);
  this.sim.setVelocityTol(0.5);
  this.sim.setCollisionAccuracy(0.6);
  this.sim.cleanSlate();
  this.advance.reset();
  if (goog.DEBUG) {
    console.log('TestViewerApp.startTest group='
      +this.groupNames_[this.groupSelected_]
      +' test="'+this.testNames_[testIndex]+'"');
  }
  // preserve the 'show forces' setting
  var showForce = this.sim.getShowForces();

  // Run the '_setup' method which sets the test initial conditions.
  this.tests_[testIndex](this.sim, this.advance);
  // ensure that we use same timestep that is used in the Engine2DTestRig
  this.simRun.setTimeStep(this.advance.getTimeStep());

  // ensure the correct diffeq solver is displayed
  this.diffEqSolver.broadcastParameter(DiffEqSolverSubject.en.DIFF_EQ_SOLVER);

  //console.log('TestViewerApp.startTest seed='+sim.getRandomSeed());

  // preserve the 'show forces' setting
  this.sim.setShowForces(showForce);
  this.makeGravityControl_();
  this.makeDampingControl_();

  // save initial state of vars, so that 'reset' can be done to return to initial state.
  this.sim.saveInitialState();
  this.setSimRect_();
  this.scriptParser.update();
  this.clock.setTime(this.sim.getTime());
  this.clock.setRealTime(this.sim.getTime());
  if (this.startOnLoad_) {
    this.clock.resume();
  } else {
    this.clock.pause();
  }
  this.simRun.startFiring();
};

/** Find an existing GravityLaw created by a test, make a NumericControl for it.
@return {undefined}
@private
*/
TestViewerApp.prototype.makeGravityControl_ = function() {
  var g = goog.array.find(this.sim.getForceLaws(), function(f, index, array) {
    return f instanceof GravityLaw || f instanceof Gravity2Law;
  });
  var e = /** @type {!HTMLInputElement} */(document.getElementById('gravity_control'));
  if (!goog.isObject(e)) {
    throw new Error('gravity_control not found');
  }
  if (g == null) {
    e.value = '';
    e.disabled = true;
    return;
  } else {
    this.gravityLaw = /** @type {!GravityLaw} */(g);
    var p = this.gravityLaw.getParameterNumber(GravityLaw.en.GRAVITY);
    var nc = new NumericControl(p, e);
    nc.setEnabled(true);
  }
};

/** Find an existing DampingLaw created by a test, make a NumericControl for it.
@return {undefined}
@private
*/
TestViewerApp.prototype.makeDampingControl_ = function() {
  var g = goog.array.find(this.sim.getForceLaws(), function(f, index, array) {
    return f instanceof DampingLaw;
  });
  var e = /** @type {!HTMLInputElement} */(document.getElementById('damping_control'));
  if (!goog.isObject(e)) {
    throw new Error('damping_control not found');
  }
  if (g == null) {
    e.value = '';
    e.disabled = true;
    return;
  } else {
    this.dampingLaw = /** @type {!DampingLaw} */(g);
    var p = this.dampingLaw.getParameterNumber(DampingLaw.en.DAMPING);
    var nc = new NumericControl(p, e);
    nc.setEnabled(true);
  }
};

/** Finds a rectangle that surrounds all the objects and set the SimView to
that size. If there are no walls, then sets to twice the size.
@return {undefined}
@private
*/
TestViewerApp.prototype.setSimRect_ = function() {
  // does sim have a specified simRect?
  var simRect = this.sim.getSimRect();
  if (simRect != null) {
    this.simRect = simRect;
  } else {
    // Find a rectangle that surrounds all the objects
    var bods = this.sim.getSimList().toArray();
    if (bods.length == 0) {
      return;
    }
    var rect = bods[0].getBoundsWorld();
    var walls = false;
    goog.array.forEach(bods, function(b, index, array) {
      rect = rect.union(b.getBoundsWorld());
      walls = walls || b.getName().match(/^WALL*/);
    });
    // if no walls, then expand the rectangle
    if (!walls) {
      rect = rect.scale(2.0);
    }
    this.simRect = rect;
  }
  this.simView.setSimRect(this.simRect);
};

/**
* @return {undefined}
* @export
*/
TestViewerApp.prototype.setup = function() {
  if (UtilityCore.ADVANCED) {
    alert('TestViewerApp does not work with advanced-compile');
    return;
  }
  this.setGroup(/*groupIndex=*/0);
  this.layout.showTerminal(true);
  this.layout.showControls(true);
  this.statusView.getDisplayList().add(this.displayClock);
  this.statusView.getDisplayList().add(this.energyGraph);

  this.terminal.parseURLorRecall();
  this.sim.saveInitialState();
  this.sim.modifyObjects();
};

/** Add the control to the set of simulation controls.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
TestViewerApp.prototype.addControl = function(control) {
  return this.layout.addControl(control);
};

/** Add the control to the set of simulation controls, before the damping control.
* @param {!LabControl} control
* @return {!LabControl} the control that was passed in
*/
TestViewerApp.prototype.prependControl = function(control) {
  var element = control.getElement();
  element.style.display = 'inline-block';
  this.layout.controls_.push(control);
  // add playback controls before the pre-existing damping and gravity controls
  var e = /** @type {!HTMLInputElement} */(document.getElementById('damping_control'));
  if (!goog.isObject(e)) {
    throw new Error('damping_control not found');
  }
  // the damping control is wrapped in a LABEL, so need to get its parentNode
  this.layout.sim_controls.insertBefore(element, e.parentNode);
  return control;
};

/** Start the application running.
* @return {undefined}
* @export
*/
TestViewerApp.prototype.start = function() {
  if (UtilityCore.ADVANCED) {
    return;
  }
  this.simRun.startFiring();
};

/** Set of internationalized strings.
@typedef {{
  GROUP: string,
  TEST: string,
  START_ON_LOAD: string
  }}
*/
TestViewerApp.i18n_strings;

/**
@type {TestViewerApp.i18n_strings}
*/
TestViewerApp.en = {
  GROUP: 'group',
  TEST: 'test',
  START_ON_LOAD: 'start on load'
};

/**
@private
@type {TestViewerApp.i18n_strings}
*/
TestViewerApp.de_strings = {
  GROUP: 'Gruppe',
  TEST: 'Pr\u00fcfung',
  START_ON_LOAD: 'beginn nach laden'
};

/** Set of internationalized strings.
@type {TestViewerApp.i18n_strings}
*/
TestViewerApp.i18n = goog.LOCALE === 'de' ? TestViewerApp.de_strings :
    TestViewerApp.en;

}); // goog.scope