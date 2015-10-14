
// steps:
// init:
//   read JSON structure and create scene
// runtime:
//   track hand
//   identify neareast 3D element
//   analyze gesture
//      no object selected: update visibility of nearest 3D element
//      grab: 
//      drag: change position, size, orientation of world + parent + selected child
//      drop: set destination values (wold, parent, selected child), select which object is now the parent
//   update Helpers;

// here are all the fields of a bookmark element:
  // {
  //      "id": 1234,
  //      "URI": "www.wikipedia.com",   // leaf node
  //      "name": "wikipedia",
  //      "type": "3DLink", // "desktop", "VRDesktop" || "3DContainer" || "3DLink" || "billboardContainer" || "bollboardLink"
  //      "model3D": "fourSpheres",
  //      "ThreeJsObjectInScene"
  //      "initialPositionOnParent": {"x": "-0.5", "y": "-0.5", "scale": "1"},
  //      "currentPositionOnParent"
  //      "initialScale"
  //      "currentScale"
  //      "children": "null", // [{"URI":...},{"URI":...}]
  //      "


  //      differenceWithPinchPointPosition
  //      distanceToPinchPointPosition   =
  //      differenceWithInitialPosition
  //      distanceToInitialPosition   =
  //      hovered 
  //      selected
  //  },

var bookmarkTree = 
{
    "URI": "null",   // non-leaf node
    "name": "root",
    "type": "desktop", // "VRDesktop" || "3DContainer" || "3DLink" || "billboardContainer" || "bollboardLink"
    "model3D": "null", // flat surface
    "children": [
        {
            "URI": "www.wikipedia.com",   // leaf node
            "name": "wikipedia",
            "type": "3DLink",
            "model3D": "fourSpheres",
            "initialPositionOnParent": {"x": "-0.5", "y": "-0.5", "z": "-0.5", "scale": "1"},
//            "children": "null"
        },
        {
            "URI": 'http:gmail.com',   // leaf node
            "name": "gmail",
            "type": "3DLink",
            "model3D": "fourSpheres",
            "initialPositionOnParent": {"x": "-0.5", "y": "0.0", "z": "-0.5", "scale": "1"},
//            "children": "null"
        },
        {
            "URI": "null",   // non-leaf node
            "name": "VR",
            "type": "3DContainer",
            "model3D": "fourSpheres",
            "initialPositionOnParent": {"x": "-0.5", "y": "0.5", "z": "-0.5", "scale": "1"},
            "children": [
                {
                    "URI": 'www.vrvana.com',   // leaf node
                    "name": "vrvana",
                    "type": "3DLink",
                    "model3D": "fourSpheres",
                    "initialPositionOnParent": {"x": "-0.5", "y": "0.5", "z": "-0.5", "scale": "1"},
//                    "initialPositionOnParent": {"alpha": "0", "beta": "0", "distance": "1.5", "scale": "1"},
//                    "children": "null"
                },
                {
                    "URI": 'www.vrplayer.com',   // leaf node
                    "name": "VimersiV",
                    "name": "VimersiV",
                    "type": "3DLink",
                    "model3D": "fourSpheres",
                    "initialPositionOnParent": {"x": "-0.5", "y": "0.5", "z": "-0.5", "scale": "1"},
//                    "initialPositionOnParent": {"alpha": "0", "beta": "0", "distance": "1.5", "scale": "1"},
//                    "children": "null"
                },
            ]
        }
    ]
  }
  ;

  // Global Variables for THREE.JS
  var container , camera, scene, renderer , stats;
  // Setting up how big we want the scene to be
  var sceneSize = 100;

  // Get everything set up
  init();
  initScene();

  // Start the frames rolling
  animate();

//function initTestPoint(x,y,z){
//    var geo = new THREE.IcosahedronGeometry( sceneSize / 10 , 0 );
//    var testPoint = new THREE.Mesh( 
//      geo,
//      new THREE.MeshNormalMaterial({
//        blending: THREE.AdditiveBlending,
//        transparent: true,
//        opacity: 0.9
//      })
//    );
//    testPoint.position.x = x;
//    testPoint.position.x = y;
//    testPoint.position.z = z;
//    var light = new THREE.PointLight( 0xffffff , 0.6 );
//    scene.add( testPoint );
//    testPoint.add( light );
//   }

function addToSceneThisBookmarkElementUnderThisOne(newElement, parentElement) {
    console.group("addToSceneThisBookmarkElementUnderThisOne(",newElement,", ",parentElement,")");
    // create the threejs object
    newElement.ThreeJsObjectInScene = createThreeJsObject(newElement);
//        newElement.type,
//        newElement.model3D,
//        newElement.initialPositionOnParent);
    console.assert(newElement.ThreeJsObjectInScene);
    // add the threejs object to parent
    newElement.ThreeJsObjectInScene.scale.set(0.02, 0.02, 0.02);
    parentElement.ThreeJsObjectInScene.add(newElement.ThreeJsObjectInScene);
    // add the threejs object to scene
//    scene.add(newElement.ThreeJsObjectInScene);
    console.groupEnd();
    

}

function init(){
    console.group("init()");
    controller = new Leap.Controller();

    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 
      50 ,
      window.innerWidth / window.innerHeight,
      sceneSize / 100 ,
      sceneSize * 4
    );

    // placing our camera position so it can see everything
    camera.position.z = sceneSize;

    // Getting the container in the right location
    container = document.createElement( 'div' );

    container.style.width      = '100%';
    container.style.height     = '100%';
    container.style.position   = 'absolute';
    container.style.top        = '0px';
    container.style.left       = '0px';
    container.style.background = '#000';

    document.body.appendChild( container );


    // Getting the stats in the right position
    stats = new Stats();

    stats.domElement.style.position  = 'absolute';
    stats.domElement.style.bottom    = '0px';
    stats.domElement.style.right     = '0px';
    stats.domElement.style.zIndex    = '999';

    document.body.appendChild( stats.domElement );


    // Setting up our Renderer
    renderer = new THREE.WebGLRenderer();

    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );


    // Making sure our renderer is always the right size
    window.addEventListener( 'resize', onWindowResize , false );
    initPinchPoint();
    initLights();
    initHelpers();

    controller.connect();

  }

function initScene() {
//    console.groupEnd();
    console.group("initScene()");    
    bookmarkTree.ThreeJsObjectInScene = createThreeJsObject(bookmarkTree); //"desktop");
    // walk the structure and create the scene
    var i = bookmarkTree;
    function traverse(o) {
        console.group("initScene():traverse(",o,")");
        if (o) {
            // if there are children
            if ( o.children) {
                for (var i in o.children) {
                    console.group("children# ",i, " :", o.children[i], " for: ", o.children[i].URI);
                    // add the child 3D object to scene (under my own object)
                    addToSceneThisBookmarkElementUnderThisOne(o.children[i], o);
                    traverse(o.children[i]);
                    console.groupEnd();
                }
            }
        }
        console.groupEnd();
    }
    traverse(bookmarkTree);
    scene.add(bookmarkTree.ThreeJsObjectInScene);
    console.groupEnd();

}



