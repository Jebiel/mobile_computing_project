import Autocomplete from 'react-native-autocomplete-input';
import * as React from 'react'
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Button } from 'react-native';
import { Qwant } from '../api/qwant';
import { AutocompleteResult } from '../models/AutocompleteResult';
import { LatLng } from '../models/LatLng';
import { VibrationModule } from '../components/VibrationModule';
import { NavigationModule } from '../components/NavigationModule';
import Arrow from '../components/Arrow';

let api: Qwant = new Qwant();

const TabOneScreen = () => {
  //Only needed for user input
  const [endQuery, setEndQuery] = useState('');
  const [possibleDestinations, setPossibleDestinations] = useState([]);
  const [features, setFeatures] = useState([]);

  const [navigationStarted, setNavigationStarted] = useState(false);
  //Heading to final destination
  const [heading, setHeading] = useState(0);

  let navModule = new NavigationModule();

  const fetchFeatures = (query) => {
    api.autocomplete(query)
      .then((result: AutocompleteResult) => {
        setFeatures(result.features);
        setPossibleDestinations(result.features
          .map(x => x.properties.geocoding.label));
      });
  }

  const startNavigation = () => {
    setNavigationStarted(true);
    var featureCoordinates = features.filter(obj => {
      return obj.properties.geocoding.label === endQuery
    });
    var destination = new LatLng(featureCoordinates[0].geometry.coordinates[1], featureCoordinates[0].geometry.coordinates[0]);

    navModule.startNavigation(destination, handleHeadingUpdate);
  }

  const handleHeadingUpdate = (heading: number) => {
    setHeading(heading);
  }

  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <Text style={styles.itemText}>Destination</Text>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          data={
            possibleDestinations
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
                setPossibleDestinations([]);
              }}>
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            ),
          }}
        />
        {endQuery.length > 0 && possibleDestinations.length == 0 &&
          <Button
            onPress={startNavigation}
            title="Start Navigation"
          />
        }
        {navigationStarted &&
            <Arrow heading={heading}/>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#fff',
    flex: 1,

    // Android requiers padding to avoid overlapping
    // with content and autocomplete
    paddingTop: 50,
  },
  itemText: {
    fontSize: 16,
    margin: 2,
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
