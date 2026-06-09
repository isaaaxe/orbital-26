
export type POI_DATA_TYPE = {
    display_name: string,
    name: string,
    code: string,
    boundary: {
        latitude: number,
        longitude: number
    }[]
    center: {latitude: number, longitude: number}
    color: string
}

export const POI_DATA: POI_DATA_TYPE[] = [
    {
        display_name: "C1",
        name: "COM 1",
        code: "COM1",
        boundary: [
            {latitude: 1.2955517929338451, longitude: 103.77362779578262},
            {latitude: 1.2947299755116342, longitude: 103.77438699306742},
            {latitude: 1.2945436921497224, longitude: 103.77422742209411},
            {latitude: 1.2944627308787748, longitude: 103.77398898114822},
            {latitude: 1.2950444336107492, longitude: 103.77342919058599},
            {latitude: 1.29539731482386, longitude: 103.77345952406473},
            {latitude: 1.2955517929338451, longitude: 103.77362779578262},
        ],
        center: {latitude: 1.294918607305062, longitude: 103.77391249242724},
        color: "rgba(130, 202, 255, 0.75)"
    },
    {
        display_name: "C2",
        name: "COM 2",
        code: "COM2",
        boundary: [
            {latitude: 1.2944627308787748, longitude: 103.77398898114822},
            {latitude: 1.2945436921497224, longitude: 103.77422742209411},
            {latitude: 1.294081444946064,  longitude: 103.77409531776226},
            {latitude: 1.2938379396888149, longitude: 103.77419439601114},
            {latitude: 1.294024793528894, longitude: 103.77467327421401},
            {latitude: 1.293609514418326, longitude: 103.7748888537719},
            {latitude: 1.2932021574991703, longitude: 103.77404491475349},
            {latitude: 1.293947385044634, longitude: 103.77372069970775},
            {latitude: 1.2944627308787748, longitude: 103.77398898114822},
        ],
        center: {latitude: 1.2938803589279313, longitude: 103.77404986077516},
        color: "rgba(100, 149, 237, 0.75)"
    },
    {
        display_name: "C3",
        name: "COM 3",
        code: "COM3",
        boundary: [
            {latitude: 1.2945436921497224, longitude: 103.77422742209411},
            {latitude: 1.2947299755116342, longitude: 103.77438699306742},
            {latitude: 1.2953463385782924, longitude: 103.77381759510382},
            {latitude: 1.2958246538217122, longitude: 103.77446165213088},
            {latitude: 1.2943026734735577, longitude: 103.77521100556537},
            {latitude: 1.294024793528894, longitude: 103.77467327421401},
            {latitude: 1.2938379396888149, longitude: 103.77419439601114},
            {latitude: 1.294081444946064,  longitude: 103.77409531776226},
            {latitude: 1.2945436921497224, longitude: 103.77422742209411},
        ],
        center: {latitude:1.2947297763475263, longitude:103.77460462789179},
        color: "rgba(30, 144, 255, 0.75)"
    },

]