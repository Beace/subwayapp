var express = require('express');
var app = express();

var mongo = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/subway';

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("X-Powered-By",' 3.2.1')
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/api/all',function(req,res){
	mongo.connect(url, function(err,db) {
		if(err){
			throw err;
		}
		db.collection('subwaydataset').find().toArray(function(err, result) {
			if(err) {
				throw err;
			}
			res.send(result);
		})
	})
	
});
app.get('/api/list/:id',function(req,res){
	console.log(req.params.id);
	var id = req.params.id;
	mongo.connect(url, function(err,db) {
		if(err){
			throw err;
		}
		db.collection('subwaydataset').find({"id":parseInt(id)}).toArray(function(err, result) {
			if(err) {
				throw err;
			}
			res.send(result);
		})
	})
})
app.post('/api/user',function(req,res){
 
	var username = req.query.username,
		password = req.query.password;

	mongo.connect(url, function(err,db) {
		if(err){
			throw err;
		}
		db.collection('admin').find({"username":username,"password":password}).toArray(function(err, result) {
			if(err) {
				throw err;	
			}
			if(result.length) {
				res.send({
					msg : true
				});
			}else{
				res.send({
					msg : false
				});
			}
			
		})
	})
});
var insertDocuments = function(opts, db, callback) {
	var collection = db.collection('admin');
	collection.insert(
		{
			username:opts.username,
			password:opts.password,
			email:opts.email
		}
	,function(err,result) {
		if(err) throw err;
		console.log('插入一条数据');
		console.log(result);
		callback(result);
	})
} 
app.post('/api/admin', function(req,res) {
	mongo.connect(url,function(err,db) {
		var username = req.query.username,
			password = req.query.password,
			email    = req.query.email;
		var opts = {username,password,email};
		insertDocuments(opts, db,function(){
			res.send({
				result:{
					ok : 1,
					n : 1
				}
			});
			db.close();
		})
	})

})
app.listen(3000,function(){
	console.log("app listening on port 3000...");
})