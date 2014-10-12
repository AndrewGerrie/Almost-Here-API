

var newrelic = require('newrelic');
var express = require('express')
  , mongoskin = require('mongoskin')
  , bodyParser = require('body-parser')

var hash = '<<>>';

var app = express()
app.use(bodyParser())

var db = mongoskin.db('<<>>', {safe:true});

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

app.get('/', function(req, res, next) {
  res.send('please select a collection, e.g., /collections/messages')
})

app.get('/collections/:collectionName', function(req, res, next) {

  req.collection.find({} ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
    if (e) return next(e)
    res.send(results)
  })
})

app.get('/setCollections/:collectionName', function(req, res, next) {

  if(req.headers.securehash === hash){
    console.log('got in')
    req.collection.insert({longitude:req.query.longitude,latitude:req.query.latitude}, {lat:req.query.longitude,latitude:req.query.latitude}, function(e, results){
    if (e) return next(e)
    res.send(results[0]._id)
  });
  }else{
    res.send("it doesn't look you're meant to be able to do that")
  }
  
})

app.get('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send(result)
  })

})


app.get('/updateCollections/:collectionName/:id', function(req, res, next) {

if(req.headers.securehash === hash){
    req.collection.updateById(req.params.id, {longitude:req.query.longitude,latitude:req.query.latitude}, {safe:true, multi:false}, function(e, result){
      if (e) return next(e)
      res.send((result===1)?{msg:'success'}:{msg:'error'})
    })
   }else{
     res.send("it doesn't look you're meant to be able to do that")
   } 
})

app.del('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
})

app.listen(process.env.PORT || 3000)
