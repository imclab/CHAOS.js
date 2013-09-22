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
	this.normalMatrix = new CHAOS.Mat4();

	this.position = params.position !== undefined ? params.position : new CHAOS.Vec3(0, 0, 0);
	this.rotation = params.rotation !== undefined ? params.rotation : new CHAOS.Vec3(0, 0, 0);
	this.scale = params.scale !== undefined ? params.scale : new CHAOS.Vec3(1, 1, 1);
	this.rotationOrder = 'XYZ';

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

	// lookAt: function(target) {
	// 	this.target = target;
	// },

	updateMatrix: function () {

		this.matrix.identity();
		
		// rotation
		this.matrix["rotate"+this.rotationOrder[0].toUpperCase()](this.rotation[this.rotationOrder[0].toLowerCase()]);
		this.matrix["rotate"+this.rotationOrder[1].toUpperCase()](this.rotation[this.rotationOrder[1].toLowerCase()]);
		this.matrix["rotate"+this.rotationOrder[2].toUpperCase()](this.rotation[this.rotationOrder[2].toLowerCase()]);
		// translation
		this.matrix.elements[12] = this.position.x;
		this.matrix.elements[13] = this.position.y;
		this.matrix.elements[14] = this.position.z;
		// scale
		this.matrix.scale(this.scale);
		
		return this;
	},

	getNormalMatrix: function() {
		this.normalMatrix.identity();
		this.normalMatrix.rotateX(this.rotation.x);
		this.normalMatrix.rotateY(this.rotation.y);
		this.normalMatrix.rotateZ(this.rotation.z);

		return this.normalMatrix;
	},

	updateWorldMatrix: function () {

		// this.parent.worldMatrix * this.matrix
		if(this.parent) {
			this.worldMatrix.multiply(this.parent.worldMatrix, this.matrix);
		}
		else {
			this.worldMatrix = this.matrix;
		}
		
		for(var i=0, c=this.children.length; i<c; i++) {
			this.children[i].updateWorldMatrix();
		}
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

CHAOS.Camera.prototype.lookAt = function(target) {
	
	CHAOS.log("look@");
	var m = new CHAOS.Mat4();
	m.look_at(this.position, target, this.up);
	this.matrix = m;

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
		return new arguments.callee(geometry, materials, materialIndices);
	}

	CHAOS.Object3D.call(this,{});

	this.geometry = geometry;
	this.materials = [];
	this.renderData = [];

	if(materials instanceof Array) {
		for(var i=0, l=materials.length; i<l; i++) {
			this.materials.push(materials[i]);
		}
	}
	else {
		if(materials!=null) this.materials.push( materials );
	}

	this.matFaces = (materialIndices === undefined) ? new Array() : materialIndices;

	if(this.matFaces.length == 0 && this.materials.length!=0) {
		var total = this.geometry.faces.length;
		var part = total / this.materials.length;

		for(var i=0; i<this.materials.length; i++) {
			for(var b=0; b<part; b++) {
				this.matFaces.push(i);
			}
		}
	}

	this.applyLights = true;
	this.needsUpdate = true;

	return this;
};

CHAOS.Mesh.prototype = Object.create( CHAOS.Object3D.prototype );

CHAOS.Mesh.prototype.prepare = function(gl) {

	for(var m =0; m<this.materials.length; m++) {
		
		var partAtt = [];
		var partFaces = [];
		var partIndices = [];

		var prop_name = ["vertices", "normals", "colors", "uvs"];
		var atts_name = ["aVertexPosition", "aVertexNormal", "aVertexColor", "aVertexUV"];
		var type_name = ["chaos.vec3", "chaos.vec3", "chaos.color", "chaos.uv"];

		var material = this.materials[m];
		this.renderData[m] = [];

		
		//getting the triangles that are used by material
		for(var i=0; i<this.matFaces.length; i++) {

			if(this.matFaces[i] == m) {
				partFaces.push(this.geometry.faces[i]);
			}
		}

		// getting the unique original indices
		for(var i=0; i<partFaces.length; i++) {
			if( partIndices.indexOf(partFaces[i][0]) == -1) partIndices.push(partFaces[i][0]);
			if( partIndices.indexOf(partFaces[i][1]) == -1) partIndices.push(partFaces[i][1]);
			if( partIndices.indexOf(partFaces[i][2]) == -1) partIndices.push(partFaces[i][2]);
		}

		// extracting geometry attributes
		for(var k=0; k<atts_name.length && this.geometry[prop_name[k]].length>0; k++) {

			this.renderData[m][atts_name[k]] = new Object();	
			this.renderData[m][atts_name[k]].value = [];
			this.renderData[m][atts_name[k]].type = type_name[k];
			this.renderData[m][atts_name[k]].needsUpdate = true;
			this.renderData[m][atts_name[k]].unpackedData = null;

			var geom_atr = this.geometry[ prop_name[k] ];

			if(geom_atr.length>0) {

				for(var f=0; f<partIndices.length; f++) {
					this.renderData[m][atts_name[k]].value.push( geom_atr[ partIndices[f] ] );
				}
			}
		}

		// calculating new indices
		for(var i=0; i<partFaces.length; i++) {
			partFaces[i][0] = partIndices.indexOf(partFaces[i][0]);
			partFaces[i][1] = partIndices.indexOf(partFaces[i][1]);
			partFaces[i][2] = partIndices.indexOf(partFaces[i][2]);
		}

		// set new indices
		this.renderData[m]["indices"] = partFaces;
		this.renderData[m]["indices"].needsUpdate = true;

		// prepare material (aka compile and link) 
		material.prepare(gl);
		// unpack and buffer geometry attributes
		for(var key in this.renderData[m]) {
			if(key != "indices") material.unpackAttribute(this.renderData[m][key], key, gl);
		}
		material.unpackIndices(this.renderData[m]["indices"], gl);
		// unpack and get ready uniforms
		material.unpackUniforms(gl);
	}

	this.needsUpdate = false;

	return this;

};

CHAOS.Mesh.prototype.draw = function (gl, camera) {

	for(var m=0; m<this.materials.length; m++) {

		var material = this.materials[m];
		var indices = this.renderData[m]["indices"];

		camera.updateMatrix();

		this.updateMatrix();
		this.updateWorldMatrix();

		var modelMatrix = this.worldMatrix;
		camera.matrix = camera.matrix.getInverse(camera.matrix);
		var a = new CHAOS.Mat4();
		var modelViewMatrix = a.multiply(camera.matrix, modelMatrix);
		var normalMatrix = this.getNormalMatrix();

		material.uniforms["uMVMatrix"] = { value: modelViewMatrix, type: "chaos.mat4" };
		material.uniforms["uPMatrix"] = { value: camera.projectionMatrix, type: "chaos.mat4" };
		material.uniforms["uNMatrix"] = { value: normalMatrix, type: "chaos.mat4" };

		material.unpackUniforms(gl);
		material.unpackUniform("uMVMatrix");
		material.unpackUniform("uPMatrix");
		material.unpackUniform("uNMatrix");

		material.use(gl);

		material.tex_count = -1;
		for(var uniform_name in material.uniforms) {
			 material.sendUniform(uniform_name, gl);
		}

		for(var attribute_name in this.renderData[m]) {
			if(attribute_name != "indices") {
				// CHAOS.log(attribute_name);
				material.bindAttribute(this.renderData[m][attribute_name], gl)
			}
		}
		// indices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.unpackedData);
		gl.drawElements(gl.TRIANGLES, indices.itemSize, gl.UNSIGNED_SHORT, 0);
	}

};
