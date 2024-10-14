// The base URL
const baseURL = "http://localhost:3000/films";

// Function to display movie details with batched DOM updates
function displayMovieDetails(movie) {
    const movieHTML = `
        <img id="poster" src="${movie.poster}" alt="Movie Poster" />
        <h1 id="title">${movie.title || "[MOVIE TITLE]"}</h1>
        <p id="runtime">Runtime: ${movie.runtime} minutes</p>
        <p id="showtime">Showtime: ${movie.showtime || "SHOWTIME"}</p>
        <p id="ticket-num">Available Tickets: ${movie.capacity - movie.tickets_sold > 0 ? movie.capacity - movie.tickets_sold : 0}</p>
    `;

    document.getElementById('movie-details').innerHTML = movieHTML;

    // Update the buy ticket button
    const buyButton = document.getElementById('buy-ticket');
    buyButton.setAttribute('data-movie-id', movie.id);
    buyButton.textContent = movie.capacity - movie.tickets_sold > 0 ? "Buy Ticket" : "Sold Out";
}

// Function to fetch all movies and render the list
function getAllMovies() {
    fetch(baseURL)
        .then(response => response.json())
        .then(movies => {
            renderMovieList(movies);
            displayMovieDetails(movies[0]); // Display the first movie's details
        })
        .catch(error => console.log("Error fetching movies:", error));
}

// Function to render movie list with event delegation
function renderMovieList(movies) {
    const filmList = document.getElementById('films');
    filmList.innerHTML = ''; // Clear any placeholder

    movies.forEach(movie => {
        const filmItem = document.createElement('li');
        filmItem.textContent = movie.title;
        filmItem.classList.add('film', 'item');
        filmItem.setAttribute('data-movie-id', movie.id); // Store movie ID in the element

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            deleteMovie(movie.id);
            filmItem.remove(); // Remove from the list
        });

        filmItem.appendChild(deleteButton);
        filmList.appendChild(filmItem);
    });

    // Event delegation for displaying movie details
    filmList.addEventListener('click', (event) => {
        const movieId = event.target.getAttribute('data-movie-id');
        if (movieId) {
            const selectedMovie = movies.find(movie => movie.id == movieId);
            displayMovieDetails(selectedMovie);
        }
    });
}

// Function to handle buying tickets without redundant fetching
function buyTicket(movie) {
    const ticketsAvailable = movie.capacity - movie.tickets_sold;

    if (ticketsAvailable > 0) {
        movie.tickets_sold += 1;
        const updatedTicketsAvailable = movie.capacity - movie.tickets_sold;

        // Update available tickets in the UI
        document.getElementById('ticket-num').textContent = updatedTicketsAvailable;

        // Update the server with the new tickets_sold value
        fetch(`${baseURL}/${movie.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tickets_sold: movie.tickets_sold })
        })
            .then(response => response.json())
            .catch(error => console.log("Error updating tickets:", error));

        // Change button text if sold out
        if (updatedTicketsAvailable === 0) {
            document.getElementById('buy-ticket').textContent = "Sold Out";
        }
    }
}

// Event listener for the buy ticket button
document.getElementById('buy-ticket').addEventListener('click', (event) => {
    const movieId = event.target.getAttribute('data-movie-id');
    if (movieId) {
        // Find the movie object from the list (assuming it's already fetched)
        fetch(`${baseURL}/${movieId}`)
            .then(response => response.json())
            .then(movie => buyTicket(movie))
            .catch(error => console.log('Error fetching movie:', error));
    }
});

// Function to delete a movie from the server
function deleteMovie(id) {
    fetch(`${baseURL}/${id}`, {
        method: "DELETE"
    })
        .then(() => console.log("Movie deleted successfully"))
        .catch(error => console.log("Error deleting movie:", error));
}

// Load the first movie's details and the list of all movies when the page loads
window.addEventListener('DOMContentLoaded', () => {
    getAllMovies();
});
