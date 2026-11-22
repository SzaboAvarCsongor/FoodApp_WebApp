import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../services/api';

export default function ProfileScreen({
  onBack,
  onNavigateToAuth,
  onNavigateToOrders,
  onNavigateToCart,
  onLogout,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const storedUserStr = await AsyncStorage.getItem('userData');
      const storedAddress = await AsyncStorage.getItem('deliveryAddress');

      if (storedAddress) {
        setAddress(storedAddress);
      }

      if (storedUserStr) {
        setUser(JSON.parse(storedUserStr));
      }

      if (token) {
        const freshUser = await fetchWithAuth('/auth/me');
        if (freshUser && (freshUser.email || freshUser.fullName || freshUser.name)) {
          const userObj = freshUser.user || freshUser;
          setUser(userObj);
          await AsyncStorage.setItem('userData', JSON.stringify(userObj));
        }
      } else if (!storedUserStr) {
        setUser(null);
      }
    } catch (error) {
      console.error('Profil betöltési hiba:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      await AsyncStorage.setItem('deliveryAddress', address.trim());
      setIsEditingAddress(false);
      if (Platform.OS !== 'web') {
        Alert.alert('Mentve', 'A szállítási címedet elmentettük.');
      }
    } catch (error) {
      console.error('Cím mentési hiba:', error);
    }
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Biztosan ki szeretnél jelentkezni?')) {
        onLogout();
      }
      return;
    }

    Alert.alert(
      'Kijelentkezés',
      'Biztosan ki szeretnél jelentkezni a fiókodból?',
      [
        { text: 'Mégse', style: 'cancel' },
        { text: 'Kijelentkezés', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
      </SafeAreaView>
    );
  }

  const getInitials = (name, email) => {
    if (typeof name === 'string' && name.trim().length > 0) {
      return name
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return '👤';
  };

  const userName = user?.fullName || user?.name;
  const isCourier = typeof user?.role === 'string' && user.role.toUpperCase() === 'COURIER';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilom</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {!user ? (
          <View style={styles.guestCard}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarIcon}>👤</Text>
            </View>
            <Text style={styles.guestTitle}>Még nem jelentkeztél be</Text>
            <Text style={styles.guestSubtitle}>
              Jelentkezz be vagy hozz létre egy fiókot a rendeléseid követéséhez és a gyorsabb vásárláshoz!
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={onNavigateToAuth}>
              <Text style={styles.loginBtnText}>Bejelentkezés / Regisztráció</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {getInitials(userName, user.email)}
                </Text>
              </View>

              <Text style={styles.userName}>{userName || 'Felhasználó'}</Text>
              <Text style={styles.userEmail}>{user.email || ''}</Text>

              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {isCourier ? '🛵 Futár fiók' : '🍕 Vásárlói fiók'}
                </Text>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>📍 Szállítási cím</Text>
                <TouchableOpacity onPress={() => setIsEditingAddress(!isEditingAddress)}>
                  <Text style={styles.editLink}>
                    {isEditingAddress ? 'Mégse' : 'Módosítás'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isEditingAddress ? (
                <View style={styles.addressEditBox}>
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Pl. Fő utca 12., 2. emelet"
                    value={address}
                    onChangeText={setAddress}
                  />
                  <TouchableOpacity style={styles.saveAddressBtn} onPress={handleSaveAddress}>
                    <Text style={styles.saveAddressText}>Cím mentése</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.addressDisplay}>
                  {address ? address : 'Még nincs megadva szállítási cím.'}
                </Text>
              )}
            </View>

            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={onNavigateToOrders}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>🧾</Text>
                  <Text style={styles.menuItemText}>Rendeléseim és követés</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={onNavigateToCart}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>🛒</Text>
                  <Text style={styles.menuItemText}>Kosár megtekintése</Text>
                </View>
                <Text style={styles.menuArrow}>→</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutPress}>
              <Text style={styles.logoutBtnText}>Kijelentkezés</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginTop: 20,
  },
  guestAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestAvatarIcon: {
    fontSize: 32,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  editLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5722',
  },
  addressDisplay: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  addressEditBox: {
    gap: 10,
    marginTop: 4,
  },
  addressInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E8E3D9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  saveAddressBtn: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveAddressText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  menuArrow: {
    fontSize: 16,
    color: '#999999',
    fontWeight: 'bold',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0ECE1',
  },
  logoutBtn: {
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#FFD5C2',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutBtnText: {
    color: '#D84315',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
