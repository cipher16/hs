//board object : scene objects and other stuffs
function Board()
{
	//general var about the scene
	var renderer, scene, camera, pointLight, spotLight;
	var projector, mouse = { x: 0, y: 0 }, INTERSECTED;

	//game specific object
	var group_hand, group_board_p1;

/**
	Public functions drawcards, ...
*/

	Board.prototype.addcard = function(c)
	{
		if(c==null|c==undefined)
			return;
		var cardMaterial = new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture( c.image ),
			transparent: true
		});

		var card = new THREE.Mesh(
		  new THREE.CubeGeometry(40,60,1,10/*quality*/,10/*quality*/,1),
		  cardMaterial);
		card.receiveShadow = true;	
		card.userData = { Card: c};
		group_hand.add(card);

		if(group_hand.children.length>0)
		{
			var path = new THREE.Path();
			path.moveTo(0,0)
				if(group_hand.children.length>3)
					path.quadraticCurveTo(62.5,25,125,0);
				else
					path.lineTo(125,0);
			var points = path.getSpacedPoints(group_hand.children.length+1);
			console.log(points,group_hand.children.length)
			for(var i=0;i<group_hand.children.length;i++){
				group_hand.children[i].position.x = points[i+1].x;
				group_hand.children[i].position.y = points[i+1].y;
				group_hand.children[i].position.z = i+1;//so each card is on top of the old one

				var rot = path.getTangent(1-(1/group_hand.children.length)*i);
				group_hand.children[i].rotation.z = -rot.y;
			}
			//group_hand.position.x=-(Math.round(group_hand.children.length/2)*50)+50;
			//console.log("Position : ",group_hand.position.x);
			/*var tween = new TWEEN.Tween({x: group_hand.position.x, y: group_hand.position.y})
	            .to({ x : -(group_hand.children.length*50/2)+25 },2000)
	            .easing(TWEEN.Easing.Elastic.InOut)
	            .onUpdate(function () {
	            	group_hand.position.x = this.x;
	            }).start();*/
		}
	}

/**
	Anonymous functions only usefull for the class itself (listeners, setup, ...)
*/
	function createScene()
	{
//scene and three.js setup
		// initialize object to perform world/screen calculations
		projector = new THREE.Projector();
		// set the scene size
		var WIDTH = window.innerWidth,
		  HEIGHT = window.innerHeight;
		console.log("width",WIDTH,"height",HEIGHT)
		// set some camera attributes
		var VIEW_ANGLE = 50,
		  ASPECT = WIDTH / HEIGHT,
		  NEAR = 0.1,
		  FAR = 10000;

		var c = document.getElementById("gameCanvas");

		renderer = new THREE.WebGLRenderer();
		camera =
		  new THREE.PerspectiveCamera(
			VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR);

		scene = new THREE.Scene();

		// add the camera to the scene
		scene.add(camera);
		camera.position.z = 320;

		// start the renderer
		renderer.setSize(WIDTH, HEIGHT);
		c.appendChild(renderer.domElement);

		var tableMaterial =
		  new THREE.MeshLambertMaterial(/*{color: 0x888888}*/
		  	//{map: THREE.ImageUtils.loadTexture( "img/STW_Table.png" )});
			{map: THREE.ImageUtils.loadTexture( "img/board.png" )});
		var table = new THREE.Mesh(
		  new THREE.CubeGeometry(450,350,3,1,1,1),
		  tableMaterial);
	    // set ground to arbitrary z position to best show off shadowing
		table.position.z = 0;
		table.position.y = 25;
		table.receiveShadow = true;	
		scene.add(table);

		// // create a point light
		pointLight =
		  new THREE.PointLight(0xF8D898);

		// set its position
		pointLight.position.x = 0;
		pointLight.position.y = 0;
		pointLight.position.z = 1000;
		pointLight.intensity = 1.9;
		pointLight.distance = 10000;
		// add to the scene
		scene.add(pointLight);
		//renderer.shadowMapEnabled = true;		

//the game magic
		group_hand     = new THREE.Object3D();
		group_board_p1 = new THREE.Object3D();
		group_hand.position.y = -130;
		group_hand.position.x = -75;
		scene.add(group_hand);
		scene.add(group_board_p1);

//listeners
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'click', onDocumentMouseClick, false);
		THREEx.WindowResize(renderer, camera);
	}
	 
	function draw()
	{
	  mouseover();
	  TWEEN.update();
	  renderer.render(scene, camera);
	  requestAnimationFrame(draw);
	}


	/*Mouse related events*/

	function mouseover()
	{
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		// create an array containing all objects in the scene with which the ray intersects
//actions from the hand (play cards, ...)
		var intersects = ray.intersectObjects( group_hand.children );
		if ( intersects.length > 0 )
		{
			// if the closest object intersected is not the currently stored intersection object
			if ( intersects[ 0 ].object != INTERSECTED && intersects[ 0 ].object.userData.Card != null ) 
			{
			    // restore previous intersection object (if it exists) to its original color
				if ( INTERSECTED ) 
					INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				// store reference to closest object as current intersection object
				INTERSECTED = intersects[ 0 ].object;
				// store color of closest object (for later restoration)
				INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
				// set a new color for closest object
				INTERSECTED.material.color.setHex( 0xffff00 );
				console.log("Intersection : ",INTERSECTED.userData.Card);
				document.body.style.cursor='pointer';

			}
		}
		else // there are no intersections
		{
			// restore previous intersection object (if it exists) to its original color
			if ( INTERSECTED ) 
				INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
			// remove previous intersection object reference
			//     by setting current intersection object to "nothing"
			INTERSECTED = null;
			document.body.style.cursor='default';
		}
	}

	function onDocumentMouseClick( event )
	{
		var card;
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

//actions from the hand (play cards, ...)
		var intersects = ray.intersectObjects( group_hand.children );
		if ( intersects.length > 0 )
		{
			// if the closest object intersected is not the currently stored intersection object
			if ( intersects[ 0 ].object.userData.Card != null ) 
			{
				card = intersects[ 0 ].object;
				console.log("Clicked on : ",card.userData.Card);



			}
		}
	}

	function onDocumentMouseMove( event ) 
	{
		// the following line would stop any other event handler from firing
		// (such as the mouse's TrackballControls)
		// event.preventDefault();
		
		// update the mouse variable
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	//lets start the work
	createScene();	//initial setup
	draw();			//start loop

}

