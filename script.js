
const API_KEY = "";
const news = [];
const bookmarkedArticles = [];
let page = 1;
const prevPageBtn = document.getElementById("prev-page-button");
const nextPageBtn = document.getElementById("next-page-button");

const formEl = document.getElementById("search-bar");
const searchEl = document.getElementById("search");
const subjectEl = document.getElementById("subject");
const searchResultsEl = document.getElementById("searchResults");
const bookmarkedArticlesEl = document.getElementById("bookmarkedArticles");
const pageEl = document.getElementById("page-count");
const titleEl = document.getElementById("title");

formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = modifyInput(searchEl.value.trim());
    if (query) {
      // Check if data with key 'news-{query} exists in locale storage before getting data.
     const queryNews = localStorage.getItem(`news-${query}`)
     if (queryNews === null) {
       getData(query);
     } else {
      renderArticles(JSON.parse(queryNews), page)
     }
        
        searchEl.value = "";
    }
    subjectEl.textContent = `Search results for "${capitalizeFirstLetter(query)}"`;
})
//remove spaces and replace with _ in input
function modifyInput(string) {
  modifiedString = string.toLowerCase();
  return modifiedString.replace(/\s+/g, "_");
}

//capitalize first letter to show proper title for search
function capitalizeFirstLetter(string) {
  return (string.charAt(0).toUpperCase() + string.slice(1)).replace(/_/g, " ");
}

