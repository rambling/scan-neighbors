/**
 * neighbors.js: scan local network for specific open port
 */
var neighbors = exports;

var async   = require("async"),
    net     = require("net"),
    Socket  = net.Socket;

neighbors.find = function(port, callback) {
	var scanIPs = getHostIPv4Addresses();
	var list = [];
	async.each(scanIPs, function(ip, next) {
		findNeighbors(ip, port, function(err, data) {
			Array.prototype.push.apply(list, data);
			next();
		});
	}, function(err){
		console.log(list);
		return typeof callback === "function" ? callback(err, list) : list;
	});
};

function findNeighbors(ip, port, callback) {
    var targetIPs = [];
	var subnet = (function() { 
		var str = ip.match(/^(\d+\.\d+\.\d+)/);
		return str && str[0];
	})();

    for (var i=1; i<=255; i++) {
        targetIPs.push(subnet + "." + i);
    }

	// remove host ip
	var hostIndex = targetIPs.indexOf(ip);
	if (hostIndex > 0) {
		targetIPs.splice(hostIndex, 1);
	}

	var list = [];
	async.each(targetIPs, function(ipAddr, next) {
        checkPort(port, ipAddr, function(error, status, host, port){
			//console.log("neighbor found: ", host, port, status);
            if(status == "open"){
				list.push(host);
            }
            next();
        });       
    }, function(err) {
		callback(err, list);
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
* @abstract Obtains object containing network adapters while filtering
* local & loopback interfaces
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
 * @return Array host's ipv4 address
 */
function getHostIPv4Addresses(callback) {
	var addresses = [];
	var interfaces = getHostInterfaces();

	for (var i in interfaces) {
		addresses.push(interfaces[i].properties.address);
	}

	return typeof callback === "function" ? callback(null, addresses) : addresses;
}
 






