//THREE.QuadraticBezierCurve3
//http://www.movable-type.co.uk/scripts/latlong.html
/*

http://sole.github.io/tween.js/examples/03_graphs.html
move
var tween = new TWEEN.Tween( { x: card.x, y: card.y } )
		            .to( { x: 200 }, 5000 )
		            .easing( TWEEN.Easing.Elastic.InOut )
		            .onUpdate( function () {
		            	card.position.z = this.x;
		                console.log('x == ' + Math.round( this.x ));
		            } ).start();


/*
			//effet fleche
				//triangle
				var triangleShape = new THREE.Shape();
				triangleShape.moveTo(  20, 20 );
				triangleShape.lineTo( 120, 20 );
				triangleShape.lineTo(  70, 70 );
				triangleShape.lineTo(  20, 20 ); // close path

				var geometry = new THREE.ExtrudeGeometry( triangleShape, { amount: 10 } );

				var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: 0xff1100 } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false, transparent: false } ) ] );
				mesh.position.set( 0,0,0 );
				scene.add( mesh );
				//rectangle
				
				var rectShape = new THREE.Shape();
				rectShape.moveTo(  50,  0 );
				rectShape.lineTo(  90,  0 );
				rectShape.lineTo(  90, 60 );
				rectShape.lineTo(  50, 60 );
				rectShape.lineTo(  50,  0 ); // close path

				var geometry = new THREE.ExtrudeGeometry( rectShape, { amount: 10 } );
				var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: 0xff1100 } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false, transparent: false } ) ] );
				mesh.position.set( 0,-120,0 );
				scene.add( mesh );

			//path
			
				var spline = new THREE.SplineCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(50, 50, 100), new THREE.Vector3(100, 100, 0)]);
				//var geometry = new THREE.ExtrudeGeometry( spline, { amount: 10 } );
				var tube = new THREE.TubeGeometry(spline, true, 20, 10, false, false);
				var mesh = THREE.SceneUtils.createMultiMaterialObject( tube, [ new THREE.MeshLambertMaterial( { color: 0xff1100 } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
				mesh.position.set( -200,-120,0 );
			

				scene.add( mesh );
				*/