function createThreeJsObject(element){ //type, model3D, initialPositionOnParent) {
    var retThreeJsComplexObject = null;
    neutralMaterial = new THREE.MeshLambertMaterial({
          color:0xf0f0f0,
          wireframe:false,
    });
    
    var lineMaterial = new THREE.LineBasicMaterial({
        color: 0x802020
    });
    
    if (element.type == "desktop") {
        retThreeJsComplexObject = new THREE.Object3D();
        var gridGeometry = new THREE.Geometry();
        // grid
        gridGeometry.vertices.push(
            new THREE.Vector3(  -1, -0.8,  0),
            new THREE.Vector3(   1, -0.8,  0),
            new THREE.Vector3(   1,  0.8,  0),
            new THREE.Vector3(  -1,  0.8,  0),
            new THREE.Vector3(  -1, -0.8,  0)
        );
        var gridLine = new THREE.Line( gridGeometry, lineMaterial );
        scene.add(gridLine);
        retThreeJsComplexObject.add(gridLine);
        retThreeJsComplexObject.position.set(0,0,-200);
        retThreeJsComplexObject.scale.set(100,100,100);
//        scene.add( gridLine );
    } else if ((element.type == "3DContainer" || element.type == "3DLink" ) && (element.model3D == "fourSpheres")) {



        var geoBase = new THREE.IcosahedronGeometry( 10 , 2 );
        var geoTop  = new THREE.IcosahedronGeometry(  4 , 4 );
        var geoLeft = new THREE.IcosahedronGeometry(  2 , 2 );
        var geoMid = new THREE.IcosahedronGeometry(  2 , 2 );

        
        var base = new THREE.Mesh( geoBase , neutralMaterial );
        var top  = new THREE.Mesh( geoTop  , neutralMaterial );
        var left = new THREE.Mesh( geoLeft , neutralMaterial );
        var mid  = new THREE.Mesh( geoMid , neutralMaterial );
        top.position.y = 8;
        left.position.x = -9;
        mid.position = new THREE.Vector3(-4,5,7);
//        mid.position.x = -6;
//        mid.position.y = 5;
//        mid.position.z = 7;

        retThreeJsComplexObject = new THREE.Object3D();
        if(element.initialPositionOnParent.x) {retThreeJsComplexObject.position.x = element.initialPositionOnParent.x;}
        if(element.initialPositionOnParent.y) {retThreeJsComplexObject.position.y = element.initialPositionOnParent.y;}
        if(element.initialPositionOnParent.z) {retThreeJsComplexObject.position.z = element.initialPositionOnParent.z;}
        retThreeJsComplexObject.add(base);
        retThreeJsComplexObject.add(top);
        retThreeJsComplexObject.add(left);
        retThreeJsComplexObject.add(mid);
        
//        var text3d = new THREE.TextGeometry( "test", {
//					size: 80,
//					height: 20,
//					curveSegments: 2,
//					font: "helvetiker"
//
//				});
        var text3dGeo = new THREE.TextGeometry( element.name, {size:2, height:1});
        var wrapper = new THREE.MeshNormalMaterial({color: 0x00ff00});
        text3dGeo.computeBoundingBox();
        var centerOffset = -0.5 * ( text3dGeo.boundingBox.max.x - text3dGeo.boundingBox.min.x );
        var words = new THREE.Mesh(text3dGeo, wrapper);
        words.position.x = centerOffset;
        words.position.y = -7;
        words.position.z = 10;
        words.rotation.y = Math.PI * 0.0;
        
        retThreeJsComplexObject.add(words);
//        text3d.computeBoundingBox();
//        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

//        var textMaterial = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, overdraw: 0.5 } );
//        text = new THREE.Mesh( text3d, textMaterial );
//
//        text.position.x = centerOffset;
//        text.position.y = 100;
//        text.position.z = 0;
//
//        text.rotation.x = 0;
//        text.rotation.y = Math.PI * 2;
//
//        group = new THREE.Group();
//        group.add( text );
//
//        scene.add( group );
        
//        retThreeJsComplexObject.scale.set(1,1,20);
        //var light = new THREE.PointLight( 0x0000ff , 0.9 );
        //retThreeJsComplexObject.add(light);
        //base.add(light);

//            initTestPoint(initialPositionOnParent.x,initialPositionOnParent.y,initialPositionOnParent.z);
    }
    return retThreeJsComplexObject;
}


  // The magical update loop,
  // using the global frame data we assigned
  function update(){
      updatePinchPoint();
  }

//
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//
//  // configure this
  var useGrabInsteadOfPitch = true;
  var counter=0;
  var decounter=0;
//  var handRoll;
//  //var handPalmNormalVector3AtGrabTime;
//  //var handDirectionOfFingersVector3AtSelectionTime;
//  //var frameAtGrabTime;
//  var debugPrintNow = false;
//  var debugPrintNow1 = false;
//  var timeForStep1 = false;
//
  // helpers
  var visualFeedbackConfidenceMesh;
  var visualFeedbackStrengthMesh;
//  var visualFeedbackPalmNormalMesh; 
//  var visualFeedbackFingersDirectionMesh;
//  var visualFeedbackPalmNormalLine;
//  var visualFeedbackFingersDirectionLine;
//  var visualFeedbackPalmNormalLine;
//  var visualFeedbackTarget;
//
  var currentXForNextHelper = 50;
//  var weightZ = 10; // TBD: tune to make the perfect move when changing from one level to another.
//
// 
//  
//
//  // Global Variables for THREE.JS
//  var container , camera, scene, renderer , stats;
//
  // Global variable for leap
  var frame, oframe, controller;
//
//  // Setting up how big we want the scene to be
//  var sceneSize = 100;
//
//  // Materials we will use for visual feedback
//  var selectableHoverMaterial;
//  var selectableNeutralMaterial;
//  var selectableSelectedMaterial;
//
//  var selectables = [];
//
//  // Bool to tell if any selectables are currently
//  // being interacted with. Kinda a crappy name. sry ;)
//  var selectableSelected = false;
//
//  var hoveredSelectable;
//
//
//  // Number of selectable Objects in the field
//  var numOfSelectables = 10;
//
//
//  // Setting up a global variable for the pinch point,
//  // and its strength.
//  // In this case we will use palmPosition, 
//  // because it is the most stable when fingers move
  var pinchPoint, pinchStrength , oPinchStrength;
//  var grabPoint, grabStrength , oGrabStrength;
//  var pinchPointConfidence = 0;
//
//  // The cutoff for pinch strengths
  var pinchStrengthCutoff = .1;
//  var pinchPointCutoff = .2;
//
//  // How quickly the selected selectable will move to
//  // the pinch point
//  var movementStrength = .03; // original:.03;
//
//  // Get everything set up
//  init();
//
//  // Start the frames rolling
//  animate();
//
//
//function init(){
//      console.groupCollapsed("Full info for init");
//      console.log("level2");
//      console.group();
//      console.warn("level3");
//      console.table([{a:1, b:2, c:3},{a:"foo", b:false, c:undefined}]);
//      console.log("i");
//      console.table([[6,7,8],[9,10,11]]);
//      console.groupEnd();
//      console.log("level2 back");
//      console.groupEnd();
//
//    controller = new Leap.Controller();
//
//    scene = new THREE.Scene();
//    
//    camera = new THREE.PerspectiveCamera( 
//      50 ,
//      window.innerWidth / window.innerHeight,
//      sceneSize / 100 ,
//      sceneSize * 4
//    );
//
//    // placing our camera position so it can see everything
//    camera.position.z = sceneSize;
//
//    // Getting the container in the right location
//    container = document.createElement( 'div' );
//
//    container.style.width      = '100%';
//    container.style.height     = '100%';
//    container.style.position   = 'absolute';
//    container.style.top        = '0px';
//    container.style.left       = '0px';
//    container.style.background = '#000';
//
//    document.body.appendChild( container );
//
//
//    // Getting the stats in the right position
//    stats = new Stats();
//
//    stats.domElement.style.position  = 'absolute';
//    stats.domElement.style.bottom    = '0px';
//    stats.domElement.style.right     = '0px';
//    stats.domElement.style.zIndex    = '999';
//
//    document.body.appendChild( stats.domElement );
//
//
//    // Setting up our Renderer
//    renderer = new THREE.WebGLRenderer();
//
//    renderer.setSize( window.innerWidth, window.innerHeight );
//    container.appendChild( renderer.domElement );
//
//
//    // Making sure our renderer is always the right size
//    window.addEventListener( 'resize', onWindowResize , false );
//
//
//    /*
//      INITIALIZE AWESOMENESS!
//    */
//    initPinchPoint();
//    initSelectables();
//    initLights();
//    initHelpers();
//
//    controller.connect();
//
//
//  }
//
  // Creates a pinch point for use to see, 
  // That both contains a wireframe for constant
  // reference, and a globe that gets filled in 
  // the more we pinch. Also, a light that 
function initPinchPoint(){

    var geo = new THREE.IcosahedronGeometry( sceneSize / 10 , 0 );

    pinchPoint = new THREE.Mesh( 
      geo,
      new THREE.MeshNormalMaterial({
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.9
      })
    );
//
//
//    pinchWireframe = new THREE.Mesh( 
//      geo,
//      new THREE.MeshNormalMaterial({
//        blending: THREE.AdditiveBlending,
//        transparent: true,
//        opacity: 0.5,
//        wireframe: true
//      })
//    );

    var light = new THREE.PointLight( 0xffffff , 0.6 );

//    pinchWireframe.position = pinchPoint.position;

    scene.add( pinchPoint );
//    pinchPoint.add( pinchWireframe ); 
    pinchPoint.add( light );

      
      
      
   }

