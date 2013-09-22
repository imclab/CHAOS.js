 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

// CHAOS.Material
// CHAOS.Effect

CHAOS.Material = function() {
	this.isReady = false;
	this.isPrepared = false;

	this.vertexShader = null;
	this.fragmentShader = null;
	this.shaderProgram = null;
	this.gl = null;

	this.attributes = {};
	this.uniforms = {};

	return this;
};

CHAOS.Material.prototype = {

	copy: function() {
		var m = new CHAOS.Material();

		m.isReady = this.isReady;
		m.isPrepared = false;

		m.vertexShader = this.vertexShader;
		m.fragmentShader = this.fragmentShader;
		m.shaderProgram = this.shaderProgram;
		m.gl = this.gl;

		m.attributes = {};
		m.uniforms = this.uniforms;

		return m;
	},

// _______
// LOADING
	fromScript: function(vs_id, fs_id) {

		this.isReady = false;
		this.isPrepared = false;

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

		this.vertexShader = getShader(vs_id);
		this.fragmentShader = getShader(fs_id);
		this.isReady = true;

		return this;
	},

	fromFile: function(params) {

		this.isReady = false;
		this.isPrepared = false;

		var vs_file = (params.folder ? params.folder : "") + params.vs,
			fs_file = (params.folder ? params.folder : "") + params.fs;

		var count = 0;

		function read_file(file, nesto) {
			var xmlhttp;

			if (window.XMLHttpRequest) 	{ xmlhttp=new XMLHttpRequest(); }
			else 						{ xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }

			xmlhttp.open("GET", file, false);		// sync, will wait
			xmlhttp.send();
			count++;
			if(count==2) { nesto.isReady = true; }
			return xmlhttp.responseText;
		}



		this.vertexShader = read_file(vs_file, this);
		this.fragmentShader = read_file(fs_file, this);

		return this;
	},

	fromString: function(str_vs, str_fs) {

		this.vertexShader = str_vs;
		this.fragmentShader = str_fs;

		this.isReady = true;
		this.isPrepared = false;

		return this;
	},

// _____________
// USE & PREPARE
	use: function(gl) {
		gl.useProgram(this.shaderProgram);
	},

	prepare: function(gl) {

		this.gl = gl;
		this.isPrepared = false;

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

	 	var vertexShader = compile(this.vertexShader, "vertex", gl);
	 	var fragmentShader = compile(this.fragmentShader, "fragment", gl);

	 	//link program

	 	this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
        this.isPrepared = true;

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            CHAOS.log("Could not initialise shaders");
            this.isPrepared = false;
        }       

        return this;
	},

	unpackAttributes: function(gl) {	

		for(var key in this.attributes) {
			if(this.attributes[key].needsUpdate) {
				if(key != "indices") {
					var itemSize = 0,
						type = this.attributes[key].type;

					if(type=="int"||type=="float") { itemSize = 1; }
					else if (type=="vec2"||type=="chaos.vec2"||type=="chaos.uv") { itemSize = 2; }
					else if (type=="vec3"||type=="chaos.vec3"||type=="chaos.color") { itemSize = 3; }

					this.attributes[key].itemSize = itemSize;
					this.attributes[key].unpackedData = this.unpackA(this.attributes[key].value, type);
					this.attributes[key].shaderLocation = this.locAttr(key);
				}

				else {
					var indices_arr = [];
					for(var i=0; i<this.attributes["indices"].length; i++) {
						indices_arr.push(this.attributes["indices"][i][0]);
						indices_arr.push(this.attributes["indices"][i][1]);
						indices_arr.push(this.attributes["indices"][i][2]);
					}
					this.attributes["indices"].unpackedData = indices_arr;
				}
				this.attributes[key].needsUpdate = false;
				this.bufferAttribute(key, gl);
			}
		}

		return this;
	},

	unpackAttribute: function(att, name, gl) {
		var itemSize = 0,
			type = att.type;

		if(type=="int"||type=="float") { itemSize = 1; }
		else if (type=="vec2"||type=="chaos.vec2"||type=="chaos.uv") { itemSize = 2; }
		else if (type=="vec3"||type=="chaos.vec3"||type=="chaos.color") { itemSize = 3; }

		att.itemSize = itemSize;
		att.unpackedData = this.unpackA(att.value, type);
		att.shaderLocation = this.locAttr(name, gl);
		att.needsUpdate = false;

		this.bufferAttribute(att, name, gl);
	},

	unpackIndices: function(ind, gl) {
		var indices_arr = [];
		for(var i=0; i<ind.length; i++) {
			indices_arr.push(ind[i][0]);
			indices_arr.push(ind[i][1]);
			indices_arr.push(ind[i][2]);
		}
		ind.unpackedData = indices_arr;
		ind.needsUpdate = false;

		this.bufferAttribute(ind, "indices", gl);
	},

	unpackA: function(data, type) {
		var unpacked = [];

		switch(type) {
			case "int": case "float": case "vec2": case "vec3": 	return data; break;
			case "chaos.vec2": case "chaos.vec3":
				var n = data.length;
				for(var i=0;i<n;i++) {
					unpacked.push(data[i].x);
					unpacked.push(data[i].y);
					if(type=="chaos.vec3") {
						unpacked.push(data[i].z);
					}
				}
				return unpacked;
				break;
			case "chaos.uv":
				var n = data.length;
				for(var i=0;i<n;i++) {
					unpacked.push(data[i].u);
					unpacked.push(data[i].v);
				}
				return unpacked;
				break;
			case "chaos.color":
				var n = data.length;
				for(var i=0;i<n;i++) {
					unpacked.push(data[i].r);
					unpacked.push(data[i].g);
					unpacked.push(data[i].b);
				}
				return unpacked;
				break;
		}
	},

	locAttr: function(name, gl) {
		var a = gl.getAttribLocation(this.shaderProgram, name);
		if(a>-1) { gl.enableVertexAttribArray(a); }
	    return a;
	},

	bufferAttribute: function(att, name, gl) {	
		if(name != "indices") {
			var buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(att.unpackedData), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			att.unpackedData = buffer;
		}
		else {
			var buffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
			att.itemSize = att.unpackedData.length;
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(att.unpackedData), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			att.unpackedData = buffer;

		}
	},

	bindAttribute: function(att, gl) {
		if(att.shaderLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, att.unpackedData);
			gl.vertexAttribPointer(att.shaderLocation, att.itemSize, gl.FLOAT, false, 0, 0);
		}
	},

	unpackUniforms: function(gl) {
		for(var key in this.uniforms) {
			this.unpackUniform(key, gl);
		}

		return this;
	},

	unpackUniform: function(key, gl) {
		this.uniforms[key].unpackedData = this.unpackU(this.uniforms[key].value, this.uniforms[key].type);
		this.uniforms[key].shaderLocation = this.locUnif(key);
		this.uniforms[key].needsUpdate = false;

		if(this.uniforms[key].value instanceof CHAOS.Texture && this.uniforms[key].value.isReady) {
			if(this.uniforms[key].value.type == "2d") this.uniforms[key].value.prepare2D(gl);
			else this.uniforms[key].value.prepareCube(gl);
		}
	},

	unpackU: function(data, type) {
		var unpacked;

		switch(type) {
			case "int": case "float": case "vec2": case "vec3": 	return data; 													break;
			case "chaos.vec3": 										unpacked[2] = data.z;
			case "chaos.vec2": 										unpacked[0] = data.x; unpacked[1] = data.y; return unpacked; 	break;
			case "chaos.uv": 										unpacked = [data.u, data.v]; 									break;
			case "chaos.color": 									return [data.r, data.g, data.b]; 								break;
			case "chaos.mat4": 										return data.elements; 											break;
		}
	},

	locUnif: function(name, gl) {
		return this.gl.getUniformLocation(this.shaderProgram, name);
	},

	sendUniform: function(name, gl) {
		

		var uniform = this.uniforms[name];
		// if(uniform.type == "chaos.texture") {
		// 	CHAOS.log("U: ", uniform);
		// }

		switch(uniform.type) {
			case "float": 										gl.uniform1f(uniform.shaderLocation, uniform.unpackedData); break;
			case "int": 										gl.uniform1i(uniform.shaderLocation, uniform.unpackedData); break;
			case "vec2": case "chaos.uv": case "chaos.vec2": 	gl.uniform2f(uniform.shaderLocation, uniform.unpackedData[0], uniform.unpackedData[1]); break;
			case "vec3": case "chaos.vec3": case "chaos.color": gl.uniform3f(uniform.shaderLocation, uniform.unpackedData[0], uniform.unpackedData[1], uniform.unpackedData[2]); break;
			case "chaos.mat4": 									gl.uniformMatrix4fv(uniform.shaderLocation, false, uniform.unpackedData); break;
			case "chaos.texture":
				if(uniform.value.isPrepared) {

					gl.activeTexture(gl.TEXTURE0 + ++this.tex_count);
					if(uniform.value.type == "2d") 			{ gl.bindTexture(gl.TEXTURE_2D, uniform.value.texture); }
					else if(uniform.value.type == "cube") 	{ gl.bindTexture(gl.TEXTURE_CUBE_MAP, uniform.value.texture); }	
			        gl.uniform1i(uniform.shaderLocation, this.tex_count);
			    }
				break;
		}
	}
};

