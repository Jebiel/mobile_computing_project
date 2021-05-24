import Autocomplete from 'react-native-autocomplete-input';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Button } from 'react-native';
import { Qwant } from '../api/qwant';
import { AutocompleteResult } from '../models/AutocompleteResult';
import * as Location from 'expo-location';
import { LatLng } from '../models/LatLng';
import { DirectionsResult } from '../models/DirectionsResult';
import { TravelMode } from '../constants/TravelMode';
Location.installWebGeolocationPolyfill();

let api: Qwant = new Qwant();

const TabOneScreen = () => {
  //Only needed for user input
  const [endQuery, setEndQuery] = useState('');
  const [possibleDestinations, setPossibleDestinations] = useState([]);
  const [features, setFeatures] = useState([]);

  const [endLocation, setEndLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentStepId, setCurrentStepId] = useState(0);
  //Start with 1 since 0 is equal to current position
  const [currentCoordinateId, setCurrentCoordinateId] = useState(1);
  const [distanceToNextCoordinate, setDistanceToNextCoordinate] = useState(null);

  const locationFetchDelay = 2000; //ms

  //Called on currentLocation change
  useEffect(() => {
    if (route == null) {
      fetchRoute();
    } else {
      // console.log("From")
      // console.log(JSON.stringify(currentLocation));

      // console.log("To")
      // console.log(JSON.stringify(new LatLng(
      //   route.legs[0].steps[currentStepId].geometry.coordinates[currentCoordinateId][1],
      //   route.legs[0].steps[currentStepId].geometry.coordinates[currentCoordinateId][0])));

      setDistanceToNextCoordinate(currentLocation.distanceTo(new LatLng(
        route.legs[0].steps[currentStepId].geometry.coordinates[currentCoordinateId][1],
        route.legs[0].steps[currentStepId].geometry.coordinates[currentCoordinateId][0]
      )))
    }
  }, [currentLocation]);

  const getLocation = async () => {
    var { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Foreground permission not granted!');
      setErrorMsg('Foreground permission not granted');
      return;
    }
    watchLocation();
  }

  const watchLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      location => {
        setCurrentLocation(new LatLng(location.coords.latitude, location.coords.longitude));
      }
    ,);
    setTimeout(watchLocation, locationFetchDelay);
  }

  const fetchFeatures = (query) => {
    api.autocomplete(query)
      .then((result: AutocompleteResult) => {
        setFeatures(result.features)
        setPossibleDestinations(result.features
          .map(x => x.properties.geocoding.label))
      });
  }

  const fetchRoute = async () => {
    if (currentLocation != null && endLocation != null) {
      console.log("Run")
      await api.directions(currentLocation, endLocation, TravelMode.walking)
        .then((result: DirectionsResult) => {
          // console.log("Result")
          // console.log(result.data.routes[0])
          setRoute(result.data.routes[0]);
        });
    }
  }

  const finalizeInput = () => {
    var featureCoordinates = features.filter(obj => {
      return obj.properties.geocoding.label === endQuery
    });
    var result = new LatLng(featureCoordinates[0].geometry.coordinates[1], featureCoordinates[0].geometry.coordinates[0]);
    setEndLocation(result);
    //Start async current location fetching
    getLocation();
  }

  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <Text>Destination</Text>
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
            onPress={finalizeInput}
            title="Confirm"
          />
        }
      </View>
      {endLocation != null &&
        <View style={styles.container}>
          <Text>Destination</Text>
          <Text>{JSON.stringify(endLocation)}</Text>
          {currentLocation != null &&
            <View>
              <Text>My location</Text>
              <Text>{JSON.stringify(currentLocation)}</Text>
            </View>
          }
          {currentLocation == null &&
            <View>
              <Text>My location</Text>
              <Text>Fetching current location...</Text>
            </View>
          }
          {route != null &&
            <View>
              <Text>Legs count</Text>
              <Text>{JSON.stringify(route.legs.length)}</Text>
              <Text>Steps count</Text>
              <Text>{JSON.stringify(route.legs[0].steps.length)}</Text>
              <Text>Total Distance</Text>
              <Text>{JSON.stringify(route.distance)}</Text>
              <Text>Current step ID</Text>
              <Text>{currentStepId}</Text>
              <Text>Current step distance left</Text>
              <Text>{JSON.stringify(route.legs[0].steps[currentStepId].distance)}</Text>
              <Text>Current step coordinates left</Text>
              <Text>{JSON.stringify(route.legs[0].steps[currentStepId].geometry.coordinates.length)}</Text>
              <Text>Distance to next coordinate</Text>
              <Text>{distanceToNextCoordinate}</Text>
            </View>
          }
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