//    
//
//  // Creates our selectables, including 3 different materials
//  // for the different states a selectable can be in
//  function initSelectables(){
//
//    selectableHoverMaterial = new THREE.MeshNormalMaterial({
//        color:0xff8080,
//        wireframe:false,
//    });
//
//    selectableNeutralMaterial = new THREE.MeshLambertMaterial({
//      color:0x404040,
//      wireframe:true,
//    });
//
//    selectableSelectedMaterial = new THREE.MeshNormalMaterial();
//    
//    bookmarkTree = new THREE.Object3D();
//
//    var geo  = new THREE.IcosahedronGeometry( 10 , 2 );
//    var geo1 = new THREE.IcosahedronGeometry( 4 , 4 );
//    var geo2 = new THREE.IcosahedronGeometry( 2 , 2 );
//
//    for( var i = -1; i <= 1 /*numOfSelectables*/; i++ ){
//    for( var j = -1; j <= 1 /*numOfSelectables*/; j++ ){
//        
//      var base        = new THREE.Mesh( geo , selectableNeutralMaterial );
//      var selectable1 = new THREE.Mesh( geo1 , selectableNeutralMaterial );
//      var selectable2 = new THREE.Mesh( geo2 , selectableNeutralMaterial );
//      //var selectable3 = new THREE.Mesh( geo2 , selectableNeutralMaterial );
//      selectable1.position.x = 0;
//      selectable1.position.y = 10;
//      selectable1.position.z = 0;
//      selectable2.position.x = -14;
//      selectable2.position.y = 0;
//      selectable2.position.z = 0;
//      
//       
//      var myComplexObject = new THREE.Object3D();
//      myComplexObject.position.x = 0;
//      myComplexObject.position.y = 0;
//      myComplexObject.position.z = 0;
//      myComplexObject.add(base);
////      myComplexObject.add(base);
//      myComplexObject.add(selectable1);
//      myComplexObject.add(selectable2);
//      
//      myComplexObject.position.x = i * sceneSize / 1;
//      myComplexObject.position.y = j * sceneSize / 2 + 25;
////      myComplexObject.position.z = -2 * sceneSize * 1;
//      myComplexObject.position.z = -200;
//      myComplexObject.initialPosition = myComplexObject.position;
//      myComplexObject.initialPositionX = myComplexObject.position.x;
//      myComplexObject.initialPositionY = myComplexObject.position.y;
//      myComplexObject.initialPositionZ = myComplexObject.position.z;
////      myComplexObject.position.x = ( Math.random() - .5 ) * sceneSize * 1;
////      myComplexObject.position.y = ( Math.random() - .5 ) * sceneSize * 1;
////      myComplexObject.position.z = ( Math.random() - .5 ) * sceneSize * 1;
//      //scene.add( myComplexObject );
//      //scene.add( selectable3 );
//        
//      // Setting a vector which will be the difference from 
//      // the pinch point to the selectable
//      myComplexObject.differenceWithPinchPointPosition = new THREE.Vector3();
//      myComplexObject.distanceToPinchPointPosition   = myComplexObject.differenceWithPinchPointPosition.length();
//
//      // Setting a vector which will be the difference from 
//      // the selectable to its initial position
//      myComplexObject.differenceWithInitialPosition = new THREE.Vector3();
//      myComplexObject.distanceToInitialPosition   = myComplexObject.differenceWithInitialPosition.length();
//
//      // Some booleans that will help us keep track of which 
//      // object is being interacted with
//      myComplexObject.hovered = false;
//      myComplexObject.selected = false;
//      
//      selectables.push( myComplexObject );
//      scene.add( myComplexObject );
//  
//
//    }
//    }
//
//  }
//
//}
function initLights(){

    var light = new THREE.DirectionalLight( 0xffffff , 0.1 );
    light.position.set( 0, 0 , 1 );
    scene.add( light );

    var light1 = new THREE.DirectionalLight( 0xff0000 , 0.5 );
    light1.position.set( 0, -1 , 0.1 );
    scene.add( light1 );

    var light2 = new THREE.DirectionalLight( 0x00ff00 , 0.9 );
    light2.position.set( 1, 0 , 0.02 );
    scene.add( light2 );

    var light3 = new THREE.AmbientLight( 0x101010 );
    scene.add( light3 );
  
  }

function initHelpers(){
    visualFeedbackConfidenceMesh = addThis0to1HelperToScene();
    visualFeedbackStrengthMesh   = addThis0to1HelperToScene();
//    // test 001 var axisHelperMesh = new THREE.AxisHelper( 50 ); scene.add( axisHelperMesh ); 
//    // test 001 axisHelperMesh.rotateOnAxis(new THREE.Vector3(-0.289,0.109,-0.950), 0.05);
//
//    visualFeedbackPalmNormalMesh        = addThisVector3HelperToScene();
//    visualFeedbackFingersDirectionMesh  = addThisVector3HelperToScene();
////    rr pinchPoint.palmNormal = hand.palmNormal;
////    rr  pinchPoint.fingersDirection = hand.direction;
    visualFeedbackPalmNormalLine = addThisNormalHelperToScene();
//    //visualFeedbackFingersDirectionLine = addThisDirectionHelperToScene();
//    visualFeedbackTarget = addThisTargetHelperToScene();
  }

function addThis0to1HelperToScene() {
      var newGeo, newMesh;
      
      // small location point
        newGeo = new THREE.IcosahedronGeometry( sceneSize / 100 , 0 );
        newMesh = new THREE.Mesh( 
            newGeo,
            new THREE.MeshNormalMaterial({
                blending: THREE.AdditiveBlending,
                transparent: false
            })
        );
        newMesh.position.x = currentXForNextHelper;
        newMesh.position.y = 0;
        newMesh.position.z = 0;
        scene.add( newMesh );

      // object itself
        newGeo = new THREE.IcosahedronGeometry( sceneSize / 25 , 1 );
        newMesh = new THREE.Mesh( 
            newGeo,
            new THREE.MeshNormalMaterial({
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.1
            })
        );

        newMesh.position.x = currentXForNextHelper;
        newMesh.position.y = 0;
        newMesh.position.z = 0;
        scene.add( newMesh );
      
        // prepare position for next helper
        currentXForNextHelper += 10;


        return newMesh;

  }

function addThisNormalHelperToScene(x,y,z) {
    x = x || 0; //currentXForNextHelper;
    y = y || 0;
    z = z || 0;
    
    var geometry;
    var linePalm;
    var lineFingers;
    
    var material = new THREE.LineBasicMaterial({
	    color: 0xff0000
    });
    var materialRef = new THREE.LineBasicMaterial({
        color: 0x802020
    });


    // small reference drawing
//    geometry = new THREE.Geometry();
//    //    a2
//    var a1 = new THREE.Vector3( x +  2.5, y - 10 + 2.5, z + 2.5 ), 
//        b1 = new THREE.Vector3( x -  2.5, y - 10 + 2.5, z + 2.5 ), 
//        c1 = new THREE.Vector3( x -  2.5, y - 10 - 2.5, z + 2.5 ), 
//        d1 = new THREE.Vector3( x +  2.5, y - 10 - 2.5, z + 2.5 ), 
//        a2 = new THREE.Vector3( x +  2.5, y - 10 + 2.5, z - 2.5 ), 
//        b2 = new THREE.Vector3( x -  2.5, y - 10 + 2.5, z - 2.5 ), 
//        c2 = new THREE.Vector3( x -  2.5, y - 10 - 2.5, z - 2.5 ), 
//        d2 = new THREE.Vector3( x +  2.5, y - 10 - 2.5, z - 2.5 );
//    geometry.vertices.push(
//        a1,b1,c1,d1,a1,a1,b2,c2,c1,b1,b2
////        /* start  */ a1, 
////        /* square */ b1, c1, d1, a1,
////        /* one    */ a2,
////        /* square */ b2, c2, d2, a2,
////        /*  extra */ b2,
////        /* one    */ b1,
////        /*  extra */ c1,
////        /* one    */ c2,
////        /*  extra */ d2,
////        /* one    */ d1
//    );
//    line = new THREE.Line( geometry, materialRef );
//    scene.add( line );
    
    // object itself
    geometry = new THREE.Geometry();
    geometry.vertices.push(
	    new THREE.Vector3( x +  0, y -  0 +   0, z -   5 ),
	    new THREE.Vector3( x +  0, y -  0 - 3.6, z - 3.6 ),
	    new THREE.Vector3( x +  0, y -  0 -   5, z -   0 ),
	    new THREE.Vector3( x +  0, y -  0 - 3.6, z + 3.6 ),
	    new THREE.Vector3( x +  0, y -  0 -   0, z +   5 ),
	    new THREE.Vector3( x +  0, y -  0 + 3.6, z + 3.6 ),
	    new THREE.Vector3( x +  0, y -  0 +   5, z -   0 ),
	    new THREE.Vector3( x +  0, y -  0 + 3.6, z - 3.6 ),
	    new THREE.Vector3( x +  0, y -  0 +   0, z -   5 ),

        new THREE.Vector3( x +  0, y -  0 +  0, z +  5 ),
        new THREE.Vector3( x +  0, y -  0 +  0, z +  0 ),
        new THREE.Vector3( x -  3, y -  0 +  0, z +  0 )
    );
    linePalm = new THREE.Line( geometry, material );
    //scene.add( line );

    
    
 
    // fingers
    geometryFingers = new THREE.Geometry();
    geometryFingers.vertices.push(
	    new THREE.Vector3( x -   0, y -  0 - 5  , z -   0 ), //  
	    new THREE.Vector3( x -   0, y -  0 - 5  , z -   4 ), 
	    new THREE.Vector3( x - 0.5, y -  0 - 5  , z -   8 ), 
	    new THREE.Vector3( x -   2, y -  0 - 5  , z -  10 ), 
	    new THREE.Vector3( x -   5, y -  0 - 5  , z -  12 ), 
	    new THREE.Vector3( x -   5, y -  0 - 3.5, z -  12 ), 
	    new THREE.Vector3( x -   2, y -  0 - 3.5, z -  10 ), 
	    new THREE.Vector3( x - 0.5, y -  0 - 3.5, z -   8 ), 
	    new THREE.Vector3( x -   0, y -  0 - 3.5, z -   6 ), //
	    new THREE.Vector3( x -   0, y -  0 - 2  , z -   6 ), //
	    new THREE.Vector3( x -   1, y -  0 - 2  , z - 8.5 ),
	    new THREE.Vector3( x -   3, y -  0 - 2  , z -  10 ),
	    new THREE.Vector3( x -   6, y -  0 - 2  , z - 13.5 ),
	    new THREE.Vector3( x -   6, y -  0 - 0.5, z - 13.5 ),
	    new THREE.Vector3( x -   3, y -  0 - 0.5, z - 10.5 ),
	    new THREE.Vector3( x -   1, y -  0 - 0.5, z -   9 ),
	    new THREE.Vector3( x -   0, y -  0 - 0.5, z - 6.5 ),
	    new THREE.Vector3( x -   0, y -  0 + 1  , z - 6.5 ),
	    new THREE.Vector3( x -   1, y -  0 + 1  , z -   9 ),
	    new THREE.Vector3( x -   3, y -  0 + 1  , z - 10.5 ),
	    new THREE.Vector3( x -   6, y -  0 + 1  , z -  14 ),
	    new THREE.Vector3( x -   6, y -  0 + 2.5, z -  14 ),
	    new THREE.Vector3( x -   3, y -  0 + 2.5, z - 10.5 ),
	    new THREE.Vector3( x -   1, y -  0 + 2.5, z -   9 ),
	    new THREE.Vector3( x -   0, y -  0 + 2.5, z -   6 ),
	    new THREE.Vector3( x -   0, y -  0 +   4, z -   6 ),
	    new THREE.Vector3( x - 0.5, y -  0 +   4, z - 8.5 ),
	    new THREE.Vector3( x -   2, y -  0 +   4, z - 10.5 ),
	    new THREE.Vector3( x -   5, y -  0 +   4, z - 12.5 ),
	    new THREE.Vector3( x -   5, y -  0 + 5.5, z - 12.5 ),
	    new THREE.Vector3( x -   2, y -  0 + 5.5, z - 10.5 ),
	    new THREE.Vector3( x - 0.5, y -  0 + 5.5, z -  8.5 ),
	    new THREE.Vector3( x -   0, y -  0 + 5.5, z -   3 ),
	    new THREE.Vector3( x -   6, y -  0 +  10, z -   8 ),
	    new THREE.Vector3( x -   7, y -  0 +  10, z -   6 ),
	    new THREE.Vector3( x - 0.5, y -  0 + 3.6, z + 3.6 ),
	    new THREE.Vector3( x -   0, y -  0 + 3.6, z + 3.6 )
        

    );
    lineFingers = new THREE.Line( geometryFingers, material );

 
     var palmAndFingersObject = new THREE.Object3D();
      palmAndFingersObject.position.x = 12;
//      palmAndFingersObject.position.y = 0;
//      palmAndFingersObject.position.z = 0;
     palmAndFingersObject.add(lineFingers);
     var fingersObject = new THREE.Object3D();
     fingersObject.add(linePalm);
     palmAndFingersObject.add(fingersObject);
   
     var myComplexObject = new THREE.Object3D();
//      myComplexObject.position.x = 0;
//      myComplexObject.position.y = 0;
//      myComplexObject.position.z = 0;
      myComplexObject.add(palmAndFingersObject);
      //scene.add( myComplexObject );

    pinchPoint.add( myComplexObject );
    //pinchPoint.add( lineFingers );
    //pinchPoint.add( pinchWireframe );
    
    // prepare position for next helper
    //currentXForNextHelper += 10;

    return myComplexObject;
}

