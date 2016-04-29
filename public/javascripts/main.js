(function() {
  'use strict';

  angular
    .module('app', ['rzModule'])
    .controller('MovieFilterController', MovieFilterController)
    .directive('moviesDirective', moviesDirective)
    .directive('tvShowsDirective', tvShowsDirective)
    .directive('genresDirective', genresDirective);

  MovieFilterController.$inject = ['$http', '$httpParamSerializer', '$interval'];

  function MovieFilterController($http, $httpParamSerializer, $interval) {
    var vm = this;

    var TICKS_PER_SEC = 20;
    var RESET_TIME_IN_MS = 200;
    var CURRENT_YEAR = new Date().getFullYear();
    vm.releaseDateLTE = CURRENT_YEAR + 1;
    vm.firstAirDateLTE = CURRENT_YEAR + 1;
    vm.category = 'movies';

    vm.movieQuery = {
      'vote_average.gte': 5.5,
      'vote_average.lte': 10.0,
      'vote_count.gte': 1000,
      'vote_count.lte': 10000,
      'release_date.gte': CURRENT_YEAR - 15,
      'release_date.lte': vm.releaseDateLTE,
      'with_genres': ''
    };

    vm.tvShowQuery = {
      'vote_average.gte': 5.5,
      'vote_average.lte': 10.0,
      'vote_count.gte': 40,
      'vote_count.lte': 2000,
      'first_air_date.gte': CURRENT_YEAR - 20,
      'first_air_date.lte': vm.firstAirDateLTE,
      'with_genres': ''
    };

    vm.timer = 0;
    vm.getYear = getYear;
    vm.resetCountdown = resetCountdown;
    vm.results = {};
    vm.totalResults = 0;

    getGenres();
    setupSliderOptions();
    countdown();

    function getGenres() {
      $http.get('/get-genres').success(function(response) {
        var genreIds = _.map(response, 'id');
        var genreObject = _.zipObject(genreIds, response);
        vm.genres = _.sortBy(genreObject, 'name');
      }).error(function(response) {
        console.log(response);
      });
    }

    function filter() {
      if (vm.category === 'movies') {
        filterMovies();
      }
      else if (vm.category === 'tvShows') {
        filterTvShows();
      }
    }

    function filterMovies() {
      var selectedGenres = _.pickBy(vm.genres, function(value, key) {
        return value.selected;
      });
      var genreIds = _.map(selectedGenres, 'id').join('|');
      vm.movieQuery['with_genres'] = genreIds;
      vm.movieQuery['release_date.lte'] = vm.releaseDateLTE + 1;
      var query = $httpParamSerializer(vm.movieQuery);
      $http.get('/discover-movies?' + query).success(function(response) {
        console.log(response);
        console.log($httpParamSerializer(vm.movieQuery));
        vm.results = response.results;
        vm.totalResults = response.total_results;
      }).error(function(response) {
        console.log(response);
      });
    }

    function filterTvShows() {
      var selectedGenres = _.pickBy(vm.genres, function(value, key) {
        return value.selected;
      });
      var genreIds = _.map(selectedGenres, 'id').join('|');
      vm.tvShowQuery['with_genres'] = genreIds;
      vm.tvShowQuery['first_air_date.lte'] = vm.firstAirDateLTE + 1;
      var query = $httpParamSerializer(vm.tvShowQuery);
      $http.get('/discover-tv-shows?' + query).success(function(response) {
        console.log(response);
        console.log($httpParamSerializer(vm.tvShowQuery));
        vm.results = response.results;
        vm.totalResults = response.total_results;
        console.log(response.results);
      }).error(function(response) {
        console.log(response);
      });
    }

    function countdown() {
      resetCountdown();
      $interval(function() {
        if (vm.timer === 0) {
          filter();
        }
        vm.timer -= 1000 / TICKS_PER_SEC;
      }, 1000 / TICKS_PER_SEC, 0);
    }

    function resetCountdown() {
      vm.timer = RESET_TIME_IN_MS;
    }

    function getYear(date) {
      return new Date(date).getFullYear() || '';
    }

    function setupSliderOptions() {
      vm.voteAverageOptions = {
        floor: 0,
        ceil: 10,
        step: 0.1,
        precision: 1,
        onChange: vm.resetCountdown,
        translate: function(value, sliderId, label) {
          switch (label) {
            case 'model':
              return '<b>Min Score:</b> ' + value;
            case 'high':
              return '<b>Max Score:</b> ' + value;
            default:
              return value;
          }
        }
      };
      vm.movieVoteCountOptions = {
        floor: 0,
        ceil: 10000,
        onChange: vm.resetCountdown,
        translate: function(value, sliderId, label) {
          switch (label) {
            case 'model':
              return '<b>Min Votes:</b> ' + value;
            case 'high':
              return '<b>Max Votes:</b> ' + value;
            default:
              return value;
          }
        }
      };
      vm.tvShowVoteCountOptions = {
        floor: 0,
        ceil: 2000,
        onChange: vm.resetCountdown,
        translate: function(value, sliderId, label) {
          switch (label) {
            case 'model':
              return '<b>Min Votes:</b> ' + value;
            case 'high':
              return '<b>Max Votes:</b> ' + value;
            default:
              return value;
          }
        }
      };
      vm.releaseDateOptions = {
        floor: 1874,
        ceil: CURRENT_YEAR + 1,
        onChange: vm.resetCountdown,
        translate: function(value, sliderId, label) {
          switch (label) {
            case 'model':
              return '<b>Min Release Date:</b> ' + value;
            case 'high':
              return '<b>Max Release Date:</b> ' + value;
            default:
              return value;
          }
        }
      };
      vm.airDateOptions = {
        floor: 1914,
        ceil: CURRENT_YEAR + 1,
        onChange: vm.resetCountdown,
        translate: function(value, sliderId, label) {
          switch (label) {
            case 'model':
              return '<b>Min First Air Date:</b> ' + value;
            case 'high':
              return '<b>Max First Air Date:</b> ' + value;
            default:
              return value;
          }
        }
      };
    }

  }

  function moviesDirective() {
    return {
      templateUrl: 'movies.html'
    };
  }

  function tvShowsDirective() {
    return {
      templateUrl: 'tv-shows.html'
    };
  }

  function genresDirective() {
    return {
      templateUrl: 'genres.html'
    };
  }


})();