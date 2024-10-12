// The base URL
const baseURL = "http://localhost:3000/films";

//Function to display movie details
function displayMovieDetails(movie) {
    const poster = document.getElementById('poster');
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const showtime = document.getElementById('showtime');
    const availableTickets = document.getElementById('availableTickets');

    poster.src = movie.poster;
    title.textContent = movie.title;
    runtime.textContent = `Runtime: ${movie.runtime} minutes`;
    showtime.textContent = `Showtime ${movie.showtime}`;

    const ticketAvailable = movie.capacity - movie.tickets_sold;
    availableTickets.textContent = `Available Tickets: ${ticketAvailable}`;
}

//function to fetch the first movie's details
function getFirstMovie() {
    fetch(`${baseURL}/1`)
    .then(response => response.json())
    .then(movie => displayMovieDetails(movie))
    .catch(error => console.log("error fetching movie:", error));
}

//load the first movie's details when the page loads
window.addEventListener('DOMContentLoaded', getFirstMovie);

//function to render movie list 
function renderMovieList(movies) {
    const filmList = document.getElementById('films');
    filmList.innerHTML = '';//clear any placeholder

movies.forEach(movie => {
    const filmItem= document.createElement('li');
    filmItem.textContent = movie.title;
    filmItem.classList.add('film', 'item');
    filmItem.addEventListener('click', () => displayMovieDetails(movie));
    filmList.appendChild(filmItem);
});
}

//function to fetch all movies and render the list
function getAllMovies() {
    fetch(baseURL)
    .then(response => response.json())
    .then(movies => renderMovieList(movies))
    .catch(error => console.log("Error fetching movies", error));
}

//loads movie list when the page loads
window.addEventListener('DOMContentLoaded', getAllMovies);

//function for ticket purchase
function buyTicket(movie) {
    const ticketsAvailable = movie.capacity - movie.ticket_sold;
    if (ticketsAvailable > 0) {
        movie.tickets_sold += 1;
        const updatedTicketsAvailable = movie.capacity - movie.ticket_sold;
        document.getElementById('available-tickets').textContent = `Available Tickets: ${updateTicketAvailable}`;
    }

    //update the server with the new tickets_sold
    fetch(`${baseURL}/${movie.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            tickets_sold: movie.tickets_sold
        })
    })
    .then(response => response.json())
    .catch(error => console.log("Error updating tickets", error));

    //change button text if sold out
    if (updatedTicketsAvailable === 0) {
      document.getElementById('buy-ticket').textContent = "Sold Out";  
    } else {
    document.getElementById('buy-ticket'). textContent = "Sold Out" 
  }
}
//Event listener for the buy TIcket button
document.getElementById('buy-ticket').addEventListener('click', () => {
    const title = document.getElementById('title').textContent;
    fetch(`${baseURL}?title=${title}`)
    .then(response => response.json())
    .then(movies => {
        if (movies.length > 0) {
            buyTicket(movies[0]);
        }
    })
    .catch(error => console.log("Error fetching movie for ticket purchse:", error));
})
//Add delete button
const deleteButton = document.createElement('buttton');
deleteButton.textContent = "Delete";
deleteButton.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    deleteMovie(movie.id);
    filmItem.remove(); //remove from the list
});
filmItem.appendChild(deleteButton);

//function to delete movie from server
function deleteMovie(id){
    fetch(`${baseURL}/${id}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .catch(error => console.log("Error deleting movie:", error));
}
