# neighbors.js

Find the connectable node in LAN (local access network) for node.js

## Example
```javascript
require("./lib/neighbors").scanNodes(80, function(err, nodes) {
	console.log(nodes);
});
```

## TODO
* Scan arrange
