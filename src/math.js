 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

// CHAOS.Math
// CHAOS.Vec2
// CHAOS.Vec3
// CHAOS.Vec4
// CHAOS.Mat3
// CHAOS.Mat4

CHAOS.Math = {
  add: function() {
		var vec;
		if(arguments[0].w==undefined) { vec = new CHAOS.Vec3().set(arguments[0]); }
		else { vec = new CHAOS.Vec4().set(arguments[0]); }
		
		for(var i=1; i<arguments.length; i++) {
			vec.add(arguments[i]);
		}
		return vec;
	},

	sub: function() {
		var vec;
		if(arguments[0].w==undefined) { vec = new CHAOS.Vec3().set(arguments[0]); }
		else { vec = new CHAOS.Vec4().set(arguments[0]); }
		
		for(var i=1; i<arguments.length; i++) {
			vec.sub(arguments[i]);
		}
		return vec;
	},

	cross: function(a,b) {
		var vec = new CHAOS.Vec3();

		vec.x = a.y * b.z - a.z * b.y;
		vec.y = a.z * b.x - a.x * b.z;
		vec.z = a.x * b.y - a.y * b.x;

		return vec;
	},

	random: function(min, max) {
		return Math.random()*(max-min)+min;
	}
};

// 														Ge       eeu eeeeeeeeee   .eeeeeeE    zeeeeu 
// 														 ee     eee  ee          eeG     eee ee   9eK
// 														 eee    ee   ee  ...W   ee        zX       eX
// 														  ee   eeW   eeeeeeeee  ee              zeee 
// 														   ee ee9    ee         ee        WW  9eey   
// 														   eeXee     ee          eeX     eee ee      
// 														    eeeW     eeeeeeeeee   Weeeeeee  Xeeeeeeee

CHAOS.Vec2 = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

CHAOS.Vec2.prototype = {
	set: function(x,y) {
		this.x = x;
		this.y = y;

		return this;
	},

	dot: function(vec) {
		return this.x*vec.x + this.y*vec.y;
	},

	length: function() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},

	normalize: function() {
		var l = this.length();
		this.x /= l;
		this.y /= l;
		return this;
	},

	sub: function(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	},

	add: function(vec) {
		this.x += vec.x;
		this.y += vec.y;
		return this;
	},

	mul: function(s) {
		this.x *= s;
		this.y *= s;
		return this;
	},

	setLength: function(l) {
		this.normalize().mul(l);
		return this;
	},

	negate: function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},

	toString: function() {
		return "vec2:[ "+this.x+", "+this.y+" ]";
	}
};

// 														Ge       eeu eeeeeeeeee   .eeeeeeE    zeeeeu 
// 														 ee     eee  ee          eeG     eee ee   XeW
// 														 eee    ee   ee  ...W   ee        zX    y Ee 
// 														  ee   eeW   eeeeeeeee  ee              eeee 
// 														   ee ee9    ee         ee        W.       ee
// 														   eeXee     ee          eeX     eeeGee    ee
// 														    eeeW     eeeeeeeeee   Weeeeeee   ueeeeee 

CHAOS.Vec3 = function(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

CHAOS.Vec3.prototype = {
	set: function(x,y,z) {
		if(arguments.length == 3) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
		else if(arguments.length==1) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		}

		return this;
	},

	dot: function(vec) {
		return this.x*vec.x + this.y*vec.y + this.z*vec.z;
	},

	cross: function ( v ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	length: function() {
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	},

	normalize: function() {
		var l = this.length();
		this.x /= l;
		this.y /= l;
		this.z /= l;
		return this;
	},

	sub: function(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		this.z -= vec.z;
		return this;
	},

	add: function(vec) {
		this.x += vec.x;
		this.y += vec.y;
		this.z += vec.z;
		return this;
	},

	mul: function(s) {
		this.x *= s;
		this.y *= s;
		this.z *= s;
		return this;
	},

	setLength: function(l) {
		this.normalize().mul(l);
		return this;
	},

	negate: function() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	},

	angleTo: function ( v ) {
		return Math.acos( this.dot( v ) / this.length() / v.length() );
	},

	toString: function() {
		return "vec3:[ "+this.x+", "+this.y+", "+this.z+" ]";
	}
};

