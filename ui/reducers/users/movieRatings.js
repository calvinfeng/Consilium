'use strict';

// Copyright 2017 Consilium
// Author(s): Calvin Feng

import { RECORD_MOVIE_RATING } from '../../actions/movieRatings';
import { DELETE_MOVIE_RATING } from '../../actions/movieRatings';

// Key Actions - Create, Update, Delete, Fetch
export default function ratingsReducer(state = {}, action) {
    switch (action.type) {

        case RECORD_MOVIE_RATING:
            const newRatingRecord = action.data;
            return Object.assign({}, state, newRatingRecord);

        case DELETE_MOVIE_RATING:
            const movieId = action.movieId;
            const newState = state;
            delete newState[movieId];
            return newState;

        default:
            return state;
    }
}