const React = require('react');
//Components
const Trailer = require('./trailer');
const Loader = require('react-loader');
const MovieItem = require('./movie_item');
//Stores
const TrailerStore = require('../stores/trailer_store');
const MovieStore = require('../stores/movie_store');
const MovieRatingStore = require('../stores/movie_rating_store');
//Actions
const MovieActions = require('../actions/movie_actions');
const MovieInfoActions = require('../actions/movie_info_actions');

const RecommendationIndex = React.createClass({

  getInitialState() {
    return {recommendationOnDisplay: {}, loaded: false};
  },

  componentDidMount() {
    this.movieStoreListener = MovieStore.addListener(this.__onChange);
    this.movieRatingStoreListener = MovieRatingStore.addListener(this.__onChange);
    this.__onChange();
  },

  componentWillUnmount() {
    this.movieStoreListener.remove();
    this.movieRatingStoreListener.remove();
  },

  // onChange handles when ratings are submitted, or when user indicates he/she isn't interested
  // in a particular movie
  __onChange() {
    let displayItems = this.generateDisplayItems(4);
    let loadStatus = false;
    if (Object.keys(displayItems).length !== 0) {
      loadStatus = true;
      $("#tmdb-logo").animate({
        height: "50px",
        marginTop: "5px",
        marginBottom: "5px"
      }, 500);
    }
    this.setState({recommendationOnDisplay: displayItems, loaded: loadStatus});
  },

  generateDisplayItems(itemCount) {
    let items = {};
    if (MovieStore.remainingRecommendationCount() >= itemCount) {
      let recommendedMovies = MovieStore.getRecommendedMovies();
      let ids = Object.keys(recommendedMovies).sort();
      let i = 0;
      while (Object.keys(items).length < itemCount) {
        if (!MovieStore.notInterested(ids[i]) && !MovieRatingStore.hasRated(ids[i])) {
          items[ids[i]] = recommendedMovies[ids[i]];
        }
        i += 1;
      }
    }
    return items;
  },

  renderRecommendations() {
    let displayItems = this.state.recommendationOnDisplay;
    return Object.keys(displayItems).map((movieId) => {
      let movie = displayItems[movieId];
      return (
        <MovieItem
          key={movie.id}
          movieId={movie.id}
          imdbId={movie.imdbId}
          recommended={true}/>
      );
    });
  },

  render() {
    let displayItems = this.state.recommendationOnDisplay;
    let imdbIds = Object.keys(displayItems).map((movieId) => {
      return displayItems[movieId].imdbId;
    });
    return (
      <div>
        <Trailer imdbIds={imdbIds}/>
        <h1>Recommendations</h1>
        <Loader loaded={this.state.loaded}>
          <div className="recommendation-index">
            {this.renderRecommendations()}
          </div>
        </Loader>
      </div>
    );
  }
});

module.exports = RecommendationIndex;
