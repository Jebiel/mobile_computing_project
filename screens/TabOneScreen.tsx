import Autocomplete from 'react-native-autocomplete-input';
import * as React from 'react'
import { useState, useEffect }  from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, Button } from 'react-native';
import { Qwant } from '../api/qwant';
import { AutocompleteResult } from '../models/AutocompleteResult';
import * as Location from 'expo-location';
import { LatLng } from '../models/LatLng';
import { VibrationModule } from '../components/VibrationModule';
import { NavigationModule } from '../components/NavigationModule';
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalDistanceLeft, setTotalDistanceLeft] = useState(null);
  const [distanceToNextStep, setDistanceToNextStep] = useState(null);
  //Next point where user needs to switch direction of movement
  const [nextManeuver, setNextManeuver] = useState(null);

  const locationFetchDelay = 1000; //ms

  let module = new VibrationModule();
  let navModule = new NavigationModule();

  
  Location.requestForegroundPermissionsAsync().then(
    () => Location.watchHeadingAsync((loc) => module.vibrate(loc.trueHeading))
  );

  //Called on currentLocation change
  useEffect(() => {
    if (route == null) {
      fetchRoute();
    } else {
      setTotalDistanceLeft(currentLocation.distanceTo(endLocation));

      //We use these values if step has not changed
      let maneuverLocation = route.legs[0].steps[currentStepIndex].maneuver.location;
      let newDistanceToNextStep = currentLocation.distanceTo(
        new LatLng(maneuverLocation[1], maneuverLocation[0])
      );
      let newCurrentStepIndex = currentStepIndex;
      let maneuverInstruction = route.legs[0].steps[currentStepIndex].maneuver.instruction;

      //If reached new maneuver point
      if (newDistanceToNextStep < 10 && currentStepIndex < route.legs[0].steps.length - 1) {
        newCurrentStepIndex = currentStepIndex + 1;
        //I update these variables here because otherwise they would be 1 update behind currentStepIndex
        //For example currentStepIndex switched 1 -> 2, but distanceToNext step would still show distance to steps[1]
        //instead of distance to next step with index 2. It would be 1 update behind which is not great.
        maneuverLocation = route.legs[0].steps[newCurrentStepIndex].maneuver.location;
        newDistanceToNextStep = currentLocation.distanceTo(
          new LatLng(maneuverLocation[1], maneuverLocation[0])
        );
        maneuverInstruction = route.legs[0].steps[newCurrentStepIndex].maneuver.instruction;
      }

      setDistanceToNextStep(newDistanceToNextStep);
      setCurrentStepIndex(newCurrentStepIndex);
      setNextManeuver(maneuverInstruction)
    }
  }, [currentLocation]);

  // const getLocation = async () => {
  //   var { status } = await Location.requestForegroundPermissionsAsync();
  //   if (status !== 'granted') {
  //     console.log('Foreground permission not granted!');
  //     setErrorMsg('Foreground permission not granted');
  //     return;
  //   }
  //   watchLocation();
  // }

  // const watchLocation = async () => {
  //   navigator.geolocation.getCurrentPosition(
  //     location => {
  //       setCurrentLocation(new LatLng(location.coords.latitude, location.coords.longitude));
  //     }
  //   ,);
  //   setTimeout(watchLocation, locationFetchDelay);
  // }

  const fetchFeatures = (query) => {
    api.autocomplete(query)
      .then((result: AutocompleteResult) => {
        setFeatures(result.features);
        setPossibleDestinations(result.features
          .map(x => x.properties.geocoding.label));
      });
  }

  const startNavigation = () => {
    resetState();

    var featureCoordinates = features.filter(obj => {
      return obj.properties.geocoding.label === endQuery
    });
    var destination = new LatLng(featureCoordinates[0].geometry.coordinates[1], featureCoordinates[0].geometry.coordinates[0]);
    
    navModule.startNavigation(destination);
    
    // setEndLocation(result);
    // Start async current location fetching
    // getLocation();
    // Fetch route to destination
    // fetchRoute();
  }

  const resetState = () => {
    setCurrentStepIndex(0);
    setTotalDistanceLeft(null);
    setDistanceToNextStep(null);
    setNextManeuver(null);
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
      </View>
      {endLocation != null &&
        <View style={styles.container}>
          <Text style={styles.itemText}>Destination</Text>
          <Text style={styles.itemText}>{JSON.stringify(endLocation)}</Text>
          {currentLocation != null &&
            <View>
              <Text style={styles.itemText}>My location</Text>
              <Text style={styles.itemText}>{JSON.stringify(currentLocation)}</Text>
            </View>
          }
          {currentLocation == null &&
            <View>
              <Text style={styles.itemText}>My location</Text>
              <Text style={styles.itemText}>Fetching current location...</Text>
            </View>
          }
          {route != null &&
            <View>
              <Text style={styles.itemText}>Steps count</Text>
              <Text style={styles.itemText}>{JSON.stringify(route.legs[0].steps.length)}</Text>
              {totalDistanceLeft != null &&
                <View>
                  <Text style={styles.itemText}>Total Distance Left</Text>
                  <Text style={styles.itemText}>{JSON.stringify(totalDistanceLeft)}</Text>
                </View>
              }
              {currentStepIndex != null &&
                <View>
                  <Text style={styles.itemText}>Current step index</Text>
                  <Text style={styles.itemText}>{JSON.stringify(currentStepIndex)}</Text>
                </View>
              }
              {distanceToNextStep != null &&
                <View>
                  <Text style={styles.itemText}>Current step distance left</Text>
                  <Text style={styles.itemText}>{JSON.stringify(distanceToNextStep)}</Text>
                </View>
              }
              {nextManeuver != null &&
                <View>
                  <Text style={styles.itemText}>Next maneuver</Text>
                  <Text style={styles.itemText}>{JSON.stringify(nextManeuver)}</Text>
                </View>
              }
              {totalDistanceLeft != null && totalDistanceLeft < 12 &&
                <Text style={styles.infoText}>Destination Reached</Text>
              }

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
    fontSize: 16,
    margin: 2,
  },
  descriptionContainer: {
    // `backgroundColor` needs to be set otherwise the
    // autocomplete input will disappear on text input.
    backgroundColor: '#F5FCFF',
    marginTop: 8,
  },
  infoText: {
    fontSize: 24,
    textAlign: 'center',
    margin: 10
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
