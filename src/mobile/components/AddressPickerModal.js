import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import MapPicker from './MapPicker';

const DEFAULT_COORDS = {
  latitude: 46.5425,
  longitude: 24.5575,
};

const isValidCoords = (value) =>
  Number.isFinite(value?.latitude) &&
  Number.isFinite(value?.longitude) &&
  value.latitude >= -90 &&
  value.latitude <= 90 &&
  value.longitude >= -180 &&
  value.longitude <= 180;

export default function AddressPickerModal({
  visible,
  initialAddress = '',
  initialCoords = null,
  onClose,
  onConfirmAddress,
}) {
  const [coords, setCoords] = useState(isValidCoords(initialCoords) ? initialCoords : DEFAULT_COORDS);
  const [addressText, setAddressText] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [coordsMatchAddress, setCoordsMatchAddress] = useState(isValidCoords(initialCoords));

  useEffect(() => {
    if (visible) {
      setCoords(isValidCoords(initialCoords) ? initialCoords : DEFAULT_COORDS);
      setAddressText(initialAddress);
      setSearchQuery('');
      setCoordsMatchAddress(isValidCoords(initialCoords));
    }
  }, [visible, initialAddress, initialCoords]);

  const reverseGeocodeCoords = async (latitude, longitude) => {
    if (Platform.OS === 'web') {
      const locationText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setAddressText(locationText);
      return;
    }

    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const place = results[0];
        const streetPart = [place.street, place.streetNumber].filter(Boolean).join(' ');
        const cityPart = place.city || place.subregion || place.region || '';
        const formatted = [cityPart, streetPart].filter(Boolean).join(', ');

        if (formatted) {
          setAddressText(formatted);
          return;
        }
      }
      setAddressText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } catch (error) {
      console.log('Reverse geocoding hiba:', error);
      setAddressText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  const handleMapSelect = async (latitude, longitude) => {
    setCoords({ latitude, longitude });
    setCoordsMatchAddress(true);
    await reverseGeocodeCoords(latitude, longitude);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const msg = 'A GPS használatához engedélyezd a helymeghatározást!';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Engedély szükséges', msg);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });
      setCoordsMatchAddress(true);
      await reverseGeocodeCoords(latitude, longitude);
    } catch (error) {
      console.error('GPS hiba:', error);
      const msg = 'Nem sikerült lekérni a jelenlegi tartózkodási helyedet.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Hiba', msg);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;

    if (Platform.OS === 'web') {
      const msg = 'A címkeresés mobilon érhető el. Weben használd a GPS gombot, vagy add meg kézzel a címedet.';
      alert(msg);
      return;
    }

    try {
      setLoadingLocation(true);
      if (Platform.OS === 'android') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Engedély szükséges', 'A címkereséshez engedélyezd a helymeghatározást!');
          return;
        }
      }

      const results = await Location.geocodeAsync(searchQuery.trim());

      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setCoords({ latitude, longitude });
        setCoordsMatchAddress(true);
        setAddressText(searchQuery.trim());
      } else {
        Alert.alert('Nincs találat', 'Nem található ilyen cím. Próbálj meg pontosabb címet megadni.');
      }
    } catch (error) {
      console.error('Címkeresési hiba:', error);
      Alert.alert('Keresési hiba', 'Nem sikerült megkeresni ezt a címet. Ellenőrizd a címet, és próbáld újra.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleConfirm = () => {
    if (!addressText.trim()) {
      const msg = 'Kérlek válassz vagy írj be egy szállítási címet!';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Hiányzó cím', msg);
      return;
    }

    onConfirmAddress({
      address: addressText.trim(),
      coords: coordsMatchAddress ? coords : null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕ Bezárás</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Szállítási cím</Text>
          <View style={{ width: 70 }} />
        </View>

        <View style={styles.searchSection}>
          {Platform.OS !== 'web' && (
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Írd be a címed (pl. Fő utca 12)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchAddress}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleSearchAddress}
                disabled={loadingLocation}
              >
                <Text style={styles.searchBtnText}>Keresés</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.gpsBtn}
            onPress={handleUseCurrentLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#FF5722" />
            ) : (
              <Text style={styles.gpsBtnText}>📍 Jelenlegi tartózkodási helyem használata</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapPicker coords={coords} onSelectLocation={handleMapSelect} />
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomLabel}>Kiválasztott szállítási cím (pontosítható):</Text>
          <TextInput
            style={styles.selectedAddressInput}
            placeholder="Utca, házszám, emelet / ajtó..."
            value={addressText}
            onChangeText={(value) => {
              setAddressText(value);
              setCoordsMatchAddress(false);
            }}
          />

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Cím megerősítése</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
  },
  closeBtn: {
    paddingVertical: 4,
  },
  closeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  searchSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE4',
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E3D9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#1A1A1A',
  },
  searchBtn: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2EB',
    paddingVertical: 10,
    borderRadius: 10,
  },
  gpsBtnText: {
    color: '#FF5722',
    fontWeight: 'bold',
    fontSize: 13,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8E3D9',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEBE4',
    gap: 10,
  },
  bottomLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  selectedAddressInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E3D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  confirmBtn: {
    backgroundColor: '#FF5722',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});