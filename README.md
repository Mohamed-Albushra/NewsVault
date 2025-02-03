NewsVault

A web application for searching, bookmarking, and saving news articles.

Features:

* Search for news articles by keyword or topic.
* Bookmark and save articles for later reading.
* View top headlines from around the world.
* Paginate through search results and bookmarked articles.
* Store articles locally for offline reading.

How it Works:

1. Users can search for news articles by entering a keyword or topic in the search bar.
2. The application fetches relevant articles from the [NewsAPI](https://newsapi.org/) and displays them on the page.
3. Users can bookmark articles by clicking the "Bookmark" checkbox.
4. Bookmarked articles are stored locally in the user's browser and can be viewed later.
5. The application also displays top headlines from around the world, which can be viewed by clicking on the title.

API Key:

To use the NewsVault application, you need to obtain an API key from the [News API](https://newsapi.org/) provider. Here's how to do it:

1. Go to the [News API](https://newsapi.org/) website and sign up for an account.
2. Once you've signed up, go to the API Keys page and generate a new API key.
3. Add your API key as a value for API_KEY variable.

Technical Details

* Built using HTML, CSS, and JavaScript
* Uses the News API for fetching news articles
* Stores data locally in the user's browser using LocalStorage
* Paginates through search results and bookmarked articles using JavaScript
