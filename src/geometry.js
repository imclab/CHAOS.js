 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

// CHAOS.UV
// CHAOS.Face3
// CHAOS.Geometry
// CHAOS.Face4 ??

CHAOS.Geometry = function() {
	if(!(this instanceof arguments.callee)) {
		return new arguments.callee();
	}
	this.name = "geometry_"+arguments.callee._count++;

	this.vertices = [];
	this.faces = [];
	this.normals = [];
	this.colors = [];
	this.uvs = [];

	this.needsUpdate = true;

	return this;
};
CHAOS.Geometry._count = 0;

CHAOS.Geometry.prototype = {

	reset: function() {
		this.vertices = [];
		this.faces = [];
		this.normals = [];
		this.colors = [];
		this.uvs = [];

		this.needsUpdate = true;

		return this;
	},

	computeNormals: function() {

		this.normals = [];

		var f = this.faces;

		for(var i=0; i<f.length; i++) {
			// hesiranje
			var a = this.vertices[ f[i][0] ];
			var b = this.vertices[ f[i][1] ];
			var c = this.vertices[ f[i][2] ];

			var bc = CHAOS.Math.sub(c,b);
			var ab = CHAOS.Math.sub(a,b);

			var n = (CHAOS.Math.cross(bc,ab)).normalize();

			this.normals.push(n);
			this.normals.push(n);
			this.normals.push(n);
		}
	},

	Sphere: function(params) {

		this.reset();

		this.name+="_sphere";

		var params = params || {};

		var latitudeBands = params.latitude || 25;
        var longitudeBands = params.longitude || 25;
        var radius = params.radius || 10;

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
                var u = 1.0 - (longNumber / longitudeBands);
                var v = 1.0 - (latNumber / latitudeBands);

                this.normals.push((new CHAOS.Vec3(x,y,z)).normalize());
                this.uvs.push( new CHAOS.UV(u,v));
                this.vertices.push(new CHAOS.Vertex(radius*x, radius*y, radius*z));
                this.colors.push(new CHAOS.Color().random());
            }
        }

        
        for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;

                this.faces.push([first,first+1,second]);
                this.faces.push([second+1, second, first+1]);
            }
        }
        return this;
	}, 

	Cuboid: function(params) {

		var w,h,d;
		var params = params || {};

		if(arguments.length==1) {
			w = params.width/2 || 5;
			h = params.height/2 || 5;
			d = params.depth/2 || 5;
		}
		else if (arguments.length==3) {
			w = arguments[0]/2;
			h = arguments[1]/2;
			d = arguments[2]/2;
		}

		this.name+="_cuboid";

		this.reset();

		this.vertices = [
			// Front face
			new CHAOS.Vertex(-w, -h,  d),
			new CHAOS.Vertex( w, -h,  d),
			new CHAOS.Vertex( w,  h,  d),
			new CHAOS.Vertex(-w,  h,  d),

			// Back face
			new CHAOS.Vertex(-w, -h, -d),
			new CHAOS.Vertex(-w,  h, -d),
			new CHAOS.Vertex( w,  h, -d),
			new CHAOS.Vertex( w, -h, -d),

			// Top face
			new CHAOS.Vertex(-w,  h, -d),
			new CHAOS.Vertex(-w,  h,  d),
			new CHAOS.Vertex( w,  h,  d),
			new CHAOS.Vertex( w,  h, -d),

			// Bottom face
			new CHAOS.Vertex(-w, -h, -d),
			new CHAOS.Vertex(w, -h, -d),
			new CHAOS.Vertex(w, -h,  d),
			new CHAOS.Vertex(-w, -h,  d),

			// Right face
			new CHAOS.Vertex(w, -h, -d),
			new CHAOS.Vertex(w,  h, -d),
			new CHAOS.Vertex(w,  h,  d),
			new CHAOS.Vertex(w, -h,  d),

			// Left face
			new CHAOS.Vertex(-w, -h, -d),
			new CHAOS.Vertex(-w, -h,  d),
			new CHAOS.Vertex(-w,  h,  d),
			new CHAOS.Vertex(-w,  h, -d)];

		this.faces = [	
			[0, 1, 2],      [0, 2, 3],    // Front face
            [4, 5, 6],      [4, 6, 7],    // Back face
            [8, 9, 10],     [8, 10, 11],  // Top face
            [12, 13, 14],   [12, 14, 15], // Bottom face
            [16, 17, 18],   [16, 18, 19], // Right face
            [20, 21, 22],   [20, 22, 23]
							];
		this.uvs = [	 
			// Front face
            new CHAOS.UV(0.0, 0.0),
            new CHAOS.UV(1.0, 0.0),
            new CHAOS.UV(1.0, 1.0),
            new CHAOS.UV(0.0, 1.0),

            // Back face
            new CHAOS.UV(1.0, 0.0),
            new CHAOS.UV(1.0, 1.0),
            new CHAOS.UV(0.0, 1.0),
            new CHAOS.UV(0.0, 0.0),

            // Top face
            new CHAOS.UV(0.0, 1.0),
            new CHAOS.UV(0.0, 0.0),
            new CHAOS.UV(1.0, 0.0),
            new CHAOS.UV(1.0, 1.0),

            // Bottom face
            new CHAOS.UV(1.0, 1.0),
            new CHAOS.UV(0.0, 1.0),
            new CHAOS.UV(0.0, 0.0),
            new CHAOS.UV(1.0, 0.0),

            // Right face
            new CHAOS.UV(1.0, 0.0),
            new CHAOS.UV(1.0, 1.0),
            new CHAOS.UV(0.0, 1.0),
            new CHAOS.UV(0.0, 0.0),

            // Left face
            new CHAOS.UV(0.0, 0.0),
            new CHAOS.UV(1.0, 0.0),
            new CHAOS.UV(1.0, 1.0),
            new CHAOS.UV(0.0, 1.0)];

		this.normals = [
			// Front face
			new CHAOS.Vec3(0.0,  0.0,  1.0),
			new CHAOS.Vec3(0.0,  0.0,  1.0),
			new CHAOS.Vec3(0.0,  0.0,  1.0),
			new CHAOS.Vec3(0.0,  0.0,  1.0),

			// Back face
			new CHAOS.Vec3(0.0,  0.0, -1.0),
			new CHAOS.Vec3(0.0,  0.0, -1.0),
			new CHAOS.Vec3(0.0,  0.0, -1.0),
			new CHAOS.Vec3(0.0,  0.0, -1.0),

			// Top face
			new CHAOS.Vec3(0.0,  1.0,  0.0),
			new CHAOS.Vec3(0.0,  1.0,  0.0),
			new CHAOS.Vec3(0.0,  1.0,  0.0),
			new CHAOS.Vec3(0.0,  1.0,  0.0),

			// Bottom face
			new CHAOS.Vec3(0.0, -1.0,  0.0),
			new CHAOS.Vec3(0.0, -1.0,  0.0),
			new CHAOS.Vec3(0.0, -1.0,  0.0),
			new CHAOS.Vec3(0.0, -1.0,  0.0),

			// Right face
			new CHAOS.Vec3(1.0,  0.0,  0.0),
			new CHAOS.Vec3(1.0,  0.0,  0.0),
			new CHAOS.Vec3(1.0,  0.0,  0.0),
			new CHAOS.Vec3(1.0,  0.0,  0.0),

			// Left face
			new CHAOS.Vec3(-1.0,  0.0,  0.0),
			new CHAOS.Vec3(-1.0,  0.0,  0.0),
			new CHAOS.Vec3(-1.0,  0.0,  0.0),
			new CHAOS.Vec3(-1.0,  0.0,  0.0)
		];

		var k=24;
		while(k--) { this.colors.push(new CHAOS.Color().random()); }

		return this;	
	}, 

	Plane: function(params) {

		this.name+="_plane";
		if(arguments.length==1) {
			var params = params || {};
		}
		else if(arguments.length==4) {
			var params = { 	width: arguments[0],
							height: arguments[1],
							widthSegments: arguments[2],
							heightSegments: arguments[3] };
		}
		else if(arguments.length==2) {
			var params = { 	width: arguments[0],
							height: arguments[1],
							widthSegments: 1,
							heightSegments: 1 };
		}
		var w = params.width || 100,
			h = params.height || 100,
			sw = params.widthSegments || 1,
			sh = params.heightSegments || 1;

		this.reset();

		for(var i=0; i<sw+1; i++) {
			for (var j = 0; j < sh+1; j++) {

				// world coord
				this.vertices.push(new CHAOS.Vertex(i*w/sw-w/2, j*h/sh-h/2, 0.0));

				// normals
				this.normals.push(new CHAOS.Vec3(0.0, 0.0, 1.0));

				// uv
				this.uvs.push(new CHAOS.UV(i/sw, j/sh));

				//colors					... TODO ... remove colors in geometry (or not)
				this.colors.push(new CHAOS.Color().random());
			}
		}

		// indices/faces
		for(var i=0; i<sh; i++) {
			for(var j=0; j<sw; j++) {
				this.faces.push([(j+1)*(sh+1)+i, j*(sh+1)+i+1, j*(sh+1)+i]);
				this.faces.push([j*(sh+1)+i+1, (j+1)*(sh+1)+i, (j+1)*(sh+1)+i+1]);
			}
		}
		return this;
	}, 

	Cylinder: function(params) {
		this.name+="_cylinder";

		var height = params.height ? params.height : 100;
		var segments = params.segments ? params.segments : 6;
		var top = params.top ? params.top : 10;
		var bottom = params.bottom ? params.bottom : 10;
		var caps = params.caps ? params.caps : false;

		var tPI = 2*Math.PI;

		this.reset();

		
		for(var i=0; i<segments; i++) {
			var x = Math.sin(tPI/segments*i);
			var z = Math.cos(tPI/segments*i);
			var x1 = Math.sin(tPI/segments*(i+1));
			var z1 = Math.cos(tPI/segments*(i+1));
			// vertices
			this.vertices.push(new CHAOS.Vertex(top*x,  height/2, top*z));
			this.vertices.push(new CHAOS.Vertex(top*x1,  height/2, top*z1));
			this.vertices.push(new CHAOS.Vertex(bottom*x, -height/2, bottom*z));
			this.vertices.push(new CHAOS.Vertex(bottom*x1, -height/2, bottom*z1));

			//colors
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());			

			// uvs
			this.uvs.push(new CHAOS.UV(i/segments,1.0));
			this.uvs.push(new CHAOS.UV((i+1)/segments,1.0));
			this.uvs.push(new CHAOS.UV(i/segments,0.0));
			this.uvs.push(new CHAOS.UV((i+1)/segments,0.0));

			//normals
			var a = new CHAOS.Vec3(top*x,  height/2, top*z);
			var b = new CHAOS.Vec3(top*x1,  height/2, top*z1);
			var c = new CHAOS.Vec3(bottom*x, -height/2, bottom*z);

			a = a.sub(b);
			c = c.sub(b);

			var n = (CHAOS.Math.cross(a,c)).normalize();

			this.normals.push(n);
			this.normals.push(n);
			this.normals.push(n);
			this.normals.push(n);

			if(caps) {
				// vertices
				this.vertices.push(new CHAOS.Vertex(bottom*x, -height/2, bottom*z));
				this.vertices.push(new CHAOS.Vertex(bottom*x1, -height/2, bottom*z1));
				this.vertices.push(new CHAOS.Vertex(0, -height/2, 0));

				this.vertices.push(new CHAOS.Vertex(top*x,  height/2, top*z));
				this.vertices.push(new CHAOS.Vertex(top*x1,  height/2, top*z1));
				this.vertices.push(new CHAOS.Vertex(0, height/2, 0));

				// colors & uvs & normals
				for(var k=0; k<6; k++) {
					var y = (k<3) ? -1 : 1;
					this.colors.push(new CHAOS.Color().random());
					this.uvs.push(new CHAOS.UV(0.0, 0.0));
					this.normals.push(new CHAOS.Vec3(0, y, 0));
				}
				

				this.faces.push([10*i,   10*i+2, 10*i+1]);
				this.faces.push([10*i+1, 10*i+2, 10*i+3]);
				this.faces.push([10*i+4, 10*i+6, 10*i+5]);
				this.faces.push([10*i+9, 10*i+7, 10*i+8]);
			}

			else {
				this.faces.push([4*i,   4*i+2, 4*i+1]);
				this.faces.push([4*i+1, 4*i+2, 4*i+3]);
			}

			
		}

		return this;
	},

	Pyramid: function(params) {
		this.name+="_pyramid";

		var height = params.height ? params.height : 100;
		var segments = params.segments ? params.segments : 6;
		var radius = params.radius ? params.radius : 10;

		var s = Math.sqrt(height*height + radius*radius);
		var ratio = s/(s+radius);

		var tPI = 2*Math.PI;

		this.reset();

		for(var i=0; i<segments; i++) {
			var x = Math.sin(tPI/segments*i);
			var z = Math.cos(tPI/segments*i);
			var x1 = Math.sin(tPI/segments*(i+1));
			var z1 = Math.cos(tPI/segments*(i+1));
			// vertices
			
			this.vertices.push(new CHAOS.Vertex(radius*x, -height/2, radius*z));
			this.vertices.push(new CHAOS.Vertex(radius*x1, -height/2, radius*z1));
			this.vertices.push(new CHAOS.Vertex(0,  height/2, 0));

			this.vertices.push(new CHAOS.Vertex(radius*x, -height/2, radius*z));
			this.vertices.push(new CHAOS.Vertex(radius*x1, -height/2, radius*z1));
			this.vertices.push(new CHAOS.Vertex(0, -height/2, 0));

			//colors
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());
			this.colors.push(new CHAOS.Color().random());

			//indices
			this.faces.push([6*i, 6*i+1, 6*i+2]);
			this.faces.push([6*i+4, 6*i+3, 6*i+5]);

			// uvs
			this.uvs.push(new CHAOS.UV(i/segments, ratio));
			this.uvs.push(new CHAOS.UV((i+1)/segments, ratio));
			this.uvs.push(new CHAOS.UV((2*i+1)/(2*segments), 0.0));

			this.uvs.push(new CHAOS.UV(i/segments, ratio));
			this.uvs.push(new CHAOS.UV((i+1)/segments, ratio));
			this.uvs.push(new CHAOS.UV((2*i+1)/(2*segments), 1.0));

			//normals
			var a = new CHAOS.Vec3(radius*x,  -height/2, radius*z);
			var b = new CHAOS.Vec3(radius*x1,  -height/2, radius*z1);
			var c = new CHAOS.Vec3(0, height/2, 0);

			a = a.sub(c);
			b = b.sub(c);

			var n = (CHAOS.Math.cross(a,b)).normalize();

			this.normals.push(n);
			this.normals.push(n);
			this.normals.push(n);

			this.normals.push(new CHAOS.Vec3(0, -1, 0));
			this.normals.push(new CHAOS.Vec3(0, -1, 0));
			this.normals.push(new CHAOS.Vec3(0, -1, 0));
		}

		return this;
	},

	getInfo: function() {
		return this.name + ":<br>"
		 	+ "-- vertices: " + this.vertices.length + "<br>"
			+ "-- triangles: " + this.faces.length + "<br>"
			+ "-- uvs: " + this.uvs.length + "<br>"
			+ "-- normals: " + this.normals.length + "<br>"
			+ "-- colors: " + this.colors.length + "<br>";
	},

	getShortInfo: function() {
		return this.name + ": <br>v:&nbsp;{"+this.vertices.length+"}, f:&nbsp;{"+this.faces.length+"}, uv:&nbsp;{"+this.uvs.length+"}, n:&nbsp;{"+this.normals.length+"}, c:&nbsp;{"+this.colors.length+"}";
	},

	getTinyInfo: function() {
		return this.name + ": <br>v:&nbsp;{"+this.vertices.length+"}, f:&nbsp;{"+this.faces.length+"}";
	},

	toString: function() {
		return this.name + "[CHAOS.Geometry]";
	}
};

