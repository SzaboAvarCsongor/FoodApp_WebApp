import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../services/api';

const normalizeOrder = (order) => {
  const restaurant = Array.isArray(order.restaurants)
    ? order.restaurants[0]
    : order.restaurants;
  const customer = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
  const statuses = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    PREPARING: 'in_preparation',
    READY: 'ready',
    DELIVERING: 'on_the_way',
    DELIVERED: 'delivered',
  };

  return {
    id: order.id,
    status: statuses[order.status] || String(order.status).toLowerCase(),
    restaurantName: restaurant?.name || 'Étterem',
    restaurantAddress: restaurant?.address || 'Cím nem érhető el',
    customerName: customer?.full_name || 'Vásárló',
    deliveryAddress: order.delivery_address || 'Cím nem érhető el',
    deliveryFee: order.delivery_fee,
    totalAmount: order.total_price,
    items: (order.order_items || []).map((orderItem) => {
      const menuItem = Array.isArray(orderItem.menu_items)
        ? orderItem.menu_items[0]
        : orderItem.menu_items;

      return {
        id: orderItem.id,
        name: menuItem?.name || 'Törölt étel',
        quantity: orderItem.quantity,
      };
    }),
  };
};

export default function CourierScreen({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [courierName, setCourierName] = useState('Futár');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCourierProfile = useCallback(async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        const name = user?.fullName || user?.name;
        if (name) setCourierName(name);
      }
    } catch (e) {
      console.log('Profil betöltési hiba:', e);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/orders/courier');
      if (!Array.isArray(data)) {
        throw new Error('A szerver érvénytelen rendeléslistát küldött.');
      }
      setOrders(data.map(normalizeOrder));
      setErrorMessage('');
    } catch (error) {
      console.error('Futár rendelések betöltési hiba:', error);
      setErrorMessage(error.message || 'Nem sikerült betölteni a rendeléseket.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Both helpers update state only after their asynchronous reads complete.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCourierProfile();
    loadOrders();
    const refreshTimer = setInterval(loadOrders, 10000);

    return () => clearInterval(refreshTimer);
  }, [loadCourierProfile, loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      await fetchWithAuth(`/orders/${orderId}/courier-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus === 'DELIVERING' ? 'on_the_way' : 'delivered' }
            : o
        )
      );
      setErrorMessage('');

      Alert.alert(
        'Siker! 🛵',
        newStatus === 'DELIVERING'
          ? 'Felvetted a rendelést, indulhat a kiszállítás!'
          : 'A rendelést sikeresen kiszállítottad!'
      );
    } catch (error) {
      console.error('Futár rendelési állapot frissítési hiba:', error);
      setErrorMessage(error.message || 'Nem sikerült frissíteni a rendelés állapotát.');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeDeliveries = orders.filter((o) => o.status === 'on_the_way');
  const restaurantOrders = orders.filter((o) =>
    ['pending', 'accepted', 'in_preparation', 'ready'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Futár felület betöltése...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.roleTag}>FUTÁR MÓD 🛵</Text>
          <Text style={styles.headerTitle}>Szia, {courierName}!</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Kilépés</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />
        }
      >
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeDeliveries.length}</Text>
            <Text style={styles.statLabel}>Aktív fuvar</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{restaurantOrders.length}</Text>
            <Text style={styles.statLabel}>Éttermeknél</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedOrders.length}</Text>
            <Text style={styles.statLabel}>Teljesítve</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktív kiszállítás ({activeDeliveries.length})</Text>

          {activeDeliveries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyBoxText}>
                Nincs folyamatban lévő kiszállításod. Válassz az elérhető rendelések közül!
              </Text>
            </View>
          ) : (
            activeDeliveries.map((order) => (
              <View key={order.id} style={styles.activeCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.statusPillActive}>🛵 Kiszállítás folyamatban</Text>
                  <Text style={styles.feeText}>+{order.deliveryFee ?? 0} lej díj</Text>
                </View>

                <Text style={styles.restaurantName}>{order.restaurantName}</Text>

                <View style={styles.routeBox}>
                  <Text style={styles.routeLine}>
                    <Text style={styles.routeLabel}>Felvétel: </Text>
                    {order.restaurantAddress || 'Étterem címe'}
                  </Text>
                  <Text style={styles.routeLine}>
                    <Text style={styles.routeLabel}>Címzett: </Text>
                    {order.customerName || 'Vásárló'} — {order.deliveryAddress || 'Kiszállítási cím'}
                  </Text>
                </View>

                <View style={styles.itemsList}>
                  {order.items?.map((item, idx) => (
                    <Text key={idx} style={styles.itemText}>
                      • {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.totalText}>Fizetendő: {order.totalAmount} lej</Text>

                  <TouchableOpacity
                    style={styles.deliverBtn}
                    onPress={() => handleStatusChange(order.id, 'DELIVERED')}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.deliverBtnText}>Kiszállítva ✓</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rendelések az éttermeknél ({restaurantOrders.length})</Text>

          {restaurantOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyBoxText}>
                Jelenleg nincs rendelés az éttermeknél.
              </Text>
            </View>
          ) : (
            restaurantOrders.map((order) => (
              <View key={order.id} style={styles.availableCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.statusPillWait}>
                    {order.status === 'ready'
                      ? '🍽️ Elkészült az étteremben'
                      : order.status === 'in_preparation'
                        ? '🍳 Készül az étteremben'
                        : order.status === 'accepted'
                          ? '✅ Az étterem elfogadta'
                          : '⏳ Várakozik az étterem elfogadására'}
                  </Text>
                  <Text style={styles.feeText}>+{order.deliveryFee ?? 0} lej díj</Text>
                </View>

                <Text style={styles.restaurantName}>{order.restaurantName}</Text>

                <View style={styles.routeBox}>
                  <Text style={styles.routeLine}>
                    <Text style={styles.routeLabel}>Honnan: </Text>
                    {order.restaurantAddress || 'Étterem címe'}
                  </Text>
                  <Text style={styles.routeLine}>
                    <Text style={styles.routeLabel}>Hova: </Text>
                    {order.deliveryAddress || 'Kiszállítási cím'}
                  </Text>
                  <Text style={styles.routeLine}>
                    <Text style={styles.routeLabel}>Címzett: </Text>
                    {order.customerName}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.totalText}>Érték: {order.totalAmount} lej</Text>

                  {order.status === 'ready' ? (
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleStatusChange(order.id, 'DELIVERING')}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.acceptBtnText}>Rendelés felvétele →</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.waitingText}>Felvétel az elkészülés után</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
  },
  roleTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  logoutBtn: {
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: {
    color: '#FF5722',
    fontWeight: 'bold',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF2EB',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  statLabel: {
    fontSize: 12,
    color: '#7A685D',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FFE0D1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    alignItems: 'center',
  },
  emptyBoxText: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 19,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FF5722',
    marginBottom: 12,
  },
  availableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPillActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  statusPillWait: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  feeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  routeBox: {
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 4,
  },
  routeLine: {
    fontSize: 13,
    color: '#333333',
  },
  routeLabel: {
    fontWeight: 'bold',
    color: '#666666',
  },
  itemsList: {
    marginBottom: 12,
    gap: 2,
  },
  itemText: {
    fontSize: 13,
    color: '#555555',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  acceptBtn: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  waitingText: {
    maxWidth: 150,
    fontSize: 12,
    color: '#7A685D',
    textAlign: 'right',
  },
  deliverBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  deliverBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});