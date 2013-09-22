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
CHAOS.br2nl=function(s){s=s.replace(/<\/?br>/gi, "\n");return s.replace(/&[^;]+;/g, " ");};

// CHAOS.Color
// CHAOS.Texture 		::: video texture, modifiers (clamping, size...)
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
	this.callback = null;
	this.name = "texture_"+arguments.callee._count++;
	return this;
};

CHAOS.Texture.prototype = {
	prepare2D: function(gl) {
		if(!this.isPrepared && this.isReady) {

			this.texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
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
	load2D: function(params) {

		var url = params.image ? params.image : params.url;
		this.callback = params.callback ? params.callback : null;
		
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
			if(self.callback) { self.callback(); }
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

		    if(pp==6) {
		    	this.isPrepared = true;
		    }
		}

		this.gl = gl;
		return this;
	},

	loadCube: function(list) {

		this.isReady = false;
		this.isPrepared = false;
		this.faces = [];
		this.type = "cube";
		this.callback = list.callback ? list.callback : null;

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
	                	if(self.callback) { self.callback(); }
	                }
	        };
	        this.faces[i].src = srcs[i];      
	    }
	    return this;
	}
};

CHAOS.Texture._count = 0;


/*CHAOS.loadOBJ = function(params) {

		var file = params.file ? params.file : params.obj;
		var matlib = params.matlib ? params.matlib : file.replace(/\.obj/, ".mtl");

		var obj_text = "",
			mat_text = "";

		var obj_meshes = [],
			obj_geometries = [],
			obj_materials = [];

		var current_mesh = 0,
			current_material = 0;

		var vertices = [],
			uvs = [],
			normals = [];

		// comments
		var reg_comm = /(#[^\n]*\n)/g;

		// grouping
		var reg_o = /#___o\s([^\n]+)([^#]+)/g,
			reg_g = /#___g\s([^\n]+)([^#]+)/g;

		// attributes
		var reg_v  = /v[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[^\n]*\n/g,
			reg_vt = /vt[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[^\n]*\n/g,
			reg_vn = /vn[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[^\n]*\n/g;

		function parse_mat(mat_str, callback, arg) {
			mat_str.replace(/newmtl\s+(.+)/g, function(match, mat_name) {
				obj_materials[mat_name] = new CHAOS.Material();
			});

			// for(var key in obj_materials) {
			// 	CHAOS.log(key, obj_materials[key]);
			// }

			return callback(arg);
		}

		function parse_obj(otext) {

			function extractVertex(match, x, y, z) {
				vertices.push(new CHAOS.Vertex( parseFloat(x), parseFloat(y), parseFloat(z) ));
				return "";
			}

			function extractUV(match, s, t) {
				uvs.push(new CHAOS.UV( parseFloat(s), parseFloat(t) ));
				return "";
			}

			function extractNormal(match, dx, dy, dz) {
				normals.push(new CHAOS.Vec3( parseFloat(dx), parseFloat(dy), parseFloat(dz) ));
				return "";
			}

			function extractObject(match, name, object_data) {

				obj_meshes[name] = new CHAOS.Mesh(new CHAOS.Geometry(), null);

				current_mesh = name;
				CHAOS.log(obj_meshes[current_mesh]);

				var geom_vertices = [],
					geom_uvs = [],
					geom_normals = [],
					geom_indices = [],
					part_v_indices = [],
					part_t_indices = [],
					part_n_indices = [];

				var reg_f = /f\s+(.+)/g,
					reg_slash = /\/{1}/g,
					reg_f_vvv = /(\-?\d+)\/(\-?\d+)\/(\-?\d+)/,
					reg_f_vt  = /(\-?\d+)\/(\-?\d+)\s+(\-?\d+)\/(\-?\d+)\s+(\-?\d+)\/(\-?\d+)/,
					reg_f_vtn = /(\-?\d+)\/(.*)\/(\-?\d+)\s+(\-?\d+)\/(.*)\/(\-?\d+)\s+(\-?\d+)\/(.*)\/(\-?\d+)/;

				object_data = object_data.replace(/\bg\b/g, "#___g");
				if(object_data.match("#___g")==null) {
					object_data = "#___g group_1\n"+object_data;
				}

				object_data = object_data.replace(reg_g, function(match, group_name, faces_data) {

					var reg_mat = /usemtl[\t ]+(.+)/;

					// nadji grupu
					// materijal - novi ili isti
					// grupu ->
					//    dodaj atribute i faces

					var mats = [];
					faces_data = faces_data.replace(reg_mat, function(match, name) { mats.push(name); } )
					var mat_name = null;
					if(mats.length!=0) {
						mat_name = mats[0];
						CHAOS.log(group_name +" uses " +mat_name+ " material.");
					}
					else {
						mat_name = current_material;
					}
					current_material = mat_name;

					faces_data.replace(reg_f, function(match, str) {

						var num_slashes = str.match(reg_slash).length;
						switch(num_slashes) {
							case 2:
								str.replace(reg_f_vvv, function(match, v1, v2, n3) {
									v1 = parseInt(v1); v1 = (v1<0) ? vertices.length-v1 : v1-1;
									v2 = parseInt(v2); v2 = (v2<0) ? vertices.length-v2 : v2-1;
									n3 = parseInt(n3); n3 = (n3<0) ? vertices.length-n3 : n3-1;

									if(part_v_indices.indexOf(v1)==-1) { part_v_indices.push(v1); geom_vertices.push(vertices[part_v_indices.indexOf(v1)]); }
									if(part_v_indices.indexOf(v2)==-1) { part_v_indices.push(v2); geom_vertices.push(vertices[part_v_indices.indexOf(v2)]); }
									if(part_v_indices.indexOf(n3)==-1) { part_v_indices.push(n3); geom_vertices.push(vertices[part_v_indices.indexOf(n3)]); }

									geom_indices.push([v1, v2, n3]);

									return "";
								});
								break;
							case 3:
								str.replace(reg_f_vt, function(match, v1, t1, v2, t2, n3, t3) {
									//
									// TODO
									//

									return "";
								});
								break;
							case 6:
							
								str.replace(reg_f_vtn, function(match, v1, t1, n1, v2, t2, n2, v3, t3, n3) {
									// CHAOS.log("SHIT", v1,v2,v3, t1,t2,t3, n1,n2,n3);
									v1 = parseFloat(v1); v1 = (v1<0) ? vertices.length-v1 : v1-1;
									v2 = parseFloat(v2); v2 = (v2<0) ? vertices.length-v2 : v2-1;
									v3 = parseFloat(v3); v3 = (v3<0) ? vertices.length-v3 : v3-1;

									

									n1 = parseFloat(n1); n1 = (n1<0) ? normals.length-n1 : n1-1;
									n2 = parseFloat(n2); n2 = (n2<0) ? normals.length-n2 : n2-1;
									n3 = parseFloat(n3); n3 = (n3<0) ? normals.length-n3 : n3-1;

									part_v_indices.push(vertices[v1]);
									part_v_indices.push(vertices[v2]);
									part_v_indices.push(vertices[v3]);

									part_n_indices.push(normals[n1]);
									part_n_indices.push(normals[n2]);
									part_n_indices.push(normals[n3]);

									if(t1!="") {
										t1 = parseFloat(t1); t1 = (t1<0) ? uvs.length-t1 : t1-1;
										t2 = parseFloat(t2); t2 = (t2<0) ? uvs.length-t2 : t2-1;
										t3 = parseFloat(t3); t3 = (t3<0) ? uvs.length-t3 : t3-1;

										part_t_indices.push(uvs[t1]);
										part_t_indices.push(uvs[t2]);
										part_t_indices.push(uvs[t3]);
									}

									return "";
								});
								break;
							default:
								alert("CHAOS: Error while parsing .OBJ file: "+file);
								break;
						}
					});
				});

 			// CHAOS.log("vertices", vertices);
 			// CHAOS.log("normals", normals);
 			// CHAOS.log("uvs", uvs);

 			// CHAOS.log(part_v_indices);
 			// CHAOS.log(part_n_indices);
 			// CHAOS.log(part_t_indices);

 			// CHAOS.log(obj_meshes[current_mesh], obj_materials[current_material]);

 			obj_meshes[current_mesh].geometry.vertices = part_v_indices;
 			obj_meshes[current_mesh].geometry.normals = part_n_indices;
 			obj_meshes[current_mesh].geometry.uvs = part_t_indices;
 			obj_meshes[current_mesh].material = null;

			}		// end of extract object

			// two slashes -> v/v/v
			// three slashes -> v/t v/t v/t
			// six slashes -> v/[vt]/vn v/[vt]/vn v/[vt]/vn


			*
			* 1. remove comments
			* 2. match and remove all vertices
			* 3. match and remove all texture coords
			* 4. match and remove all vertex normals
			* 5. match objects ->
			*	 create geometry
			* 	 6. match groups and material ->
			* 		7. match faces
			*

			// use mtl??? ___________________________________________

			
			// removing comments
			otext = otext.replace(reg_comm, "");
			// extracting vertices
			otext = otext.replace(reg_v, extractVertex);
			// extracting uvs
			otext = otext.replace(reg_vt, extractUV);
			// extracting normals
			otext = otext.replace(reg_vn, extractNormal);

			//extracting objects
			var ob_num = otext.match(/\bo\b/g);
			otext = otext.replace(/(\bo\b)/g, "#___o");
			
			if(ob_num==null) {
				extractObject(null, "myOBJGeometry", otext);
			}
			else {
				otext = otext.replace(reg_o, extractObject);
			}

			return obj_meshes;
		}

		return (function read_file(file, file_mat) {
			var xmlhttp;

			if (window.XMLHttpRequest) 	{ xmlhttp=new XMLHttpRequest(); }
			else 						{ xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }

			xmlhttp.open("GET", file, false);
			xmlhttp.send();
			var str_obj = xmlhttp.responseText;

			xmlhttp.open("GET", file_mat, false);
			xmlhttp.send();
			var str_mat = xmlhttp.responseText;

			return parse_mat(str_mat, parse_obj, str_obj);		// async
		})(file, matlib);

};*/

