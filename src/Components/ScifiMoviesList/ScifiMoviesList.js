import { useState, useEffect } from 'react';
import axios from 'axios';
import "./ScifiMoviesList.scss";

function ScifiMoviesList() {
  const [movies, setMovies] = useState([]);
  const [ratings, setRatings] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [reviewsByMovieId, setReviewsByMovieId] = useState({});
  const api_key = 'ab59f4edec34ee271cc30d89d81eeceb';
  const base_url = 'https://api.themoviedb.org/3';

  // Generalized Axios request function
  const makeApiRequest = async (endpoint, method = 'get', data = {}) => {
    const url = `${base_url}/${endpoint}`;
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYjU5ZjRlZGVjMzRlZTI3MWNjMzBkODlkODFlZWNlYiIsInN1YiI6IjY2MGIzOGYzYWUzODQzMDE2MzFkNzg1OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ze4ufM7sH2VrvqdorKIiVIcDR5GzuS0FNtMlCPlp3Lo`,
        'Content-Type': 'application/json;charset=utf-8',
      },
      params: method === 'get' ? { api_key, ...data } : {},
      data: method !== 'get' ? data : {},
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API request error:', error);
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      const data = await makeApiRequest('discover/movie', 'get', { with_genres: '878' });
      if (data) setMovies(data.results);
    };

    fetchMovies();
  }, []);

  const handleRatingChange = (e, movieId) => {
    setInputValues({ ...inputValues, [movieId]: e.target.value });
  };

  const saveRating = async (movieId) => {
    const ratingValue = inputValues[movieId];
    if (ratingValue) {
      const data = await makeApiRequest(`movie/${movieId}/rating`, 'post', { value: ratingValue });
      console.log('Save Rating Response:', data); 
      updateStatesAfterRatingChange(movieId, ratingValue);
    }
  };  

  const deleteRating = async (movieId) => {
    const data = await makeApiRequest(`movie/${movieId}/rating`, 'delete');
    console.log('Delete Rating Response:', data); 
    updateStatesAfterRatingChange(movieId, '');
  };  

  const updateStatesAfterRatingChange = (movieId, ratingValue) => {
    setRatings((prev) => ({ ...prev, [movieId]: ratingValue }));
    setInputValues((prev) => ({ ...prev, [movieId]: '' }));
  };

  const fetchReviews = async (movieId) => {
    const endpoint = `movie/${movieId}/reviews`;
    const data = await makeApiRequest(endpoint, 'get', { language: 'en-US', page: 1 });
    if (data) {
      console.log(`Fetched Reviews for Movie ID ${movieId}:`, data.results);
      setReviewsByMovieId(prevReviews => ({
        ...prevReviews,
        [movieId]: data.results,
      }));
    } else {
      setReviewsByMovieId(prevReviews => ({
        ...prevReviews,
        [movieId]: [],
      }));
    }
  };  

  const clearReviews = (movieId) => {
    if(reviewsByMovieId[movieId]) {
      console.log(`Clearing Reviews for Movie ID ${movieId}:`, reviewsByMovieId[movieId]);
    } else {
      console.log(`No Reviews to Clear for Movie ID ${movieId}`);
    }
  
    setReviewsByMovieId(prevReviews => {
      const newState = { ...prevReviews };
      delete newState[movieId]; 
      return newState;
    });
  };  

  return (
    <div className="container">
      <h2 className="title">Check These Out</h2>
      <ul className="movieList">
        {movies.map((movie) => (
          <li key={movie.id} className="movieItem">
            <div className="movieTitle">{movie.title}</div>
            <div className="ratingDisplay">Rating: {ratings[movie.id] || 'Not rated'}</div>
            <input
              className="inputRating"
              type="number"
              placeholder="Rate 1-10"
              value={inputValues[movie.id] || ''}
              onChange={(e) => handleRatingChange(e, movie.id)}
            />
            <button onClick={() => saveRating(movie.id)} className="button saveButton">Save Rating</button>
            <button onClick={() => deleteRating(movie.id)} className="button deleteButton">Delete Rating</button>
            <button onClick={() => fetchReviews(movie.id)} className="button viewReviewsButton">View Reviews</button>
            <button onClick={() => clearReviews(movie.id)} className="button clearReviewsButton">Clear Reviews</button>
            {reviewsByMovieId.hasOwnProperty(movie.id) ? (
              reviewsByMovieId[movie.id].length > 0 ? (
                <div className="reviewsSection">
                  {reviewsByMovieId[movie.id].map(review => (
                    <div key={review.id} className="reviewItem">
                      <p><strong>{review.author}</strong>: {review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No reviews available for this movie.</p>
              )
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );  
}

export default ScifiMoviesList;
