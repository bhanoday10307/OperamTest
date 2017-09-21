const http = require('http');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/image-net";
let root = { name: "ImageNet 2011 Fall Release", size: 32326, children: [], active: true};
function insertNode(node){
	let names = node.name.split('>').map((x) => { return x.trim(); });
	let current = root;
	let index;
	while((names.length>1) && (current.name === names[0])){
			names.shift();
			index = current.children.findIndex((obj)=> { return (obj.name === names[0]); });
			if(index>-1)
				current = current.children[index];
	}
	node.name = names[0];
	node.children = [];
	node.active = false;
	current.children.push(node);
}
MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	console.log("connected to image-net database!");
	let query = {};
    db.collection("wordnets").find(query).project({_id:0, id: 0}).sort({_id: 1}).toArray(function(err, result) {
		if (err) throw err;
		console.log("loaded "+result.length+" nodes from db");
		db.close();
		for(let i=1; i<result.length; i++){
			insertNode(result[i]);
		}
//		return root;
    });
});
var server = http.createServer(function(req, res){
	console.log('request was made: '+ req.url);
	if(req.url === "/tree.json"){
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(root));
	}else if(req.url === "/index.html" || req.url === "/"){
		res.writeHead(200, {'Content-Type': 'text/html'});
		let rs = fs.createReadStream('./index.html', "utf8" );
		rs.pipe(res);
	}else if(req.url === "/styles.css"){
		res.writeHead(200, {'Content-Type': 'text/css'});
		let rs = fs.createReadStream('./styles.css', "utf8" );
		rs.pipe(res);
	}
});
server.listen(3000, '127.0.0.1');
console.log("Listening on port 3000");