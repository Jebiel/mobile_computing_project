export interface DirectionsResult {
    type:       string;
    geocoding:  DirectionsResultGeocoding;
    intentions: any[];
    features:   Feature[];
}

export interface Feature {
    type:       string;
    geometry:   Geometry;
    properties: Properties;
    distance:   number;
}

export interface Geometry {
    coordinates: number[];
    type:        string;
}

export interface Properties {
    geocoding: AddressClass;
}

export interface AddressClass {
    type:                  Type;
    label:                 string;
    name:                  string;
    postcode:              null | string;
    city:                  any;             // Test this at a later point (City)
    id:                    string;
    citycode:              string;
    administrativeRegions: AdministrativeRegion[];
    poiTypes?:             PoiType[];
    properties?:           Property[];
    address?:              AddressClass;
    countryCodes:          any[];           // Test this at a later point (CountryCode[])
    street?:               string;
    housenumber?:          string;
}

export interface AdministrativeRegion {
    id:       any;                          // Test this at a later point (ID)
    insee:    string;
    level:    number;
    label:    any;                          // Test this at a later point
    name:     any;                          // Test this at a later point (AdministrativeRegionName)
    zipCodes: any[];
    coord:    Coord;
    bbox:     number[];
    zoneType: ZoneType;
    parentID: any | null;                   // Test this at a later point
    codes:    Code[];
}

export interface Code {
    name:  any;                             // Test this at a later point
    value: string;
}

export interface Coord {
    lon: number;
    lat: number;
}

export enum ZoneType {
    City = "city",
    Country = "country",
    State = "state",
}

export interface PoiType {
    id:   string;
    name: string;
}

export interface Property {
    key:   string;
    value: string;
}

export enum Type {
    House = "house",
    Poi = "poi",
    Street = "street",
}

export interface DirectionsResultGeocoding {
    version: string;
    query:   string;
}