CHAOS.Vertex = CHAOS.Vec3;

CHAOS.UV = function(u,v) {
	this.u = u || 0.;
	this.v = v || 0.;
};

CHAOS.UV.prototype = {
	set: function(u,v) {
		if(arguments.length==1) {
			this.u = u.u;
			this.v = u.v;
		}
		else {
			this.u = u;
			this.v = v;
		}
		return this;
	},

	toString: function() {
		return "uv:[ "+this.u+", "+this.v+" ]";
	}
};

CHAOS.Face3 = function(v1,v2,v3) {
	this.v1 = v1 || new CHAOS.Vertex();
	this.v2 = v2 || new CHAOS.Vertex();
	this.v3 = v3 || new CHAOS.Vertex();
	this.normal = this.computeNormal();
	return this;
};

CHAOS.Face3.prototype = {

	set: function(v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z) {
		var a,b,c;
		if(arguments.length==3) {
			a = new CHAOS.Vertex().set(v1x, v1y, v1z);
			b = new CHAOS.Vertex().set(v2x, v2y, v2z);
			c = new CHAOS.Vertex().set(v3x, v3y, v3z);
		}
		else {
			a = v1x;
			b = v1y;
			c = v1z;
		}
		return new CHAOS.Face3(a,b,c);
	}
};
