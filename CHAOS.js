 /**
 * >> CHAOS.js - webGL-based 3D engine
 *
 * @version 0.34
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

CHAOS.__R = null;
// counters
CHAOS.numCameras = 0;
CHAOS.numScenes = 0;
CHAOS.numObjects = 0;
CHAOS.numPasses = 0;

// constants
// LOL, not one? xD

// ... TODO ...
// objects -> mesh, particle, line, light, camera
// material - line, particle, wireframe
// quad support?

// loader
// post processing - CHAOS.PASS

// >>>
// deferred rendering, sound api, video texture, input api, animation/game loop
// physics, material library, pp library, axis draw, particle-light draw, camera draw
// >>>


// CHAOS.prototype.random = function(low, high) {
//   return Math.random()*(high-low)+low;
// };

CHAOS.Animation = function(fnc_name, fps) {
	this.fnc_name = fnc_name;
	this.fps = fps ? fps : 60;

	// window.requestAnimFrame = (function() {
	//   return window.requestAnimationFrame ||
	//          window.webkitRequestAnimationFrame ||
	//          window.mozRequestAnimationFrame ||
	//          window.oRequestAnimationFrame ||
	//          window.msRequestAnimationFrame ||
	//          function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	//            window.setTimeout(callback, 1000/60);
	//          };
	// })();
	return this;
};

CHAOS.Animation.prototype = {
	reqFrame: function() {
		var a = this;
		var anim = function() { a.animate(); };
		window.setTimeout(anim, 1000/a.fps);	// TODO
	},

	animate: function() {
		this.reqFrame();
		this.fnc_name();
	},

	toString: function() {
		return "shit";
	}
};

CHAOS.A = CHAOS.Animation;

// 				eeeeeeeeE   ueeeeeeeeee  eee      ee   eeeeeeeeu    eeeeeeeeeez ueeeeeeeez   Eeeeeeeeeee  eeeeeeee# 
// 				ee      ee   ee          eeeey    ee   ee     #ee   ee           ee     zee  eeK          ee     ue#
// 				ee     eee   ee ....Ku   ee eeE   ee   ee       ee  eeX ....5    ee     ee#  eeG ....y    ee     eeW
// 				eeeeeeeee    eeeeeeeee   ee  eee  ee   ee       ee  eeeeeeeeeW   eeeeeeeee   eeeeeeeee9   eeeeeeeee 
// 				ee     eee   ee          ee   eee ee   ee       ee  ee           ee     eeX  eeX          ee     eeu
// 				ee      ee   ee          ee    Xeeee   ee     yee   ee           ee     9eG  eeX          ee     Ke5
// 				ee      ee  ueeeeeeeeee  ee      eee   eeeeeeee5    eeeeeeeeeeD uee     Dee  EeeeeeeeeeG  ee     WeE

CHAOS.Renderer = function(id, options) {

    this.context = null;
    var _clearColor = null;
    var _canvas = null;  

	try {
	    _canvas = document.getElementById(id);
	    this.context = _canvas.getContext('experimental-webgl');

	    if(this.context == null){
	        this.context = _canvas.getContext('webgl');
	    }
	}
	catch(error){}

	if(this.context != null) {

		var options = options || {};
		
		_clearColor = options.clearColor !== undefined ? new CHAOS.Color(options.clearColor) : new CHAOS.Color(0x000000);
	    this.context.clearColor(_clearColor.r, _clearColor.g, _clearColor.b, _clearColor.a);
        

        this.context.viewportWidth = options.width !== undefined ? options.width : _canvas.width;
	    this.context.viewportHeight = options.height !== undefined ? options.height : _canvas.height;

        this.context.viewport(0, 0, this.context.viewportWidth, this.context.viewportHeight);

        this.context.enable(this.context.DEPTH_TEST);
		this.context.depthFunc(this.context.LEQUAL);		// only compare to depth buffer when equal
		this.context.depthMask(true);						// enable depth testing

		this.context.frontFace(this.context.CCW);			// vertex primitive order - ccw

		this.clear();
		this.context.getExtension('OES_texture_float');
		// this.context.assertFloatRenderTarget();
		CHAOS.__R = this;

		this.QUAD = null;

		this.doubleSided(true);
		console.log(">> CHAOS.js webGL renderer initiated");

	}
	else {
	    alert("Couldn't init webGL.");
	}

	return this;
};

CHAOS.Renderer.prototype = {

	// albedo/diffuse - color, textures RGB16 + depth A16 
	// normals - normalMaterial RG16 + specular power i shininess BA16

	// PASS 1
	// color + texture 		RGB
	// depth 				A

	// PASS 2
	// normals 				RG
	// specular 			BA

	// PASS 3
	// p1 + p2 + fog + light + shadow maps

	// animate
	render: function(obj, cam) {
		this.clear();
		if(obj instanceof CHAOS.Object3D) {
			this.renderObject(obj, cam);
		}
		else if(obj instanceof CHAOS.Pass) {
			this.renderPass(obj);
		}
		else {
			alert("Render function not properly configured.")
		}
	},
	renderObject: function(o, cam) {
		
		var over_mat = o.overrideMaterial;
		var override = false;

		var mate;

		if(over_mat==null && (o instanceof CHAOS.Mesh)) {
			mate = o.materials[0];		// ... TODO ... multi material
		}
		else {
			mate = over_mat;
			override = true;
		}

		// o.update()
		if(o instanceof CHAOS.Mesh) {



			function check_att(sp, name) {
				var check;
				if(sp.attr[name] > -1) { check = true; }
				else { check = false; }
				return check;
			}

			function check_uni(sp, name) {
				var check;
				if(sp.unif[name] != null) { check = true; }
				else { check = false; }
				return check;
			}

			var gl = this.context;

			// console.log("--- "+o.name + " now drawing");

			var geom = o.geometry;			// ... TODO ... double sided or not, cull-face on/off


			// activate shader
			mate.use();
			var shaderProgram = mate.shaderProgram;

			if(geom.needsUpdate) {
					
				geom.buffers["aVertexPosition"] = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexPosition"]);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.vertices), gl.STATIC_DRAW);


				if(geom.indices.length!=0) {
					geom.buffers["indices"] = gl.createBuffer();
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.buffers["indices"]);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geom.indices), gl.STATIC_DRAW);
				}

				if(geom.normals.length!=0 && check_att(shaderProgram, "aVertexNormal")) {
					geom.buffers["aVertexNormal"] = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexNormal"]);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.normals), gl.STATIC_DRAW);
				}

				if(geom.uvs.length!=0 && check_att(shaderProgram, "aTextureCoord")) {
					geom.buffers["aTextureCoord"] = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aTextureCoord"]);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.uvs), gl.STATIC_DRAW);
				}

				if(geom.colors.length!=0 && check_att(shaderProgram, "aVertexColor")) {
					geom.buffers["aVertexColor"] = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexColor"]);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.colors), gl.STATIC_DRAW);
				}

				for(var key in mate.customAttr) {
					if(check_att(shaderProgramm, key)) {
						geom.buffers[key] = gl.createBuffer();
						gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers[key]);
						gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mate.customAttr[key]), gl.STATIC_DRAW);
					}
				}

				geom.needsUpdate = false;
			}
			
			// updating objects matrices

			// - - - - - - - - - - - - - - - - - - - - UNIFORMS - - - - - - - - - - - - - - - - - - - -
			
			// model-view matrix
			// projection matrix
			// normal matrix
			// custom uniforms

			var modelMatrix;
			var viewMatrix;
			var projMatrix;
			var normalMatrix;
			
			projMatrix = cam.projectionMatrix;

			o.updateMatrix();
			modelMatrix = o.matrix;

			cam.updateMatrix();

			normalMatrix = new CHAOS.Mat4();
			normalMatrix = normalMatrix.getInverse(modelMatrix);
			normalMatrix.transpose();

			viewMatrix = cam.matrix.getInverse(cam.matrix);

			modelMatrix = modelMatrix.multiplySelf(viewMatrix);

			if(check_uni(shaderProgram, "uPMatrix")) {
				gl.uniformMatrix4fv(shaderProgram.unif["uPMatrix"], false, projMatrix.elements);
				// console.log("uPMatrix sent");
			}

			if(check_uni(shaderProgram, "uMVMatrix")) {
				gl.uniformMatrix4fv(shaderProgram.unif["uMVMatrix"], false, modelMatrix.elements);
				// console.log("uMVMatrix sent");
			}

			if(check_uni(shaderProgram, "uNMatrix")) {
				gl.uniformMatrix4fv(shaderProgram.unif["uNMatrix"], false, normalMatrix.elements);
				// console.log("uNMatrix sent");
			}

			for(var key in mate.customUnif) {
				if(check_uni(shaderProgram, key)) {
					// console.debug("OOO", shaderProgram.unif[key], mate.customUnif[key], mate.customUnif[key].utype);
					mate.sendUniform(shaderProgram.unif[key], mate.customUnif[key], mate.customUnif[key].utype);
				}
			}
			// custom uniforms ... TODO ...	

			// lights, shader header chunks ... TODO ...

			var tex_count = -1;

			for(var key in mate.maps) {

				if(mate.maps[key].isReady) {

					gl.activeTexture(gl.TEXTURE0 + ++tex_count);
					if(mate.maps[key].type == "2d") 		{	gl.bindTexture(gl.TEXTURE_2D, mate.maps[key]); 			}
					else if(mate.maps[key].type == "cube") 	{	gl.bindTexture(gl.TEXTURE_CUBE_MAP, mate.maps[key]);	}
			        gl.uniform1i(shaderProgram.unif[key], tex_count);     
			        // check TODO
			    }

			}



			// - - - - - - - - - - - - - - - - - - - - ATTRIBUTES - - - - - - - - - - - - - - - - - - - -

			gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexPosition"]);							// TODO check if exist at all
			gl.vertexAttribPointer(shaderProgram.attr["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);

	        if(check_att(shaderProgram, "aTextureCoord")) {
		        gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aTextureCoord"]);
				gl.vertexAttribPointer(shaderProgram.attr["aTextureCoord"], 2, gl.FLOAT, false, 0, 0);
				// console.info("aTextureCoord sent");
			}

			if(check_att(shaderProgram, "aVertexNormal")) {
				gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexNormal"]);
				gl.vertexAttribPointer(shaderProgram.attr["aVertexNormal"], 3, gl.FLOAT, false, 0, 0);
				// console.info("aVertexNormal sent");
			}

			if(check_att(shaderProgram, "aVertexColor")) {
				gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexColor"]);
				gl.vertexAttribPointer(shaderProgram.attr["aVertexColor"], 3, gl.FLOAT, false, 0, 0);
				// console.info("aVertexNormal sent");
			}


			for(var key in mate.customAttr) {
				if(check_att(shaderProgram, key)) {
					gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers[key]);
					gl.vertexAttribPointer(shaderProgram.attr[key], mate.customAttr[key].item_size, gl.FLOAT, false, 0, 0);
				}
			}


	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.buffers["indices"]);
	        gl.drawElements(gl.TRIANGLES, geom.indices.length, gl.UNSIGNED_SHORT, 0);

	        // console.log("--- drawn!");
	    }

        // - - - - - - - - - - - - - - - - - - - - CHILDREN - - - - - - - - - - - - - - - - - - - -

        var numCh = o.children.length;
        for(var i=0; i < numCh; i++) {
        	if ( override ) {
        		o.children[i].overrideMaterial = over_mat;
        	}
        	this.renderObject(o.children[i], cam);
        }



	},

	// 												                      EeeeeeeG                        
	// 												.  y                  ee     e5  aaaaa     .      .   
	// 											   eeeee eeG.ee# eee#eee  ee    ee  ee  ee  eeKDee  eeKGeG
	// 												eD   eezeeee ee   ee  eeeeeeey   XeeeeD ee      ee    
	// 												ee   e#      ee   ee  ee       Gey   eK     De5     ee
	// 												eE   Xee9eez Ee   ee  Ee        e#z9eee eeXyDe  ee5ue9
	//
	//											______________________________________________________________
	//											--------------------------------------------------------------


	renderPass: function(pass) {
		
		var gl = this.context;

		var mate = pass.material;
		var geom = this.QUAD;
		
		var shaderProgram;

		mate.use();
		shaderProgram = mate.shaderProgram;

		if(geom.needsUpdate) {
				
			geom.buffers["aVertexPosition"] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexPosition"]);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.vertices), gl.STATIC_DRAW);

			geom.buffers["indices"] = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.buffers["indices"]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geom.indices), gl.STATIC_DRAW);

			geom.buffers["aTextureCoord"] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aTextureCoord"]);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom.uvs), gl.STATIC_DRAW);

			// for(var key in mate.customAttr) {
			// 	geom.buffers[key] = gl.createBuffer();
			// 	gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers[key]);
			// 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mate.customAttr[key]), gl.STATIC_DRAW);
			// }

			geom.needsUpdate = false;

			// ... TODO ... check custom attr
		}
		
		// - - - - - - - - - - - - - - - - - - - - UNIFORMS - - - - - - - - - - - - - - - - - - - -

		/* custom uniforms */
		for(var key in mate.customUnif) {
			if(check_uni(shaderProgram, key)) {
				console.debug("OOO", shaderProgram.unif[key], mate.customUnif[key], mate.customUnif[key].utype);
				mate.sendUniform(shaderProgram.unif[key], mate.customUnif[key], mate.customUnif[key].utype);
			}
		}

		/* textures */
		var tex_count = -1;
		for(var key in pass.fbs) {

			gl.activeTexture(gl.TEXTURE0 + ++tex_count);
			gl.bindTexture(gl.TEXTURE_2D, pass.textures[key]);
	        gl.uniform1i(shaderProgram.unif[key], tex_count); 
		}



		// - - - - - - - - - - - - - - - - - - - - ATTRIBUTES - - - - - - - - - - - - - - - - - - - -

		gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aVertexPosition"]);
		gl.vertexAttribPointer(shaderProgram.attr["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers["aTextureCoord"]);
		gl.vertexAttribPointer(shaderProgram.attr["aTextureCoord"], 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geom.buffers["indices"]);
        gl.drawElements(gl.TRIANGLES, geom.indices.length, gl.UNSIGNED_SHORT, 0);
        // console.log("--- "+"drawn QUAD PP!");
	    
	},

	r2t: function(scene, camera, pass) {

		var gl = this.context;

		if(pass === null || pass === undefined) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, camera.fbs[camera.activeBuffer]);
        	this.render(scene);
        	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		else {

			gl.bindFramebuffer(gl.FRAMEBUFFER, pass.fbs[pass.activeBuffer]);
	        this.render(scene, camera);
	        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	},

	doubleSided: function(yes) {
		var gl = this.context;
		if(yes) {
			gl.disable(gl.CULL_FACE);
		}
		else {
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
		}
	},

	getGL: function() {
		return this.context;
	},

	clear: function() {
		this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
	},

	getWidth: function() {
		return this.context.viewportWidth;
	},

	getHeight: function() {
		return this.context.viewportHeight;
	},

	getAspectRatio: function() {
		return this.getWidth() / this.getHeight();
	},

	create_QUAD: function() {
		this.QUAD 		= new CHAOS.Geometry().Plane(2, 2, 1, 1);		// -1..1, that's why 2
		// TODO buffer geometry here
	}
};

