/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.require('SB.Graphics');
goog.provide('SB.GraphicsThreeJS');

SB.GraphicsThreeJS = function()
{
	SB.Graphics.call(this);
}

goog.inherits(SB.GraphicsThreeJS, SB.Graphics);

SB.GraphicsThreeJS.prototype.initialize = function(param)
{
	param = param || {};
	
	// call all the setup functions
	this.initOptions(param);
	this.initPageElements(param);
	this.initScene();
	this.initRenderer(param);
	this.initMouse();
	this.initKeyboard();
	this.addDomHandlers();
}

SB.GraphicsThreeJS.prototype.focus = function()
{
	if (this.renderer && this.renderer.domElement)
	{
		this.renderer.domElement.focus();
	}
}

SB.GraphicsThreeJS.prototype.initOptions = function(param)
{
	this.displayStats = (param && param.displayStats) ? 
			param.displayStats : SB.GraphicsThreeJS.default_display_stats;
}

SB.GraphicsThreeJS.prototype.initPageElements = function(param)
{
    this.container = param.container ? param.container : document.createElement( 'div' );
    document.body.appendChild( this.container );
    
    if (this.displayStats)
    {
        var stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.left = '140px';
        stats.domElement.style.height = '40px';
        this.container.appendChild( stats.domElement );
        this.stats = stats;
    }
}

SB.GraphicsThreeJS.prototype.initScene = function()
{
    var scene = new THREE.Scene();

    scene.add( new THREE.AmbientLight(0xffffff) ); //  0x505050 ) ); // 
	
    var camera = new THREE.PerspectiveCamera( 45, 
    		this.container.offsetWidth / this.container.offsetHeight, 1, 4000 );
    camera.position.set( 0, 0, 10 );

    scene.add(camera);
    
    this.scene = scene;
	this.camera = camera;
}

SB.GraphicsThreeJS.prototype.initRenderer = function(param)
{
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.sortObjects = false;
    renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );

    if (param && param.backgroundColor)
    {
    	renderer.domElement.style.backgroundColor = param.backgroundColor;
    	renderer.domElement.setAttribute('z-index', -1);
    }
    
    this.container.appendChild( renderer.domElement );

    var projector = new THREE.Projector();

    this.renderer = renderer;
    this.projector = projector;
    
}

SB.GraphicsThreeJS.prototype.initMouse = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'mousemove', 
			function(e) { that.onDocumentMouseMove(e); }, false );
	dom.addEventListener( 'mousedown', 
			function(e) { that.onDocumentMouseDown(e); }, false );
	dom.addEventListener( 'mouseup', 
			function(e) { that.onDocumentMouseUp(e); }, false );
	
	$(dom).mousewheel(
	        function(e, delta) {
	            that.onDocumentMouseScroll(e, delta);
	        }
	    );
	
}

SB.GraphicsThreeJS.prototype.initKeyboard = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'keydown', 
			function(e) { that.onKeyDown(e); }, false );
	dom.addEventListener( 'keyup', 
			function(e) { that.onKeyUp(e); }, false );
	dom.addEventListener( 'keypress', 
			function(e) { that.onKeyPress(e); }, false );

	// so it can take focus
	dom.setAttribute("tabindex", 1);
    
}

SB.GraphicsThreeJS.prototype.addDomHandlers = function()
{
	var that = this;
	window.addEventListener( 'resize', function(event) { that.onWindowResize(event); }, false );
}

SB.GraphicsThreeJS.prototype.objectFromMouse = function(pagex, pagey)
{
	var offset = $(this.renderer.domElement).offset();
	
	var eltx = pagex - offset.left;
	var elty = pagey - offset.top;
	
	// translate client coords into vp x,y
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = this.camera.position.clone();
    pos = this.camera.matrixWorld.multiplyVector3(pos);
    var ray = new THREE.Ray( pos, vector.subSelf( pos ).normalize() );

    var intersects = ray.intersectScene( this.scene );
	
    if ( intersects.length > 0 ) {
    	var intersected = intersects[0];
    	return (this.findObjectFromIntersected(intersected.object, intersected.point));        	    	                             
    }
    else
    {
    	return { object : null, point : null };
    }
}

SB.GraphicsThreeJS.prototype.findObjectFromIntersected = function(object, point)
{
	if (object.data)
	{
		return { object: object.data, point: point };
	}
	else if (object.parent)
	{
		return this.findObjectFromIntersected(object.parent, point);
	}
	else
	{
		return null;
	}
}

SB.GraphicsThreeJS.prototype.onDocumentMouseMove = function(event)
{
    event.preventDefault();
    //console.log("MOUSE Mouse move " + event.pageX + ", " + event.pageY);
    
    SB.Mouse.instance.onMouseMove(event.pageX, event.pageY);
    
    if (SB.Picker)
    {
    	SB.Picker.handleMouseMove(event.pageX, event.pageY);
    }
    
    SB.Game.handleMouseMove(event.pageX, event.pageY);
}

SB.GraphicsThreeJS.prototype.onDocumentMouseDown = function(event)
{
    event.preventDefault();
    
    // N.B.: ahh, the bullshit continues...
    this.focus();
    
    // console.log("Mouse down " + event.pageX + ", " + event.pageY);
    
    SB.Mouse.instance.onMouseDown(event.pageX, event.pageY);
    
    if (SB.Picker)
    {
    	SB.Picker.handleMouseDown(event.pageX, event.pageY);
    }
    
    SB.Game.handleMouseDown(event.pageX, event.pageY);
}

SB.GraphicsThreeJS.prototype.onDocumentMouseUp = function(event)
{
    event.preventDefault();
    // console.log("Mouse up " + event.pageX + ", " + event.pageY);
    
    SB.Mouse.instance.onMouseUp(event.pageX, event.pageY);
    
    if (SB.Picker)
    {
    	SB.Picker.handleMouseUp(event.pageX, event.pageY);
    }	            

    SB.Game.handleMouseUp(event.pageX, event.pageY);
}

SB.GraphicsThreeJS.prototype.onDocumentMouseScroll = function(event, delta)
{
    event.preventDefault();
    // console.log("Mouse wheel " + delta);
    
    SB.Mouse.instance.onMouseScroll(delta);

    if (SB.Picker)
    {
    	SB.Picker.handleMouseScroll(delta);
    }
    
    SB.Game.handleMouseScroll(delta);
}

SB.GraphicsThreeJS.prototype.onKeyDown = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    SB.Keyboard.instance.onKeyDown(event.keyCode, event.charCode);
    
	SB.Game.handleKeyDown(event.keyCode, event.charCode);
}

SB.GraphicsThreeJS.prototype.onKeyUp = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    SB.Keyboard.instance.onKeyUp(event.keyCode, event.charCode);
    
	SB.Game.handleKeyUp(event.keyCode, event.charCode);
}
	        
SB.GraphicsThreeJS.prototype.onKeyPress = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    SB.Keyboard.instance.onKeyPress(event.keyCode, event.charCode);
    
	SB.Game.handleKeyPress(event.keyCode, event.charCode);
}

SB.GraphicsThreeJS.prototype.onWindowResize = function(event)
{
	this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

	this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
	this.camera.updateProjectionMatrix();
}

SB.GraphicsThreeJS.prototype.update = function()
{
    this.renderer.render( this.scene, this.camera );

    if (this.stats)
    {
    	this.stats.update();
    }
}
	        
SB.GraphicsThreeJS.default_display_stats = false,
