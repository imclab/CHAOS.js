 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

// CHAOS.Light
// CHAOS.AmbientLight
// CHAOS.SpotLight
// CHAOS.DirectionalLight
// CHAOS.PointLight
// CHAOS.CustomLight  ??

CHAOS.Light = function(params) {
  if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	CHAOS.Object3D.call(this,{});

	this.name = "light_"+arguments.callee._count++;
	this.color = params.color ? params.color : new CHAOS.Color();
	this.intensity = params.intensity ? params.intensity : 0.;

	this.shape = null;
	this.shader = null;

	return this;
};

CHAOS.Light._count = 0;

CHAOS.Light.prototype = Object.create( CHAOS.Object3D.prototype );



CHAOS.AmbientLight = function(params) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	CHAOS.Light.call(this,params);

	this.name += "_ambient_"+arguments.callee._count++;

	this.shape = null;
	this.shader = null;

	return this;
};

CHAOS.AmbientLight.prototype = Object.create( CHAOS.Light.prototype );
CHAOS.AmbientLight._count = 0;


CHAOS.SpotLight = function(params) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	CHAOS.Light.call(this,params);

	this.name += "_spot_"+arguments.callee._count++;

	this.shape = null;
	this.shader = null;

	return this;
};

CHAOS.SpotLight.prototype = Object.create( CHAOS.Light.prototype );
CHAOS.SpotLight._count = 0;


CHAOS.PointLight = function(params) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	CHAOS.Light.call(this,params);

	this.name += "_point_"+arguments.callee._count++;

	this.shape = null;
	this.shader = null;

	return this;
};

CHAOS.PointLight.prototype = Object.create( CHAOS.Light.prototype );
CHAOS.PointLight._count = 0;


CHAOS.DirectionalLight = function(params) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	CHAOS.Light.call(this,params);

	this.name += "_directional_"+arguments.callee._count++;

	this.shape = null;
	this.shader = null;

	return this;
};

CHAOS.DirectionalLight.prototype = Object.create( CHAOS.Light.prototype );
CHAOS.DirectionalLight._count = 0;
