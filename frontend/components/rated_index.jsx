const React = require('react');
const MovieRatingStore = require('../stores/movie_rating_store');
const MovieStore = require('../stores/movie_store');
const MovieActions = require('../actions/movie_actions');
const MovieItem = require('./movie_item');
import * as Cookies from "js-cookie";

const RatedIndex = React.createClass({
  // getRatedMoviesFromCookies() {
  //   let cookies = JSON.parse(Cookies.get('consilium'));
  //   let ratedMovies = {};
  //   let ratings = {};
  //   if (cookies.hasOwnProperty("rated")) {
  //     let ratedMoviesFromCookies = cookies["rated"];
  //     Object.keys(ratedMoviesFromCookies).forEach( (movieId) => {
  //       ratedMovies[movieId] = MovieStore.findMovie(movieId);
  //       ratedMovies[movieId]["rating"] = ratedMoviesFromCookies[movieId];
  //     });
  //   }
  //   return ratedMovies;
  // },

  getInitialState() {
    return { ratedMovies: {} };
  },

  componentDidMount() {
    this.movieRatingStoreListener = MovieRatingStore.addListener(this.setRatedMovies);
  },

  componentWillUnmount(){
    this.movieRatingStoreListener.remove();
  },

  setRatedMovies() {
    let ratings = MovieRatingStore.getRatings();
    let ratedMovies = {};
    Object.keys(ratings).forEach((movieId) => {
      ratedMovies[movieId] = MovieStore.findMovie(movieId);
      ratedMovies[movieId]["rating"] = ratings[movieId];
    });
    this.setState({ratedMovies: ratedMovies});
  },

  renderRatedMovies() {
    let movies = this.state.ratedMovies;
    return Object.keys(movies).map((movieId) => {
      let movie = movies[movieId];
      return (
        <MovieItem
          key={movie.id}
          movieId={movie.id}
          imdbId={movie.imdbId}
          rated={true}
          rating={movie.rating}
          />
      );
    });
  },

  render() {
    return (
      <div>
        <h1>Rated Movies</h1>
        <div className="movie-index">
          {this.renderRatedMovies()}
        </div>
      </div>
    );
  }

});

module.exports = RatedIndex;