//function addThisDirectionHelperToScene(x,y,z) {
//    x = x || currentXForNextHelper;
//    y = y || 0;
//    z = z || 0;
//    
//    var geometry;
//    var line;
//    
//    var material = new THREE.LineBasicMaterial({
//	    color: 0xff0000
//    });
//    var material2 = new THREE.LineBasicMaterial({
//        color: 0x802020
//    });
//
//
//    // small reference drawing
//    geometry = new THREE.Geometry();
//    
//    // arrow
//    geometry.vertices.push(
//	    new THREE.Vector3( x +   0, y -   20, z -  0 ),
//	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
//	    new THREE.Vector3( x + 0.5, y -   20, z -  4 ),
//	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
//	    new THREE.Vector3( x - 0.5, y -   20, z -  4 ),
//	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
//	    new THREE.Vector3( x +   0, y - 19.5, z -  4 ),
//	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
//	    new THREE.Vector3( x +   0, y - 20.5, z -  4 ),
//        new THREE.Vector3( x +   0, y -   20, z -  5 )
//    );
//    line = new THREE.Line( geometry, material2 );
//    scene.add( line );
//    
//    // object itself
//    geometry = new THREE.Geometry();
//    geometry.vertices.push(
//	   new THREE.Vector3( x +  0, y +  0, z +  0 ),
//	   new THREE.Vector3( x +  0, y +  5, z +  0 )
//    );
//    line = new THREE.Line( geometry, material );
//    scene.add( line );
//    
//    // prepare position for next helper
//    currentXForNextHelper += 10;
//
//    return line;
//}
//
//function addThisVector3HelperToScene(x,y,z) {
//    x = x || currentXForNextHelper;
//    y = y || 0;
//    z = z || 0;
//      
//      var axisHelperMesh;
//
//      axisHelperMesh = new THREE.AxisHelper( 5 ); scene.add( axisHelperMesh ); 
//      //axisHelperMesh.rotateOnAxis(new THREE.Vector3(0.109,-0.950, -0.289), 0.05);
//      axisHelperMesh.position.add(new THREE.Vector3(x, y, z));
//      
//       // prepare position for next helper
//      currentXForNextHelper += 10;
//      return axisHelperMesh;
//  }
//
//function addThisTargetHelperToScene() {
//    var geometry;
//    var line1, line2;
//    var material = new THREE.LineBasicMaterial({
//	    color: 0xff0000
//    });
//    // Left to Right
//    geometry = new THREE.Geometry();
//    geometry.vertices.push(
//	   new THREE.Vector3(-10, 0, -200 ),
//	   new THREE.Vector3( 10, 0, -200 )
//    );
//    line1 = new THREE.Line( geometry, material );
//    // bottom to top
//    geometry = new THREE.Geometry();
//    geometry.vertices.push(
//	   new THREE.Vector3( 0,-10, -200 ),
//	   new THREE.Vector3( 0, 10, -200 )
//    );
//    line2 = new THREE.Line( geometry, material );
//    
//    var myComplexObject = new THREE.Object3D();
//    myComplexObject.add(line1);
//    myComplexObject.add(line2);
//
//    scene.add( myComplexObject );
//    return myComplexObject;
//  }
//
  // This function moves from a position from leap space, 
  // to a position in scene space, using the sceneSize
  // we defined in the global variables section
function leapToScene( position ){

    var x = position[0] - frame.interactionBox.center[0];
    var y = position[1] - frame.interactionBox.center[1];
    var z = position[2] - frame.interactionBox.center[2];
      
    x /= frame.interactionBox.size[0];
    y /= frame.interactionBox.size[1];
    z /= frame.interactionBox.size[2];

    x *= sceneSize;
    y *= sceneSize;
    z *= sceneSize;

    z -= sceneSize;

    return new THREE.Vector3( x , y , z );

  }