//get data from api and store it in local storage
async function getData(query) {
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&apiKey=${API_KEY}`);

    if (!response.ok) {
      throw new Error(data.message);
    }
    const data = await response.json();
    const news = data.articles;

    news.forEach((article) => {
      article.review = "";
      article.bookmarked = false;
      article.newId = news.indexOf(article)+`-${query}`;
    });
    
    localStorage.setItem("news", JSON.stringify(news));
    
    localStorage.setItem(`news-${query}`, JSON.stringify(news));

    // future feature to save all news to local storage in one key-value pair
    let storedSavedNews = localStorage.getItem('savedNews');
    let savedNews = JSON.parse(storedSavedNews);
    if (savedNews === null) {
      savedNews = [];
    }
    const index = savedNews.findIndex(obj => Object.keys(obj)[0] === query);
    if (index !== -1) {
      savedNews[index][query] = news;
    } else {
        savedNews.push({[query]: news});
    }
    localStorage.setItem("savedNews", JSON.stringify(savedNews));
    
    if (localStorage.getItem("bookmarkedArticles") === null) {
      localStorage.setItem("bookmarkedArticles", JSON.stringify([]));
    };
    if (news) {
      renderArticles(news, page);
      renderBookmarkedArticles(bookmarkedArticles);
    }
  } catch (error) {
    console.log(error);
    console.log("the local storage is empty");
  }
}

//get top headlines from api and store it in local storage to load in default before search
async function getHeadlines() {
  try {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
    if (!response.ok) {
      throw new Error(data.message);
    }
    const data = await response.json();
    const headlinesNews = data.articles;
    headlinesNews.forEach((article) => {
      article.review = "";
      article.bookmarked = false;
      article.newId = headlinesNews.indexOf(article);
    })
    localStorage.setItem("news", JSON.stringify(headlinesNews));
    localStorage.setItem("bookmarkedArticles", JSON.stringify([]));
    renderArticles(headlinesNews, page);
  } catch (error) {
    console.log(error);
  }
}

titleEl.addEventListener("click", () => {
  getHeadlines();
})

//check local storage and render articles
function checkLS() {
  const articles = JSON.parse(localStorage.getItem("news")); 
  const bookmarkedArticles = JSON.parse(localStorage.getItem("bookmarkedArticles"));
  const headlinesNews = JSON.parse(localStorage.getItem("headlinesNews"));
if (articles || bookmarkedArticles) {	
     renderArticles(articles, page);
    renderBookmarkedArticles(bookmarkedArticles);
  }else{
    if (!headlinesNews) {
      getHeadlines();
    }else {
      renderArticles(headlinesNews, page); 
    }
      
  }
}



checkLS()

//render articles function by creating article elements
function renderArticles(articles, page) {
    searchResultsEl.innerHTML = "";
    const startIndex = (page - 1) * 12;
    const endIndex = page * 12;
    if (!articles) {
      console.log("the local storage is empty. No news to show.");
    }
    // slice articles to show 12 per page
    const slicedArticles = articles.slice(startIndex, endIndex);
    slicedArticles.forEach((article) => {
        const articleEl = document.createElement("article");
        articleEl.classList.add("article");
        let articleImage;
        if (!article.urlToImage) {
         articleImage = "./default.jpg";
        }else{
           articleImage = article.urlToImage;
        };
        index = articles.indexOf(article);
        const bookmarkId = (article.newId + 1).toString();
        articleEl.innerHTML = `
        <img src="${articleImage}" alt="${article.title}">    
        <h2>${article.title}</h2>
            <p>${article.content}</p>
            <a href="${article.url}" target="_blank">Read more</a>
            <input type="checkbox" id="bookmark_${bookmarkId}" class="bookmark" name="bookmark" value="${article.bookmarked}">
            <label for="bookmark_${bookmarkId}">Bookmark</label>
            <textarea name="review" class="review" id="review_${bookmarkId}" cols="30" rows="10">${article.review}</textarea>
        `;
        const bookmarkedEl = articleEl.querySelector(`#bookmark_${bookmarkId}`);
      //handle bookmarking articles   
        bookmarkedEl.addEventListener("change", () => {
            if (bookmarkedEl.checked) {
              const bookmarkedArticles = JSON.parse(localStorage.getItem("bookmarkedArticles")); 
             article.bookmarked = true;
              if (!bookmarkedArticles.find((a) => a.newId === article.newId)) {
                bookmarkedEl.checked = true;
                const bookmarkedId = (article.newId + 1).toString();
                bookmarkedEl.id = `bookmarked_${bookmarkedId}`;
                const labelEl = articleEl.getElementsByTagName("label")[0];  
                labelEl.innerHTML = "Bookmarked";
                labelEl.classList.add("bookmarked");
                labelEl.setAttribute("for", `bookmarked_${bookmarkedId}`);
                bookmarkedArticles.push(article);
                localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles));
                searchResultsEl.removeChild(articleEl);
                renderBookmarkedArticles();
              }else{
                console.log("article already bookmarked");
            }
           }
        })
        const reviewEl = articleEl.querySelector(`#review_${bookmarkId}`);
        //handle reviewing articles
            reviewEl.addEventListener("change", () => {
                article.review = reviewEl.value;
                const index = articles.findIndex((a) => a.newId === article.newId);
                articles.splice(index, 1, article); 
               localStorage.setItem("news", JSON.stringify(articles));
               if (bookmarkedArticles.find((a) => a.newId === article.newId)) {
                 const index = bookmarkedArticles.findIndex((a) => a.newId === article.newId);
                 bookmarkedArticles.splice(index, 1, article);
                 localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles));
               } 
            })
        
        searchResultsEl.appendChild(articleEl);
    });
    
}