CHAOS.R = CHAOS.Renderer;

// 											eeeeeeee      eeee      eeeeeeeK   9eeeeeee 
// 											ee     ee     eeee.    ee     eeK ee#    Eee
// 											ee     ee    ee  ee    eee        Keeu      
// 											eeeeeeeee   Gee  Xee    Weeeeeee    eeeeeee 
// 											ee 55WK     ee  . ee          eee         ee
// 											ee         eeeeeeeeee eee      ee eeu     ee
// 											ee        9ee      eeX .eeeeeeee   Geeeeeee 

CHAOS.Pass = function(name_url) {

	this.maps = [];
	this.uniforms = [];
	this.attributes = [];

	this.rbs = [];
	this.textures = [];
	this.fbs = [];

	this.activeBuffer = null;

	if(name_url === undefined || name_url === null) {
		this.material = null;
	}
	else {
		this.material = new CHAOS.Material().fromFile(name_url+".vs", name_url+".fs");
		
	}

	CHAOS.numPasses++;
	if(CHAOS.numPasses == 1) {	// it's very first pass created, so create quad and orthographic camera
		CHAOS.__R.create_QUAD();
	}

	return this;
};

CHAOS.Pass.prototype = {
	fromScript: function(vs_id, fs_id) {
		this.material = new CHAOS.Material().fromScript(vs_id, fs_id);
		return this;
	},

	fromFile: function(vs_file, fs_file) {
		this.material = new CHAOS.Material().fromFile(vs_file, fs_file);
		return this;
	},

	fromString: function(vs, fs) {
		this.material = new CHAOS.Material().fromString(vs_file, fs_file);
		return this;
	},
	addRenderTarget: function(name, w, h, bit) {
		var width = w;
		var height = h;	// TODO


		var gl = CHAOS.__R.context;

		var bit_type = bit==16 ? gl.FLOAT : gl.UNSIGNED_BYTE;

		this.fbs[name] = gl.createFramebuffer();  // frame buffer object
		this.fbs[name].width = width;
		this.fbs[name].height = height;		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbs[name]);

		this.textures[name] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.textures[name]);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null); // empty texture gl.FLOAT | gl.UNSIGNED_BYTE

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // ... TODO ...
        //_MIPMAP_NEAREST
        // gl.generateMipmap(gl.TEXTURE_2D);

        this.rbs[name] = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbs[name]);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[name], 0);	// bind framebuffer to texture
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.rbs[name]);	// bind framebuffer to renderbuffer

		// unbind everything
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // allocate uniform
        this.material.locUnif(name);

	},

	selectTexture: function(name) {
		this.activeBuffer = name;
		return this;
	},

	addAttribute: function(name, arr, item_size) {
		// this.material.addAttrib();
		// TODO, check if needed
	},

	addUniform: function(arr, name, type) {
		this.material.addUniform(arr, name, type);
		// TODO finish in material class
	},

	addTexture: function(name, texture) {
		if(texture.type == "2d") {	this.material.addTexture(name, texture); }
		else { alert("Cannot send cube textures to Pass."); }
	}
};


