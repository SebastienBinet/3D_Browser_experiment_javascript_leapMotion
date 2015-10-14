
  // configure this
  var useGrabInsteadOfPitch = true;
  var counter=0;
  var decounter=0;
  var handRoll;
  var handPalmNormalVector3AtGrabTime;
  var handDirectionOfFingersVector3AtSelectionTime;
  //var frameAtGrabTime;
  var debugPrintNow = false;
  var timeForStep1 = false;

  // helpers
  var visualFeedbackConfidenceMesh;
  var visualFeedbackStrengthMesh;
  var visualFeedbackPalmNormalMesh; 
  var visualFeedbackFingersDirectionMesh;
  var visualFeedbackPalmNormalLine;
  var visualFeedbackFingersDirectionLine;

  var currentXForNextHelper = 50;



  // Global Variables for THREE.JS
  var container , camera, scene, renderer , stats;

  // Global variable for leap
  var frame, oframe, controller;

  // Setting up how big we want the scene to be
  var sceneSize = 100;

  // Materials we will use for visual feedback
  var selectableHoverMaterial;
  var selectableNeutralMaterial;
  var selectableSelectedMaterial;

  var selectables = [];

  // Bool to tell if any selectables are currently
  // being interacted with. Kinda a crappy name. sry ;)
  var selectableSelected = false;

  var hoveredSelectable;


  // Number of selectable Objects in the field
  var numOfSelectables = 10;


  // Setting up a global variable for the pinch point,
  // and its strength.
  // In this case we will use palmPosition, 
  // because it is the most stable when fingers move
  var pinchPoint, pinchStrength , oPinchStrength;
  var grabPoint, grabStrength , oGrabStrength;
  var pinchPointConfidence = 0;

  // The cutoff for pinch strengths
  var pinchStrengthCutoff = .5;
  var pinchPointCutoff = .2;

  // How quickly the selected selectable will move to
  // the pinch point
  var movementStrength = .3; // original:.03;

  // Get everything set up
  init();

  // Start the frames rolling
  animate();


  function init(){

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


    /*
      INITIALIZE AWESOMENESS!
    */
    initPinchPoint();
    initSelectables();
    initLights();
    initHelpers();

    controller.connect();


  }

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
        opacity: 0.1
      })
    );


    pinchWireframe = new THREE.Mesh( 
      geo,
      new THREE.MeshNormalMaterial({
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.5,
        wireframe: true
      })
    );

    var light = new THREE.PointLight( 0xffffff , 0.6 );

    pinchWireframe.position = pinchPoint.position;

    scene.add( pinchPoint );
    pinchPoint.add( pinchWireframe ); 
    pinchPoint.add( light );

  }



  // Creates our selectables, including 3 different materials
  // for the different states a selectable can be in
  function initSelectables(){

    selectableHoverMaterial = new THREE.MeshNormalMaterial({
        color:0xff8080,
        wireframe:false,
    });

    selectableNeutralMaterial = new THREE.MeshLambertMaterial({
      color:0x404040,
      wireframe:true,
    });

    selectableSelectedMaterial = new THREE.MeshNormalMaterial();

    var geo  = new THREE.IcosahedronGeometry( 10 , 2 );
    var geo1 = new THREE.IcosahedronGeometry( 4 , 4 );
    var geo2 = new THREE.IcosahedronGeometry( 2 , 2 );

    for( var i = -1; i <= 1 /*numOfSelectables*/; i++ ){
    for( var j = -1; j <= 1 /*numOfSelectables*/; j++ ){
        
      var base        = new THREE.Mesh( geo , selectableNeutralMaterial );
      var selectable1 = new THREE.Mesh( geo1 , selectableNeutralMaterial );
      var selectable2 = new THREE.Mesh( geo2 , selectableNeutralMaterial );
      //var selectable3 = new THREE.Mesh( geo2 , selectableNeutralMaterial );
      selectable1.position.x = 0;
      selectable1.position.y = 10;
      selectable1.position.z = 0;
      selectable2.position.x = -14;
      selectable2.position.y = 0;
      selectable2.position.z = 0;
      
       
      var myComplexObject = new THREE.Object3D();
      myComplexObject.position.x = 0;
      myComplexObject.position.y = 0;
      myComplexObject.position.z = 0;
      myComplexObject.add(base);
      myComplexObject.add(base);
      myComplexObject.add(selectable1);
      myComplexObject.add(selectable2);
      
      myComplexObject.position.x = i * sceneSize / 1;
      myComplexObject.position.y = j * sceneSize / 1;
      myComplexObject.position.z = -2 * sceneSize * 1;
      myComplexObject.initialPositionX = myComplexObject.position.x;
      myComplexObject.initialPositionY = myComplexObject.position.y;
      myComplexObject.initialPositionZ = myComplexObject.position.z;
//      myComplexObject.position.x = ( Math.random() - .5 ) * sceneSize * 1;
//      myComplexObject.position.y = ( Math.random() - .5 ) * sceneSize * 1;
//      myComplexObject.position.z = ( Math.random() - .5 ) * sceneSize * 1;
      //scene.add( myComplexObject );
      //scene.add( selectable3 );
        
      // Setting a vector which will be the diffrerence from 
      // the pinch point to the selectable
      myComplexObject.difference = new THREE.Vector3();
      myComplexObject.distance   = myComplexObject.difference.length();

      // Some booleans that will help us keep track of which 
      // object is being interacted with
      myComplexObject.hovered = false;
      myComplexObject.selected = false;
      
      selectables.push( myComplexObject );
      scene.add( myComplexObject );
  

    }
    }

  }

  function initLights(){

    var light = new THREE.DirectionalLight( 0xffffff , .5 );
    light.position.set( 0, 0 , 1 );
    scene.add( light );
    var light1 = new THREE.DirectionalLight( 0xff0000 , .5 );
    light1.position.set( 0, 1 , 0 );
    scene.add( light1 );
    var light2 = new THREE.DirectionalLight( 0x00ff00 , .4 );
    light2.position.set( 1, 0 , 0 );
    scene.add( light2 );
  
  }

  function initHelpers(){
    visualFeedbackConfidenceMesh = addThis0to1HelperToScene();
    visualFeedbackStrengthMesh   = addThis0to1HelperToScene();
    // test 001 var axisHelperMesh = new THREE.AxisHelper( 50 ); scene.add( axisHelperMesh ); 
    // test 001 axisHelperMesh.rotateOnAxis(new THREE.Vector3(-0.289,0.109,-0.950), 0.05);

    visualFeedbackPalmNormalMesh        = addThisVector3HelperToScene();
    visualFeedbackFingersDirectionMesh  = addThisVector3HelperToScene();
//    rr pinchPoint.palmNormal = hand.palmNormal;
//    rr  pinchPoint.fingersDirection = hand.direction;
    visualFeedbackPalmNormalLine = addThisNormalHelperToScene();
    visualFeedbackFingersDirectionLine = addThisDirectionHelperToScene();
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
     palmAndFingersObject.add(lineFingers);
     var fingersObject = new THREE.Object3D();
     fingersObject.add(linePalm);
     palmAndFingersObject.add(fingersObject);
   
     var myComplexObject = new THREE.Object3D();
      myComplexObject.position.x = 0;
      myComplexObject.position.y = 30;
      myComplexObject.position.z = 0;
      myComplexObject.add(palmAndFingersObject);
      scene.add( myComplexObject );

    
    // prepare position for next helper
    //currentXForNextHelper += 10;

    return myComplexObject;
}

