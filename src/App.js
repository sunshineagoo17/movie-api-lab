import React from 'react';
import ScifiMoviesList from './Components/MoviesList/ScifiMoviesList';
import "./App.scss";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sci-fi Movies List</h1>
      </header>
      <ScifiMoviesList />
    </div>
  );
}

export default App;