// 								eee     #eeu     eeeD    eeeeeeeeeee eeeeeeeeee  eeeeeeeeK   ee      eee      ee      
// 								eeeK    eee     eeeee        5e      ee          ee     eeW  ee     eezee     ee      
// 								eeee   eeee     ee .ee       eeX     eeu         ee     ee   ee    .ee ee.    ee      
// 								ee5eW  eE9e    ee   ee5      eeX     eeeeeeeee   eeeeeeeeG   ee    ee   ee    ee      
// 								ee ee ee 9e   .ee u yee      eeX     ee          ee     ee   ee   eee K eee   ee      
// 								ee eeeee ee   eeeeeeeeee     eeX     ee          ee     ee   ee  yeeeeeeeeey  ee      
// 								ee  eee  eeu eeu      eey    EeX     eeeeeeeeee  ee     eeG  ee  ee       ee  eeeeeeee


CHAOS.Material = function() {
	this.vertexShader = null;
	this.fragmentShader = null;
	this.shaderProgram = null;
	this.gl = CHAOS.__R.context;

	this.customAttr = [];
	this.customUnif = [];
	this.maps = [];

	return this;

	// get vertex
	// get fragment
	// attach
	// easy access, add, modify uniforms
};

CHAOS.Material.prototype = {
	fromScript: function(vs_id, fs_id) {

		function getShader(id) {

			var shaderScript = document.getElementById(id);

	        if (!shaderScript) {
	            return null;
	        }

	        var str = "";
	        var k = shaderScript.firstChild;
	        while (k) {
	            if (k.nodeType == 3) {
	                str += k.textContent;
	            }
	            k = k.nextSibling;
	        }

	        return str;
		}

		var vs_text = getShader(vs_id);
		var fs_text = getShader(fs_id);

		return this.fromString(vs_text, fs_text);
	},

	fromFile: function(vs_file, fs_file) {

		function read_file(file) {
			var xmlhttp;

			if (window.XMLHttpRequest) 	{ xmlhttp=new XMLHttpRequest(); }
			else 						{ xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }

			xmlhttp.open("GET", file, false);		// sync, will wait
			xmlhttp.send();
			return xmlhttp.responseText;
		}


		var vs_str = read_file(vs_file);
		var fs_str = read_file(fs_file);

		return this.fromString(vs_str, fs_str);
	},

	fromString: function(str_vs, str_fs) {

		var gl = this.gl;

		function compile(text_shader, sh_type, gl) {
			var shader;
	        if (sh_type == "vertex") {
	            shader = gl.createShader(gl.VERTEX_SHADER);
	        } else if (sh_type == "fragment") {
	            shader = gl.createShader(gl.FRAGMENT_SHADER);
	        } else {
	            return null;
	        }

	        gl.shaderSource(shader, text_shader);
	        gl.compileShader(shader);

	        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	            alert(gl.getShaderInfoLog(shader));
	            return null;
	        }
	        return shader;
		}

	 	this.vertexShader = compile(str_vs, "vertex", gl);
	 	this.fragmentShader = compile(str_fs, "fragment", gl);

	 	//link program

	 	this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, this.vertexShader);
        gl.attachShader(this.shaderProgram, this.fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        this.shaderProgram.attr = [];
        this.shaderProgram.unif = [];

        // ensure default attributes
        this.locAttr("aVertexPosition");
        this.locAttr("aTextureCoord");
        this.locAttr("aVertexNormal");
        this.locAttr("aVertexColor");		// TODO chech if -1

        // ensure default uniforms
        this.locUnif("uPMatrix");
        this.locUnif("uMVMatrix");
        this.locUnif("uNMatrix");

        return this;
	},

	locAttr: function(name) {
		this.shaderProgram.attr[name] = this.gl.getAttribLocation(this.shaderProgram, name);
		// console.debug(name, this.shaderProgram.attr[name]);
		if(this.shaderProgram.attr[name]>-1) {
	        this.gl.enableVertexAttribArray(this.shaderProgram.attr[name]);
	    }
	},

	locUnif: function(name) {
		this.shaderProgram.unif[name] = this.gl.getUniformLocation(this.shaderProgram, name);
	},

	use: function() {
		this.gl.useProgram(this.shaderProgram);
	},

	addAttrib: function(name, arr, item_size) {
	
		this.customAttr[name] = arr;
		this.customAttr[name].item_size = item_size;
		this.locAttr(name);
		this.needsUpdate = true;

	},

	addUniform: function(arr, name, utype) {
		this.locUnif(name);
		if(utype != "1f" && utype != "1i") {
			this.customUnif[name] = arr;
			this.customUnif[name].utype = utype;
		}
		else {
			this.customUnif[name] = [arr];
			this.customUnif[name].utype = utype;
		}
	},

	updateUniform: function(name, arr) {
		var utype = this.customUnif[name].utype;
		if(utype != "1f" && utype != "1i") {
			this.customUnif[name] = arr;
		}
		else {
			this.customUnif[name][0] = arr;
		}
	},

	addTexture: function(name, texture) {	
		this.maps[name] = texture;
		this.locUnif(name);
	},

	sendUniform: function(location, value, type) {
		// type - 	1i, 2i, 3i, 4i,
		//			1f, 2f, 3f, 4f,
		//			2m, 3m, 4m
		var gl = this.gl;
		switch (type) {
			case "1i": gl.uniform1i(location, value[0]); break;
			case "2i": gl.uniform2i(location, value[0], value[1]); break;
			case "3i": gl.uniform3i(location, value[0], value[1], value[2]); break;
			case "4i": gl.uniform4i(location, value[0], value[1], value[2], value[3]); break;

			case "1f": gl.uniform1f(location, value[0]); break;
			case "2f": gl.uniform2f(location, value[0], value[1]); break;
			case "3f": gl.uniform3f(location, value[0], value[1], value[2]); break;
			case "4f": gl.uniform4f(location, value[0], value[1], value[2], value[3]); break;

			case "2m": gl.uniformMatrix2fv(location, false, value); break;
			case "3m": gl.uniformMatrix3fv(location, false, value); break;
			case "4m": gl.uniformMatrix4fv(location, false, value); break;
		}
	}

	
};