// 													Ge       eeu eeeeeeeeee   .eeeeeeE       eee 
// 													 ee     eee  ee          eeG     eee   9eeee 
// 													 eee    ee   ee  ...W   ee        zD  Eee ee 
// 													  ee   eeW   eeeeeeeee  ee           eee  ee 
// 													   ee ee9    ee         ee        W Xee  yee 
// 													   eeXee     ee          eeX     eeeXeeeeeee#
// 													    eeeW     eeeeeeeeee   Weeeeeee        eE 


CHAOS.Vec4 = function(x,y,z,w) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = ( w !== undefined ) ? w : 1;
};

CHAOS.Vec4.prototype = {
	set: function ( x, y, z, w ) {
		if(arguments.length==1) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			this.w = x.w;
		}
		else if(arguments.length==4) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		return this;
	},

	add: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;
	},

	sub: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

		return this;
	},

	mul: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;
		this.w *= s;

		return this;
	},

	negate: function() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		this.w = -this.w;

		return this;
	},

	dot: function ( v ) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	},

	length: function() {
		return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
	},

	normalize: function () {
		return this.mul( 1/this.length() );
	},

	setLength: function ( l ) {
		return this.normalize().mul(l);
	},

	toString: function() {
		return "["+this.x+", "+this.y+", "+this.z+", "+this.w+", "+"]";
	}
};

// 														eee     #eeX     eeee    eeeeeeeeeee  zeeeeu 
// 														eeeK    eeeX    Deeee         e5     ee   XeW
// 														eeee   eeeeX    ee  ee       Xee        y Ee 
// 														ee eE  ee5eX   ee   GeG      Xee        eeee 
// 														ee ee ee KeX  .ee u  ee      Xee           ee
// 														ee eeeee 9eX  eeeeeeeeee     Xee    eee    ee
// 														ee  eee  EeX eeu      eey    XeE     ueeeeee 


CHAOS.Mat3 = function() {
	this.elements = new Float32Array(9);
};

CHAOS.Mat3.prototype = {
	set: function(e11,e12,e13,e21,e22,e23,e31,e32,e33) {
		var e = this.elements;

		e[0] = e11;
		e[1] = e12;
		e[2] = e13;

		e[3] = e21;
		e[4] = e22;
		e[5] = e23;

		e[6] = e31;
		e[7] = e32;
		e[8] = e33;

		return this;
	},

	zero: function() {
		var n = 9;
		while(n--) {
			this.elements[n] = 0;
		}

		return this;
	},

	indetity: function() {
		this.zero();
		this.elements[0] = this.elements[4] = this.elements[8] = 1;

		return this;
	},

	one: function() {
		return this.indetity();
	},

	mul: function(s) {
		var n = 9;
		while(n--) {
			this.elements[n] *= s;
		}	
		return this;
	},

	transpose: function() {
		var t, e = this.elements;
		t=e[1];  e[1]=e[3];  e[3]=t;
		t=e[2];  e[2]=e[6];  e[6]=t;
		t=e[5];  e[5]=e[7];  e[7]=t;

		return this; 
	},

	D: function() {
		var e = this.elements;
		return 	e[0] * (e[4] * e[8] - e[5] * e[7])
			-	e[1] * (e[3] * e[8] - e[5] * e[6])
			+	e[2] * (e[3] * e[7] - e[4] * e[6]);
	},

	invert: function() {
		var e = this.elements, d = this.D();

		if(d!=0) {
			var e11=e[0], e12=e[1], e13=e[2],
				e21=e[3], e22=e[4], e23=e[5],
				e31=e[6], e32=e[7], e33=e[8];

			e[0] = e22 * e33 - e23 * e32;
			e[1] = e31 * e23 - e21 * e33;
			e[2] = e21 * e32 - e22 * e31;

			e[3] = e13 * e32 - e12 * e33;
			e[4] = e11 * e33 - e13 * e31;
			e[5] = e12 * e31 - e11 * e32;

			e[6] = e12 * e23 - e13 * e22;
			e[7] = e13 * e21 - e11 * e23;
			e[8] = e11 * e22 - e12 * e21;

			return this.transpose().mul(1/d);
		}
		else {
			return this;
			alert("Determinant of the matrix is 0.");
		}
	},

	toString: function() {
		var e = this.elements;
		return 	"| " + e[0] + " " + e[1] + " " + e[2] + " | \r\n" +
				"| " + e[3] + " " + e[4] + " " + e[5] + " | \r\n" +
				"| " + e[6] + " " + e[7] + " " + e[8] + " | \r\n";
	}
};

