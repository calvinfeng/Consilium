require "#{Rails.root}/lib/tasks/binary_heap.rb"

class Api::MoviesController < ApplicationController

    def index
        if params[:imdbId]
            movie = Movie.find_by_imdb_id(params[:imdbId])
            @movies = [movie]
        else
            @movies = Movie.all
        end
        render :index
    end

    def show
        if params[:id]
            @movie = Movie.find(params[:id])
            render :show
        elsif params[:imdbId]
            @movie = Movie.find_by_imdb_id(params[:imdbId])
            render :show
        else
            @errors = ["Can't find the requested movie"]
            render 'api/shared/error', status: 422
        end
    end

    def recommendations
        percentile = params[:percentile].to_i
        movie_ratings = params[:movie_ratings]
        skipped_movies = params[:skipped_movies]
        preference_vector = params[:preference_vector]
        min_year = params[:min_year]
        max_year = params[:max_year]

        # NOTE: We are going to move away from kNN algorithm due to Redis's ridiculously high pricing
        # movie_ratings = params[:movie_ratings]
        # @movies = knn_recommendations(min_year, max_year, movie_ratings)

        @svd_recommendations = svd_recommendations(min_year,
            max_year,
            preference_vector,
            skipped_movies,
            movie_ratings,
            percentile)

        recommended_movie_ids = @svd_recommendations.keys
        @movies = Movie.find(recommended_movie_ids)

        render 'api/movies/recommendation.json.jbuilder'
    end

    def fetch_most_viewed
        @movies = Movie.find(eval($redis.get("most_viewed_movie_ids")))
        render 'api/movies/most_viewed.json.jbuilder'
    end

    private
    def svd_recommendations(min_year, max_year, preference_vector, skipped_movies, movie_ratings, percentile)
        priority_queue = BinaryHeap.new
        popularity_bracket = nil
        case percentile
        when 20
            popularity_bracket = eval($redis.get('top_80_percent'))
        when 50
            popularity_bracket = eval($redis.get('top_50_percent'))
        when 80
            popularity_bracket = eval($redis.get('top_20_percent'))
        when 100
            popularity_bracket = eval($redis.get('top_5_percent'))
        end

        movie_features = eval($redis.get("movie_features"))
        movie_years = eval($redis.get("movie_years"))
        movie_features.each do |movie_id, feature_vector|
            movie_year = movie_years[movie_id]
            if skipped_movies[movie_id.to_s].nil? &&
                movie_ratings[movie_id.to_s].nil? &&
                (min_year <= movie_year && movie_year <= max_year) &&
                (popularity_bracket.nil? || popularity_bracket[movie_id])

                prediction = 0
                feature_vector.each_index do |idx|
                    prediction += preference_vector[idx] * feature_vector[idx]
                end

                priority_queue.push({ id: movie_id, predicted_rating: prediction, percentile: percentile })
            end
        end

        puts "Movie year range #{min_year} - #{max_year}"
        puts "Total number of movies in queue #{priority_queue.store.length}"

        recommendations = Hash.new
        until recommendations.length == 10 || priority_queue.store.length == 0
            movie = priority_queue.extract
            recommendations[movie[:id]] = movie
            puts "Movie #{movie[:id]}: #{movie[:predicted_rating]}"
        end
        recommendations
    end

    def knn_recommendations(min_year, max_year, movie_ratings_by_user)
        min_year = min_year || 1900
        max_year = max_year || 2017

        movies = Movie.where("year >= #{min_year} AND year <= #{max_year}")
        indices = (0...movies.length).to_a.shuffle

        recommended_movies = []
        user = User.new(movie_ratings_by_user)
        until recommended_movies.count >= 10 || indices.length == 0
            index = indices.pop
            prediction = movies[index].knn_prediction_for(user)
            puts "\n#{movies[index].title} - prediction = #{prediction}\n\n" unless prediction.nil?
            if !prediction.nil? && movies[index].knn_prediction_for(user) > 3.5
                recommended_movies << movies[index]
            end
        end

        return recommended_movies
    end
end