// 											  Eeeeeee.     eeeeeee    uee         ueeeeeeE    Eeeeeeeee 
// 											 ee     Dee. eee     eee   ee        eeX     ee#  ee      ez
// 											Ge       u9  ee       ee   ee       ee        ee  ee     zeK
// 											ee          eeK       Ee#  ee       ee        ee  eeeeeeeee 
// 											ee        5 KeE       ee   ee       ee        ee  ee     Ge.
// 											 ee     Keeu eee     eee   ee        eeu     eeE  ee      e5
// 											  eeeeeeeW     eeeeeee    ueeeeeeee   yeeeeeee    Eeu     eE



CHAOS.Color = function(hex) {
	var hex = hex || 0x000000;
	if (hex <= 0xFFFFFF) {
		
		this.r = ((hex >> 16) & 255) / 255;
		this.g = ((hex >> 8) & 255) / 255;
		this.b = (hex & 255) / 255;
		this.a = 1.0;
	}
	else {
		this.r = ((hex >> 24) & 255) / 255;
		this.g = ((hex >> 16) & 255) / 255;
		this.b = ((hex >> 8) & 255) / 255;
		this.a = (hex & 255) / 255;
	}
    return this;
};

CHAOS.Color.prototype = {
	fromRGB: function(r,g,b) {
		if (r>1 || g>1 || b>1) {
			r /= 255;
			g /= 255;
			b /= 255;
		}
		this.r = r;
		this.g = g;
		this.b = b;

		return this;
	},

	fromRGBA: function(r,g,b,a) {
		if (r>1 || g>1 || b>1 || a>1) {
			r /= 255;
			g /= 255;
			b /= 255;
			a /= 255;
		}
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	
		return this;
	},

	fromHEX: function(hex) {
		return new CHAOS.Color(hex);
	},

	random: function() {
		return new CHAOS.Color(0xFFFFFF*Math.random());
	},

	toString: function() {
		return "( "+this.r.toFixed(2)+", "+this.g.toFixed(2)+", "+this.b.toFixed(2)+", "+this.a.toFixed(2)+" )";
	}
};


