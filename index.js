var express = require('express');
var app = express();
var MovieDB = require('moviedb')(process.env.API_KEY);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var genres;
MovieDB.genreList(function(err, res) {
  if (err) {
    console.log('Unable to get list of genres.');
  }
  else {
    genres = res.genres;
    console.log('Successfully retrieved list of genres.');
  }
});

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/get-genres', function(request, response) {
  response.json(genres);
});

app.get('/discover-movies', function(request, response) {
  MovieDB.discoverMovie(request.query, function(err, res) {
    if (err) {
      console.log('Unable to search for movies.');
    }
    else {
      response.json(res);
    }
  });
});

app.get('/discover-tv-shows', function(request, response) {
  MovieDB.discoverTv(request.query, function(err, res) {
    if (err) {
      console.log('Unable to search for tv shows.');
    }
    else {
      response.json(res);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


