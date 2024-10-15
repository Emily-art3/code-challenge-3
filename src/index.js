// The base URL
const baseURL = "http://localhost:3000/films";

// Global variable to store fetched movies
let movies = [];

// Function to display movie details
function displayMovieDetails(movie) {
    // Update movie poster
    const posterElement = document.getElementById('poster');
    if (posterElement) {
        posterElement.src = movie.poster;
        posterElement.alt = movie.title || "[MOVIE TITLE]";
    }

    // Update movie title
    const titleElement = document.getElementById('title');
    if (titleElement) {
        titleElement.textContent = movie.title || "[MOVIE TITLE]";
    }

    // Update movie runtime
    const runtimeElement = document.getElementById('runtime');
    if (runtimeElement) {
        runtimeElement.textContent = `Runtime: ${movie.runtime || "[RUNTIME]"} minutes`;
    }

    // Update movie showtime
    const showtimeElement = document.getElementById('showtime');
    if (showtimeElement) {
        showtimeElement.textContent = movie.showtime || "[SHOWTIME]";
    }

    // Update available tickets
    const ticketsElement = document.getElementById('ticket-num');
    if (ticketsElement) {
        const availableTickets = movie.capacity - movie.tickets_sold;
        ticketsElement.textContent = `Available Tickets: ${availableTickets > 0 ? availableTickets : 0}`;
    }

    // Update buy ticket button
    const buyButton = document.getElementById('buy-ticket');
    if (buyButton) {
        buyButton.setAttribute('data-movie-id', movie.id);
        buyButton.textContent = movie.capacity - movie.tickets_sold > 0 ? "Buy Ticket" : "Sold Out";
    }
}

// Function to fetch all movies and render the list
function getAllMovies() {
    fetch(baseURL)
        .then(response => response.json())
        .then(fetchedMovies => {
            movies = fetchedMovies; // Store the movies globally
            renderMovieList(movies);
            displayMovieDetails(movies[0]); // Display the first movie's details
        })
        .catch(error => console.log("Error fetching movies:", error));
}

// Function to render movie list with event delegation
function renderMovieList(movies) {
    const filmList = document.getElementById('films');
    filmList.innerHTML = ''; // Clear the list

    movies.forEach(movie => {
        const filmItem = document.createElement('li');
        filmItem.textContent = movie.title;
        filmItem.classList.add('film', 'item');
        filmItem.setAttribute('data-movie-id', movie.id);

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
        document.getElementById('ticket-num').textContent = `Available Tickets: ${updatedTicketsAvailable}`;

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
        const selectedMovie = movies.find(movie => movie.id == movieId);
        if (selectedMovie) {
            buyTicket(selectedMovie);
        }
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
