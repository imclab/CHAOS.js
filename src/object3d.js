 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

// CHAOS.Object3D
// CHAOS.Scene
// CHAOS.Mesh
// CHAOS.Camera

CHAOS.Object3D = function(params) {
  if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}

	var params = params || {};
	this.name = params.name !== undefined ? params.name : "object_"+arguments.callee._count++;

	this.parent = null;
	this.children = params.children !== undefined ? params.children : [];

	this.matrix = new CHAOS.Mat4();
	this.worldMatrix = new CHAOS.Mat4();

	this.position = params.position !== undefined ? params.position : new CHAOS.Vec3(0, 0, 0);
	this.rotation = params.rotation !== undefined ? params.rotation : new CHAOS.Vec3(0, 0, 0);
	this.scale = params.scale !== undefined ? params.scale : new CHAOS.Vec3(1, 1, 1);

	this.up = params.up !== undefined ? params.up : new CHAOS.Vec3(0, 1, 0);
	this.target = params.target !== undefined ? params.target : new CHAOS.Vec3(0, 0, 1);

	this.parentMaterial = null;
	this.overrideMaterial = null;

	return this;
};

CHAOS.Object3D._count = 0;

CHAOS.Object3D.prototype = {

	addObject: function(obj) {
		obj.parent = this;
		this.children.push(obj);
	},

	add: function(obj) {	
		if(obj instanceof Array) {
			var n = obj.length;
			for(var i=0; i<n; i++) {
				this.addObject(obj[i]);
			}
		}
		else {
			this.addObject(obj);
		}	
	},

	lookAt: function(target) {
		this.target = target;
	},

	updateMatrix: function() {
		// position
		// lookat
		// rotation
		// scale (not for now)
		this.matrix = new CHAOS.Mat4().identity();
		this.matrix = this.matrix.translate(this.position);

		// this.matrix = this.matrix.lookAtIt(this.position, this.target, new CHAOS.Vec3(0,1,0));
		// console.log(this.name , this.matrix);

		
		this.matrix = this.matrix.rotateX(this.rotation.x);
		this.matrix = this.matrix.rotateY(this.rotation.y);
		this.matrix = this.matrix.rotateZ(this.rotation.z);
		if(this.parent != null) {
			this.matrix = this.matrix.multiply(this.matrix, this.parent.matrix);
		}

	},

	applyTransformation: function(matT) {
		this.matrix.multiplySelf(matT);
	},

	removeByName: function(name) {
		var i = this.children.length;
		while(i--) {
			if(this.children[i].name == name) {
				this.children.splice(i,1);
			}
		}
	},

	remove: function(o) {
		o.parent = undefined;
		this.removeByName(o.name);
	},

	setPosition: function(x,y,z) {
		this.position.set(x,y,z);
		return this;
	},

	setRotation: function(x,y,z) {
		this.rotation.set(x,y,z);
		return this;
	},

	setScale: function(kx,ky,kz) {
		this.scale.set(kx,ky,kz);
	},

	getMatrix: function() {
		return this.matrix;
	},

	getParent: function() {
		return this.parent;
	},

	getChildren: function() {
		return this.children;
	},

	clear: function() {
		this.children = [];
		// TODO .parent
	}
};

// 									 9eeeeeee     zeeeeeey   eeeeeeeeee uee9     ee   eeeeeeeee
// 									5ey    Eee   eeu    ueeX ee          eeee    ee   ee       
// 									 eeu        ee        #u ee  ...W    eE ee   ee   ee ....5 
// 									  eeeeeeeK  ee           eeeeeeeee   ee  ee  ee   eeeeeeee.
// 									        ee  ee        5  ee          ee   ee ee   ee       
// 									ee      eey  ee      ee# ee          ee    eeee   ee       
// 									 eeeeeeeeu    EeeeeeeD   eeeeeeeeee uee     eee   eeeeeeeee


CHAOS.Scene = function() {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}

	CHAOS.Object3D.call(this,{});

	this.lights = [];
	this.name = "scene_"+arguments.callee._count++;
	return this;
};

