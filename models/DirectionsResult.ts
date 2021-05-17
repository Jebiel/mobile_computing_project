export interface DirectionsResult {
    status: string;
    data:   Data;
}

export interface Data {
    routes:  Route[];
    message: null;
    code:    string;
}

export interface Route {
    duration: number;
    distance: number;
    carbon:   null;
    summary:  null;
    price:    null;
    legs:     Leg[];
    geometry: Geometry;
}

export interface Geometry {
    coordinates: Array<number[]>;
    type:        string;
}

export interface Leg {
    duration: number;
    distance: number;
    summary:  string;
    steps:    Step[];
    stops:    any[];
    info:     null;
    mode:     string;
    from:     null;
    to:       null;
}

export interface Step {
    maneuver: Maneuver;
    duration: number;
    distance: number;
    geometry: Geometry;
    mode:     string;
}

export interface Maneuver {
    location:    number[];
    modifier:    null;
    type:        string;
    instruction: string;
}
