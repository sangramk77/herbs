declare module 'leaflet' {
    export type Circle = any;
    export type CircleMarker = any;
    export type DivIconOptions = any;
    export type Draw = any;
    export type DrawEvents = any;
    export type DrawMap = any;
    export type DrawOptions = any;
    export type EditToolbar = any;
    export type ErrorEvent = any;
    export type FeatureGroup = any;
    export type LatLngExpression = any;
    export type LayerGroup = any;
    export type LocateOptions = any;
    export type LocationEvent = any;
    export type Map = any;
    export type Marker = any;
    export type MarkerCluster = any;
    export type PointExpression = any;
    export type Polygon = any;
    export type Polyline = any;
    export type Popup = any;
    export type Rectangle = any;
    export type TileLayer = any;
    export type Tooltip = any;

    const L: any;
    export default L;
}

declare module 'leaflet-draw' {
    const leafletDraw: any;
    export default leafletDraw;
}

declare module 'leaflet.markercluster' {
    const markerCluster: any;
    export default markerCluster;
}

declare module 'leaflet.fullscreen' {
    const fullscreen: any;
    export default fullscreen;
}

declare module 'geojson' {
    export type BBox = number[];
    export type Position = number[];
    export type Point = { type: 'Point'; coordinates: Position };
    export type Feature<G = Point, P = Record<string, unknown>> = {
        type: 'Feature';
        geometry: G;
        properties: P;
        id?: string | number;
    };
    export type FeatureCollection<G = Point, P = Record<string, unknown>> = {
        type: 'FeatureCollection';
        features: Array<Feature<G, P>>;
    };
}
