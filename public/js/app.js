/*
 * Main script for the omdb search app. No libraries or frameworks used, just vanilla JS.
*/

var omdbUrl = "https://www.omdbapi.com/?r=json",
   faves = [];
/*
 * Start by loading the favourites from the server
 * and populating the favourites list
*/
ajaxRequest("/favorites", "GET", function() {
   /* 
    * The response is JSON but in string format, it needs to be
    * parsed before we can use work with it like any other array or object
    * We can use the built in JSON object to do this.
    */
   faves = JSON.parse(this.responseText);

   populateResultsList(faves, "#favorites .list-group");
});

/*
 * Set up an event listener for when the search form is submitted.
*/
document.querySelector("#search-form").addEventListener("submit", function(ev) {

   var searchTerm = document.querySelector("#search-term").value,
      searchUrl = omdbUrl + "&type=movie&s=";
   
   // Show the loading "page" while we wait for the api request
   showPage("#loading");

   /*
    * Use the search term to make a request to the omdb api for search results
    * by concatenating it with the searchUrl
   */
   ajaxRequest(searchUrl + searchTerm, "GET", function() {
      
      var results = JSON.parse(this.responseText).Search,
         searchResultsPage = document.querySelector("#search-results"),
         resultList = searchResultsPage.querySelector(".list-group");

      /*
       * Populate the search results list with the data returned from the api
       * and then show the page.
      */
      populateResultsList(results, resultList);
      showPage(searchResultsPage);
   });

   // Prevent the form from submitting, which would cause a page refresh.
   ev.preventDefault();
});


/*
 * This is the function that will run when a user clicks a search result or a favorite.
*/
var resultClickHandler = function (ev) {

   /* 
    * We're listening for the event on the parent element, but we can get the exact result 
    * that was clicked with ev.target.
   */
   var clicked = ev.target,
      imdbID = clicked.getAttribute("data-imdbID"),
      movieDeetsUrl = omdbUrl + "&plot=full&i=";

   showPage("#loading");

   // Make an api request for the details of the specific movie that was clicked on.
   ajaxRequest(movieDeetsUrl + imdbID, "GET", function() {
      var movieDeets = JSON.parse(this.responseText);

      // Populate the movie details "page" with data.
      document.querySelector("#movie-poster").src = movieDeets.Poster;
      setElementContents("#movie-title", movieDeets.Title);
      setElementContents("#movie-year", movieDeets.Year);
      setElementContents("#movie-genre", movieDeets.Genre);
      setElementContents("#movie-actors", movieDeets.Actors);
      setElementContents("#movie-awards", movieDeets.Awards);
      setElementContents("#movie-runtime", movieDeets.Runtime);
      setElementContents("#movie-plot", movieDeets.Plot);

      var faveBtn = document.querySelector("#add-to-favorites")

      // Check if this movie has been favorited already. If yes, disable the button.
      if (isFavorited(imdbID)) {
         setElementContents(faveBtn, "Already favorited!");
         faveBtn.disabled = true;
      } else {
         setElementContents(faveBtn, "Add to favorites");
         /*
          * Store the id of the movie as a data-attribute so we can easily
          * rerieve it when the button is clicked.
         */
         faveBtn.setAttribute("data-imdbID", imdbID);
         faveBtn.disabled = false;
      }

      showPage("#movie-details");
   });

};

/*
 * You can't set an event handler on multiple elements at the same time in vanilla js,
 * you have to loop through them and set the event handler on each one.

 * You'll notice that the event handler is being set on the element that holds the results,
 * and not on the individual results themselves. This is because we frequently remove the
 * results and add new ones, and we'd have to re-set the event handlers on each one every time this happened.
 * It's more efficient to watch for the event on the parent instead. This is called event delegation.
*/
var listGroups = document.querySelectorAll(".list-group");

for (var i = 0; i < listGroups.length; i++) {
   listGroups[i].addEventListener("click", resultClickHandler);
}