function addThisDirectionHelperToScene(x,y,z) {
    x = x || currentXForNextHelper;
    y = y || 0;
    z = z || 0;
    
    var geometry;
    var line;
    
    var material = new THREE.LineBasicMaterial({
	    color: 0xff0000
    });
    var material2 = new THREE.LineBasicMaterial({
        color: 0x802020
    });


    // small reference drawing
    geometry = new THREE.Geometry();
    geometry.vertices.push(
	    new THREE.Vector3( x +   0, y -   20, z -  0 ),
	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
	    new THREE.Vector3( x + 0.5, y -   20, z -  4 ),
	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
	    new THREE.Vector3( x - 0.5, y -   20, z -  4 ),
	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
	    new THREE.Vector3( x +   0, y - 19.5, z -  4 ),
	    new THREE.Vector3( x +   0, y -   20, z -  5 ),
	    new THREE.Vector3( x +   0, y - 20.5, z -  4 ),
        new THREE.Vector3( x +   0, y -   20, z -  5 )
    );
    line = new THREE.Line( geometry, material2 );
    scene.add( line );
    
    // object itself
    geometry = new THREE.Geometry();
    geometry.vertices.push(
	   new THREE.Vector3( x +  0, y +  0, z +  0 ),
	   new THREE.Vector3( x +  0, y +  5, z +  0 )
    );
    line = new THREE.Line( geometry, material );
    scene.add( line );
    
    // prepare position for next helper
    currentXForNextHelper += 10;

    return line;
}

  function addThisVector3HelperToScene(x,y,z) {
    x = x || currentXForNextHelper;
    y = y || 0;
    z = z || 0;
      
      var axisHelperMesh;

      axisHelperMesh = new THREE.AxisHelper( 5 ); scene.add( axisHelperMesh ); 
      //axisHelperMesh.rotateOnAxis(new THREE.Vector3(0.109,-0.950, -0.289), 0.05);
      axisHelperMesh.position.add(new THREE.Vector3(x, y, z));
      
       // prepare position for next helper
      currentXForNextHelper += 10;
      return axisHelperMesh;
  }

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


  // The magical update loop,
  // using the global frame data we assigned
  function update(){

    updatePinchPoint();
    //updateGrabPoint();
    updateSelectables();
    selectAsPerPitchingGesture();
    moveSelectedSelectable();
    turnSelectedSelectable();
    updateHelpers();
  }