//    
//
//  // The magical update loop,
//  // using the global frame data we assigned
//  function update(){
//
//    updatePinchPoint();
//    //updateGrabPoint();
//    updateSelectables_nearest2D();
//    selectAsPerPitchingGesture();
//    moveSelectables();
//    turnSelectables();
//    //moveSelectedSelectable();
//    //turnSelectedSelectable();
//    updateHelpers();
//  }
//
//
//
//
//
//
//
////////////////////////// update 1 ///////// update-current-hand-position /////////////

  function updatePinchPoint(){
  
    if( frame.hands[0] ){

      var hand = frame.hands[0];
      
      // First position pinch point
      pinchPoint.position = leapToScene( hand.palmPosition );
      //console.group();
      //console.log("p%cos: [ " + hand.palmPosition + ", " + pinchPoint.position + " ]","color: red; font-style: italic",pinchPoint.position);
      //console.table([hand.palmPosition, pinchPoint.position]);
      if (debugPrintNow1) {
          //console.log(hand.palmPosition[0], hand.palmPosition[1], hand.palmPosition[2], "--", pinchPoint.position.x, pinchPoint.position.y, pinchPoint.position.z);
//          console.table([hand.palmPosition, pinchPoint.position]);
          debugPrintNow1 = false;
      }
      //console.groupEnd();
      pinchPoint.palmNormal = hand.palmNormal;
      pinchPoint.fingersDirection = hand.direction;
      
      pinchPoint.pitch = hand.pitch();
      pinchPoint.roll = hand.roll();
      pinchPoint.yaw = hand.yaw();
        
      // fonctionne visualFeedbackPalmNormalMesh.rotateOnAxis(new THREE.Vector3(-0.289,0.109,-0.950), 0.05);
//      visualFeedbackPalmNormalMesh.setRotationFromEuler(new THREE.Euler( pinchPoint.palmNormal[0], pinchPoint.palmNormal[1], pinchPoint.palmNormal[2], 'XYZ' ));
      // fonctionne    visualFeedbackFingersDirectionMesh.setRotationFromEuler(new THREE.Euler( 0, 1, 0.3, 'XYZ' ));     //Vect3.position.set(10,10,0);
//      visualFeedbackFingersDirectionMesh.setRotationFromEuler(new THREE.Euler( pinchPoint.fingersDirection[0], pinchPoint.fingersDirection[1], pinchPoint.fingersDirection[2], 'XYZ' ));     //Vect3.position.set(10,10,0);
//      visualFeedbackFingersDirectionMesh.rotation(new THREE.Euler( 0, 1, 1.57, 'XYZ' ));
        
        
        
//        visualFeedbackPalmNormalLine.child.position.sub(new THREE.Vector3(-100.0, 0,0));
        visualFeedbackPalmNormalLine/*.children[0]*/.setRotationFromEuler(new THREE.Euler( pinchPoint.pitch, -pinchPoint.yaw, 3.14152956/2 + pinchPoint.roll, 'XYZ' ));
//        visualFeedbackPalmNormalLine.child.position.sub(new THREE.Vector3(100.5, 0,0));

        // incomplete     matrix.makeRotationAxis(new THREE.Vector3(0,1,0), 0.5); 
        
        
//      var line_2 = visualFeedbackPalmNormalLine.clone();
//      line_2.setRotationFromEuler(new THREE.Euler( 0, 0, pinchPoint.yaw, 'XYZ' ));
//      visualFeedbackPalmNormalLine = line_2.clone()
//        visualFeedbackPalmNormalLine.rotationAutoUpdate = true;

        // problem:rotate around world origin     visualFeedbackPalmNormalLine.setRotationFromEuler(new THREE.Euler( 0, 0, pinchPoint.yaw, 'XYZ' ));
        
/*
      visualFeedbackPalmNormalLine.clone();
      Object3D_1.setRotationFromEuler(new THREE.Euler( 0, 0, pinchPoint.yaw, 'XYZ' ));
      visualFeedbackPalmNormalLine.rotation = Object3D_1.rotation;
      visualFeedbackPalmNormalLine.updateMatrix();
*/        
        
//      var temp1 = new THREE.Vector3(visualFeedbackPalmNormalLine.position.x, visualFeedbackPalmNormalLine.position.y, visualFeedbackPalmNormalLine.position.z);
//      var temp2 = visualFeedbackPalmNormalLine.position.sub(temp1);
//      // problem:rotate around world origin    visualFeedbackPalmNormalLine.setRotationFromEuler(new THREE.Euler( pinchPoint.palmNormal[0], pinchPoint.palmNormal[1], pinchPoint.palmNormal[2], 'XYZ' ));
//      temp2.applyAxisAngle(new THREE.Vector3(0,1,0), 0.5);
//      var temp3 = visualFeedbackPalmNormalLine.position.add(temp1);
//        new THREE.line.clone(
//      visualFeedbackPalmNormalLine.position.set(temp3.x, temp3.y, temp3.z);
if (0) {
    //      var a=  hand.palmNormal;
//      var b=  hand.pitch();
//      var c=  hand.roll();
//        handRoll = hand.roll();
//      var d=  hand.yaw();
        

//        if (previousFrame && previousFrame.id > 0) {
//            var e=  hand.rotationAngle (previousFrame);
//            //var f=  hand.rotationAxis (previousFrame);
//            //rotationSinceLastGrabStart = hand.rotationAxis (frameAtGrabTime);
//            //var g=  hand.rotationMatrix (previousFrame);
//        }
//      previousFrame = controller.frame(1);
        
//      if (debugPrintNow) {
//          console.log( "Values=");
//          console.log( "       " + (a)?a:"nan");
//          console.log( "              " + b);
//          console.log( "                     " + c);
//          console.log( "                            " + d);
//          console.log( "                                   " + e);
//          if (f) {
//          console.log( "                                          " + f[0] + ',' + f[1] + ',' + f[2]);      
//          }
//          if (g) {
//          console.log( "                                                 " + g);    
//          }
//                          }
}
        
      oPinchStrength = pinchStrength;
        
      if (useGrabInsteadOfPitch) {
        pinchStrength = hand.grabStrength;
      } else {
        pinchStrength = hand.pinchStrength;
      }
        
      pinchPointConfidence = hand.confidence;
        
        
      
        
      // Makes our pinch point material opacity based
      // on pinch strength, to give use visual feedback
      // of how strong we are pinching
      pinchPoint.material.opacity = pinchStrength * pinchPointConfidence;
      pinchPoint.materialNeedsUpdate = true;

    }


  }

