import Autocomplete from 'react-native-autocomplete-input';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Button } from 'react-native';
import { Qwant } from '../api/qwant';
import { AutocompleteResult } from '../models/AutocompleteResult';

let api: Qwant = new Qwant();

const TabOneScreen = () => {
  const [endQuery, setEndQuery] = useState('');
  const [endLocations, setEndLocations] = useState([]);
  const [features, setFeatures] = useState([]);
  const [endCoordinates, setEndCoordinates] = useState(undefined);

  const fetchFeatures = (query) => {
    api.autocomplete(query)
      .then((result: AutocompleteResult) => {
        setFeatures(result.features)
        setEndLocations(result.features
          .map(x => x.properties.geocoding.label))
      });
  }

  const finalizeInput = () => {
    var featureCoordinates = features.filter(obj => {
      return obj.properties.geocoding.label === endQuery
    });
    var result = {
      latitude: featureCoordinates[0].geometry.coordinates[1],
      longitude: featureCoordinates[0].geometry.coordinates[0]
    }
    setEndCoordinates(result);
  }

  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <Text>Destination</Text>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          data={
            endLocations
          }
          value={endQuery}
          onChangeText={text => {
            setEndQuery(text);
            fetchFeatures(text);
          }}
          placeholder="e.g. Ballerup"
          flatListProps={{
            keyExtractor: (item, i) => i.toString(),
            renderItem: ({ item, i }) => (
              <TouchableOpacity onPress={() => {
                setEndQuery(item);
                setEndLocations([]);
              }}>
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            ),
          }}
        />
        {endQuery.length > 0 && endLocations.length == 0 &&
          <Button
            onPress={finalizeInput}
            title="Confirm"
          />
        }
      </View>
      {endCoordinates != undefined &&
        <View style={styles.container}>
          <Text>Destination</Text>
          <Text>{JSON.stringify(endCoordinates)}</Text>
        </View>
      }
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