// 																	ee      ee uee       ee
// 																	ee      ee  eee     ee 
// 																	ee      ee   eeu   #ee 
// 																	ee      ee    ee   ee  
// 																	ee      ee    9ee eeu  
// 																	ee     #ee     ee5ee   
// 																	 GeeeeeeX      .eee    

CHAOS.Vertex = CHAOS.Vec3;

CHAOS.UV = function(u,v) {
	this.u = u || 0.0;
	this.v = v || 0.0;
};

CHAOS.UV.prototype = {
	set: function(u,v) {
		this.u = u;
		this.v = v;
		return this;
	},

	toString: function() {
		return "uv:[ "+this.u+", "+this.v+" ]";
	}
};

// 														eeeeeeeeez    eeeK       eeeeeee    eeeeeeeeeW  zeeeeu 
// 														ee           eeEee     eee     eee  ee         ee   XeW
// 														ee ...uW     ee #ee    ee       DE  ee ....5      y Ee 
// 														eeeeeeee    ee   ee   #eE           eeeeeeeeW     eeee 
// 														ee         eee u zee  .ee       WX  ee               ee
// 														ee         eeGeeeeeee  eee     eee  ee        eee    ee
// 														ee        ee       ee    eeeeeee    eeeeeeeee  ueeeeee 


CHAOS.Face3 = function(v1,v2,v3) {
	this.v1 = v1 || new CHAOS.Vertex();
	this.v2 = v2 || new CHAOS.Vertex();
	this.v3 = v3 || new CHAOS.Vertex();
	this.normal = this.computeNormal();
};

CHAOS.Face3.prototype = {

	// tessalatte TODO

	set: function(v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z) {
		this.v1 = new CHAOS.Vertex().set(v1x, v1y, v1z);
		this.v2 = new CHAOS.Vertex().set(v2x, v2y, v2z);
		this.v3 = new CHAOS.Vertex().set(v3x, v3y, v3z);
		this.normal = this.computeNormal();
		return this;
	},

	computeNormal: function() {
		var ba = this.v2.sub(this.v2, this.v1);
		var bc = this.v2.sub(this.v2, this.v3);
		return bc.cross(ba).normalize();
	}
};






// 							  zeeeeeeX    eeeeeeeeee    eeeeeee     eee      eeE  Eeeeeeeeee eeeeeeeeeee Eeeeeeeee  Kee      Kee
// 							 ee     ueeX  ee          eee     eee   eee9    eeee  ee             5e      ee      ee   eee   eee 
// 							Ge            eeu ...uW   ee       XeG  eeee   #eeee  eeX .....      eeX     ee     Kee    Xee ee   
// 							ee    eeeeeu  eeeeeeeee  #eE        ee  ee ee  ee ee  eeeeeeeee      eeX     eeeeeeeee       eee    
// 							ee    Xy ee9  ee          ee       Wee  ee ee DeX ee  ee             eeX     ee     Dee      #eu    
// 							 ee      eeX  ee          eee     Gee   ee Xeeee .ee  ee             eeX     eeX     ee      eeX    
// 							  Eeeeeee9eX  eeeeeeeeee    eeeeeee     ee  eeeK 5eE  Eeeeeeeeee     EeX     EeX     ee      EeX    


