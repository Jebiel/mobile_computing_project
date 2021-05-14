import Autocomplete from 'react-native-autocomplete-input';
import PropTypes from 'prop-types';
import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

const API = 'https://swapi.dev/api/films/';
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function comp(a, b) {
  return a.toLowerCase().trim() === b.toLowerCase().trim();
}

function findMovie(query, movies) {
  if (query === '') {
    return [];
  }

  const regex = new RegExp(`${query.trim()}`, 'i');
  return movies.filter((film) => film.title.search(regex) >= 0);
}

const MovieDetails = ({ movie }) => {
  const { title, director, opening_crawl, episode_id } = movie;
  const roman = episode_id < ROMAN.length ? ROMAN[episode_id] : episode_id;

  return (
    <View>
      <Text style={styles.titleText}>
        {roman}. {title}
      </Text>
      <Text style={styles.directorText}>({director})</Text>
      <Text style={styles.openingText}>{opening_crawl}</Text>
    </View>
  );
};

MovieDetails.propTypes = {
  movies: PropTypes.object,
};

const TabOneScreen = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [startQuery, setStartQuery] = useState('');
  const startMovies = findMovie(startQuery, allMovies);
  const [endQuery, setEndQuery] = useState('');
  const endMovies = findMovie(endQuery, allMovies);

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(({ results }) => {
        setAllMovies(results);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <Text>Starting point</Text>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          data={
            startMovies.length === 1 && comp(startQuery, startMovies[0].title) ? [] : startMovies
          }
          value={startQuery}
          onChangeText={setStartQuery}
          placeholder="Enter Star Wars film title"
          flatListProps={{
            keyExtractor: (item) => item.episode_id.toString(),
            renderItem: ({ item, i }) => (
              <TouchableOpacity onPress={() => setStartQuery(item.title)}>
                <Text style={styles.itemText}>{item.title}</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Text>Destination</Text>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          data={
            endMovies.length === 1 && comp(endQuery, endMovies[0].title) ? [] : endMovies
          }
          value={endQuery}
          onChangeText={setEndQuery}
          placeholder="Enter Star Wars film title"
          flatListProps={{
            keyExtractor: (item) => item.episode_id.toString(),
            renderItem: ({ item, i }) => (
              <TouchableOpacity onPress={() => setEndQuery(item.title)}>
                <Text style={styles.itemText}>{item.title}</Text>
              </TouchableOpacity>
            ),
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#F5FCFF',
    flex: 1,

    // Android requiers padding to avoid overlapping
    // with content and autocomplete
    paddingTop: 50,

    // Make space for the default top bar
    ...Platform.select({
      web: {
        marginTop: 0
      },
      default: {
        marginTop: 25
      }
    })
  },
  itemText: {
    fontSize: 15,
    margin: 2,
  },
  descriptionContainer: {
    // `backgroundColor` needs to be set otherwise the
    // autocomplete input will disappear on text input.
    backgroundColor: '#F5FCFF',
    marginTop: 8,
  },
  infoText: {
    textAlign: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  directorText: {
    color: 'grey',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  openingText: {
    textAlign: 'center',
  },
  autocompleteContainer: {
    // Hack required to make the autocomplete
    // work on Andrdoid
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    padding: 5
  },
});

export default TabOneScreen;
