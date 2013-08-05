 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

CHAOS.log = function(){try{console.log.apply(console,arguments)}catch(e){try{opera.postError.apply(opera,arguments)}catch(e){alert(Array.prototype.join.call(arguments," "))}}};
CHAOS.getInfo=function(){var e="",t="";var n=0,r=0;for(var i in this){if(i!="getInfo"){if(typeof this[i]=="function"){r++;var s=new RegExp("function[^(]*(([^)]*))","i");var o=this[i].toString();var u=o.match(s)[0];u=u.replace(/function[^(]*\(/,"");t+=i+"("+"), "}else{n++;e+=i+", "}}}return"CHAOS :<br>ATTRIBUTES {"+n+"}: "+e+"<br><br>"+"METHODS {"+r+"}: "+t};
CHAOS.getClasses=function(){var s="";for(var t in this){if(t!="log"&&t!="getInfo"&&t!="getClasses")s+=s?", "+t:t}return s};
CHAOS.htmltojs=function(s){return s.replace(/<\/?br>/gi, "\n");};

// CHAOS.Color
// CHAOS.Texture   	::: video texture, modifiers (clamping, size...)
// CHAOS.loadFile() ??

CHAOS.Color = function(hex) {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	if(arguments.length == 1) {
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
	}
	else if(arguments.length == 3) {
		this.r = arguments[0];
		this.g = arguments[1];
		this.b = arguments[2];
	}
	else if(arguments.length == 4) {
		this.r = arguments[0];
		this.g = arguments[1];
		this.b = arguments[2];
		this.a = arguments[3];
	}

    return this;
};

CHAOS.Color.prototype = {
	rgb: function(r,g,b) {
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

	rgba: function(r,g,b,a) {
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

	hex: function(hex) {
		return new CHAOS.Color(hex);
	},

	random: function() {
		return new CHAOS.Color(0xFFFFFF*Math.random());
	},

	toString: function() {
		return "col:("+this.r.toFixed(2)+", "+this.g.toFixed(2)+", "+this.b.toFixed(2)+", "+this.a.toFixed(2)+")";
	}
};

CHAOS.Texture = function() {
	this.gl = null;
	this.type = "none";
	this.isPrepared = false;
	this.isReady = false;
	this.image = null;
	this.texture = null;
	this.faces = [];
	this.name = "texture_"+arguments.callee._count++;
	return this;
};

CHAOS.Texture.prototype = {
	prepare2D: function(gl) {
		if(!this.isPrepared && this.isReady) {

			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			this.isPrepared = true;
		}
		this.gl = gl;
		return this;
	},
	load2D: function(url) {
		
		this.isReady = false;
		this.isPrepared = false;
		this.faces = [];
		this.type = "2d";
		this.image = new Image();
		this.image.src = url;

		var self = this;

		this.image.onload = function() {
			self.isReady = true;
			self.isPrepared = false;
		};

		return this;
	},

	prepareCube: function(gl) {
		if(!this.isPrepared && this.isReady) {

			var pp = 0;

			var place = [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		                 gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		                 gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		                 gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		                 gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		                 gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];

			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		    for(var i=0; i<6; i++) {
		    	// gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		    	if(this.faces[i] instanceof Image) {
		            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		            gl.texImage2D(place[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.faces[i]);
		            pp++;
		        }
		    }

		    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

		    if(pp==6) { this.isPrepared = true; }
		}

		this.gl = gl;
		return this;
	},

	loadCube: function(list) {

		this.isReady = false;
		this.isPrepared = false;
		this.faces = [];
		this.type = "cube";

		var ready = 0;
		var url_all = url_all || "";	

	    var srcs = [(list.folder ? list.folder : "")+(list.px ? list.px : "px")+(list.ext ? list.ext : ""),
	   				(list.folder ? list.folder : "")+(list.nx ? list.nx : "nx")+(list.ext ? list.ext : ""),
	   				(list.folder ? list.folder : "")+(list.py ? list.py : "py")+(list.ext ? list.ext : ""),
	   				(list.folder ? list.folder : "")+(list.ny ? list.ny : "ny")+(list.ext ? list.ext : ""),
	   				(list.folder ? list.folder : "")+(list.pz ? list.pz : "pz")+(list.ext ? list.ext : ""),
	   				(list.folder ? list.folder : "")+(list.nz ? list.nz : "nz")+(list.ext ? list.ext : "")];

	   	var self = this;

	    for (var i = 0; i < 6; i++) {
	        this.faces[i] = new Image();

	        this.faces[i].onload = function() {         
	                ready++;
	                if(ready==6) {
	                	self.isReady = true;
	                }
	        };
	        this.faces[i].src = srcs[i];      
	    }
	    return this;
	}
};

CHAOS.Texture._count = 0;
