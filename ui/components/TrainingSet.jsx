'use strict';

// Copyright 2017 Consilium
// Author(s): Calvin Feng

import React                   from 'react';
import _                       from 'lodash';

//Components
import PosterSlider            from './PosterSlider';
import MovieItem               from './MovieItem';

import { ProgressBar, Button } from 'react-bootstrap';


class TrainingSet extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            trainingMovies: {},
            ratingCount: 0
        };
    }

    componentDidMount() {
        this.props.dispatchTrainingMoviesFetch();
    }

    get description() {
        let description = `These are some movies we think you have seen before.
        If you have seen them, whether you like or dislike them, let us know and give
        them ratings! If not, click the skip button and we will give you more choices.
        It will help our backend machine learning algorithm to learn your taste and preference`;
        if (this.state.ratingCount === 0) {
            return (
                <div>
                    <p>{description}</p>
                    <h4>
                        As soon as 10 movies are rated, the recommender system will get to work!
                    </h4>
                </div>
            );
        } else {
            return (
                <div>
                    <p>{description}</p>
                    <h4>Rate <strong>{10 - this.state.ratingCount}</strong> more movies</h4>
                </div>
            );
        }
    }

    get trainingSet() {
        const movies = this.props.trainingMovies;
        return Object.keys(movies).sort().map((movieId) => {
            let movie = movies[movieId];
            return (
                <MovieItem
                    key={movie.id}
                    movieId={movie.id}
                    imdbId={movie.imdbId}/>
            );
        });
    }

    render() {
        return (
            <div>
                <PosterSlider movies={this.props.trainingMovies}/>
                <div className="gauge-header">
                    <h1>Popular Movies</h1>
                    <Button
                        disabled={this.state.skipDisable}
                        bsSize="xsmall"
                        id="skip-button"
                        className="react-buttons"
                        onClick={this.skipAll}
                        bsStyle="primary">
                        More Movies
                    </Button>
                </div>
                {this.description}
                <ProgressBar now={100 * this.state.ratingCount / 10}/>
                <div className="gauge-index">
                    {this.trainingSet}
                </div>
            </div>
        );
    }

}

export default TrainingSet;