var app = angular.module("movieApp", ["ui.router"]);

app.config(['$stateProvider', '$urlMatcherFactoryProvider',
   function($stateProvider, $urlMatcherFactoryProvider) {

      // Allow trailing slashes
      $urlMatcherFactoryProvider.strictMode(false);

      // Set up our routes!
      $stateProvider
         .state("search", {
            url: "/search/:term",
            resolve: {
               results: function($http, $stateParams) {
                  return $http.get("https://www.omdbapi.com/?r=json&type=movie&s=" + $stateParams.term);
               }
            },
            templateUrl: "templates/results.html",
            controller: function($scope, results) {
               $scope.titleString = "Search Results";
               $scope.movies = results.data.Search;
            }
         })
         .state("movie", {
            url: "/movie/:imdbID",
            resolve: {
               movie: function($http, $stateParams) {
                  return $http.get("https://www.omdbapi.com/?r=json&plot=full&i=" + $stateParams.imdbID);
               },
               faves: function($http) {
                  return $http.get("/favorites");
               }
            },
            templateUrl: "templates/movie-details.html",
            controller: function($scope, $http, movie, faves) {
               $scope.movie = movie.data;

               // Whether this movie has been faved or not.
               $scope.faved = _.find(faves.data, function(fav) {
                  return fav.imdbID === movie.data.imdbID;
               });

               // function for favoriting a movie.
               $scope.favorite = function() {
                  $http.post("/favorites", {
                     Title: movie.data.Title,
                     Year: movie.data.Year, 
                     imdbID: movie.data.imdbID
                  });
                  $scope.faved = true;
               }
            }
         })
         .state("faves", {
            url: "/faves",
            resolve: {
               faves: function($http) {
                  return $http.get("/favorites");
               }
            },
            templateUrl: "templates/results.html",
            controller: function($scope, faves) {
               $scope.titleString = "My Favourites";
               $scope.movies = faves.data;
            }
         });
   }
]);

app.controller("movieAppController", function($scope) {
   // Show loading image while waiting for any dependencies to resolve
   $scope.$on('$stateChangeStart', function(event, toState) {
      if (toState.resolve) {
         $scope.showSpinner = true;
      }
   });
   $scope.$on('$stateChangeSuccess', function(event, toState) {
      if (toState.resolve) {
         $scope.showSpinner = false;
      }
   });

   // Change the route to perform a search when the search form is submitted.
   $scope.search = function(searchTerm) {
      window.location.hash = "/search/" + encodeURIComponent(searchTerm);
   }
});