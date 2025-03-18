import React, { useState, useEffect } from "react";
import "./movies.css";
import Swal from "sweetalert2";

const MovieDatabase = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [dataType, setDataType] = useState("movies");

  // Check for user's preferred color scheme on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);

    // Apply theme class to body
    document.body.className = prefersDark ? "dark-theme" : "light-theme";
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.className = !darkMode ? "dark-theme" : "light-theme";

    // Show theme change notification
    Swal.fire({
      title: !darkMode ? "Dark Mode Activated" : "Light Mode Activated",
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      background: !darkMode ? "#333" : "#fff",
      color: !darkMode ? "#fff" : "#333",
    });
  };

  // Fetch movies from local backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://cinemagic-f3fn.onrender.com/movies"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data)) {
          setMovies(data);

          // Show success notification
          Swal.fire({
            title: "Movies Loaded",
            text: `${data.length} movies retrieved successfully`,
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: darkMode ? "#333" : "#fff",
            color: darkMode ? "#fff" : "#333",
          });
        } else {
          throw new Error("No movies found in the API response");
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);

        // Show error notification
        Swal.fire({
          title: "Error",
          text: `Failed to load movies: ${err.message}`,
          icon: "error",
          background: darkMode ? "#333" : "#fff",
          color: darkMode ? "#fff" : "#333",
          confirmButtonColor: "#3085d6",
        });
      }
    };

    fetchMovies();
  }, [darkMode]);

  // Reset to movie list
  const showMovieList = () => {
    setDataType("movies");
    setSelectedMovie(null);
  };

  // Helper function to parse string arrays
  const parseStringArray = (stringArray) => {
    if (!stringArray || !stringArray[0]) return [];
    try {
      // Handle the string representation of an array
      return JSON.parse(stringArray[0].replace(/'/g, '"'));
    } catch (e) {
      return stringArray;
    }
  };

  // Filter movies based on search term
  const filteredMovies = Array.isArray(movies)
    ? movies.filter(
        (movie) =>
          movie.Movie_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof movie.Cast === "string" &&
            movie.Cast.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (Array.isArray(movie.Cast) &&
            movie.Cast.some((cast) =>
              cast.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      )
    : [];

  // Handle movie selection
  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    window.scrollTo(0, 0);

    // Show movie selection notification
    Swal.fire({
      title: "Movie Selected",
      text: movie.Movie_Name,
      icon: "info",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      background: darkMode ? "#333" : "#fff",
      color: darkMode ? "#fff" : "#333",
    });
  };

  // Handle back button click
  const handleBackClick = () => {
    setSelectedMovie(null);
  };

  // Generate star rating display
  const renderStarRating = (rating) => {
    if (!rating) return <span className="no-rating">Not rated</span>;

    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full">
            ★
          </span>
        ))}
        {halfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">
            ☆
          </span>
        ))}
        <span className="rating-number">({rating}/10)</span>
      </div>
    );
  };

  // Format movie release date
  const formatReleaseDate = (releaseDateArray) => {
    if (!releaseDateArray || !releaseDateArray[0]) return "Unknown";
    try {
      const dateString = releaseDateArray[0].replace(/\[|\]|'|"/g, "");
      // Extract just the date part
      const match = dateString.match(/([A-Za-z]+ \d+, \d+)/);
      return match ? match[0] : dateString;
    } catch (e) {
      return String(releaseDateArray);
    }
  };

  // Format movie runtime
  const formatRuntime = (runtimeArray) => {
    if (!runtimeArray || !runtimeArray[0]) return "Unknown";
    try {
      return runtimeArray[0].replace(/\[|\]|'|"/g, "");
    } catch (e) {
      return String(runtimeArray);
    }
  };

  // Generate movie poster placeholder
  const renderMoviePoster = (movieName) => {
    const initials = movieName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="movie-poster-placeholder">
        <div className="poster-initials">{initials}</div>
        <div className="poster-title">{movieName}</div>
      </div>
    );
  };

  // Render movie details
  const renderMovieDetails = () => {
    if (!selectedMovie) return null;

    const genres = parseStringArray(selectedMovie.Genres);
    const cast = parseStringArray(selectedMovie.Cast);
    const languages = parseStringArray(selectedMovie.Original_Language);
    const productionCompanies = parseStringArray(
      selectedMovie.Production_Company
    );

    return (
      <div className="movie-details">
        <button className="back-button" onClick={handleBackClick}>
          <span>←</span> Back to Movies
        </button>

        <div className="movie-details-content">
          <div className="movie-poster-container">
            {renderMoviePoster(selectedMovie.Movie_Name)}
            <div className="movie-meta">
              <div className="meta-item">
                <p className="meta-label">Rating</p>
                <div>{renderStarRating(selectedMovie.Vote_Average)}</div>
              </div>
              <div className="meta-item">
                <p className="meta-label">Votes</p>
                <p>{selectedMovie.Vote_Count}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Release Date</p>
                <p>{formatReleaseDate(selectedMovie.Release_Date)}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Runtime</p>
                <p>{formatRuntime(selectedMovie.Run_Time)}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Budget</p>
                <p>{selectedMovie.Budget || "Not available"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Revenue</p>
                <p>{selectedMovie.Revenue || "Not available"}</p>
              </div>
            </div>
          </div>

          <div className="movie-info">
            <h2 className="movie-title">{selectedMovie.Movie_Name}</h2>
            {selectedMovie.Tagline && (
              <p className="movie-tagline">"{selectedMovie.Tagline}"</p>
            )}

            {genres.length > 0 && (
              <div className="movie-genres">
                {genres.map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="movie-plot">
              <h3>Overview</h3>
              <p>{selectedMovie.Overview || "No overview available."}</p>
            </div>

            {selectedMovie.Storyline &&
              selectedMovie.Storyline !== selectedMovie.Overview && (
                <div className="movie-storyline">
                  <h3>Storyline</h3>
                  <p>{selectedMovie.Storyline}</p>
                </div>
              )}

            {languages.length > 0 && (
              <div className="movie-languages">
                <h3>Languages</h3>
                <p>{languages.join(", ")}</p>
              </div>
            )}

            {productionCompanies.length > 0 && (
              <div className="movie-production">
                <h3>Production Companies</h3>
                <p>{productionCompanies.join(", ")}</p>
              </div>
            )}

            {cast.length > 0 && (
              <div className="movie-cast">
                <h3>Cast</h3>
                <div className="cast-list">
                  {cast.map((actor, index) => (
                    <span key={index} className="cast-item">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedMovie.Home_Page && (
              <div className="movie-link">
                <h3>Official Link</h3>
                <a
                  href={selectedMovie.Home_Page}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Homepage
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render movie list
  const renderMovieList = () => {
    return (
      <div className="movie-grid">
        {filteredMovies.map((movie) => (
          <div
            key={movie._id}
            className="movie-card"
            onClick={() => handleMovieSelect(movie)}
          >
            <div className="movie-poster">
              {renderMoviePoster(movie.Movie_Name)}
            </div>
            <div className="movie-card-content">
              <h3 className="movie-card-title">{movie.Movie_Name}</h3>
              <div className="movie-card-meta">
                <div className="movie-card-genres">
                  {parseStringArray(movie.Genres)
                    .slice(0, 3)
                    .map((genre, index) => (
                      <span key={index} className="genre-pill">
                        {genre}
                      </span>
                    ))}
                </div>
                <div className="movie-card-rating">
                  {renderStarRating(movie.Vote_Average)}
                </div>
                <span className="movie-card-year">
                  {formatReleaseDate(movie.Release_Date)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main render
  return (
    <div className="movie-database">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>CineMagic</h1>
          <div className="header-controls">
            <nav className="data-nav">
              <button
                className={`nav-button ${
                  dataType === "movies" ? "active" : ""
                }`}
                onClick={showMovieList}
              >
                Movies
              </button>
            </nav>
            <button
              onClick={toggleDarkMode}
              className="theme-toggle"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <svg
                  className="sun-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 2V4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 20V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 12H2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 12H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19.8 4.2L18.4 5.6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5.6 18.4L4.2 19.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19.8 19.8L18.4 18.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5.6 5.6L4.2 4.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  className="moon-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Conditional rendering based on data type */}
        {dataType === "movies" &&
          (selectedMovie ? (
            renderMovieDetails()
          ) : (
            <>
              {/* Search bar */}
              <div className="search-container">
                <div className="search-bar">
                  <svg
                    className="search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search movies by title or cast..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {searchTerm && (
                  <div className="search-results-count">
                    Found {filteredMovies.length} movies
                  </div>
                )}
              </div>

              {/* Loading, error and content states */}
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your movie collection...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-message">Error: {error}</p>
                  <p className="error-help">
                    We couldn't fetch the movies. Please try again later.
                  </p>
                </div>
              ) : filteredMovies.length === 0 ? (
                <div className="empty-results">
                  <p className="empty-title">
                    No movies found matching your search.
                  </p>
                  <p className="empty-subtitle">
                    Try adjusting your search criteria.
                  </p>
                </div>
              ) : (
                renderMovieList()
              )}
            </>
          ))}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} CineMagic - Movie Database</p>
            <p>Connected to localhost:5000/movies API</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MovieDatabase;
