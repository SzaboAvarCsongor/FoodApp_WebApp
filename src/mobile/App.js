import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import CourierScreen from './screens/CourierScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddressPickerModal from './components/AddressPickerModal';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const isCourier = (user) =>
  typeof user?.role === 'string' && user.role.toUpperCase() === 'COURIER';

const isValidCoords = (coords) =>
  Number.isFinite(coords?.latitude) &&
  Number.isFinite(coords?.longitude) &&
  coords.latitude >= -90 &&
  coords.latitude <= 90 &&
  coords.longitude >= -180 &&
  coords.longitude <= 180;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [cartReturnScreen, setCartReturnScreen] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [pendingAdd, setPendingAdd] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        const [userDataStr, savedAddress, savedCoordsStr] = await AsyncStorage.multiGet([
          'userData',
          'deliveryAddress',
          'deliveryCoords',
        ]);

        if (userDataStr[1]) {
          const user = JSON.parse(userDataStr[1]);
          if (isCourier(user)) {
            setCurrentScreen('courier');
          }
        }

        if (savedAddress[1]) {
          setDeliveryAddress(savedAddress[1]);
        }

        if (savedCoordsStr[1]) {
          const coords = JSON.parse(savedCoordsStr[1]);
          setDeliveryCoords(isValidCoords(coords) ? coords : null);
        }
      } catch (e) {
        console.log('Inicializálási hiba:', e);
      }
    };
    initApp();
  }, []);

  const handleConfirmAddress = async ({ address, coords }) => {
    setDeliveryAddress(address);
    setDeliveryCoords(isValidCoords(coords) ? coords : null);
    try {
      await AsyncStorage.multiSet([
        ['deliveryAddress', address],
        ['deliveryCoords', JSON.stringify(isValidCoords(coords) ? coords : null)],
      ]);
    } catch (e) {
      console.log('Cím mentési hiba:', e);
    }
  };

  const handleCartAddressChange = (address) => {
    setDeliveryAddress(address);
    setDeliveryCoords(null);
  };

  const handleAuthSuccess = (user) => {
    if (isCourier(user)) {
      setCurrentScreen('courier');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setCartItems([]);
    setCartRestaurant(null);
    setCurrentScreen('auth');
  };

  const addToCart = (item, restaurant) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === item.id);
      if (existing) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    setCartRestaurant(restaurant || null);
  };

  const handleAddToCart = (item, restaurant) => {
    const isOtherRestaurant =
      cartItems.length > 0 &&
      cartRestaurant &&
      restaurant &&
      String(cartRestaurant.id) !== String(restaurant.id);

    if (isOtherRestaurant) {
      setPendingAdd({ item, restaurant });
      return false;
    }

    addToCart(item, restaurant);
    return true;
  };

  const confirmReplaceCart = () => {
    if (!pendingAdd) return;
    setCartItems([{ ...pendingAdd.item, quantity: 1 }]);
    setCartRestaurant(pendingAdd.restaurant || null);
    setPendingAdd(null);
  };

  const handleUpdateQuantity = (itemId, change) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
  };

  const openCart = (fromScreen) => {
    setCartReturnScreen(fromScreen);
    setCurrentScreen('cart');
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const cartDeliveryFee =
    cartRestaurant?.delivery_fee != null ? Number(cartRestaurant.delivery_fee) : undefined;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="auto" />

        {currentScreen === 'courier' && (
          <CourierScreen onLogout={handleLogout} />
        )}

        <View style={[styles.root, currentScreen !== 'home' && styles.hidden]}>
          <HomeScreen
            cartCount={cartCount}
            onNavigateToProfile={() => setCurrentScreen('profile')}
            deliveryAddress={deliveryAddress}
            onOpenAddressPicker={() => setAddressModalVisible(true)}
            onNavigateToCart={() => openCart('home')}
            onNavigateToOrders={() => setCurrentScreen('orders')}
            onSelectRestaurant={(id) => {
              setSelectedRestaurantId(id);
              setCurrentScreen('restaurant');
            }}
          />
        </View>

        {currentScreen === 'auth' && (
          <AuthScreen onNavigateToHome={handleAuthSuccess} />
        )}

        {currentScreen === 'restaurant' && (
          <RestaurantDetailScreen
            restaurantId={selectedRestaurantId}
            cartCount={cartCount}
            onBack={() => setCurrentScreen('home')}
            onNavigateToCart={() => openCart('restaurant')}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentScreen === 'cart' && (
          <CartScreen
            cartItems={cartItems}
            restaurantId={cartRestaurant?.id}
            deliveryFee={cartDeliveryFee}
            deliveryAddress={deliveryAddress}
            deliveryCoords={deliveryCoords}
            onOpenAddressPicker={() => setAddressModalVisible(true)}
            onDeliveryAddressChange={handleCartAddressChange}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onBack={() => setCurrentScreen(cartReturnScreen)}
            onOrderSuccess={() => setCurrentScreen('orders')}
          />
        )}

        {currentScreen === 'orders' && (
          <OrdersScreen
            onBack={() => setCurrentScreen('home')}
            onSelectRestaurant={(id) => {
              setSelectedRestaurantId(id);
              setCurrentScreen('restaurant');
            }}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen
            onBack={() => setCurrentScreen('home')}
            onNavigateToAuth={() => setCurrentScreen('auth')}
            onNavigateToOrders={() => setCurrentScreen('orders')}
            onNavigateToCart={() => openCart('profile')}
            onLogout={handleLogout}
          />
        )}

        <AddressPickerModal
          visible={addressModalVisible}
          initialAddress={deliveryAddress}
          initialCoords={deliveryCoords}
          onClose={() => setAddressModalVisible(false)}
          onConfirmAddress={handleConfirmAddress}
        />

        <Modal
          transparent
          animationType="fade"
          visible={pendingAdd !== null}
          onRequestClose={() => setPendingAdd(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Új kosár indítása?</Text>
              <Text style={styles.modalText}>
                A kosarad egy másik étterem ételeit tartalmazza
                {cartRestaurant?.name ? ` (${cartRestaurant.name})` : ''}. Egy rendelésben csak
                egy étteremből rendelhetsz. Kiüríted a kosarat, és hozzáadod ezt a tételt?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setPendingAdd(null)}
                >
                  <Text style={styles.modalSecondaryText}>Mégse</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalPrimaryBtn} onPress={confirmReplaceCart}>
                  <Text style={styles.modalPrimaryText}>Kosár ürítése</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalSecondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0ECE1',
  },
  modalSecondaryText: {
    color: '#444444',
    fontWeight: '600',
  },
  modalPrimaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FF5722',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  root: {
  flex: 1,
  backgroundColor: '#1A1A1A', 
  },
});