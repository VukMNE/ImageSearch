var express = require("express");
var mongo = require('mongodb').MongoClient;
var cors = require("cors");
var strftime = require("strftime");
require("dotenv").config(); //ovo je neophodno da bih mogao sakriti varijable unutar stringa
var url =`mongodb://${process.env.USERNAME}:${process.env.PASSWOURD}@ds125914.mlab.com:25914/urls`;
var apiKey = process.env.APIKEY;
var idEngine = process.env.ENGINEID;
var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: apiKey,
  cx: idEngine
});
var parametri = {
	query: "",
	offset: 0
}
var app = express();
app.use(cors());
app.use(express.static('./public'));
app.get("/search/*", function(request, response){
	parametri.query = request.url.substring(request.url.lastIndexOf("/")+1).split("?")[0];
	insertSearchQuery(parametri.query);
	var subster = request.url.split("?")[1];
	parametri.offset = subster.split("=")[1];
	
	googleSearch.build({
	  q: parametri.query,
	  start: parametri.offset*10,
	  fileType: "png%2C+jpg",
	  num: 10, // Number of search results to return between 1 and 10, inclusive 
	}, function(error, searchResult) {
		if(error){throw error;}
		var imagesFromSearch = searchResult.items;
		var imagesFinal =  imagesFromSearch.map(function(obj) { 
								   var img = {};
								   img.url = obj.pagemap.cse_image[0].src;
								   img.altText = obj.title;
								   img.pageUrl = obj["link"];
								   return img;
								});

		  console.log(imagesFinal);
		  response.send(imagesFinal);
	});
});

//list searches
app.get("/searches", function(request, response){
	mongo.connect(url, function(err, server) {
	  var db = server.db("urls");
	  var project = { _id: 0};
	  db.collection("searches").find().sort({_id: -1}).project(project).toArray(function(err, data) {
		if (err) {throw err;}
		response.send(data);
		server.close();
	  });
	});
});
app.listen(process.env.PORT || 5000);


function insertSearchQuery(queryString){
	mongo.connect(url, function(err, server) {
			if(err){throw err;}
			var db = server.db('urls');
			var collection = db.collection('searches');
			var timeStamp = new Date();
			var timeString = strftime('%d.%m.%Y %H:%M', timeStamp); //01.01.2018 17:30 format 
			var row = { 'queryWord':queryString, 'timeOfSearch':timeString};
			collection.insert(row, function(error,data){
					if(error){throw error;}
				});
			server.close();	
	});
}