/*
 * Listen for clicks on the "Add to favorites" button.
*/
document.querySelector("#add-to-favorites").addEventListener("click", function() {

   // Grab the data that we want to save to the server
   var imdbID = this.getAttribute("data-imdbID"),
      title = document.querySelector("#movie-title"),
      year = document.querySelector("#movie-year"),
      // Build the post data string */
      postData = "Title=" + title.innerHTML + "&Year="+ year.innerHTML +"&imdbID=" + imdbID;

   // Disable the button and change it's text to show that this movie is now favorited.
   setElementContents(this, "Favorited!");
   this.disabled = true;

   // Make a POSt request to the server to save the data.
   ajaxRequest("/favorites", "POST", postData, function() {
      faves = JSON.parse(this.responseText);

      populateResultsList(faves, "#favorites .list-group");
   });

});

/*
 * Show the favorites "page" when the "View Favorites" button is clicked.
*/
document.querySelector("#view-favorites").addEventListener("click", function() {
   showPage("#favorites");
});

/*
 * Set the contents of an HTML element. It's worth making a function to do this
 * as we want to allow the use of either an element or a selector. That way we
 * don't have to manually find the element first each time.
*/
function setElementContents(el, content) {
   if (typeof el === "string") {
      el = document.querySelector(el);
   }
   el.innerHTML = content;
}

/*
 * Check whether this movie has been favorited already.
 * We do this by looping through each favorite and checking if the
 * imdbID matches the one we are searching for.
*/
function isFavorited(imdbID) {
   for (var i = 0; i < faves.length; i++) {
      if (faves[i] && faves[i].imdbID === imdbID) {
         return true;
      }
   }
   return false;
};

/*
 * Hide all page elements and show the one being passed in.
*/
function showPage(pageToShow) {
   if (typeof pageToShow === "string") {
      pageToShow = document.querySelector(pageToShow);
   }

   var pages = document.querySelectorAll(".page");

   // Hide all the .page elements one by one.
   for (var i = 0; i < pages.length; i++) {
      pages[i].classList.add("hidden");
   }

   // Show the element passed in.
   pageToShow.classList.remove("hidden");
};

/*
 * Make an ajax request. Used for both api requests and making requests to our own server.
*/
function ajaxRequest(url, method, postData, callback) {

   /*
    * Make postData argument optional, so you don't have to pass "undefined" or "null"
    * for GET requests.
   */
   if (!callback && typeof postData === "function") {
      callback = postData;
   }

   /* Create an XHR object, this is the object that is used for making Ajax requests. */
   var xhr = new XMLHttpRequest();

   xhr.open(method, url);

   // If a callback was specified, set it to be fired once the request is finished.
   if (callback) {
      xhr.addEventListener("load", callback);
   }
   
   /*
    * If this is a POST request, set the content type to the type we want to use
    * 'application/x-www-form-urlencoded' lets us send serialised data like
    * this: name=matt&age=25&hello=world
   */
   if (method.toUpperCase() === "POST") {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(postData);
   } else {
      xhr.send()
   }
}

/*
 * Loop through the results array and create a list item for each result. Put these
 * list items into the destination element.
*/
function populateResultsList(results, destination) {
   // Allow either an element or a selector to be passed in as the destination
   if (typeof destination === "string") {
      destination = document.querySelector(destination);
   }

   // Empty the destination, otherwise we'll end up with old results still showing.
   setElementContents(destination, "");

   // If there were no results found, then show a "no results" message and exit the function.
   if (!results || results.length === 0) {
      setElementContents(destination, "<p>No results found</p>");
      return;
   }

   // Loop through the results.
   for (var i = 0; i < results.length; i++) {
      var movie = results[i],
         listItem = document.createElement("button");
      
      // Set the text of the element
      setElementContents(listItem, movie.Title +" ("+ movie.Year +")");

      /*
       * Set a data attribute on the result so we can easily retrieve it and load the
       * correct movie details when it's clicked.
      */
      listItem.setAttribute("data-imdbID", movie.imdbID);
      listItem.classList.add("list-group-item");
      // Put the list item into the detination element.
      destination.appendChild(listItem);
   }
}