CHAOS.Scene.prototype = Object.create( CHAOS.Object3D.prototype );

CHAOS.Scene.prototype.addObject = function(obj) {

	if(obj instanceof CHAOS.Light) {
		obj.parent = this;
		this.lights.push(obj);

	}
	else {
		obj.parent = this;
		this.children.push(obj);
	}
};

CHAOS.Scene.prototype.add = function(obj) {
	if(obj instanceof Array) {
			var n = obj.length;
			this.numObjects+=n;
			for(var i=0; i<n; i++) {
				this.addObject(obj[i]);
			}
		}
		else {
			this.addObject(obj);
		}
};

CHAOS.Scene.prototype.loadOBJ = function(url) {
	// parse
	// make new mesh
	// add to scene
	return this;
};

CHAOS.Scene._count = 0;

// 								  Eeeeeeeu      eeeu     eee     WeeX  eeeeeeeeee  eeeeeeee       eee    
// 								 ee     DeeW   eeEee     eee#    eeeX  ee          ee     ee     ee#ee   
// 								Ge       u9    ee eez    eeee   9eeeX  ee          ee     ee    uee eeX  
// 								ee            ee   ee    ee ee  ee eX  eeeeeeeee   eeeeeeee     ee   ee  
// 								ee        5  Xee u zee   ee 'e ee  eX  ee          ee     ee   eee K eee 
// 								 ee     Kee  eeGeeeeeeG  ee  eeee  eX  ee          ee     ee  .eeeeeeeee 
// 								  eeeeeeey  ee       ee  ee  .ee. .eX  eeeeeeeeee  ee     eeX ee       ee


CHAOS.Camera = function() {

	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}

	CHAOS.Object3D.call(this,{});

	this.projectionMatrix = new CHAOS.Mat4();
	this.name = "camera_"+arguments.callee._count++;

	return this;

};
CHAOS.Camera.prototype = Object.create( CHAOS.Object3D.prototype );

CHAOS.Camera.prototype.Perspective = function(params) {				// near, far, fov, aspect

	var params = params || {};
	var near = params.near !== undefined ? params.near : 0.1;
	var far = params.far !== undefined ? params.far : 2000;
	var aspect = params.aspect !== undefined ? params.aspect : 1;	
	var fov = params.fov !== undefined ? params.fov : 45;

	this.projectionMatrix.makePerspective(fov, aspect, near, far);
	return this;
};

CHAOS.Camera.prototype.Orthographic = function(params) {			// near, far, left, right, top, bottom
	var params = params || {};
	var near = params.near !== undefined ? params.near : 0.1;
	var far = params.far !== undefined ? params.far : 2000;
	var left = params.left !== undefined ? params.left : -500;
	var right = params.right !== undefined ? params.right : 500;
	var top = params.top !== undefined ? params.top : 500;
	var bottom = params.bottom !== undefined ? params.bottom : -500;

	this.projectionMatrix.makeOrthographic(left, right, top, bottom, near, far);

	return this;
};

CHAOS.Camera._count = 0;

// 									eee     #eeu  eeeeeeeeee  9eeeeeee   eeu     ee
// 									eeeK    eee   ee         ee     eee  ee      ee
// 									eeee   eeee   ee  ....   eee.        eeu ... ee
// 									ee eW  eG9e   eeeeeeeee    eeeeeee   eeeeeeeeee
// 									ee ee ee 9e   ee                uee  ee      ee
// 									ee eeeee ee   ee        Kee      ee  ee      ee
// 									ee  eee  eeu  eeeeeeeee9  eeeeeeee   eeu     ee

CHAOS.Mesh = function(geometry, materials, materialIndices) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}

	CHAOS.Object3D.call(this,{});

	this.geometry = geometry;
	this.materials = materials;
	this.materialIndices = materialIndices ? materialIndices : [];
	//     // each traingle -> material index
	// ==> // each material -> starting face index

	return this;
};

CHAOS.Mesh.prototype = Object.create( CHAOS.Object3D.prototype );

CHAOS.Mesh.prototype.sortByMaterial = function() {
	/* sorting */
	return this;
};
