var express = require("express");
var mongo = require('mongodb').MongoClient;
var cors = require("cors");
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
app.get("/search/*", function(request, response){
	parametri.query = request.url.substring(request.url.lastIndexOf("/")+1).split("?")[0];
	var subster = request.url.split("?")[1];
	parametri.offset = subster.split("=")[1];
	
	googleSearch.build({
	  q: parametri.query,
	  start: 0,
	  fileType: "png%2C+jpg",
	  num: 10, // Number of search results to return between 1 and 10, inclusive 
	}, function(error, searchResult) {
	  console.log(searchResult);
	  response.send(searchResult);
	});
});

app.listen(process.env.PORT || 5000);

