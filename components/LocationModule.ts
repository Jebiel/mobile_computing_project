import * as Location from 'expo-location';

interface Handler { remove(): void; };

export class LocationModule {
    private options: Location.LocationOptions = {
        accuracy: Location.LocationAccuracy.BestForNavigation,
        mayShowUserSettingsDialog: true,
        timeInterval: 0,
        distanceInterval: 0
    };

    private subscriptions: Handler[];

    constructor() {
        Location.requestForegroundPermissionsAsync().catch(this.locationErrorHandler);
    }

    locationErrorHandler(reason: any) {
        throw new Error(`Location was denied! Reason: ${reason}`);
    }

    subscribe(callback: Location.LocationCallback) {
        Location.watchPositionAsync(this.options, callback)
            .then((handler) => this.subscriptions.push(handler))
            .catch(this.subscribeError);
    }

    subscribeError(reason: any) { console.error(reason); }

    getLocation(): Promise<Location.LocationObject> {
        return Location.getCurrentPositionAsync(this.options);
    }

    clearSubscriptions() {
        this.subscriptions.forEach((h: Handler) => h.remove());
    }

    stop() { this.clearSubscriptions(); }
}