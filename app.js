const fs = require('fs');
const request = require('sync-request');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/image-net";//test
const nodeList = [];
const idWordMap = getWordMap();
fd = fs.openSync("./data-dump2.json", 'w');
class ListNode{
	constructor(id, name, size){
		this._id = ListNode.count++;
		this.id = id;
		this.name = name;
		this.size= size;
	}
}
ListNode.count = 0;
function getWordMap(){
	let data = fs.readFileSync('./idWordMap.txt', "utf8");
	let result = {};
	let key, value;
	data = data.split("\n");
	for(let i=0; i<data.length; i++){
		[key, value] = data[i].split('\t');
		result[key] = value;
	}
	return result;
}
function appendNode(id, prefix) {
	let children, name, size;
	size = request('GET','http://www.image-net.org/api/text/wordnet.structure.hyponym?wnid='+id+'&full=1', {retry: true});
	size = size.body.toString('utf-8').split('\r\n-');
	size = size.length-1;
	if(id in idWordMap){
		name = idWordMap[id];
	}else{
		name = request('GET','http://www.image-net.org/api/text/wordnet.synset.getwords?wnid='+id, {retry: true});
		name = name.body.toString('utf-8').replace(/\n/g, ',').replace(/,$/, '');
	}
	if(prefix !== "")
		name = prefix+" > "+name;
	let node = new ListNode(id, name, size);
	nodeList.push(node);
	fs.writeSync(fd, JSON.stringify(node, null, 1), null, 'utf8');
	console.log(node);
	if(size>0){
		var str = request('GET', 'http://www.image-net.org/api/text/wordnet.structure.hyponym?wnid='+node.id, {retry: true});
		str = str.body.toString('utf-8');
		children = str.split('\r\n-');
		children.shift();//removing the current node i.e, parent.
		children[children.length-1] = children[children.length-1].replace(/\r\n/, '');
		for(let i=0; i<children.length; i++){
			appendNode(children[i], name);
		}
		return;
	}
	return;
}
appendNode("nfall11", "");
console.log(nodeList.length);
fs.closeSync(fd);
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("connected to image-net database!");
  db.collection("wordnets").insertMany(nodeList, function(err, res){
  	if(err) throw err;
  	console.log("successfully inserted documents into wordnets collection");
  });
});