// 														eee     #eeX     eeee    eeeeeeeeeee     eee 
// 														eeeK    eeeX    Deeee         e5       9eeee 
// 														eeee   eeeeX    ee  ee       Xee      Eee ee 
// 														ee eE  ee5eX   ee   GeG      Xee     eee  ee 
// 														ee ee ee KeX  .ee u  ee      Xee    Gee  yee 
// 														ee eeeee 9eX  eeeeeeeeee     Xee    Eeeeeeee#
// 														ee  eee  EeX eeu      eey    XeE          eE 


CHAOS.Mat4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.elements = new Float32Array( 16 );

	this.set(

		( n11 !== undefined ) ? n11 : 1, n12 || 0, n13 || 0, n14 || 0,
		n21 || 0, ( n22 !== undefined ) ? n22 : 1, n23 || 0, n24 || 0,
		n31 || 0, n32 || 0, ( n33 !== undefined ) ? n33 : 1, n34 || 0,
		n41 || 0, n42 || 0, n43 || 0, ( n44 !== undefined ) ? n44 : 1

	);

	return this;

};

CHAOS.Mat4.prototype = {

	constructor: CHAOS.Mat4,

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		var te = this.elements;

		te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
		te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
		te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
		te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;

		return this;



	},

	identity: function () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	},

	one: function() {
		return this.identity();
	},

	zero: function () {

		this.set(

			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0

		);

		return this;

	},

	copy: function ( m ) {

		var me = m.elements;

		this.set(

			me[0], me[4], me[8], me[12],
			me[1], me[5], me[9], me[13],
			me[2], me[6], me[10], me[14],
			me[3], me[7], me[11], me[15]

		);

		return this;

	},

	lookAtIt: function( eye, target, up ) {

		console.log("*", eye,target, up);

		// up = new CHAOS.Vec3(0,1,0);

		var te = this.elements;

		var zaxis = new CHAOS.Vec3();
		zaxis = target.sub(target, eye);
		zaxis = zaxis.normalize();

		var xaxis = new CHAOS.Vec3();
		xaxis = up.cross(zaxis);
		xaxis = xaxis.normalize();

		var yaxis = new CHAOS.Vec3();
		yaxis = zaxis.cross(xaxis);

		te[0] = xaxis.x; te[4] = yaxis.x; te[8] = zaxis.x;
		te[1] = xaxis.y; te[5] = yaxis.y; te[9] = zaxis.y;
		te[2] = xaxis.z; te[6] = yaxis.z; te[10] = zaxis.z;

		return this;

    // normal(target - eye);    // The "look-at" vector.
    // Vector3 xaxis = normal(cross(up, zaxis));// The "right" vector.
    // Vector3 yaxis = cross(zaxis, xaxis);     // The "up" vector.
},

	lookAt: function ( eye, target, up ) {

		var te = this.elements;

		var x = new CHAOS.Vec3(0,0,0);
		var y = new CHAOS.Vec3(0,0,0);
		var z = new CHAOS.Vec3(0,0,0);

		console.log(x,y,z,eye,target, up);

		z = z.sub( eye, target ).normalize();

		if ( z.length() === 0 ) {

			z.z = 1;

		}

		x = x.cross( up, z ).normalize();

		if ( x.length() === 0 ) {

			z.x += 0.0001;
			x.cross( up, z ).normalize();

		}

		y = y.cross( z, x );


		te[0] = x.x; te[4] = y.x; te[8] = z.x;
		te[1] = x.y; te[5] = y.y; te[9] = z.y;
		te[2] = x.z; te[6] = y.z; te[10] = z.z;

		return this;

	},

	multiply: function ( a, b ) {

		var ae = a.elements;
		var be = b.elements;
		var te = this.elements;

		var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
		var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
		var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
		var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

		var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
		var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
		var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
		var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	},

	multiplySelf: function ( m ) {

		return this.multiply( this, m );

	},

	multiplyScalar: function ( s ) {

		var te = this.elements;
		var n = te.length;

		while(n--) { te[n]*=s; }

		return this;

	},

	multiplyVector3: function ( v ) {

		var te = this.elements;

		var vx = v.x, vy = v.y, vz = v.z;
		var d = 1 / ( te[3] * vx + te[7] * vy + te[11] * vz + te[15] );

		v.x = ( te[0] * vx + te[4] * vy + te[8] * vz + te[12] ) * d;
		v.y = ( te[1] * vx + te[5] * vy + te[9] * vz + te[13] ) * d;
		v.z = ( te[2] * vx + te[6] * vy + te[10] * vz + te[14] ) * d;

		return v;

	},

	multiplyVector4: function ( v ) {

		var te = this.elements;
		var vx = v.x, vy = v.y, vz = v.z, vw = v.w;

		v.x = te[0] * vx + te[4] * vy + te[8] * vz + te[12] * vw;
		v.y = te[1] * vx + te[5] * vy + te[9] * vz + te[13] * vw;
		v.z = te[2] * vx + te[6] * vy + te[10] * vz + te[14] * vw;
		v.w = te[3] * vx + te[7] * vy + te[11] * vz + te[15] * vw;

		return v;

	},

	rotateAxis: function ( v ) {

		var te = this.elements;
		var vx = v.x, vy = v.y, vz = v.z;

		v.x = vx * te[0] + vy * te[4] + vz * te[8];
		v.y = vx * te[1] + vy * te[5] + vz * te[9];
		v.z = vx * te[2] + vy * te[6] + vz * te[10];

		v.normalize();

		return v;

	},

	crossVector: function ( a ) {

		var te = this.elements;
		var v = new CHAOS.Vec4();

		v.x = te[0] * a.x + te[4] * a.y + te[8] * a.z + te[12] * a.w;
		v.y = te[1] * a.x + te[5] * a.y + te[9] * a.z + te[13] * a.w;
		v.z = te[2] * a.x + te[6] * a.y + te[10] * a.z + te[14] * a.w;

		v.w = ( a.w ) ? te[3] * a.x + te[7] * a.y + te[11] * a.z + te[15] * a.w : 1;

		return v;

	},

	determinant: function () {

		var te = this.elements;

		var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
		var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
		var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
		var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n14 * n23 * n32 * n41-
			n13 * n24 * n32 * n41-
			n14 * n22 * n33 * n41+
			n12 * n24 * n33 * n41+

			n13 * n22 * n34 * n41-
			n12 * n23 * n34 * n41-
			n14 * n23 * n31 * n42+
			n13 * n24 * n31 * n42+

			n14 * n21 * n33 * n42-
			n11 * n24 * n33 * n42-
			n13 * n21 * n34 * n42+
			n11 * n23 * n34 * n42+

			n14 * n22 * n31 * n43-
			n12 * n24 * n31 * n43-
			n14 * n21 * n32 * n43+
			n11 * n24 * n32 * n43+

			n12 * n21 * n34 * n43-
			n11 * n22 * n34 * n43-
			n13 * n22 * n31 * n44+
			n12 * n23 * n31 * n44+

			n13 * n21 * n32 * n44-
			n11 * n23 * n32 * n44-
			n12 * n21 * n33 * n44+
			n11 * n22 * n33 * n44
		);

	},

	transpose: function () {

		var te = this.elements;
		var tmp;

		tmp = te[1]; te[1] = te[4]; te[4] = tmp;
		tmp = te[2]; te[2] = te[8]; te[8] = tmp;
		tmp = te[6]; te[6] = te[9]; te[9] = tmp;

		tmp = te[3]; te[3] = te[12]; te[12] = tmp;
		tmp = te[7]; te[7] = te[13]; te[13] = tmp;
		tmp = te[11]; te[11] = te[14]; te[14] = tmp;

		return this;

	},

	getPosition: function () {

		var te = this.elements;
		return CHAOS.Mat4.__v1.set( te[12], te[13], te[14] );

	},

	setPosition: function ( v ) {

		var te = this.elements;

		te[12] = v.x;
		te[13] = v.y;
		te[14] = v.z;

		return this;

	},

	getColumnX: function () {

		var te = this.elements;
		return CHAOS.Mat4.__v1.set( te[0], te[1], te[2] );

	},

	getColumnY: function () {

		var te = this.elements;
		return CHAOS.Mat4.__v1.set( te[4], te[5], te[6] );

	},

	getColumnZ: function() {

		var te = this.elements;
		return CHAOS.Mat4.__v1.set( te[8], te[9], te[10] );

	},

	getInverse: function ( m ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		var te = this.elements;
		var me = m.elements;

		var n11 = me[0], n12 = me[4], n13 = me[8], n14 = me[12];
		var n21 = me[1], n22 = me[5], n23 = me[9], n24 = me[13];
		var n31 = me[2], n32 = me[6], n33 = me[10], n34 = me[14];
		var n41 = me[3], n42 = me[7], n43 = me[11], n44 = me[15];

		te[0] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
		te[4] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
		te[8] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
		te[12] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
		te[1] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
		te[5] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
		te[9] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
		te[13] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
		te[2] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
		te[6] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
		te[10] = n12*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
		te[14] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
		te[3] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
		te[7] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
		te[11] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
		te[15] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
		this.multiplyScalar( 1 / m.determinant() );

		return this;

	},

	setRotationFromEuler: function ( v, order ) {

		var te = this.elements;

		var x = v.x, y = v.y, z = v.z;
		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		if ( order === undefined || order === 'XYZ' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[0] = c * e;
			te[4] = - c * f;
			te[8] = d;

			te[1] = af + be * d;
			te[5] = ae - bf * d;
			te[9] = - b * c;

			te[2] = bf - ae * d;
			te[6] = be + af * d;
			te[10] = a * c;

		} else if ( order === 'YXZ' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[0] = ce + df * b;
			te[4] = de * b - cf;
			te[8] = a * d;

			te[1] = a * f;
			te[5] = a * e;
			te[9] = - b;

			te[2] = cf * b - de;
			te[6] = df + ce * b;
			te[10] = a * c;

		} else if ( order === 'ZXY' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[0] = ce - df * b;
			te[4] = - a * f;
			te[8] = de + cf * b;

			te[1] = cf + de * b;
			te[5] = a * e;
			te[9] = df - ce * b;

			te[2] = - a * d;
			te[6] = b;
			te[10] = a * c;

		} else if ( order === 'ZYX' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[0] = c * e;
			te[4] = be * d - af;
			te[8] = ae * d + bf;

			te[1] = c * f;
			te[5] = bf * d + ae;
			te[9] = af * d - be;

			te[2] = - d;
			te[6] = b * c;
			te[10] = a * c;

		} else if ( order === 'YZX' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[0] = c * e;
			te[4] = bd - ac * f;
			te[8] = bc * f + ad;

			te[1] = f;
			te[5] = a * e;
			te[9] = - b * e;

			te[2] = - d * e;
			te[6] = ad * f + bc;
			te[10] = ac - bd * f;

		} else if ( order === 'XZY' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[0] = c * e;
			te[4] = - f;
			te[8] = d * e;

			te[1] = ac * f + bd;
			te[5] = a * e;
			te[9] = ad * f - bc;

			te[2] = bc * f - ad;
			te[6] = b * e;
			te[10] = bd * f + ac;

		}

		return this;

	},


	setRotationFromQuaternion: function ( q ) {

		var te = this.elements;

		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		te[0] = 1 - ( yy + zz );
		te[4] = xy - wz;
		te[8] = xz + wy;

		te[1] = xy + wz;
		te[5] = 1 - ( xx + zz );
		te[9] = yz - wx;

		te[2] = xz - wy;
		te[6] = yz + wx;
		te[10] = 1 - ( xx + yy );

		return this;

	},

	compose: function ( translation, rotation, scale ) {

		var te = this.elements;
		var mRotation = CHAOS.Mat4.__m1;
		var mScale = CHAOS.Mat4.__m2;

		mRotation.one();
		mRotation.setRotationFromQuaternion( rotation );

		mScale.makeScale( scale.x, scale.y, scale.z );

		this.multiply( mRotation, mScale );

		te[12] = translation.x;
		te[13] = translation.y;
		te[14] = translation.z;

		return this;

	},

	decompose: function ( translation, rotation, scale ) {

		var te = this.elements;

		// grab the axis vectors
		var x = CHAOS.Mat4.__v1;
		var y = CHAOS.Mat4.__v2;
		var z = CHAOS.Mat4.__v3;

		x.set( te[0], te[1], te[2] );
		y.set( te[4], te[5], te[6] );
		z.set( te[8], te[9], te[10] );

		translation = ( translation instanceof CHAOS.Vec3 ) ? translation : new CHAOS.Vec3();
		rotation = ( rotation instanceof CHAOS.Quaternion ) ? rotation : new CHAOS.Quaternion();
		scale = ( scale instanceof CHAOS.Vec3 ) ? scale : new CHAOS.Vec3();

		scale.x = x.length();
		scale.y = y.length();
		scale.z = z.length();

		translation.x = te[12];
		translation.y = te[13];
		translation.z = te[14];

		// scale the rotation part

		var matrix = CHAOS.Mat4.__m1;

		matrix.copy( this );

		matrix.elements[0] /= scale.x;
		matrix.elements[1] /= scale.x;
		matrix.elements[2] /= scale.x;

		matrix.elements[4] /= scale.y;
		matrix.elements[5] /= scale.y;
		matrix.elements[6] /= scale.y;

		matrix.elements[8] /= scale.z;
		matrix.elements[9] /= scale.z;
		matrix.elements[10] /= scale.z;

		rotation.setFromRotationMatrix( matrix );

		return [ translation, rotation, scale ];

	},

	extractPosition: function ( m ) {

		var te = this.elements;
		var me = m.elements;

		te[12] = me[12];
		te[13] = me[13];
		te[14] = me[14];

		return this;

	},

	extractRotation: function ( m ) {

		var te = this.elements;
		var me = m.elements;

		var vector = CHAOS.Mat4.__v1;

		var scaleX = 1 / vector.set( me[0], me[1], me[2] ).length();
		var scaleY = 1 / vector.set( me[4], me[5], me[6] ).length();
		var scaleZ = 1 / vector.set( me[8], me[9], me[10] ).length();

		te[0] = me[0] * scaleX;
		te[1] = me[1] * scaleX;
		te[2] = me[2] * scaleX;

		te[4] = me[4] * scaleY;
		te[5] = me[5] * scaleY;
		te[6] = me[6] * scaleY;

		te[8] = me[8] * scaleZ;
		te[9] = me[9] * scaleZ;
		te[10] = me[10] * scaleZ;

		return this;

	},

	//

	translate: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[12] = te[0] * x + te[4] * y + te[8] * z + te[12];
		te[13] = te[1] * x + te[5] * y + te[9] * z + te[13];
		te[14] = te[2] * x + te[6] * y + te[10] * z + te[14];
		te[15] = te[3] * x + te[7] * y + te[11] * z + te[15];

		return this;

	},

	rotateX: function ( angle ) {

		var te = this.elements;
		var m12 = te[4];
		var m22 = te[5];
		var m32 = te[6];
		var m42 = te[7];
		var m13 = te[8];
		var m23 = te[9];
		var m33 = te[10];
		var m43 = te[11];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		te[4] = c * m12 + s * m13;
		te[5] = c * m22 + s * m23;
		te[6] = c * m32 + s * m33;
		te[7] = c * m42 + s * m43;

		te[8] = c * m13 - s * m12;
		te[9] = c * m23 - s * m22;
		te[10] = c * m33 - s * m32;
		te[11] = c * m43 - s * m42;

		return this;

	},

	rotateY: function ( angle ) {

		var te = this.elements;
		var m11 = te[0];
		var m21 = te[1];
		var m31 = te[2];
		var m41 = te[3];
		var m13 = te[8];
		var m23 = te[9];
		var m33 = te[10];
		var m43 = te[11];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		te[0] = c * m11 - s * m13;
		te[1] = c * m21 - s * m23;
		te[2] = c * m31 - s * m33;
		te[3] = c * m41 - s * m43;

		te[8] = c * m13 + s * m11;
		te[9] = c * m23 + s * m21;
		te[10] = c * m33 + s * m31;
		te[11] = c * m43 + s * m41;

		return this;

	},

	rotateZ: function ( angle ) {

		var te = this.elements;
		var m11 = te[0];
		var m21 = te[1];
		var m31 = te[2];
		var m41 = te[3];
		var m12 = te[4];
		var m22 = te[5];
		var m32 = te[6];
		var m42 = te[7];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		te[0] = c * m11 + s * m12;
		te[1] = c * m21 + s * m22;
		te[2] = c * m31 + s * m32;
		te[3] = c * m41 + s * m42;

		te[4] = c * m12 - s * m11;
		te[5] = c * m22 - s * m21;
		te[6] = c * m32 - s * m31;
		te[7] = c * m42 - s * m41;

		return this;

	},

	rotateByAxis: function ( axis, angle ) {

		var te = this.elements;

		// optimize by checking axis

		if ( axis.x === 1 && axis.y === 0 && axis.z === 0 ) {

			return this.rotateX( angle );

		} else if ( axis.x === 0 && axis.y === 1 && axis.z === 0 ) {

			return this.rotateY( angle );

		} else if ( axis.x === 0 && axis.y === 0 && axis.z === 1 ) {

			return this.rotateZ( angle );

		}

		var x = axis.x, y = axis.y, z = axis.z;
		var n = Math.sqrt(x * x + y * y + z * z);

		x /= n;
		y /= n;
		z /= n;

		var xx = x * x, yy = y * y, zz = z * z;
		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var oneMinusCosine = 1 - c;
		var xy = x * y * oneMinusCosine;
		var xz = x * z * oneMinusCosine;
		var yz = y * z * oneMinusCosine;
		var xs = x * s;
		var ys = y * s;
		var zs = z * s;

		var r11 = xx + (1 - xx) * c;
		var r21 = xy + zs;
		var r31 = xz - ys;
		var r12 = xy - zs;
		var r22 = yy + (1 - yy) * c;
		var r32 = yz + xs;
		var r13 = xz + ys;
		var r23 = yz - xs;
		var r33 = zz + (1 - zz) * c;

		var m11 = te[0], m21 = te[1], m31 = te[2], m41 = te[3];
		var m12 = te[4], m22 = te[5], m32 = te[6], m42 = te[7];
		var m13 = te[8], m23 = te[9], m33 = te[10], m43 = te[11];
		var m14 = te[12], m24 = te[13], m34 = te[14], m44 = te[15];

		te[0] = r11 * m11 + r21 * m12 + r31 * m13;
		te[1] = r11 * m21 + r21 * m22 + r31 * m23;
		te[2] = r11 * m31 + r21 * m32 + r31 * m33;
		te[3] = r11 * m41 + r21 * m42 + r31 * m43;

		te[4] = r12 * m11 + r22 * m12 + r32 * m13;
		te[5] = r12 * m21 + r22 * m22 + r32 * m23;
		te[6] = r12 * m31 + r22 * m32 + r32 * m33;
		te[7] = r12 * m41 + r22 * m42 + r32 * m43;

		te[8] = r13 * m11 + r23 * m12 + r33 * m13;
		te[9] = r13 * m21 + r23 * m22 + r33 * m23;
		te[10] = r13 * m31 + r23 * m32 + r33 * m33;
		te[11] = r13 * m41 + r23 * m42 + r33 * m43;

		return this;

	},

	scale: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[0] *= x; te[4] *= y; te[8] *= z;
		te[1] *= x; te[5] *= y; te[9] *= z;
		te[2] *= x; te[6] *= y; te[10] *= z;
		te[3] *= x; te[7] *= y; te[11] *= z;

		return this;

	},

	getMaxScaleOnAxis: function () {

		var te = this.elements;

		var scaleXSq =  te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
		var scaleYSq =  te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
		var scaleZSq =  te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

		return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

	},

	//

	makeTranslation: function ( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	makeRotationX: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, -s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	makeRotationY: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	makeRotationZ: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, -s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	makeRotationAxis: function ( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var t = 1 - c;
		var x = axis.x, y = axis.y, z = axis.z;
		var tx = t * x, ty = t * y;

		this.set(

			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},

	makeScale: function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	makeFrustum: function ( left, right, bottom, top, near, far ) {

		var te = this.elements;
		var x = 2 * near / ( right - left );
		var y = 2 * near / ( top - bottom );

		var a = ( right + left ) / ( right - left );
		var b = ( top + bottom ) / ( top - bottom );
		var c = - ( far + near ) / ( far - near );
		var d = - 2 * far * near / ( far - near );

		te[0] = x;  te[4] = 0;  te[8] = a;   te[12] = 0;
		te[1] = 0;  te[5] = y;  te[9] = b;   te[13] = 0;
		te[2] = 0;  te[6] = 0;  te[10] = c;   te[14] = d;
		te[3] = 0;  te[7] = 0;  te[11] = - 1; te[15] = 0;

		return this;

	},

	makePerspective: function ( fov, aspect, near, far ) {

		var ymax = near * Math.tan( fov * Math.PI / 360 );
		var ymin = - ymax;
		var xmin = ymin * aspect;
		var xmax = ymax * aspect;

		return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );

	},

	makeOrthographic: function ( left, right, top, bottom, near, far ) {

		var te = this.elements;
		var w = right - left;
		var h = top - bottom;
		var p = far - near;

		var x = ( right + left ) / w;
		var y = ( top + bottom ) / h;
		var z = ( far + near ) / p;

		te[0] = 2 / w; te[4] = 0;     te[8] = 0;      te[12] = -x;
		te[1] = 0;     te[5] = 2 / h; te[9] = 0;      te[13] = -y;
		te[2] = 0;     te[6] = 0;     te[10] = -2 / p; te[14] = -z;
		te[3] = 0;     te[7] = 0;     te[11] = 0;      te[15] = 1;

		return this;

	},


	clone: function () {

		var te = this.elements;

		return new CHAOS.Mat4(

			te[0], te[4], te[8], te[12],
			te[1], te[5], te[9], te[13],
			te[2], te[6], te[10], te[14],
			te[3], te[7], te[11], te[15]

		);

	},

	toString: function() {
		var e = this.elements;
		return 	"| " + e[0] + " " + e[1] + " " + e[2] + " " + e[3] + " | \r\n" +
				"| " + e[4] + " " + e[5] + " " + e[6] + " " + e[7] + " | \r\n" +
				"| " + e[8] + " " + e[9] + " " + e[10] + " " + e[11] + " | \r\n" +
				"| " + e[12] + " " + e[13] + " " + e[14] + " " + e[15] + " | \r\n";
	},

	toHTMLString: function() {
		var e = this.elements;
		return 	"| " + e[0] + " " + e[1] + " " + e[2] + " " + e[3] + " | <br>" +
				"| " + e[4] + " " + e[5] + " " + e[6] + " " + e[7] + " | <br>" +
				"| " + e[8] + " " + e[9] + " " + e[10] + " " + e[11] + " | <br>" +
				"| " + e[12] + " " + e[13] + " " + e[14] + " " + e[15] + " | <br>";
	} 

};

CHAOS.Mat4.__v1 = new CHAOS.Vec3();
CHAOS.Mat4.__v2 = new CHAOS.Vec3();
CHAOS.Mat4.__v3 = new CHAOS.Vec3();
