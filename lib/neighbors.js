/**
 * neighbors.js: scan local network for specific open port
 */
var async   = require("async"),
    net     = require("net"),
    Socket  = net.Socket;

exports.scanNodes = function(targetPort, callback) {
	var hostAddress = getHostAddress();
	var neighbors = [];
	async.each(hostAddress, function(address, next) {
		scanSubnet(address, targetPort, function(err, data) {
			Array.prototype.push.apply(neighbors, data);
			next();
		});
	}, function(err){
		// console.log(neighbors);
		return typeof callback === "function" ? callback(err, neighbors) : neighbors;
	});
};

function scanSubnet(host, targetPort, callback) {
	var neighbors = [];
    var targetIPs = [];
	var subnet = (function() { 
		var str = host.match(/^(\d+\.\d+\.\d+)/);
		return str && str[0];
	})();

    for (var i=1; i<=255; i++) {
        targetIPs.push(subnet + "." + i);
    }

	// remove host ip
	var hostIndex = targetIPs.indexOf(host);
	if (hostIndex > 0) {
		targetIPs.splice(hostIndex, 1);
	}

	async.each(targetIPs, function(ip, next) {
        checkPort(targetPort, ip, function(error, status, host, targetPort){
			//console.log("neighbor found: ", host, targetPort, status);
            if(status == "open"){
				neighbors.push(host);
            }
            next();
        });       
    }, function(err) {
		callback(err, neighbors);
	});
}

/**
 * ref : http://stackoverflow.com/a/17504116
 */
function checkPort(port, host, callback) {
    var socket = new Socket(), status = null;
 
    // Socket connection established, port is open
    socket.on('connect', function() {status = 'open';socket.end();});
    socket.setTimeout(1500);// If no response, assume port is not listening
    socket.on('timeout', function() {status = 'closed';socket.destroy();});
    socket.on('error', function(exception) {status = 'closed';});
    socket.on('close', function(exception) {callback(null, status,host,port);});

    socket.connect(port, host);
}

/**
* refs: https://github.com/jas-/node-libnmap/blob/master/lib/node-libnmap.js
*
* @function interfaces
* @abstract Obtains object containing network adapters while filtering local & loopback interfaces
*
* @returns {Array} An array network interface objects
*/
function getHostInterfaces(callback) {
    var ifaces = require('os').networkInterfaces(),
        obj = [];
 
    for (var i in ifaces) {
        if (/array|object/.test(ifaces[i])){
            for (var x in ifaces[i]){
                if (/false/.test(ifaces[i][x].internal) && /ipv4/i.test(ifaces[i][x].family)) {
                    var tmp = { adapter: i, properties: ifaces[i][x] };
                    obj.push(tmp);
                }
            }
        }
    }
 
	return typeof callback === "function" ? callback(null, obj) : obj;
}

/**
 * @return {Array} An array ipv4 address object of host
 */
function getHostAddress(callback) {
	var addresses = [];
	var interfaces = getHostInterfaces();

	for (var i in interfaces) {
		addresses.push(interfaces[i].properties.address);
	}

	return typeof callback === "function" ? callback(null, addresses) : addresses;
}
