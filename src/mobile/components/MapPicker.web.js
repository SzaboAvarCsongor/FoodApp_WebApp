import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapPicker({ coords }) {
  const mapUrl = `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`;

  return (
    <View style={styles.webMapWrapper}>
      <iframe
        title="Google Maps"
        src={mapUrl}
        style={{ width: '100%', height: '100%', border: 0 }}
        loading="lazy"
      />
      <View style={styles.webHint}>
        <Text style={styles.webHintText}>
          Weben használd a GPS gombot, vagy add meg kézzel a címedet. A térkép a GPS-helyet mutatja.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapWrapper: {
    flex: 1,
    position: 'relative',
  },
  webHint: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 6,
    borderRadius: 8,
  },
  webHintText: {
    fontSize: 11,
    color: '#555555',
    textAlign: 'center',
  },
});