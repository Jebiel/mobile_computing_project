/** Taken from:
 * https://github.com/googlemaps/google-maps-services-js/blob/master/src/common.ts
 * 
 * The enum has been adapted to work with QwantMaps, and transit has been removed.
 */
export enum TravelMode {
    /** (default) indicates standard driving directions using the road network. */
    driving = "driving-traffic",
    /** requests walking directions via pedestrian paths & sidewalks (where available). */
    walking = "walking",
    /** requests bicycling directions via bicycle paths & preferred streets (where available). */
    bicycling = "cycling"
  }