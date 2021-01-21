export const getEmptyFeatureCollection = () => {
  return {
    type: "FeatureCollection",
    features: [],
  };
};

export const getEmptyFeature = (type, coordinates) => {
  return {
    type: "Feature",
    geometry: {
      type: type,
      coordinates: coordinates,
    },
    properties: {
      name: null,
    },
  };
};
