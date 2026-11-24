import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapPicker({ coords, onSelectLocation }) {
  return (
    <MapView
      style={styles.map}
      region={{
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }}
      onPress={(e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        onSelectLocation(latitude, longitude);
      }}
    >
      <Marker
        coordinate={coords}
        draggable
        title="Kiszállítási pont"
        onDragEnd={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          onSelectLocation(latitude, longitude);
        }}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});