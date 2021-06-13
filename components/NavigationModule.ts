import { Qwant } from '../api/qwant';
import { LatLng } from '../models/LatLng';
import { LocationObject } from 'expo-location';
import { Leg } from '../models/DirectionsResult';
import { LocationModule } from './LocationModule';
import { TravelMode } from '../constants/TravelMode';
import { VibrationModule } from './VibrationModule';

export class NavigationModule {
  route: Leg;
  location = new LocationModule();
  vibroMod = new VibrationModule();

  previousLocation: LatLng;

  pointReachedAccuracy: number = 15; //meters

  private get nextLocation(): LatLng {
    if (this.route.steps.length == 0) { return null; }
    let location = this.route.steps[0].maneuver.location;
    return new LatLng(location[1], location[0]);
  }

  private get lastLocation(): LatLng {
    if (this.route.steps.length == 0) { return null; }
    let stepsLength = this.route.steps.length;
    let location = this.route.steps[stepsLength - 1].maneuver.location;
    return new LatLng(location[1], location[0]);
  }

  constructor() { }

  startNavigation(dest: LatLng, headingCallback: Function = null, pointSwitchedCallback: Function = null, locationCallback: Function = null) {
    this.location.getLocation().then(
      async (loc: LocationObject) => {
        // Fetch route from qwantmaps api.
        let from = new LatLng(loc.coords.latitude, loc.coords.longitude);
        this.route = (await new Qwant().directions(from, dest, TravelMode.walking)).data.routes[0].legs[0];

        // Initialize the previousLocation to the current location, before we 
        // start listening for location changes.
        let coords = (await this.location.getLocation()).coords;
        this.previousLocation = new LatLng(coords.latitude, coords.longitude);

        // Start loop
        this.location.subscribe((pos) => {
          this.handleLocationUpdate(new LatLng(pos.coords.latitude, pos.coords.longitude), headingCallback, pointSwitchedCallback, locationCallback);
        });
      }
    );
  }

  private handleLocationUpdate(currentLocation: LatLng, headingCallback: Function = null, pointSwitchedCallback: Function = null, locationCallback: Function = null) {
    if (this.nextLocation == null) { return; }
    let distanceToNextLocation = currentLocation.distanceTo(this.nextLocation);

    if (distanceToNextLocation <= this.pointReachedAccuracy) {
      this.route.steps.shift();
      if(pointSwitchedCallback != null) {
        pointSwitchedCallback();
      }
      this.vibroMod.decreasePatternPauseForWhile();
    }
    else {
      // The heading we should be at ^^
      let desiredHeading = currentLocation.bearingTo(this.nextLocation);
      let actualHeading = this.previousLocation.bearingTo(currentLocation);
      let headingDifference = actualHeading - desiredHeading;

      if (headingCallback != null) {
        let headingToDestination = currentLocation.bearingTo(this.lastLocation);
        headingCallback(headingToDestination - actualHeading);
      }

      if (locationCallback != null) {
        locationCallback(currentLocation);
      }

      this.vibroMod.vibrate(headingDifference);
    }

    // Update previousLocation
    this.previousLocation = currentLocation;
  }
}