CHAOS.Geometry = function() {
	this.name = "geometry_";
	this.vertices = [];		// array of vertex
	this.indices = [];		// array of int
	this.normals = [];		// array of vec3
	this.colors = [];		// array of color
	this.uvs = [];			// array of uv

	this.needsUpdate = true;
	this.buffers = [];

	// draw as flat

	// ... TODO ...
	// vertices 	as CHAOS.Vertex
	// normals 		as CHAOS.Vec3
	// colors 		as CHAOS.Color
	// uvs 			as CHAOS.UV

	// updating??!!	----------------------------------------------------------
};

CHAOS.Geometry.prototype = {
	// seperate faces TODO
	// scale --
	// rotate -- MESH?

	computeNormals: function() {		// TODO computeNormals, tessellate
		var i = this.indices;
		var v = this.vertices;
		
		var n = i.length/3;

		var f = new CHAOS.Face3();
		var nor = new CHAOS.Vec3();
		this.normals = [];

		while(n--) {

			nor = f.set(v[3*i[3*n]], v[3*i[3*n]+1], v[3*i[3*n]+2],
						v[3*i[3*n+1]], v[3*i[3*n+1]+1], v[3*i[3*n+1]+2],
						v[3*i[3*n+2]], v[3*i[3*n+2]+1], v[3*i[3*n+2]+2]).normal;

			this.normals.push(nor.x);
			this.normals.push(nor.y);
			this.normals.push(nor.z);

			this.normals.push(nor.x);
			this.normals.push(nor.y);
			this.normals.push(nor.z);

			this.normals.push(nor.x);
			this.normals.push(nor.y);
			this.normals.push(nor.z);
		}
	},

	Sphere: function(r,eq,sl) {

		var latitudeBands = eq || 25;
        var longitudeBands = sl || 25;
        var radius = r || 10;

        var vertexPositionData = this.vertices;
        var normalData = this.normals;
        var textureCoordData = this.uvs;
        var indexData = this.indices;

        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                textureCoordData.push(u);
                textureCoordData.push(v);
                vertexPositionData.push(radius * x);
                vertexPositionData.push(radius * y);
                vertexPositionData.push(radius * z);
            }
        }

        
        for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                indexData.push(first);
                indexData.push(second);
                indexData.push(first + 1);

                indexData.push(second);
                indexData.push(second + 1);
                indexData.push(first + 1);
            }
        }

        this.name = "geometry_sphere";
        return this;

		// ... TODO ...
	}, 

	Cuboid: function(w, h, d) {

		var w = w/2 || 5;
		var h = h/2 || 5;
		var d = d/2 || 5;

		this.vertices = [
			// Front face
            -w, -h,  d,
             w, -h,  d,
             w,  h,  d,
            -w,  h,  d,

            // Back face
            -w, -h, -d,
            -w,  h, -d,
             w,  h, -d,
             w, -h, -d,

            // Top face
            -w,  h, -d,
            -w,  h,  d,
             w,  h,  d,
             w,  h, -d,

            // Bottom face
            -w, -h, -d,
             w, -h, -d,
             w, -h,  d,
            -w, -h,  d,

            // Right face
             w, -h, -d,
             w,  h, -d,
             w,  h,  d,
             w, -h,  d,

            // Left face
            -w, -h, -d,
            -w, -h,  d,
            -w,  h,  d,
            -w,  h, -d];

		this.indices = [	
			0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23
							];
		this.uvs = [	 
			// Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0];

		this.normals = [
			// Front face
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,
             0.0,  0.0,  1.0,

            // Back face
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,
             0.0,  0.0, -1.0,

            // Top face
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,

            // Bottom face
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Right face
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,
             1.0,  0.0,  0.0,

            // Left face
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0,
            -1.0,  0.0,  0.0
		];

		this.colors = [];		// ... TODO ... remove colors in geometry (or not)
		var k=24;
		while(k--) {
			this.colors.push(Math.random());
			this.colors.push(Math.random());
			this.colors.push(Math.random());
		}
		this.name = "geometry_cube";

		return this;	
	}, 

	Plane: function(width, height, segments_width,segments_height) {
		var w = width || 100,
			h = height || 100,
			sw = segments_width || 1,
			sh = segments_height || 1;

		this.vertices = [];	
		this.uvs = [];
		this.normals = [];
		this.colors = [];

		for(var i=0; i<sw+1; i++) {
			for (var j = 0; j < sh+1; j++) {

				// world coord
				this.vertices.push(i*w/sw-w/2);
				this.vertices.push(j*h/sh-h/2);	
				this.vertices.push(0);

				// normals
				this.normals.push(0.0);
				this.normals.push(0.0);
				this.normals.push(1.0);

				// uv
				this.uvs.push(i/sw);
				this.uvs.push(j/sh);

				//colors					... TODO ... remove colors in geometry (or not)
				this.colors.push(0);
				this.colors.push(Math.random());
				this.colors.push(0);
			}
		}

		this.indices = [];	

		for(var i=0; i<sw; i++) {
			for(var j=0; j<sh; j++) {
						
				this.indices.push( (j+1)*(sw+1)+i );
				this.indices.push( j*(sw+1)+i+1 );
				this.indices.push( j*(sw+1)+i );	

				this.indices.push( j*(sw+1)+i+1 );	
				this.indices.push( (j+1)*(sw+1)+i );
				this.indices.push( (j+1)*(sw+1)+i+1 );
			}
		}
		this.name = "geometry_plane";
		return this;
	}, 

	Cylinder: function(top_radius, bottom_radius, height, segments) {
		// ...TODO
	},

	getInfo: function() {
		var s = "<br>Geometry: " + this.name + "<br>";
		s 	+= "-- vertices: " + this.vertices.length/3 + "<br>"
			+ "-- triangles: " + this.indices.length/3 + "<br>"
			+ "-- UVs: " + this.uvs.length/2 + "<br>"
			+ "-- normals: " + this.normals.length + "<br>"
			+ "-- colors: " + this.colors.length + "<br>";
		return s;
	},

	toString: function() {
		return this.printVertices();
	},
	printVertex: function(v) {
		return "("+v.x+", "+v.y+", "+v.z+")";
	},
	printNormals: function() {
		var s = "normals: <br>";
		for(var i=0; i<this.normals.length/3; i++) { 
			s+= "( "+this.normals[3*i] +", "+ this.normals[3*i+1] +", "+ this.normals[3*i+2] + " )<br>";
		}
		return s;
	},
	printVertices: function() {
		var s= "vertices:[";
		var v = this.vertices;
		var n = v.length, i=n;
		while(i--) {
			s+=this.printVertex(v[n-i-1])+", ";
		}
		s+="]<br>";
		return s;
	},
	printFaces: function() {
		var s= "faces:<br>";
		var i = this.indices;
		var v = this.vertices;

		for(var n=0; n<i.length/3; n++) {
			s+= "| " + v[ 3* i[3*n   ] ] + ", " + v[ 3* i[3*n   ] +1 ] + ", " + v[ 3* i[3*n   ] +2] + " |<br>" +
				"| " + v[ 3* i[3*n +1] ] + ", " + v[ 3* i[3*n +1] +1 ] + ", " + v[ 3* i[3*n +1] +2] + " |<br>" +
				"| " + v[ 3* i[3*n +2] ] + ", " + v[ 3* i[3*n +2] +1 ] + ", " + v[ 3* i[3*n +2] +2] + " |<br><br>";
		}
		return s;
	},
	printIndices: function() {
		var s = "indices:[";
		var i = this.indices;
		var n = i.length;
		while(n--) {
			s+=i[n]+", ";
		}
		s+="]<br>";
		return s;
	},
	printUV: function() {
		var s = "UVs:[";
		var l = this.uvs.length;
		for(var i=0; i<l/2; i++) {
			s += ("( " + this.uvs[2*i].toFixed(2) + ", " + this.uvs[2*i+1].toFixed(2) + " ), ");
		}

		s+= "]<br>";
		return s;
	}

};

