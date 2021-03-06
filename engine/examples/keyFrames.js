SB.Examples.KeyFrameGame = function()
{
	SB.Game.call(this);	    	
}

goog.inherits(SB.Examples.KeyFrameGame, SB.Game);

SB.Examples.KeyFrameGame.prototype.initEntities = function()
{
	var root = new SB.Entity;
	
	var b1 = new SB.Examples.KeyFrameBall();
	b1.transform.position.x = 2;

	root.addChild(b1);
	
	this.addEntity(root);

	this.viewer = new SB.Viewer({ headlight : true });
	this.viewer.transform.position.z = 5;
	root.addChild(this.viewer);
	
	root.realize();

	this.viewer.viewpoint.camera.bind();
	
}

