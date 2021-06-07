import * as Location from 'expo-location';

interface PositionCallback { (position: GeolocationPosition): void; }

class LocationModule {
    private subscriptions: number[];
    private previousCoordinate: GeolocationCoordinates;

    constructor() {
        Location.requestForegroundPermissionsAsync().then()
            .catch(this.locationErrorHandler);
    }

    locationErrorHandler(reason: any) {
        throw new Error(`Location was denied! Reason: ${reason}`);
    }

    subscribe(callback: PositionCallback): number {
        if (this.subscriptions.length == 0) {
            this.registerCallback((pos) => {
                this.previousCoordinate = pos.coords;
            });
        }

        return this.registerCallback(callback);
    }

    registerCallback(callback: PositionCallback): number {
        let options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 0,
            maximumAge: 0
        };

        let id = navigator.geolocation.watchPosition(
            callback,
            this.subscribeError,
            options);

        this.subscriptions.push(id);

        return id;
    }

    subscribeError(error: GeolocationPositionError) {
        console.error(error.message);
    }

    clearSubscriptions() {
        this.subscriptions.forEach((id: number) => {
            navigator.geolocation.clearWatch(id);
        });
    }

    stop() { this.clearSubscriptions(); }
}