// 							eeeeeeeeeeX eeeeeeeeez ee5    5ee eeeeeeeeeee ee      ee   eeeeeeee    eeeeeeeee
// 							    ee      ee          eee  eeE      ee      ee      ee   ee     ee   ee       
// 							    ee      ee ....y     5eeeeX       ee      ee      ee   ee     ee   ee ....5 
// 							    ee      eeeeeeee9     .ee         ee      ee      ee   eeeeeeeey   eeeeeeee.
// 							    ee      ee           9eeeeE       ee      ee      ee   ee     ee   ee       
// 							    ee      ee          ee#  eee      ee      ee9     ee   ee     ee   ee       
// 							    ee      eeeeeeeee55ee      eey    eeu      yeeeeee9    ee     eeD  eeeeeeeee


CHAOS.Texture = function() {	

	this.type = "empty";
	return this;
};

CHAOS.Texture.prototype = {
	load2D: function(url) {
		function handleTextureLoaded(image, texture, gl) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			texture.isReady = true;
		}

		var tex, im, gl = CHAOS.__R.context;

		tex = gl.createTexture();
		tex.isReady = false;
		tex.type = "2d";
		im = new Image();
		im.src = url;
		im.onload = function() { handleTextureLoaded(im, tex, gl); }	

		return tex;
	},

	loadCube: function(url_list, url_all) {

		var gl = CHAOS.__R.context;
		var texture = gl.createTexture();
		texture.isReady = false;
		var ready = 0;
		var url_all = url_all || "";

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	    var faces = [[url_all+url_list[0], gl.TEXTURE_CUBE_MAP_POSITIVE_X],
	                 [url_all+url_list[1], gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
	                 [url_all+url_list[2], gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
	                 [url_all+url_list[3], gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
	                 [url_all+url_list[4], gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
	                 [url_all+url_list[5], gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];

	    for (var i = 0; i < faces.length; i++) {
	        var face = faces[i][1];
	        var image = new Image();
	        image.onload = function(texture, face, image) {
	            return function() {
	                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	                ready++;
	                if(ready==6) {
	                	texture.isReady = true;
	                }
	            }
	        } (texture, face, image);
	        image.src = faces[i][0];

	        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	    }
	    texture.type = "cube";
	    return texture;
	}

	// TODO
	// fromVideo: function(videoElement) {
	// 	cubeTexture = gl.createTexture();
	// 	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	// }
};



// 					  zeeeeeee     eeeeeeee        eeX  eeeeeeeeeeW   yeeeeeee  zeeeeeeeeeee        eeeee    eeeeeeeeE  
// 					 eeu     eee   ee     ee       eeX  ee          ueeW     eee     ee           eee   ee.  ee      eeK
// 					Ee        ee   ee .. uee       eeX  eeX ....X   ee        Xe     ee               . ee   eeX      ee
// 					ee        ee#  eeeeeeee        eeX  eeeeeeeee   ee               ee              eeeee   eeX      ee
// 					Ee        ee.  ee     #eX ee   eeX  ee          ee        Kz     ee                  ee  eeX      ee
// 					 ee      eee   ee     Eee ee   ee9  ee          yee      eee     ee          Xee     ee  ee      eey
// 					  Eeeeeeee     eeeeeeee9   eeeeeX   eeeeeeeeeeW   Deeeeeee       ee            eeeeee#   eeeeeeeee  


CHAOS.Object3D = function(params) {
	var params = params || {};
	CHAOS.numObjects++;
	this.name = params.name !== undefined ? params.name : "object"+CHAOS.numObjects;

	this.parent = undefined;
	this.children = params.children !== undefined ? params.children : [];
	this.numObjects = 0;

	this.matrix = new CHAOS.Mat4().one();
	this.worldMatrix = new CHAOS.Mat4().one();

	this.position = params.position !== undefined ? params.position : new CHAOS.Vec3(0, 0, 0);
	this.rotation = params.rotation !== undefined ? params.rotation : new CHAOS.Vec3(0, 0, 0);
	this.scale = params.scale !== undefined ? params.scale : new CHAOS.Vec3(1, 1, 1);

	this.up = params.up !== undefined ? params.up : new CHAOS.Vec3(0, 1, 0);
	this.target = params.target !== undefined ? params.target : new CHAOS.Vec3(0, 0, 1);

	this.parentMaterial = null;
	this.overrideMaterial = null;

	return this;
};

CHAOS.Object3D.prototype = {

	addObject: function(obj) {
		obj.parent = this;
		this.children.push(obj);
		this.numObjects++;
	},

	add: function(obj) {	

		// array or single object to be added, manage parent/child relation ... TODO ...
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
		
			
	},

	lookAt: function(target) {
		this.target = target;
	},

	updateMatrix: function() {
		// position
		// lookat
		// rotation
		// scale (not for now)
		this.matrix = new CHAOS.Mat4().one();
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

	setParent: function(p) {
		this.parent;
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
	},

	toString: function() {
		// light, camera, mesh, particle, line

		var s = "O3D > unknown";
		if(this instanceof CHAOS.Mesh) {
			s="O3D > Mesh";
		}
		else if (this instanceof CHAOS.Camera) {
			s="O3D > Camera";
		}
		else if(this instanceof CHAOS.Scene) {
			s = "O3D > Scene";
		}
		return s;
	}	// TODO lookAt
};

// 											 9eeeeeee     zeeeeeey   eeeeeeeeee uee9     ee   eeeeeeeee
// 											5ey    Eee   eeu    ueeX ee          eeee    ee   ee       
// 											 eeu        ee        #u ee  ...W    eE ee   ee   ee ....5 
// 											  eeeeeeeK  ee           eeeeeeeee   ee  ee  ee   eeeeeeee.
// 											        ee  ee        5  ee          ee   ee ee   ee       
// 											ee      eey  ee      ee# ee          ee    eeee   ee       
// 											 eeeeeeeeu    EeeeeeeD   eeeeeeeeee uee     eee   eeeeeeeee


CHAOS.Scene = function() {
	CHAOS.Object3D.call(this);
	CHAOS.numScenes++;
	this.lights = [];
	this.numLights = 0;
	this.name = "scene"+CHAOS.numScenes;
	return this;
};

CHAOS.Scene.prototype = Object.create( CHAOS.Object3D.prototype );

CHAOS.Scene.prototype.addObject = function(obj) {

	if(obj instanceof CHAOS.Light) {
		obj.parent = this;
		this.lights.push(obj);
		this.numLights++;

	}
	else {
		obj.parent = this;
		this.children.push(obj);
		this.numObjects++;
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

CHAOS.S = CHAOS.Scene;

// 													eee     #eeu  eeeeeeeeee  9eeeeeee   eeu     ee
// 													eeeK    eee   ee         ee     eee  ee      ee
// 													eeee   eeee   ee  ....   eee.        eeu ... ee
// 													ee eW  eG9e   eeeeeeeee    eeeeeee   eeeeeeeeee
// 													ee ee ee 9e   ee                uee  ee      ee
// 													ee eeeee ee   ee        Kee      ee  ee      ee
// 													ee  eee  eeu  eeeeeeeee9  eeeeeeee   eeu     ee


CHAOS.Mesh = function(g, m, mi) {	//geoemtry, material [, material_indices if has multiple materials]
	CHAOS.Object3D.call(this);

	var mi = mi || null;

	this.geometry = g;
	this.materials = [];
	this.materialIndices = [];
	this.multiMat = false;

	if(m instanceof CHAOS.Material) {	// 1 material, ALL surfaces
		
		this.materials.push(m);

	}

	else {

		this.materials = m;				// MULTI materials
		if(mi==null) {					// surfaces specified, else divide ... TODO ... mutlimaterial
			this.materialIndices = mi;
			var f = g.indices.length/3;
			var numMaterials = m.length;
			f = (f-(f%m))/m;
			for (var i = 0; i < m; i++) {
				this.materialIndices.push(i*f);
			}
		}
		this.multiMat = true;

	}

	return this;
};
CHAOS.Mesh.prototype = Object.create( CHAOS.Object3D.prototype );

// TODO
// CHAOS.Lines
// CHAOS.Particle

// 										  Eeeeeeeu      eeeu     eee     WeeX  eeeeeeeeee  eeeeeeee       eee    
// 										 ee     DeeW   eeEee     eee#    eeeX  ee          ee     ee     ee#ee   
// 										Ge       u9    ee eez    eeee   9eeeX  ee          ee     ee    uee eeX  
// 										ee            ee   ee    ee ee  ee eX  eeeeeeeee   eeeeeeee     ee   ee  
// 										ee        5  Xee u zee   ee 'e ee  eX  ee          ee     ee   eee K eee 
// 										 ee     Kee  eeGeeeeeeG  ee  eeee  eX  ee          ee     ee  .eeeeeeeee 
// 										  eeeeeeey  ee       ee  ee  .ee. .eX  eeeeeeeeee  ee     eeX ee       ee


CHAOS.Camera = function() {

	CHAOS.Object3D.call(this,{});

	this.projectionMatrix = new CHAOS.Mat4();

	CHAOS.numCameras++;
	this.name = "camera"+CHAOS.numCameras;
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

CHAOS.Light = function() {
	CHAOS.Object3D.call(this,{});

	this.name = "light";
	return this;
}
