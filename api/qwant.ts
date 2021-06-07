import { LatLng } from '../models/LatLng';
import { TravelMode } from '../constants/TravelMode';
import { AutocompleteResult } from '../models/AutocompleteResult';
import { DirectionsResult } from '../models/DirectionsResult';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Class representing a wrapper for QwantMap's apis,
 * this includes their autocomplete and directions api. 
 * @public
 */
export class Qwant {
    private timestamp: number;
    private queryLimit: number;
    private queryPos?: LatLng;

    private baseUrl: string = 'https://www.qwant.com/maps/detail/v1/';

    /**
     * @param queryLimit    - Optional parameter, to specify the desired number of 
     *                        results returned from the autocomplete api.
     * 
     * Is by default set to 7.
     * @param queryPos      - Optional query position used by the autocomplete api, 
     *                        to filter the query results(nearby), according to this 
     *                        location. 
     */
    constructor(queryLimit = 7, queryPos?: LatLng) {
        this.queryLimit = queryLimit;
        this.queryPos = queryPos;

        this.timestamp = new Date().getSeconds() - 20;
    }

    /**
     * Sets the internal query position used by the autocomplete api,
     * if already set, the query position will be updated.
     * @public
     */
    public setQueryPos(newPosition: LatLng): void {
        this.queryPos = newPosition;
    }

    /**
     * Performs an autocomplete query, to check addresses 
     * matching the given input string.
     * @param query - E.g. address or place.
     * @public
     */
    public async autocomplete(query: string): Promise<AutocompleteResult> {
        // Build the request url
        let url = this.baseUrl + 'autocomplete';

        // Add the query string
        url += `?q=${query}`;

        // Add query limit
        url += `&limit=${this.queryLimit}`;

        // Check if a query position has been provided
        if (this.queryPos) {
            url += `&lat=${this.queryPos.lat}`;
            url += `&lon=${this.queryPos.lng}`;
            url += '&zoom=10.000';
        }

        console.log(url);

        // Fetch the data from backend
        let response = await fetch(url, { method: 'GET' });

        console.log(response);

        if (response.ok) {
            return JSON.parse(await response.text());
        }
        else {
            return null;
        }
    }

    /**
     * Returns the directions, from a given starting point, to
     * a destination, including the total expected time in seconds, 
     * and distance in meters. 
     * 
     * The directions also include the route's individual 'legs',
     * which indicates e.g. turns etc.
     * @param query - Input string e.g. address or place.
     * @public
     */
    public async directions(from: LatLng, to: LatLng, mode: TravelMode): Promise<DirectionsResult> {
        // If not more than 20 seconds ago, since last call, ignore it!
        if (new Date().getSeconds() - this.timestamp < 20) {
            console.log('The directions API shouldn\'t be called too often.');
            return; 
        }

        let key = `${from.lat}${from.lng}${to.lat}${to.lng}${mode}`;

        return AsyncStorage.getItem(key).then(
            async (value) => {
                if (value == null) {
                    // Build the request url
                    let url = this.baseUrl + 'directions/';

                    // Add from and to's coordinates
                    url += `${from.lng},${from.lat};${to.lng},${to.lat}/`;

                    // Add default parameters
                    url += '?geometries=geojson&steps=true&alternatives=true&overview=full';

                    // Add the travelmode
                    url += `&type=${mode}`;

                    // Fetch the data from backend
                    let response = await fetch(url, { method: 'GET' });

                    if (response.ok) {
                        this.timestamp = new Date().getSeconds();
                        let responseText = await response.text();
                        AsyncStorage.setItem(key, responseText);
                        return JSON.parse(responseText);
                    }
                    else {
                        return Promise.reject(Error(`Error getting directions, with statuscode ${response.status}`));
                    }
                } else {
                    return JSON.parse(value);
                }
            }
        );
    }
}