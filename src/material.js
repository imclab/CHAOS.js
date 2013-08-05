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

	return this;
};

CHAOS.Material.prototype = {
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

	unpackAttributes: function() {	
		// {key, array, numitems, location}

		// int, float
		// vec2, chaos.uv, chaos.vec2
		// vec3, chaos.vec3
		// chaos.color

		for(var key in this.attributes) {
			var itemSize = 0,
				type = this.attributes[key].type;

			if(type=="int"||type=="float") { itemSize = 1; }
			else if (type=="vec2"||type=="chaos.vec2"||type=="chaos.uv") { itemSize = 2; }
			else if (type=="vec3"||type=="chaos.vec3"||type=="chaos.color") { itemSize = 3; }

			this.attributes[key].itemSize = itemSize;
			this.attributes[key].unpackedData = this.unpackA(this.attributes[key].value, type);
			this.attributes[key].needsUpdate = true;
			this.attributes[key].shaderLocation = this.locAttr(key);
		}

		return this;
	},

	unpackUniforms: function() {
		for(var key in this.uniforms) {
			this.uniforms[key].unpackedData = this.unpackU(this.uniforms[key].value, this.uniforms[key].type);
			// this.uniforms[key].needsUpdate = true;
			this.uniforms[key].shaderLocation = this.locUnif(key);
		}

		return this;
	},

	unpackA: function(data, type) {
		var unpacked = [];

		// int, float
		// vec2, chaos.uv, chaos.vec2
		// vec3, chaos.vec3
		// chaos.color

		switch(type) {
			case "int": case "float": case "vec2": case "vec3":
				return data;
				break;
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

	unpackU: function(data, type) {
		// int, float
		// vec2, chaos.uv, chaos.vec2
		// vec3, chaos.vec3
		// chaos.mat4
		// chaos.color, chaos.texture

		switch(type) {
			case "int": case "float": case "vec2": case "vec3":
				return data;
				break;
			case "chaos.vec2": case "chaos.vec3":
				var unpacked = [data.x, data.y];
				if(type=="chaos.vec3") { unpacked.push(data.z); }
				return unpacked;
				break;
			case "chaos.uv":
				var unpacked = [data.u, data.v];
				break;
			case "chaos.color":
				return [data.r, data.g, data.b];
				break;
			case "chaos.mat4":
				return data.elements;
				break;
			case "chaos.texture":
				return data.texture;
				break;
		}
	},

	locAttr: function(name) {
		var a = this.gl.getAttribLocation(this.shaderProgram, name);
		if(a>-1) {
	        this.gl.enableVertexAttribArray(a);
	    }
	    return a;
	},

	locUnif: function(name) {
		return this.gl.getUniformLocation(this.shaderProgram, name);
	},

	use: function() {
		this.gl.useProgram(this.shaderProgram);
	},

	sendUniform: function(name) {
		// TODO, support int and bool values, not only float

		// int, float
		// vec2, chaos.uv, chaos.vec2
		// vec3, chaos.vec3, chaos.color
		// chaos.mat4
		// chaos.texture  ??

		var uniform = this.uniforms[name];

		switch(type) {
			case "float":
				this.gl.uniform1f(uniform.shaderLocation, uniform.unpackedData);
				break;
			case "int":
				this.gl.uniform1i(uniform.shaderLocation, uniform.unpackedData);
				break;
			case "vec2": case "chaos.uv": case "chaos.vec2":
				this.gl.uniform2f(uniform.shaderLocation, uniform.unpackedData[0], uniform.unpackedData[1]);
				break;
			case "vec3": case "chaos.vec3": case "chaos.color":
				this.gl.uniform3f(uniform.shaderLocation, uniform.unpackedData[0], uniform.unpackedData[1], uniform.unpackedData[2]);
				break;
			case "chaos.mat4":
				this.gl.uniformMatrix4fv(uniform.shaderLocation, false, uniform.unpackedData);
				break;
		}
	}
};

CHAOS.Effect = CHAOS.Material;