//////////////////////// update 1 ///////// update-current-hand-position /////////////

  function updatePinchPoint(){
  
    if( frame.hands[0] ){

      var hand = frame.hands[0];
      
      // First position pinch point
      pinchPoint.position = leapToScene( hand.palmPosition );
      pinchPoint.palmNormal = hand.palmNormal;
      pinchPoint.fingersDirection = hand.direction;
      
      pinchPoint.pitch = hand.pitch();
      pinchPoint.roll = hand.roll();
      pinchPoint.yaw = hand.yaw();
        
      // fonctionne visualFeedbackPalmNormalMesh.rotateOnAxis(new THREE.Vector3(-0.289,0.109,-0.950), 0.05);
      visualFeedbackPalmNormalMesh.setRotationFromEuler(new THREE.Euler( pinchPoint.palmNormal[0], pinchPoint.palmNormal[1], pinchPoint.palmNormal[2], 'XYZ' ));
      // fonctionne    visualFeedbackFingersDirectionMesh.setRotationFromEuler(new THREE.Euler( 0, 1, 0.3, 'XYZ' ));     //Vect3.position.set(10,10,0);
      visualFeedbackFingersDirectionMesh.setRotationFromEuler(new THREE.Euler( pinchPoint.fingersDirection[0], pinchPoint.fingersDirection[1], pinchPoint.fingersDirection[2], 'XYZ' ));     //Vect3.position.set(10,10,0);
//      visualFeedbackFingersDirectionMesh.rotation(new THREE.Euler( 0, 1, 1.57, 'XYZ' ));
        
        
        
//        visualFeedbackPalmNormalLine.child.position.sub(new THREE.Vector3(-100.0, 0,0));
        visualFeedbackPalmNormalLine.children[0].setRotationFromEuler(new THREE.Euler( pinchPoint.pitch, -pinchPoint.yaw, 3.14152956/2 + pinchPoint.roll, 'XYZ' ));
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


  /*

    There are many other ways to write this function,
    This one is created not for efficiency, but simply
    for using the most basic functionality ( AKA For Loops )
    I'll leave it as an excercise to the reader to make it
    better, possibly using arrays of 'selected objects'

  */

//////////////////////// update 2 ///////// highlight-nearest-selecteable /////////////

  function updateSelectables(){

    // First for loop is to figure out which 
    // selectable is the closest
    for( var i = 0; i < selectables.length; i++ ){

      var selectable = selectables[i];

      selectable.difference.subVectors(
        selectable.position, 
        pinchPoint.position
      );

      selectable.distance = selectable.difference.length();

    }

    // Make sure to only update our selectables
    // if there is not a selected object, 
    // otherwise you might be selecting one object,
    // and than accidentally hover over another one....

    if( !selectableSelected ){

      var closestDistance = Infinity;
      var closestSelectable;

      // First for loop is to figure out which 
      // selectable is the closest
      for( var i = 0; i < selectables.length; i++ ){

        if( selectables[i].distance < closestDistance ){

          closestSelectable = selectables[i];
          closestDistance   = selectables[i].distance;

        }

      }

      // Second for loop is to assign the proper 'hover'
      // status for each selectable
      for( var i = 0; i < selectables.length; i++ ){

        if( selectables[i] == closestSelectable ){
          if( !selectables[i].hovered ){
            selectables[i].hovered = true;
            for (child=0; child<selectables[i].children.length; child++){
                selectables[i].children[child].material = selectableHoverMaterial;
                 }
            selectables[i].materialNeedsUpdate = true;
          }

        }else{
          if( selectables[i].hovered ){
            selectables[i].hovered = false;
            for (child=0; child<selectables[i].children.length; child++){
                selectables[i].children[child].material = selectableNeutralMaterial;
            }
            selectables[i].materialNeedsUpdate = true;
          }
        }
      }
    }
  }



//////////////////////// update 3 //////// start-or-stop-selecting //////////////

function     selectAsPerPitchingGesture(){
    // Pinch Start
    if( 
      oPinchStrength < pinchStrengthCutoff &&
      pinchStrength >= pinchStrengthCutoff &&
      pinchPointConfidence >= pinchPointCutoff
    ){

      // If a selectable is hovered, make it selected,
      // and update its material
      for( var i = 0; i < selectables.length; i++ ){

        if( selectables[i].hovered ){

          selectables[i].selected = true;
          selectables[i].material = selectableSelectedMaterial;

          selectableSelected = true;
            
          // Use this as the reference for rotations
          pinchPoint.frameAtSelectionTime = frame;
          handFingersDirectionAtSelectionTime_Vector3  = pinchPoint.fingersDirection;
          handPalmNormalAtGrabTime_Vector3 = pinchPoint.palmNormal;
            
          selectables[i].rotationAtSelectionTime = selectables[i].rotation.clone();
            console.log("rot at selection time= [ " 
                        + selectables[i].rotationAtSelectionTime.x + ", " 
                        + selectables[i].rotationAtSelectionTime.y + ", " 
                        + selectables[i].rotationAtSelectionTime.z + ", " 
                        + selectables[i].rotationAtSelectionTime.order + " ]");
            

        }
      }
      // todelete? snapshot of the current frame ID
      // todelete? frameAtGrabTime = controller.frame(0);
      console.log( 'Pinch Start' );

    // Pinch Stop
    }else if( 
      oPinchStrength > pinchStrengthCutoff &&
      pinchStrength <= pinchStrengthCutoff
    ){

       for( var i = 0; i < selectables.length; i++ ){

        // If a selectable is selected, make it no longer selected
        if( selectables[i].selected ){

          selectables[i].selected = false;

          // Make sure that we are returning the selectable
          // to the proper material
          if( selectables[i].hovered ){
            selectables[i].material = selectableHoverMaterial;
          }else{
            selectables[i].material = selectableNeutralMaterial;
          }

          // for debug, put all "empty"
          selectableSelected = false;
          selectables[i].rotationAtSelectionTime = new THREE.Euler(-1,-1,-1,"EMPTY");
        }
      }

      // for debug, put all "empty"
      handFingersDirectionAtSelectionTime_Vector3  = new THREE.Vector3(-1,-1,-1);
      handPalmNormalAtGrabTime_Vector3 = new THREE.Vector3(-1,-1,-1);
      pinchPoint.frameAtSelectionTime = null;
      console.log( 'Pinch Stop' );

    }
}


//////////////////////// update 4 ///////// move-selected /////////////

function moveSelectedSelectable(){

    for( var i = 0; i < selectables.length; i++ ){

      if( selectables[i].selected ){

        var force = selectables[i].difference.clone();
        //force.multiplyScalar( movementStrength );

        selectables[i].position.sub( force );
          /* test only */ selectables[i].updateMatrix();
      }
    }
}

//////////////////////// update 5 //////// turn-selected //////////////

var temp = 0.0;
function turnSelectedSelectable(){
  var found = false;

  if( frame.hands[0] ){

    var hand = frame.hands[0];

    for( var i = 0; i < selectables.length; i++ ){

      if( selectables[i].selected ){
          found = true;
          var rotationAxisSinceLastFrame_Vector3 = hand.rotationAxis(oframe);
          //console.log("$ rotationAxis=[" + rotationAxisSinceLastFrame_Vector3[0] +", " + rotationAxisSinceLastFrame_Vector3[1] +", " + rotationAxisSinceLastFrame_Vector3[2] +"]");
          var newVect3 = new THREE.Vector3(rotationAxisSinceLastFrame_Vector3[0], rotationAxisSinceLastFrame_Vector3[1], rotationAxisSinceLastFrame_Vector3[2]);
          //console.log("$ newVect3    =[" + newVect3.x +", " + newVect3.y +", " + newVect3.z +"]");

          var rotationAngleSinceLastFrame = hand.rotationAngle(oframe);
          // BAD var rotationAxisSinceLastFrame_Euler = new THREE.Euler().setFromVector3(rotationAxisSinceLastFrame_Vector3);
          
//          xxxx
          selectables[i]/*.children[0]*/.setRotationFromEuler(new THREE.Euler( pinchPoint.pitch, -pinchPoint.yaw, 3.14152956/2 + pinchPoint.roll, 'XYZ' ));

//          selectables[i].rotateOnAxis(
////              new THREE.Vector3(-0.289,0.109,-0.950)
//              newVect3
//              //rotationAxisSinceLastFrame_Vector3
//              , 
//              
//              0.05
//              //rotationAngleSinceLastFrame
//              );

          
          
          
          
          
//          // rotations
//          // get the hand rotation since select start
//          if (pinchPoint && pinchPoint.frameAtSelectionTime) {
//              if(debugPrintNow) {
//                  console.log("pinchPoint.frameAtSelectionTime.id=" + pinchPoint.frameAtSelectionTime.id);
//                  console.log("selectable rot at sel=[" + selectables[i].rotationAtSelectionTime.x +", " + selectables[i].rotationAtSelectionTime.y +", " + selectables[i].rotationAtSelectionTime.z + ", " + selectables[i].rotationAtSelectionTime.order +"]");
//                  console.log("selectable   curr rot=[" + selectables[i].rotation.x +", " + selectables[i].rotation.y +", " + selectables[i].rotation.z +", " + selectables[i].rotation.order +"]");
//              }
//              var rotationAxisSinceSelectStart = hand.rotationAxis(pinchPoint.frameAtSelectionTime);
//              var rotationAngleSinceSelectStart = hand.rotationAngle(pinchPoint.frameAtSelectionTime);
//              
//              selectables[i].rotateOnAxis(rotationAxisSinceSelectStartVec3, rotationAngleSinceSelectStart - selectables[i].rotationAtSelectionTime);//rotationAngleSinceSelectStart);
//              if(debugPrintNow) {
//                  console.log("rotationAxis=[" + rotationAxisSinceSelectStart[0] +", " + rotationAxisSinceSelectStart[1] +", " + rotationAxisSinceSelectStart[2] +"]");
//                  console.log("rotationSinceSelectStart=" + rotationAngleSinceSelectStart);
//                  ///////console.log("selectable   new  rot=[" + selectables[i].rotation.x +", " + selectables[i].rotation.y +", " + selectables[i].rotation.z +"]");
//              }
//          }
              
          //selectables[i].rotation.copy(rotationAxisAtGrabTime);
//        selectables[i].rotation.set(0,handRoll,0);
        //selectables[i].rotation.set(0,temp,0);
          temp += 0.02;

      }
        

    }
  }
    if(!found) {
      for( var i = 0; i < selectables.length; i++ ){
          
          
          
          
          
//      //var rot_localSpace = new THREE.Vector3( selectables[i].rotation[0], selectables[i].rotation[1], selectables[i].rotation[2]);
        var up = new THREE.Vector3(0,1,0);
//        var up_localToWorld = rot_localSpace.localToWorld(up);
//        var up_WorldToLocal = rot_localSpace.worldToLocal(up);
        if (timeForStep1) {
            //rotateAroundObjectAxis( selectables[i] /*object*/, up /*axis*/, 0.05/*radians*/ );
//          selectables[i].rotateOnAxis ( up_localToWorld, 0.05);
        } else {
            //rotateAroundWorldAxis( selectables[i] /*object*/, up/*axis*/, 0.05/*radians*/ );
//          selectables[i].rotateOnAxis( up_WorldToLocal, 0.05);
        }
      }
    }

}

//////////////////////// update 6 //////// update-helpers //////////////

  function updateHelpers() {
      visualFeedbackConfidenceMesh.material.opacity = pinchPointConfidence;
      visualFeedbackStrengthMesh.material.opacity = pinchStrength;
  }



  function animate(){

    oframe = frame;
    frame = controller.frame();
    if ((counter % 32) == 0) {debugPrintNow = true;} else {debugPrintNow = false;}
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




// Rotate an object around an axis in object space
function rotateAroundObjectAxis( object, axis, radians ) {

    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.rotateOnAxis
    object.makeRotationAxis ( axis, radians );

    BAD.rotationMatrix.setRotationAxis( axis.normalize(), radians );
    object.matrix.multiplySelf( rotationMatrix );                       // post-multiply
    object.rotation.setRotationFromMatrix( object.matrix );
}

// Rotate an object around an axis in world space (the axis passes through the object's position)       
function rotateAroundWorldAxis( object, /*THREE.Vector3*/ axis, radians ) {

    var toDelete = new THREE.Vector3();
    var toDelete2 = toDelete.normalize();
    var toDelete3 = new THREE.Vector3(axis);
    var toDelete4 = toDelete3.normalize();
    
    var rotationMatrix = new THREE.Matrix4();

    rotationMatrix.setRotationAxis( toDelete4, radians );
    rotationMatrix.multiplySelf( object.matrix );                       // pre-multiply
    object.matrix = rotationMatrix;
    object.rotation.setRotationFromMatrix( object.matrix );
}