//
//  /*
//
//    There are many other ways to write this function,
//    This one is created not for efficiency, but simply
//    for using the most basic functionality ( AKA For Loops )
//    I'll leave it as an excercise to the reader to make it
//    better, possibly using arrays of 'selected objects'
//
//  */
//
//
////////////////////////// update 2 ///////// highlight-nearest-selecteable /////////////
//
//  function updateSelectables_nearest3D(){
//
//    // First for loop is to figure out which 
//    // selectable is the closest
//    for( var i = 0; i < selectables.length; i++ ){
//
//      var selectable = selectables[i];
//      selectable.differenceWithPinchPointPosition.subVectors(
//        selectable.position, 
//        pinchPoint.position
//      );
//
//      selectable.distanceToPinchPointPosition = selectable.differenceWithPinchPointPosition.length();
//
//    }
//
//    // Make sure to only update our selectables
//    // if there is not a selected object, 
//    // otherwise you might be selecting one object,
//    // and than accidentally hover over another one....
//
//    if( !selectableSelected ){
//
//      var closestDistance = Infinity;
//      var closestSelectable;
//
//      // First for loop is to figure out which 
//      // selectable is the closest
//      for( var i = 0; i < selectables.length; i++ ){
//
//        if( selectables[i].distanceToPinchPointPosition < closestDistance ){
//
//          closestSelectable = selectables[i];
//          closestDistance   = selectables[i].distanceToPinchPointPosition;
//
//        }
//
//      }
//
//      // Second for loop is to assign the proper 'hover'
//      // status for each selectable
//      for( var i = 0; i < selectables.length; i++ ){
//
//        if( selectables[i] == closestSelectable ){
//          if( !selectables[i].hovered ){
//            selectables[i].hovered = true;
//            for (child=0; child<selectables[i].children.length; child++){
//                selectables[i].children[child].material = selectableHoverMaterial;
//                 }
//            selectables[i].materialNeedsUpdate = true;
//          }
//
//        }else{
//          if( selectables[i].hovered ){
//            selectables[i].hovered = false;
//            for (child=0; child<selectables[i].children.length; child++){
//                selectables[i].children[child].material = selectableNeutralMaterial;
//            }
//            selectables[i].materialNeedsUpdate = true;
//          }
//        }
//      }
//    }
//  }
//
//
//  function updateSelectables_nearest2D(){
//
//    // First for loop is to figure out which 
//    // selectable is the closest in XY plane (forget Z value)
//    for( var i = 0; i < selectables.length; i++ ){
//
//      var selectable = selectables[i];
//      selectable.differenceWithPinchPointPosition.subVectors(
//        selectable.position, 
//        pinchPoint.position
//      );
//      var deltaX = selectable.position.x - pinchPoint.position.x;
//      var deltaY = selectable.position.y - pinchPoint.position.y;
//      selectable.distanceToPinchPointPosition = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
//
//      selectable.differenceWithInitialPosition.subVectors(
//        selectable.position, 
//        selectable.initialPosition
//      );
//
//      selectable.distanceToInitialPosition = selectable.differenceWithInitialPosition.length();
//
//    }
//
//    // Make sure to only update our selectables
//    // if there is not a selected object, 
//    // otherwise you might be selecting one object,
//    // and than accidentally hover over another one....
//
//    if( !selectableSelected ){
//
//      var closestDistance = Infinity;
//      var closestSelectable;
//
//      // First for loop is to figure out which 
//      // selectable is the closest
//      for( var i = 0; i < selectables.length; i++ ){
//
//        if( selectables[i].distanceToPinchPointPosition < closestDistance ){
//
//          closestSelectable = selectables[i];
//          closestDistance   = selectables[i].distanceToPinchPointPosition;
//
//        }
//
//      }
//
//      // Second for loop is to assign the proper 'hover'
//      // status for each selectable
//      for( var i = 0; i < selectables.length; i++ ){
//
//        if( selectables[i] == closestSelectable ){
//          if( !selectables[i].hovered ){
//            selectables[i].hovered = true;
//            for (child=0; child<selectables[i].children.length; child++){
//                selectables[i].children[child].material = selectableHoverMaterial;
//                 }
//            selectables[i].materialNeedsUpdate = true;
//          }
//
//        }else{
//          if( selectables[i].hovered ){
//            selectables[i].hovered = false;
//            for (child=0; child<selectables[i].children.length; child++){
//                selectables[i].children[child].material = selectableNeutralMaterial;
//            }
//            selectables[i].materialNeedsUpdate = true;
//          }
//        }
//      }
//    }
//  }
//
//
//
////////////////////////// update 3 //////// start-or-stop-selecting //////////////
//
//function     selectAsPerPitchingGesture(){
//    // Pinch Start
//    if( 
//      oPinchStrength < pinchStrengthCutoff &&
//      pinchStrength >= pinchStrengthCutoff 
//    //    &&
//    //  pinchPointConfidence >= pinchPointCutoff
//    ){
//
//      // If a selectable is hovered, make it selected,
//      // and update its material
//      for( var i = 0; i < selectables.length; i++ ){
//
//        if( selectables[i].hovered ){
//
//          selectables[i].selected = true;
//          selectables[i].material = selectableSelectedMaterial;
//
//          selectableSelected = true;
//            
//          // Use this as the reference for rotations
//          pinchPoint.frameAtSelectionTime = frame;
//          handFingersDirectionAtSelectionTime_Vector3  = pinchPoint.fingersDirection;
//          handPalmNormalAtGrabTime_Vector3 = pinchPoint.palmNormal;
//            
//          selectables[i].rotationAtSelectionTime = selectables[i].rotation.clone();
//            console.log("rot at selection time= [ " 
//                        + selectables[i].rotationAtSelectionTime.x + ", " 
//                        + selectables[i].rotationAtSelectionTime.y + ", " 
//                        + selectables[i].rotationAtSelectionTime.z + ", " 
//                        + selectables[i].rotationAtSelectionTime.order + " ]");
//            
//
//        }
//      }
//      // todelete? snapshot of the current frame ID
//      // todelete? frameAtGrabTime = controller.frame(0);
//      console.log( 'Pinch Start' );
//
//    // Pinch Stop
//    }else if( 
//      oPinchStrength > pinchStrengthCutoff &&
//      pinchStrength <= pinchStrengthCutoff
//    ){
//
//       for( var i = 0; i < selectables.length; i++ ){
//
//        // If a selectable is selected, make it no longer selected
//        if( selectables[i].selected ){
//            
//            // if selected is dropped near enough
//            if (selectables[i].position.z > 0) {
//                console.log("dropped near");
//            } else { // else selected is dropped far
//                console.log("dropped far");
//            }
//            
//          selectables[i].selected = false;
//
//          // Make sure that we are returning the selectable
//          // to the proper material
//          if( selectables[i].hovered ){
//            selectables[i].material = selectableHoverMaterial;
//          }else{
//            selectables[i].material = selectableNeutralMaterial;
//          }
//
//          // for debug, put all "empty"
//          selectableSelected = false;
//          selectables[i].rotationAtSelectionTime = new THREE.Euler(-1,-1,-1,"EMPTY");
//        }
//      }
//
//      // for debug, put all "empty"
//      handFingersDirectionAtSelectionTime_Vector3  = new THREE.Vector3(-1,-1,-1);
//      handPalmNormalAtGrabTime_Vector3 = new THREE.Vector3(-1,-1,-1);
//      pinchPoint.frameAtSelectionTime = null;
//        
//      console.log( 'Pinch Stop' );
//
//    }
//}
//
//
////////////////////////// update 4 ///////// move-selected /////////////
//
////function moveSelectedSelectable(){
////
////    for( var i = 0; i < selectables.length; i++ ){
////
////      if( selectables[i].selected ){
////
////        var force = selectables[i].differenceWithPinchPointPosition.clone();
////        //force.multiplyScalar( movementStrength );
////
////        selectables[i].position.sub( force );
////          /* test only */ selectables[i].updateMatrix();
////      }
////    }
////}
//
//function moveSelectables() {
//    for( var i = 0; i < selectables.length; i++ ){
//
//      if( selectables[i].selected ){
//
//        var force = selectables[i].differenceWithPinchPointPosition.clone();
//        //force.multiplyScalar( movementStrength );
//
//        selectables[i].position.sub( force );
//      } else { // move back to initial positions
//        var force = selectables[i].differenceWithInitialPosition.clone();
//        force.multiplyScalar( movementStrength );
//
//        selectables[i].position.sub( force );
//      }
//    }
//}
////////////////////////// update 5 //////// turn-selected //////////////
//
//var temp = 0.0;
//function turnSelectedSelectable(){
//  var found = false;
//
//  if( frame.hands[0] ){
//
//    var hand = frame.hands[0];
//
//    for( var i = 0; i < selectables.length; i++ ){
//
//      if( selectables[i].selected ){
//          found = true;
//          var rotationAxisSinceLastFrame_Vector3 = hand.rotationAxis(oframe);
//          //console.log("$ rotationAxis=[" + rotationAxisSinceLastFrame_Vector3[0] +", " + rotationAxisSinceLastFrame_Vector3[1] +", " + rotationAxisSinceLastFrame_Vector3[2] +"]");
//          var newVect3 = new THREE.Vector3(rotationAxisSinceLastFrame_Vector3[0], rotationAxisSinceLastFrame_Vector3[1], rotationAxisSinceLastFrame_Vector3[2]);
//          //console.log("$ newVect3    =[" + newVect3.x +", " + newVect3.y +", " + newVect3.z +"]");
//
//          var rotationAngleSinceLastFrame = hand.rotationAngle(oframe);
//          // BAD var rotationAxisSinceLastFrame_Euler = new THREE.Euler().setFromVector3(rotationAxisSinceLastFrame_Vector3);
//          
////          xxxx
//          selectables[i]/*.children[0]*/.setRotationFromEuler(new THREE.Euler( pinchPoint.pitch, -pinchPoint.yaw, 3.14152956/2 + pinchPoint.roll, 'XYZ' ));
//
////          selectables[i].rotateOnAxis(
//////              new THREE.Vector3(-0.289,0.109,-0.950)
////              newVect3
////              //rotationAxisSinceLastFrame_Vector3
////              , 
////              
////              0.05
////              //rotationAngleSinceLastFrame
////              );
//
//          
//          
//          
//          
//          
////          // rotations
////          // get the hand rotation since select start
////          if (pinchPoint && pinchPoint.frameAtSelectionTime) {
////              if(debugPrintNow) {
////                  console.log("pinchPoint.frameAtSelectionTime.id=" + pinchPoint.frameAtSelectionTime.id);
////                  console.log("selectable rot at sel=[" + selectables[i].rotationAtSelectionTime.x +", " + selectables[i].rotationAtSelectionTime.y +", " + selectables[i].rotationAtSelectionTime.z + ", " + selectables[i].rotationAtSelectionTime.order +"]");
////                  console.log("selectable   curr rot=[" + selectables[i].rotation.x +", " + selectables[i].rotation.y +", " + selectables[i].rotation.z +", " + selectables[i].rotation.order +"]");
////              }
////              var rotationAxisSinceSelectStart = hand.rotationAxis(pinchPoint.frameAtSelectionTime);
////              var rotationAngleSinceSelectStart = hand.rotationAngle(pinchPoint.frameAtSelectionTime);
////              
////              selectables[i].rotateOnAxis(rotationAxisSinceSelectStartVec3, rotationAngleSinceSelectStart - selectables[i].rotationAtSelectionTime);//rotationAngleSinceSelectStart);
////              if(debugPrintNow) {
////                  console.log("rotationAxis=[" + rotationAxisSinceSelectStart[0] +", " + rotationAxisSinceSelectStart[1] +", " + rotationAxisSinceSelectStart[2] +"]");
////                  console.log("rotationSinceSelectStart=" + rotationAngleSinceSelectStart);
////                  ///////console.log("selectable   new  rot=[" + selectables[i].rotation.x +", " + selectables[i].rotation.y +", " + selectables[i].rotation.z +"]");
////              }
////          }
//              
//          //selectables[i].rotation.copy(rotationAxisAtGrabTime);
////        selectables[i].rotation.set(0,handRoll,0);
//        //selectables[i].rotation.set(0,temp,0);
//          temp += 0.02;
//
//      }
//        
//
//    }
//  }
//    if(!found) {
//      for( var i = 0; i < selectables.length; i++ ){
//          
//          
//          
//          
//          
////      //var rot_localSpace = new THREE.Vector3( selectables[i].rotation[0], selectables[i].rotation[1], selectables[i].rotation[2]);
//        var up = new THREE.Vector3(0,1,0);
////        var up_localToWorld = rot_localSpace.localToWorld(up);
////        var up_WorldToLocal = rot_localSpace.worldToLocal(up);
//        if (timeForStep1) {
//            //rotateAroundObjectAxis( selectables[i] /*object*/, up /*axis*/, 0.05/*radians*/ );
////          selectables[i].rotateOnAxis ( up_localToWorld, 0.05);
//        } else {
//            //rotateAroundWorldAxis( selectables[i] /*object*/, up/*axis*/, 0.05/*radians*/ );
////          selectables[i].rotateOnAxis( up_WorldToLocal, 0.05);
//        }
//      }
//    }
//
//}
//
//function turnSelectables() {
//}
//
////////////////////////// update 6 //////// update-helpers //////////////
//
//function updateHelpers() {
//      visualFeedbackConfidenceMesh.material.opacity = pinchPointConfidence;
//      visualFeedbackStrengthMesh.material.opacity = pinchStrength;
////      visualFeedbackTarget.position = pinchPoint.position;
//      visualFeedbackTarget.position.x = pinchPoint.position.x;
//      visualFeedbackTarget.position.y = pinchPoint.position.y;
//  }
//
//
//
function animate(){

    oframe = frame;
    frame = controller.frame();
    if ((counter % 32) == 0) {
        debugPrintNow = true;
        debugPrintNow1 = true;
    } else {
        debugPrintNow = false;
    }
    if ((counter % 128) > 64) {timeForStep1 = true;} else {timeForStep1 = false;}
    counter++;
      
    update();
    stats.update();

    renderer.render( scene , camera );

    requestAnimationFrame( animate );

  }

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }
//
//
//
//
//// Rotate an object around an axis in object space
//function rotateAroundObjectAxis( object, axis, radians ) {
//
//    var rotationMatrix = new THREE.Matrix4();
//    rotationMatrix.rotateOnAxis
//    object.makeRotationAxis ( axis, radians );
//
//    BAD.rotationMatrix.setRotationAxis( axis.normalize(), radians );
//    object.matrix.multiplySelf( rotationMatrix );                       // post-multiply
//    object.rotation.setRotationFromMatrix( object.matrix );
//}
//
//// Rotate an object around an axis in world space (the axis passes through the object's position)       
//function rotateAroundWorldAxis( object, /*THREE.Vector3*/ axis, radians ) {
//
//    var toDelete = new THREE.Vector3();
//    var toDelete2 = toDelete.normalize();
//    var toDelete3 = new THREE.Vector3(axis);
//    var toDelete4 = toDelete3.normalize();
//    
//    var rotationMatrix = new THREE.Matrix4();
//
//    rotationMatrix.setRotationAxis( toDelete4, radians );
//    rotationMatrix.multiplySelf( object.matrix );                       // pre-multiply
//    object.matrix = rotationMatrix;
//    object.rotation.setRotationFromMatrix( object.matrix );
//}
//
//function computeScaleI(zGrabbed, zCurrent) {
//    var scaleI = -1;
//    var deltaCurrentGrabbed = zCurrent - zGrabbed;
//    var zone1Length = zGrabbed;
//    var zone2Length = 0.5;
//    if          (zGrabbed > 0)                     { // grabbed i
//        if        /*(zGrabbed > 0)&&*/ (zCurrent >= zGrabbed)                     { // grabbed i --- drag even more near
//            scaleI = 10;
//        } else if /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&*/ (zCurrent >= 0) { // grabbed i+1 --- drag away --- first drag section
//            scaleI = 10*3/4 + (10*3/4 - 10/2) * (deltaCurrentGrabbed / zone1Length);
//        } else if /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&   (0 > zCurrent)&&*/ (zCurrent >= -0.5)   { // grabbed i+1 --- drag away --- second drag section  -----NOTE:  starts with a discountinuity 
//            scaleI =10/2 + 4 * (zCurrent / zone2Length);
//        } else    /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&   (0 > zCurrent)&&   (-0.5 > zCurrent)*/  { // grabbed i+1 --- drag away --- too far
//            scaleI =1;
//        }
//    } else if /*(0 > zGrabbed)&&*/ (zGrabbed >= zCurrent)                     { // grabbed i+1 --- drag even more far
//        scaleI = 1;
//    } else if /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&*/ (0 >= zCurrent) { // grabbed i+1 --- drag to us --- first drag section
//        // in zone0: linear interpolation between 1.5 and 2
//        scaleI = 1.5 - (2 - 1.5) * (deltaCurrentGrabbed / zone1Length);
//    } else if /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&   (zCurrent >  0))&&*/ (0.5 >= zCurrent)  { // grabbed i+1 --- drag to us --- second drag section  -----NOTE:  starts with a discountinuity 
//        // in zone1: linear interpolation between 2 and 10
//        scaleI = 2 + 8 * (zCurrent / zone2Length);
//    } else    /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&   (zCurrent >  0))&&   (zCurrent > 0.5)*/ { // grabbed i+1 --- drag to us --- too near
//        scaleI = 10;
//    }
//    return scaleI;  
//}
//function computeScaleWorld(iCurrent, zGrabbed, zCurrent) {
//}
//function computeXYScaleI(zGrabbed, zCurrent) {
//    var XYScaleI = -101;
//    var deltaCurrentGrabbed = zCurrent - zGrabbed;
//    var zone1Length = zGrabbed;
//    var zone2Length = 0.5;
//    if          (zGrabbed > 0)                     { // grabbed i
//        if        /*(zGrabbed > 0)&&*/ (zCurrent >= zGrabbed)                     { // grabbed i --- drag even more near
//            XYScaleI = 0;
//        } else if /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&*/ (zCurrent >= 0) { // grabbed i+1 --- drag away --- first drag section
//            XYScaleI = 0;
//        } else if /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&   (0 > zCurrent)&&*/ (zCurrent >= -0.5)   { // grabbed i+1 --- drag away --- second drag section  -----NOTE:  starts with a discountinuity 
//            XYScaleI = - zCurrent / zone2Length;
//        } else    /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&   (0 > zCurrent)&&   (-0.5 > zCurrent)*/  { // grabbed i+1 --- drag away --- too far
//            XYScaleI =1;
//        }
//    } else if /*(0 > zGrabbed)&&*/ (zGrabbed >= zCurrent)                     { // grabbed i+1 --- drag even more far
//        XYScaleI = 1;
//    } else if /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&*/ (0 >= zCurrent) { // grabbed i+1 --- drag to us --- first drag section
//        XYScaleI = 1;
//    } else if /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&   (zCurrent >  0))&&*/ (0.5 >= zCurrent)  { // grabbed i+1 --- drag to us --- second drag section  -----NOTE:  starts with a discountinuity 
//        XYScaleI = 1 - zCurrent / zone2Length;
//    } else    /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&   (zCurrent >  0))&&   (zCurrent > 0.5)*/ { // grabbed i+1 --- drag to us --- too near
//        XYScaleI = 0;
//    }
//    
//    return XYScaleI;
//}
//function computeZOffsetI(zGrabbed, zCurrent) {
//    var ZOffsetI = -102;
//    var deltaCurrentGrabbed = zCurrent - zGrabbed;
//    var zone1Length = zGrabbed;
//    var zone2Length = 0.5;
//    // grab near
//    if          (zGrabbed > 0)                     { // grabbed i
//        if        /*(zGrabbed > 0)&&*/ (zCurrent >= zGrabbed)                     { // grabbed i --- drag even more near
//            ZOffsetI = -1.0;
//        } else if /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&*/ (zCurrent >= 0) { // grabbed i+1 --- drag away --- first drag section
//            ZOffsetI = -1.0 - 0.5 * deltaCurrentGrabbed / zone1Length;
//        } else if /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&   (0 > zCurrent)&&*/ (zCurrent >= -0.5)   { // grabbed i+1 --- drag away --- second drag section  -----NOTE:  starts with a discountinuity 
//            ZOffsetI = -0.5 - 0.5 * (zCurrent / zone2Length);
//        } else    /*(zGrabbed > 0)&&   (zGrabbed >  zCurrent)&&   (0 > zCurrent)&&   (-0.5 > zCurrent)*/  { // grabbed i+1 --- drag away --- too far
//            ZOffsetI = 0.0;
//        }
//
//    //grab far   
//    } else if /*(0 > zGrabbed)&&*/ (zGrabbed >= zCurrent)                     { // grabbed i+1 --- drag even more far
//        ZOffsetI = 0.0;
//    } else if /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&*/ (0 >= zCurrent) { // grabbed i+1 --- drag to us --- first drag section
//        ZOffsetI = 0.5 * (deltaCurrentGrabbed / zone1Length);
//    } else if /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&   (zCurrent >  0))&&*/ (0.5 >= zCurrent)  { // grabbed i+1 --- drag to us --- second drag section  -----NOTE:  starts with a discountinuity 
//        ZOffsetI = -0.5 - 0.5 * (zCurrent / zone2Length);
//    } else    /*(0 > zGrabbed)&&   (zCurrent >  zGrabbed)&&   (zCurrent >  0))&&   (zCurrent > 0.5)*/ { // grabbed i+1 --- drag to us --- too near
//        ZOffsetI = -1.0;
//    }
//    return ZOffsetI * weightZ / 2;
//}
//function computeZOffsetWorldForThisMove(iCurrent, zGrabbed, zCurrent) {
//}
//
//    
//var testVectorDragI = [
//                                // testId, in_zGrabbed, in_zCurrent, weightZ,  out_I_scale, out_I_xyScale, out_I_zOffset
//    /*grab far , push more      */[  10000,       -0.75,      -0.80 ,      10,        1    ,          1   ,                  0],
//    /*grab far , stay           */[  10001,       -0.75,      -0.75 ,      10,        1    ,          1   ,                  0],
//    /*grab far , pull  by 0.01  */[  10002,       -0.75,      -0.749,      10,        1.5  ,          1   ,        -0.001*10/2],
//    /*grab far , pull  by half  */[  10003,       -0.75,      -0.375,      10,        1.75 ,          1   ,         -0.25*10/2],
//    /*grab far , pull  to 0     */[  10004,       -0.75,       0    ,      10,        2    ,          1   ,         -0.5 *10/2],
//    /*grab far , pull  to 0.25  */[  10005,       -0.75,       0.25 ,      10,        6    ,          0.5 ,         -0.75*10/2],
//    /*grab far , pull  to 0.5   */[  10006,       -0.75,       0.5  ,      10,       10    ,          0   ,         -1   *10/2],
//    /*grab far , pull  to 0.75  */[  10007,       -0.75,       0.75 ,      10,       10    ,          0   ,         -1   *10/2],
//
//    /*grab far , push more      */[  10010,       -0.5 ,      -0.55 ,      10,        1    ,          1   ,                  0],
//    /*grab far , stay           */[  10011,       -0.5 ,      -0.5  ,      10,        1    ,          1   ,                  0],
//    /*grab far , pull  by 0.01  */[  10012,       -0.5 ,      -0.499,      10,        1.5  ,          1   ,   -0.001/0.75*10/2],
//    /*grab far , pull  by half  */[  10013,       -0.5 ,      -0.25 ,      10,        1.75 ,          1   ,         -0.25*10/2], 
//    /*grab far , pull  to 0     */[  10014,       -0.5 ,       0    ,      10,        2    ,          1   ,          -0.5*10/2], 
//    /*grab far , pull  to 0.25  */[  10015,       -0.5 ,       0.25 ,      10,        6    ,          0.5 ,         -0.75*10/2],
//    /*grab far , pull  to 0.5   */[  10016,       -0.5 ,       0.5  ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab far , pull  to 0.75  */[  10017,       -0.5 ,       0.75 ,      10,       10    ,          0   ,            -1*10/2],
//
//    /*grab far , push more      */[  10020,       -0.25,      -0.30 ,      10,        1    ,          1   ,                  0],
//    /*grab far , stay           */[  10021,       -0.25,      -0.25 ,      10,        1    ,          1   ,                  0],
//    /*grab far , pull  by 0.01  */[  10022,       -0.25,      -0.249,      10,        1.5  ,          1   ,   -0.001/0.75*10/2],
//    /*grab far , pull  by half  */[  10023,       -0.25,      -0.125,      10,        1.75 ,          1   ,         -0.25*10/2],
//    /*grab far , pull  to 0     */[  10024,       -0.25,       0    ,      10,        2    ,          1   ,          -0.5*10/2],
//    /*grab far , pull  to 0.25  */[  10025,       -0.25,       0.25 ,      10,        6    ,          0.5 ,         -0.75*10/2],
//    /*grab far , pull  to 0.5   */[  10026,       -0.25,       0.5  ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab far , pull  to 0.75  */[  10027,       -0.25,       0.75 ,      10,       10    ,          0   ,            -1*10/2],
//////////////-------------------------
//    /*grab near, pull more      */[  10100,        0.75,       0.80 ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab near, stay           */[  10101,        0.75,       0.75 ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab near, push  by 0.01  */[  10102,        0.75,       0.749,      10,        7.5  ,          0   ,-(1-(0.001/0.75))*10/2],
//    /*grab near, push  by half  */[  10103,        0.75,       0.375,      10,        6.25 ,          0   ,         -0.75*10/2],
//    /*grab near, push  to  0    */[  10104,        0.75,      -0    ,      10,        5    ,          0   ,          -0.5*10/2],
//    /*grab near, push  to -0.25 */[  10105,        0.75,      -0.25 ,      10,        3    ,          0.5 ,         -0.25*10/2],
//    /*grab near, push  to -0.5  */[  10106,        0.75,      -0.5  ,      10,        1    ,          1   ,                  0],
//    /*grab near, push  to -0.75 */[  10107,        0.75,      -0.75 ,      10,        1    ,          1   ,                  0],
//
//    /*grab near, pull more      */[  10110,        0.5 ,       0.55 ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab near, stay           */[  10111,        0.5 ,       0.55 ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab near, push  by 0.01  */[  10112,        0.5 ,       0.499,      10,        7.5  ,          0   ,-(1-0.001/0.75)*10/2],
//    /*grab near, push  by half  */[  10113,        0.5 ,       0.25 ,      10,        6.25 ,          0   ,         -0.75*10/2],
//    /*grab near, push  to  0    */[  10114,        0.5 ,      -0    ,      10,        5    ,          0   ,          -0.5*10/2],
//    /*grab near, push  to -0.25 */[  10115,        0.5 ,      -0.25 ,      10,        3    ,          0.5 ,         -0.25*10/2],
//    /*grab near, push  to -0.5  */[  10116,        0.5 ,      -0.5  ,      10,        1    ,          1   ,                  0],
//    /*grab near, push  to -0.75 */[  10117,        0.5 ,      -0.75 ,      10,        1    ,          1   ,                  0],
//
//    /*grab near, pull more      */[  10120,        0.25,       0.30 ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab near, stay           */[  10121,        0.25,       0.25 ,      10,       10    ,          0   ,            -1*10/2],
//    /*grab near, push  by 0.01  */[  10122,        0.25,       0.249,      10,        7.5  ,          0   ,-(1-0.001/0.75)*10/2],
//    /*grab near, push  by half  */[  10123,        0.25,       0.125,      10,        6.25 ,          0   ,         -0.75*10/2],
//    /*grab near, push  to  0    */[  10124,        0.25,      -0    ,      10,        5    ,          0   ,          -0.5*10/2],
//    /*grab near, push  to -0.25 */[  10125,        0.25,      -0.25 ,      10,        3    ,          0.5 ,          -0.25*10/2],
//    /*grab near, push  to -0.5  */[  10126,        0.25,      -0.5  ,      10,        1    ,          1   ,                  0],
//    /*grab near, push  to -0.75 */[  10127,        0.25,      -0.75 ,      10,        1    ,          1   ,                  0],
//
//];
//
//function performTestVectors() {
//    var qtyVectors = testVectorDragI.length,
//               test_idx = 0,
//        in_zGrabbed_idx = 1,
//        in_zCurrent_idx = 2, 
//         in_weightZ_idx = 3,
//        out_I_scale_idx = 4, 
//      out_I_xyScale_idx = 5,
//      out_I_zOffset_idx = 6;
//        
//        
//        
//    for (i=0; i< qtyVectors; i++) {
//        var in_zGrabbed   = testVectorDragI[i][   in_zGrabbed_idx], 
//            in_zCurrent   = testVectorDragI[i][   in_zCurrent_idx], 
//            in_weightZ    = testVectorDragI[i][    in_weightZ_idx],  
//            expectedComputeScaleI   = testVectorDragI[i][   out_I_scale_idx],
//            expectedComputeXYScaleI = testVectorDragI[i][ out_I_xyScale_idx], 
//            expectedComputeZOffsetI = testVectorDragI[i][ out_I_zOffset_idx],
//            resultComputeScaleI     = computeScaleI(in_zGrabbed, in_zCurrent),
//            resultComputeXYScaleI   = computeXYScaleI(in_zGrabbed, in_zCurrent),
//            resultComputeZOffsetI   = computeZOffsetI(in_zGrabbed, in_zCurrent),
//            isErrorDetected = false;
////        isErrorDetected = isErrorDetected || (expectedComputeScaleI >=  0.01 && (resultComputeScaleI > expectedComputeScaleI*1.02);
////        isErrorDetected = isErrorDetected || (expectedComputeScaleI >=  0.01 && (resultComputeScaleI < expectedComputeScaleI/1.02);
////        isErrorDetected = isErrorDetected || (expectedComputeScaleI <= -0.01 && (resultComputeScaleI < expectedComputeScaleI*1.02);
////        isErrorDetected = isErrorDetected || (expectedComputeScaleI <= -0.01 && (resultComputeScaleI > expectedComputeScaleI/1.02);
////        isErrorDetected = isErrorDetected || (expectedComputeScaleI >  -0.01 && expectedComputeScaleI <  0.01) && (resultComputeScaleI < -0.02 || resultComputeScaleI > 0.02);
////        isErrorDetected = isErrorDetected || (resultComputeXYScaleI != expectedComputeXYScaleI);
////        isErrorDetected = isErrorDetected || (resultComputeZOffsetI != expectedComputeZOffsetI);
//        isErrorDetected = isErrorDetected || areBothValueNearEnough(expectedComputeScaleI  , resultComputeScaleI  );
//        isErrorDetected = isErrorDetected || areBothValueNearEnough(expectedComputeXYScaleI, resultComputeXYScaleI);
//        isErrorDetected = isErrorDetected || areBothValueNearEnough(expectedComputeZOffsetI, resultComputeZOffsetI);
//        if (isErrorDetected) {
//            console.log("error while performing test#" +  testVectorDragI[i][test_idx] + " values = [ " 
//                        + in_zGrabbed + ", "
//                        + in_zCurrent + ", "
//                        + in_weightZ + ", -> "
//                        + "< " + expectedComputeScaleI + ", " + resultComputeScaleI + " >, "
//                        + "< " + expectedComputeXYScaleI + ", " + resultComputeXYScaleI + " >, "
//                        + "< " + expectedComputeZOffsetI + ", " + resultComputeZOffsetI + " > "
//                        + " ]");
//            isErrorDetected = false; // for next test
//        }
//    }
//}
//
//function areBothValueNearEnough(a,b) {
//    var ret = false;
//    ret = ret || (a === undefined || b === undefined);
//    ret = ret || (a >=  0.01) && (b > a*1.02);
//    ret = ret || (a >=  0.01) && (b < a/1.02);
//    ret = ret || (a <= -0.01) && (b < a*1.02);
//    ret = ret || (a <= -0.01) && (b > a/1.02);
//    ret = ret || (a >  -0.01 && a <  0.01) && (b < -0.02 || b > 0.02);
//    return ret;
//}
//
//performTestVectors();
