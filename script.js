/* CONFIG */
const TMDB_KEY = "bb6f3e486fbce89586745ded69c13681";
const MASTER_KEY = "$2a$10$gYn6RI7zmyY4F2EVTo1oOuoMmPmi9SxaNVNm1Y4.XJQrRFX8ZIKnS";
const MOVIES_URL = "https://api.jsonbin.io/v3/b/6981d78f43b1c97be961f419/latest";

let movies = [];

/* TOPBAR – CHOWA SIĘ PRZY SCROLLU, WRACA PO NAJECHANIU */
let lastScroll = 0;
const topbar = document.querySelector(".topbar");

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    if (current > lastScroll && current > 80) {
        topbar.classList.add("hidden");
    } else {
        topbar.classList.remove("hidden");
    }

    lastScroll = current;
});

/* Kliknięcie TvSuper przewija do góry i resetuje kategorie */
document.querySelector(".logo").onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderAllCategories();
};

/* TMDB FETCH */
async function fetchTMDB(title) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results?.[0] || null;
}

/* LOAD MOVIES */
async function loadMovies() {
    const res = await fetch(MOVIES_URL, { headers: { "X-Master-Key": MASTER_KEY }});
    const data = await res.json();
    movies = data.record;

    for (let movie of movies) {
        const tmdb = await fetchTMDB(movie.titleEn || movie.title);
        if (tmdb) {
            movie.poster = "https://image.tmdb.org/t/p/w500" + tmdb.poster_path;
            movie.backdrop = "https://image.tmdb.org/t/p/original" + tmdb.backdrop_path;
            movie.rating = tmdb.vote_average;
            movie.year = tmdb.release_date?.slice(0, 4);
            movie.genres = tmdb.genre_ids;
            movie.description = tmdb.overview;
            movie.popularity = tmdb.popularity;
        }
    }

    renderAllCategories();
}

/* CATEGORY BUILDER */
function addCategory(name, list, container) {
    const section = document.createElement("div");
    section.className = "category";

    section.innerHTML = `<h2>${name}</h2>`;

    /* DUŻY FILM POD TYTUŁEM — ALE NIE DLA "Losowe" */
    if (name !== "Losowe" && list[0]) {
        const big = document.createElement("img");
        big.className = "featured";
        big.src = list[0].backdrop;
        big.onclick = () => openMovie(movies.indexOf(list[0]));
        section.appendChild(big);
    }

    const grid = document.createElement("div");
    grid.className = "movie-grid";

    list.forEach(movie => {
        const id = movies.indexOf(movie);
        const div = document.createElement("div");
        div.className = "movie fade-in";
        div.innerHTML = `
            <img src="${movie.poster}">
            <div class="info blur-bg">
                <p><strong>${movie.title}</strong></p>
                <p class="rating">⭐ ${movie.rating}</p>
            </div>
        `;
        div.onclick = () => openMovie(id);
        grid.appendChild(div);
    });

    section.appendChild(grid);
    container.appendChild(section);
}

/* RANDOM */
function randomMovies(count = 10) {
    return [...movies].sort(() => Math.random() - 0.5).slice(0, count);
}

/* RENDER CATEGORIES — PRZEPLATANE */
function renderAllCategories() {
    const content = document.getElementById("content");
    content.innerHTML = "";

    addCategory("Polecane", randomMovies(), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Najwyżej oceniane", [...movies].sort((a,b)=>b.rating-a.rating).slice(0,10), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Najniżej oceniane", [...movies].sort((a,b)=>a.rating-b.rating).slice(0,10), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Komedia", movies.filter(m=>m.genres?.includes(35)), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Animacja", movies.filter(m=>m.genres?.includes(16)), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Akcja", movies.filter(m=>m.genres?.includes(28)), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Sci‑Fi", movies.filter(m=>m.genres?.includes(878)), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Najnowszy film", [...movies].sort((a,b)=>b.year-a.year).slice(0,10), content);
    addCategory("Losowe", randomMovies(), content);

    addCategory("Dopiero dodane", [...movies].reverse().slice(0,10), content);
}

/* OPEN MOVIE */
function openMovie(id) {
    window.location.href = "film.html?id=" + id;
}

/* SEARCH — NAJBLIŻSZE DOPASOWANIE JEST WIĘKSZE */
document.getElementById("searchInput").addEventListener("input", e => {
    const filter = e.target.value.toLowerCase();
    const filtered = movies.filter(m => m.title.toLowerCase().includes(filter));

    const content = document.getElementById("content");
    content.innerHTML = `<h2>Wyniki wyszukiwania</h2>`;

    const grid = document.createElement("div");
    grid.className = "movie-grid";

    filtered.forEach((movie, index) => {
        const id = movies.indexOf(movie);
        const div = document.createElement("div");

        div.className = index === 0 ? "movie search-big fade-in" : "movie fade-in";

        div.innerHTML = `
            <img src="${movie.poster}">
            <div class="info blur-bg">
                <p><strong>${movie.title}</strong></p>
                <p class="rating">⭐ ${movie.rating}</p>
            </div>
        `;
        div.onclick = () => openMovie(id);
        grid.appendChild(div);
    });

    content.appendChild(grid);
});

loadMovies();
