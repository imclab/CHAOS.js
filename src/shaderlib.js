 /**
 * CHAOS++ - webGL 3D engine with deferred rendering and post-processing
 *
 * @version 0.xx
 * @author Okanovic Dragan / http://abstract-algorithm.com/
 *
 */

var CHAOS = CHAOS || {};


(function() {
  var nl = "\n";
	CHAOS.ShaderLib = {
	blendLight: {
		vs: "void main() {"+nl+
			"gl_Position = vec4(0);"+nl+
			"}",
		fs: "void main() {"+nl+
			"gl_FragColor = vec4(0);"+nl+
			"}"
	},

	depth: {
		vs: "",
		fs: ""
	},

	pass2: {
		vs: "void main() {"+nl+
			"gl_Position = vec4(0);"+nl+
			"}",
		fs: "void main() {"+nl+
			"gl_FragColor = vec4(0);"+nl+
			"}"
	}
}
})();