CHAOS.Effect = CHAOS.Material;

CHAOS.Effect.prototype.fromFile = function(url) {
	var path = url + ".fx";

	this.isReady = true;
	this.isPrepare = false;

	function read_file(file, self) {
		var xmlhttp;

		if (window.XMLHttpRequest) 	{ xmlhttp=new XMLHttpRequest(); }
		else 						{ xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }

		xmlhttp.open("GET", file, false);		// sync, will wait
		xmlhttp.send();
		self.isReady = true;
		return xmlhttp.responseText;
	}

	this.vertexShader = CHAOS.ShaderLib.effectVS.vs;
	this.fragmentShader = read_file(path, this);
};

CHAOS.Effect.prototype.draw = function(gl) {
	if(!this.QUAD) {
		this.vertexShader = 
		this.QUAD = new CHAOS.Mesh(new CHAOS.Geometry().Plane({width: 2, height: 2}), this);
		this.QUAD.prepare(gl);
	}

	this.tex_count = -1;
	for(var uniform_name in this.uniforms) {
		 this.sendUniform(uniform_name, gl);
	}

	for(var attribute_name in this.attributes) {
		if(attribute_name != "indices") {
			this.bindAttribute(attribute_name, gl)
		}
	}

	// indices
	var indices = this.attributes["indices"];
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices.unpackedData);
	gl.drawElements(gl.TRIANGLES, indices.itemSize, gl.UNSIGNED_SHORT, 0);
}

/*
--- attribute

	var attributes = {
		position: 	{ value: geometry.vertices,		type: "chaos.vec3" 	},
		normals: 	{ value: geometry.normals, 		type: "chaos.vec3" 	},
		colors: 	{ value: geometry.colors, 		type: "chaos.color"	},
		uvs: 		{ value: geometry.uvs, 			type: "chaos.uv" 	},
		offset: 	{ value: myArray, 				type: "float" 		}
	}

	position: 		{ value: vertices, 		type: "chaos.vec3",		needsUpdate: true, 		unpacked: []}

--- uniforms

	var unfs = {
		uTex: 		{ value: mojaTekstura, 				type: 	"chaos.texture" },
		uRes: 		{ value: [1280.,1024.],				type: 	"vec2" 			},
		uMouse: 	{ value: [mx, my], 					type:	"vec2" 			},
		uSphere: 	{ value: [x, y, z], 				type: 	"vec3" 			},
		uCube: 		{ value: new CHAOS.Vec3(x,y,z), 	type: 	"chaos.vec3" 	},
		uModMat: 	{ value: mojaMatrica, 				type: 	"chaos.mat4" 	}
	};
*/
