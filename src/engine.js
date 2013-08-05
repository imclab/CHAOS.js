 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

// CHAOS.Engine   :::  clear(), context loss?
// CHAOS.RenderTarget

CHAOS.Engine = function(id, options) {
  if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}

	this.gl = null;
    this._clearColor = null;
    this._aa = options.antialias ? options.antialias : (options.aa ? options.aa : false);
    var _canvas = null;  

	try {
	    _canvas = document.getElementById(id);
	    this.gl = _canvas.getContext('experimental-webgl', {antialias: this._aa});

	    if(this.gl == null){
	        this.gl = _canvas.getContext('webgl', {antialias: this._aa});
	    }
	}
	catch(error){
		CHAOS.log("CHAOS: Couldn't get context upon element specified.");
	}

	if(this.gl != null) {

		var options = options || {};
		
		this._clearColor = options.clearColor !== undefined ? new CHAOS.Color(options.clearColor) : new CHAOS.Color(0x000000);
	    this.gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        
	    this.width = options.width !== undefined ? options.width : _canvas.width;
	    this.height = options.height !== undefined ? options.height : _canvas.height;
        this.gl.viewportWidth = this.width;
	    this.gl.viewportHeight = this.height;

        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);

        this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);		// only compare to depth buffer when equal
		this.gl.depthMask(true);				// enable depth testing

		this.gl.frontFace(this.gl.CCW);			// vertex primitive order - ccw
		this.gl.disable(this.gl.CULL_FACE);		// double sided

		this.clear(); // TODO
		this.gl.getExtension('OES_texture_float');

		this.QUAD = new CHAOS.Mesh(new CHAOS.Geometry().Plane({width: 2, height: 2}), null);	// screen plane
		this.QUADCam = new CHAOS.Camera(); 														// identity matrix, lol xD cheat!

		this.blendLight = new CHAOS.Material().fromString(CHAOS.ShaderLib.blendLight.vs, CHAOS.ShaderLib.blendLight.fs);
		this.blendLight.prepare(this.gl);
		this.pass2shader = new CHAOS.Material().fromString(CHAOS.ShaderLib.pass2.vs, CHAOS.ShaderLib.pass2.fs);
		this.pass2shader.prepare(this.gl);

		this.rt_pass1  = new CHAOS.RenderTarget({width: this.width, height: this.height, bits: 8});	// 8bit: 	RGB, specular
		this.rt_pass2  = new CHAOS.RenderTarget({width: this.width, height: this.height, bits: 16});	// 32bit: 	depth, normal.xy, specular
		this.rt_passLA = new CHAOS.RenderTarget({width: this.width, height: this.height, bits: 8});	// 8bit: 	light accumulation
		this.rt_final  = null;
		
		CHAOS.log("CHAOS++ v0.34 - initialized");

	}
	else {
	    CHAOS.log("CHAOS: Couldn't init webGL.");
	}

	return this;
};

CHAOS.Engine.prototype = {
	render: function(a,b,c) {

		//this.clear();	// TODO

		if(a instanceof CHAOS.Object3D && b instanceof CHAOS.Camera) {
			this.rt_final = c === undefined ? null : c;
			this.renderScene(a,b);
		}
		else if(a instanceof CHAOS.Effect) {
			this.rt_final = b === undefined ? null : b;
			this.QUAD.overrideMaterial = a;
			this.renderScene(this.QUAD, this.QUADCam);
		}
		else {
			CHAOS.log("CHAOS.Engine.render() :: Render call not setup correctly: ",a,b,c);
		}
	},
	renderScene: function(scene, camera) {

	// _____________________
	// BUILD RENDERING LISTS

		var renderList = [],
			overrideList = [],
			lightList = scene.lights;

		(function addChildren(obj) {
			if(obj.overrideMaterial) {
				overrideList.push(obj);
			}
			else {
				renderList.push(obj);
			}
			for(var i=obj.children.length-1; i>=0; i--) {
				addChildren(obj.children[i]);
			}
		})(scene);

	// __________
	// FIRST PASS

		// material.modifiedVer = ... TODO
		setRT(rt_pass1);
		var l = renderList.length, i = l;
		var modifier = new RegExp("gl_FragColor", "ig");
		while(i--) {
			this.renderObject(renderList[i], camera, renderList[i].material, [ modifier , "xD"]);
		}

	// ___________
	// SECOND PASS
		i = l;
		setRT(this.rt_pass2);
		while(i--) {
			this.renderObject(renderList[i], camera, this.pass2shader, null);
		}

	// __________
	// LIGHT PASS
		i = lightList.length;
		// culling
		while(i--) {
			// override material
			this.renderObject(lightList[i].mesh, camera, lightsList.shader, null)
		}

	// __________
	// FINAL PASS	
		this.render(this.blendLight, this.rt_final)

	// _____________
	// OVERRIDE PASS
		setRT(this.rt_final);
		i = overrideList.length;
		while(i--) {
			this.renderObject(overrideList[i], camera, overrideList[i].overrideMaterial, null);
		}

	},
	renderObject: function(mesh, camera, material, modifier) {
		// modifier: [appendTop, replaceWhat, replaceWith, appendBottom]
		/*
		
		blah;

		void main() {
			blah;
			gl_FragColor = 

		}



		*/
	},
	setRT: function(rt) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, rt.framebuffer);
	},	
	getAspectRatio: function() {
		return this.width / this.height;
	},
	clear: function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	},
	doubleSided: function(yes) {
		var gl = this.gl;
		if(yes) {
			gl.disable(gl.CULL_FACE);
		}
		else {
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
		}
	}
};


// 										eeeeeeee.  eeeeeeeeee
// 										ee     ee      ee    
// 										ee     ee      ee    
// 										eeeeeeeeX      ee    
// 										ee     ee      ee    
// 										ee     ee      ee    
// 										ee     eeD     ee    

CHAOS.RenderTarget = function(params) {

	this.width = params.width ? params.width : 512;
	this.height = params.height ? params.height : 512;
	this.bits = params.bits ? params.bits : (params.bit ? params.bit : 8);

	this.texture = null;
	this.renderbuffer = null;
	this.framebuffer = null;

	this.isPrepared = false;

	return this;
};

CHAOS.RenderTarget.prototype = {
	prepare: function(gl) {

		var bit_type = this.bits ? gl.FLOAT : gl.UNSIGNED_BYTE;

		this.framebuffer = gl.createFramebuffer();  // frame buffer object	
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, bit_type, null); 			// empty texture gl.FLOAT | gl.UNSIGNED_BYTE

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);										// MIPMAP-ing nearest etc, generate

        this.renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0); 			// bind framebuffer to texture
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer); 	// bind framebuffer to renderbuffer

		// unbind everything
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.isPrepared = true;

		return this;
	}
};