CHAOS.loadOBJ = function(params) {
	var file_path = params.file ? params.file : params.path;
	var mat_path = params.mtl ? params.mtl : file_path.replace(/\.obj/,".mtl");

	var meshlib = [],
		matlib = [],
		current_mesh_name = "",
		current_material_index = -1;

	var all_vertices = [],
		all_uvs = [],
		all_normals = [];

	function parse_mat(mat_str, callback, arg) {
		mat_str.replace(/newmtl\s+(\w+)/g, function(match, mat_name) {
			matlib[mat_name] = {};
			return match;
		});

		// for(var key in obj_materials) {
		// 	CHAOS.log(key, obj_materials[key]);
		// }

		// callback(arg);
	}

	function parse_obj(f_text) {

		var reg_line = /([^\n]+)/g;

		var reg_v  = /v[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[^\n]*\n/g,
			reg_vt = /vt[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[^\n]*\n/g,
			reg_vn = /vn[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[ \t]+(\-?[\d\.]+)[^\n]*\n/g;

		var reg_f = /f\s+(.+)/g,
			reg_slash = /\//g,
			reg_f_vvv = /(\-?\d+)\/(\-?\d+)\/(\-?\d+)/,
			reg_f_vt  = /(\-?\d+)\/(\-?\d+)\s+(\-?\d+)\/(\-?\d+)\s+(\-?\d+)\/(\-?\d+)/,
			reg_f_vtn = /(\-?\d+)\/(.*)\/(\-?\d+)\s+(\-?\d+)\/(.*)\/(\-?\d+)\s+(\-?\d+)\/(.*)\/(\-?\d+)/;

		f_text = f_text.replace(/(#[^\n]*\n)/g, "");
		f_text = f_text.replace(/(\s){2,}/g, "$1");

		// vertices
		f_text = f_text.replace(reg_v, function(match, x, y, z) { all_vertices.push(new CHAOS.Vertex(parseFloat(x), parseFloat(y), parseFloat(z))); return ""; });
		// texture coordinates
		f_text = f_text.replace(reg_vt, function(match, u, v) { all_uvs.push( new CHAOS.UV(parseFloat(u), parseFloat(v) ) ); return ""; });
		// normals
		f_text = f_text.replace(reg_vn, function(match, x, y, z) { all_normals.push(new CHAOS.Vec3(parseFloat(x), parseFloat(y), parseFloat(z))); return ""; });

		f_text = f_text.replace(/\bg\b([^\n]+)/g, "");
		f_text = f_text.replace(/(\s){2,}/g, "$1");
		
		// read line-by-line
		f_text.replace(reg_line, function(match, text_line) { 
			/* o, usemtl, f
			*
			*	o - creates new mesh
			*	usemtl - switches material index used
			*	f - adds mesh face
			*
			*/
			var data = [];
			switch(text_line[0]) {
				case "o":
					var mesh_name = text_line.match(/o\s([^\n]+)/)[1];
					if(meshlib[mesh_name]===undefined) {
						
						meshlib[mesh_name] = new CHAOS.Mesh(new CHAOS.Geometry(), matlib, []);
						
					}
					current_mesh_name = mesh_name;
					break;

				case "u":
					var material_name = text_line.match(/usemtl\s([^\n]+)/)[1];
					var count = 0;
					for(var key in matlib) {
						if(key == material_name) { current_material_index = count; break; }
						count++;
					}
					break;

				case "f":
					if(current_mesh_name=="") {
						meshlib["object_1"] = new CHAOS.Mesh(new CHAOS.Geometry(), matlib, []);
						current_mesh_name = "object_1";
					}

					// prebroj slasheve, dodaj podatke, dodaj materijal
					switch(text_line.match(reg_slash).length) {
						case 2:
							break;
						case 3:
							break;
						case 6:
							data = text_line.match(reg_f_vtn);
							for(var i=1; i<10; i++) {
								if(data[i]!="") data[i] = parseInt(data[i]);
							}

							data[1] = (data[1]<0) ? all_vertices.length-data[1] : data[1]-1;
							data[4] = (data[4]<0) ? all_vertices.length-data[4] : data[4]-1;
							data[7] = (data[7]<0) ? all_vertices.length-data[7] : data[7]-1;


							// if(data[2]!="") {
								data[2] = (data[2]<0) ? all_uvs.length-data[2] : data[2]-1;
								data[5] = (data[5]<0) ? all_uvs.length-data[5] : data[5]-1;
								data[8] = (data[8]<0) ? all_uvs.length-data[8] : data[8]-1;	
							// }
							
							data[3] = (data[3]<0) ? all_normals.length-data[3] : data[3]-1;
							data[6] = (data[6]<0) ? all_normals.length-data[6] : data[6]-1;
							data[9] = (data[9]<0) ? all_normals.length-data[9] : data[9]-1;						

							meshlib[current_mesh_name].geometry.vertices.push(all_vertices[data[1]]);
							meshlib[current_mesh_name].geometry.vertices.push(all_vertices[data[4]]);
							meshlib[current_mesh_name].geometry.vertices.push(all_vertices[data[7]]);

							// if(data[2]!="") {
								meshlib[current_mesh_name].geometry.uvs.push(all_uvs[data[2]]);
								meshlib[current_mesh_name].geometry.uvs.push(all_uvs[data[5]]);
								meshlib[current_mesh_name].geometry.uvs.push(all_uvs[data[8]]);
							

							meshlib[current_mesh_name].geometry.normals.push(all_normals[data[3]]);
							meshlib[current_mesh_name].geometry.normals.push(all_normals[data[6]]);
							meshlib[current_mesh_name].geometry.normals.push(all_normals[data[9]]);

							break;
						default:
							CHAOS.log("Error parsing OBJ file: "+file_path);
							break;
					}
					meshlib[current_mesh_name].matFaces.push(current_material_index);
					var l = meshlib[current_mesh_name].geometry.vertices.length/3;
					meshlib[current_mesh_name].geometry.faces.push([3*(l-1), 3*l-2, 3*l-1]);
					break;
				default:
					CHAOS.log("Error parsing OBJ file: "+file_path);
					break;
			}
		}); // end reading line-by-line

	}

	return (function read_file(file, file_mat) {
			var xmlhttp;

			if (window.XMLHttpRequest) 	{ xmlhttp=new XMLHttpRequest(); }
			else 						{ xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }

			xmlhttp.open("GET", file, false);
			xmlhttp.send();
			var str_obj = xmlhttp.responseText;

			xmlhttp.open("GET", file_mat, false);
			xmlhttp.send();
			var str_mat = xmlhttp.responseText;

			parse_mat(str_mat);
			parse_obj(str_obj);

			return meshlib;
	})(file_path, mat_path);

}
