var neighbors = require("../lib/neighbors");

neighbors.scanNodes(80, function(err, nodes) {
	if (err) {
		console.log("Error", err);
	}
	console.log(nodes);
});