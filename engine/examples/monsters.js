SB.Examples.Monsters = function()
{
	SB.Game.call(this);	    	
	
	this.lastdy = 0;
	this.dragging = false;
	this.helpScreen = null;
}

goog.inherits(SB.Examples.Monsters, SB.Game);

SB.Examples.Monsters.prototype.initialize = function(param)
{
	if (!param)
		param = {};
	
	if (!param.backgroundColor)
		param.backgroundColor = SB.Examples.Monsters.default_bgcolor;

	if (!param.displayStats)
		param.displayStats = SB.Examples.Monsters.default_display_stats;
	
	SB.Game.prototype.initialize.call(this, param);
}


SB.Examples.Monsters.prototype.initEntities = function()
{
	this.root = new SB.Entity;
	this.dragger = new SB.Dragger();
	this.rotator = new SB.Rotator();
	this.root.addComponent(this.dragger);
	this.root.addComponent(this.rotator);
	this.dragger.subscribe("move", this, this.onDraggerMove);
	this.rotator.subscribe("rotate", this, this.onRotatorRotate);
	
	var grid = new SB.Grid({size: 14});
	this.root.addComponent(grid);
	
	var m1 = new SB.Examples.Monster();
	m1.transform.position.x = 5;

	var m2 = new SB.Examples.Monster();
	m2.transform.position.x = -5;

	var m3 = new SB.Examples.Monster();
	m3.transform.position.z = -5;

	this.createViewer();
	
//	this.avatar = new SB.Examples.Avatar;
//	this.camera.addChild(this.avatar);
	
	this.monsters = [m1, m2, m3];
	this.activeMonster = null;
	
	this.root.addChild(m1);
	this.root.addChild(m2);
	this.root.addChild(m3);
	this.root.addChild(this.viewer);
	
	this.addEntity(this.root);

	this.root.realize();
	
	this.viewer.viewpoint.camera.bind();
	
}

SB.Examples.Monsters.prototype.createViewer = function()
{
	this.viewer = new SB.Viewer({ headlight : true });
	this.avatar = new SB.Examples.Avatar;

	this.viewer.addChild(this.avatar);
}

SB.Examples.Monsters.prototype.onMouseMove = function(x, y)
{
	this.dragger.set(x, y);
	this.rotator.set(x, y);
}

SB.Examples.Monsters.prototype.onMouseDown = function(x, y)
{
	this.dragger.start(x, y);
	this.rotator.start(x, y);
	this.dragging = true;
}

SB.Examples.Monsters.prototype.onMouseUp = function(x, y)
{
	this.dragger.stop(x, y);
	this.rotator.stop(x, y);
	this.dragging = false;
	this.lastdy = 0;
}

SB.Examples.Monsters.prototype.onMouseScroll = function(delta)
{
	SB.Graphics.instance.camera.position.z -= delta;
}

SB.Examples.Monsters.prototype.onKeyDown = function(keyCode, charCode)
{
	if (this.activeMonster)
		this.activeMonster.onKeyDown(keyCode, charCode);
}

SB.Examples.Monsters.prototype.onKeyUp = function(keyCode, charCode)
{
	this.lastdy = 0;
	var mi;
	
	var handled = false;
	switch (String.fromCharCode(keyCode))
	{
    	case 'H' :
    		this.help();
    		handled = true;
    		break;
    		
    	case '1' :
    		mi = 1;
    		break;
    	case '2' :
    		mi = 2;
    		break;
    	case '3' :
    		mi = 3;
    		break;
    		
    	default : 
    		break;
	}

	if (!handled && this.activeMonster)
	{
		this.activeMonster.onKeyUp(keyCode, charCode);
	}
		
	if (mi)
	{
		var monster = this.monsters[mi-1];
		this.setActiveMonster(monster);
	}
}

SB.Examples.Monsters.prototype.onKeyPress = function(keyCode, charCode)
{
}

SB.Examples.Monsters.prototype.onRotatorRotate = function(axis, delta)
{
	delta *= .666;
	
	if (delta != 0)
	{
		// this.viewer.transform.rotation.y -= delta;
		var dir = new THREE.Vector3(0, -delta, 0);
		this.viewer.turn(dir);
		this.lastrotate = delta;
	}
}

SB.Examples.Monsters.prototype.onDraggerMove = function(dx, dy)
{
	if (Math.abs(dy) <= 2)
		dy = 0;
	
	dy *= .02;
	
	if (dy)
	{
		this.lastdy = dy;
	}
	else if (this.lastdy && this.dragging)
	{
		dy = this.lastdy;
	}

	if (dy != 0)
	{
		// this.viewer.transform.position.z -= dy;
		var dir = new THREE.Vector3(0, 0, -dy);
		this.viewer.move(dir);
	}
}

SB.Examples.Monsters.prototype.setActiveMonster = function(monster)
{
	if (this.activeMonster)
	{
		this.activeMonster.setActive(false);
	}
	
	monster.setActive(true);
	
	this.activeMonster = monster;
}

SB.Examples.Monsters.prototype.help = function()
{
	if (!this.helpScreen)
	{
		this.helpScreen = new SB.Examples.MonstersHelp();
	}
	
	this.helpScreen.show();
}

SB.Examples.Monsters.default_bgcolor = '#000000';
SB.Examples.Monsters.default_display_stats = true;
