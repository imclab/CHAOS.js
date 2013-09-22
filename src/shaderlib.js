 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};

CHAOS.ShaderLib = {
	blendLight: {
		vs: ["void main() {",
			"gl_Position = vec4(0);",
			"}"].join("\n"),
		fs: ["void main() {",
			"gl_FragColor = vec4(0);",
			"}"].join("\n")
	},

	depth: {
		vs: ["void main() {",
			"gl_Position = vec4(0);",
			"}"].join("\n"),
		fs: ["void main() {",
			"gl_FragColor = vec4(0);",
			"}"].join("\n")
	},

	pass2: {
		vs: ["void main() {",
			"gl_Position = vec4(0);",
			"}"].join("\n"),
		fs: ["void main() {",
			"gl_FragColor = vec4(0);",
			"}"].join("\n")
	},

	effectVS: {
		fs: "",
		vs: ["attribute vec3 aVertexPosition;",
			"attribute vec2 aVertexUV;",
			"varying vec2 vUV",
			"void main() {",
			"gl_Position = vec4(aVertexPosition, 1.0);",
			"vUV = aVertexUV;",
			"}"].join("\n")
	}
};
