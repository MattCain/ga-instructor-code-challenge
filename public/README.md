## WDI Instructor Code Challenge - Framework usage

I chose to use angular.js as the MVC framework for rewriting the omdb search app.

The benefits of using angular are:

- You will write a lot less code and get things done a lot more quickly, as many of the common problems that you'd otherwise have to spend time writing helper functions and utility code to handle, are already handled for you. To name a few:
 - Routing and views, allowing you to show the right application state depending on the URL.
 - Templating rather than having to use code to explicitly put data into the DOM in the right places.
 - Better ajax functions provided, no need to touch XHR objects yourself.
- Readabilty. Writing so much less code makes it much easier to read it!
- Modularity. Angular makes it easy to split your code into re-usable chunks, making your codebase a lot more organized.
- Testability. There are lots of tools and frameworks for unit testing your angular code. Also made easier by the modularity!
- Big community. There's lots of 3rd party components and loads of questions covering the common issues you might run into on StackOverflow.

The additional challenges involved include:

- Steep learning curve. It can take a while to get to grips with angular and some of it's concepts, longer than most other front-end MVC frameworks.
- The built in router is not very good, you're better off using the 3rd party ui-router.
- Searchability. Search engine crawlers do not handle front-end MVC frameworks very well, which can result in poor search rankings if you dont' take special measures!