//render bookmarked articles
function renderBookmarkedArticles() {
  const bookmarkedArticles = JSON.parse(localStorage.getItem("bookmarkedArticles"));
  const startIndex = (page - 1) * 12;
  const endIndex = page * 12;
   if (bookmarkedArticles === null) {
      localStorage.setItem("bookmarkedArticles", JSON.stringify([]));
      console.log("No Bookmarked Articles added yet.");
    }
  const slicedBookmarked = bookmarkedArticles.slice(startIndex, endIndex);
   
  slicedBookmarked.forEach((Barticle) => {
    const bookmarkedId = (Barticle.newId + 1).toString();
    const BarticleEl = document.createElement("article");
    BarticleEl.classList.add("article");
    const BarticleBtnEl = document.createElement("button");
    BarticleBtnEl.textContent = "X";
    BarticleBtnEl.classList.add("remove");
    BarticleEl.appendChild(BarticleBtnEl);
    const BarticleImg = document.createElement("img");
    BarticleImg.src = Barticle.urlToImage;
    BarticleImg.alt = Barticle.title;
    BarticleEl.appendChild(BarticleImg);
    const BarticleTitle = document.createElement("h2");
    BarticleTitle.textContent = Barticle.title;
    BarticleEl.appendChild(BarticleTitle);
    const BarticleContent = document.createElement("p");
    BarticleContent.textContent = Barticle.content;
    BarticleEl.appendChild(BarticleContent);
    const BarticleLink = document.createElement("a");
    BarticleLink.href = Barticle.url;
    BarticleLink.textContent = "Read more";
    BarticleLink.target = "_blank";
    BarticleEl.appendChild(BarticleLink);
    const BarticleBookmark = document.createElement("input");
    BarticleBookmark.type = "checkbox";
    BarticleBookmark.checked = Barticle.bookmarked;
    BarticleBookmark.attributes = "disabled = true";
    BarticleBookmark.id = `bookmarked_${bookmarkedId}`;
    BarticleEl.appendChild(BarticleBookmark);
    const BarticleBookmarkLabel = document.createElement("label");
    BarticleBookmarkLabel.for = `bookmarked_${bookmarkedId}`;
    BarticleBookmarkLabel.textContent = "Bookmarked";
    BarticleEl.appendChild(BarticleBookmarkLabel);
    const BarticleReview = document.createElement("textarea");
    BarticleReview.id = `Breview_${bookmarkedId}`;
    BarticleReview.classList.add("review");
    BarticleReview.name = "review";
    BarticleReview.value = Barticle.review;
    BarticleReview.cols = "30";
    BarticleReview.rows = "10";
    BarticleEl.appendChild(BarticleReview);
    bookmarkedArticlesEl.appendChild(BarticleEl);
    const bookmarkedEl = BarticleEl.querySelector(`#bookmarked_${bookmarkedId}`);
bookmarkedEl.addEventListener("change", () => {
  if (!bookmarkedEl.checked) {
    console.log(Barticle);
    Barticle.bookmarked = false;
    const index = bookmarkedArticles.findIndex((article) => article.newId === Barticle.newId);
    bookmarkedArticles.splice(index, 1);
    localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles));
    bookmarkedArticlesEl.removeChild(BarticleEl);
  }
})
   //handle removing bookmarked articles 
   const BarticleBtn = BarticleEl.querySelector("button");
    BarticleBtn.addEventListener("click", () => {
      const index = bookmarkedArticles.findIndex((article) => article.newId === Barticle.newId);
      bookmarkedArticles.splice(index, 1);
      localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles));
      bookmarkedArticlesEl.removeChild(BarticleEl);
    });
    //handle reviewing bookmarked articles
    const reviewEl = BarticleEl.querySelector(`#Breview_${bookmarkedId}`);

    reviewEl.addEventListener("change", () => {
      Barticle.review = reviewEl.value;
        const index = bookmarkedArticles.findIndex((a) => a.newId === Barticle.newId);
        bookmarkedArticles.splice(index, 1, Barticle);
        if (bookmarkedArticles.find((a) => a.newId === Barticle.newId)) {
          const index = bookmarkedArticles.findIndex((a) => a.newId === Barticle.newId);
          bookmarkedArticles.splice(index, 1, Barticle);
          localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles));
        } 
    })
  });
}


//handle pagination 
nextPageBtn.addEventListener("click", () => {
  page++;
   const articles = JSON.parse(localStorage.getItem("news"));
  renderArticles(articles, page);
  pageEl.innerHTML = `Page ${page}`;
  
});

prevPageBtn.addEventListener("click", () => {
  if (page > 1) {
    page--;
    const articles = JSON.parse(localStorage.getItem("news"));
    renderArticles(articles, page);
    pageEl.innerHTML = `Page ${page}`;
  }
});
