import React, { useState, useEffect } from 'react';
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

export default function CourierScreen({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [courierName, setCourierName] = useState('Futár');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadCourierProfile();
    loadOrders();
  }, []);

  const loadCourierProfile = async () => {
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
  };

  const loadOrders = async () => {
    try {
      const data = await fetchWithAuth('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Futár rendelések betöltési hiba, tartalék adatok használata:', error);
      setOrders([
        {
          id: 'ord-201',
          restaurantName: 'Szaftos Burger',
          restaurantAddress: 'Fő utca 12.',
          customerName: 'Kovács Anna',
          deliveryAddress: 'Virág utca 8., 2. em. 4.',
          status: 'on_the_way',
          totalAmount: 4790,
          deliveryFee: 790,
          items: [
            { name: 'Dupla Húsos Burger', quantity: 1 },
            { name: 'Kézműves Cola', quantity: 1 },
          ],
        },
        {
          id: 'ord-202',
          restaurantName: 'Napoli Pizza',
          restaurantAddress: 'Kossuth tér 5.',
          customerName: 'Nagy Péter',
          deliveryAddress: 'Petőfi Sándor u. 44.',
          status: 'in_preparation',
          totalAmount: 3500,
          deliveryFee: 600,
          items: [
            { name: 'Margherita Pizza', quantity: 1 },
            { name: 'Sajtos Sültkrumpli', quantity: 1 },
          ],
        },
        {
          id: 'ord-203',
          restaurantName: 'Sushi Garden',
          restaurantAddress: 'Deák Ferenc u. 3.',
          customerName: 'Szabó Eszter',
          deliveryAddress: 'Rákóczi út 19.',
          status: 'pending',
          totalAmount: 6200,
          deliveryFee: 850,
          items: [
            { name: 'Lazac Maki Box (16 db)', quantity: 1 },
          ],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      await fetchWithAuth(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      Alert.alert(
        'Siker! 🛵',
        newStatus === 'on_the_way'
          ? 'Felvetted a rendelést, indulhat a kiszállítás!'
          : 'A rendelést sikeresen kiszállítottad!'
      );
    } catch (error) {
      console.log('Státusz frissítési hiba (helyi szimuláció fut):', error);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const activeDeliveries = orders.filter((o) => o.status === 'on_the_way');
  const availableOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'in_preparation' || o.status === 'ready'
  );
  const completedToday = orders.filter((o) => o.status === 'delivered');

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
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeDeliveries.length}</Text>
            <Text style={styles.statLabel}>Aktív fuvar</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{availableOrders.length}</Text>
            <Text style={styles.statLabel}>Elérhető</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedToday.length}</Text>
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
                  <Text style={styles.feeText}>+{order.deliveryFee || 700} lej díj</Text>
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
                    onPress={() => handleStatusChange(order.id, 'delivered')}
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
          <Text style={styles.sectionTitle}>Elérhető rendelések ({availableOrders.length})</Text>

          {availableOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyBoxText}>
                Jelenleg nincs új felvehető rendelés. Húzd le a képernyőt a frissítéshez!
              </Text>
            </View>
          ) : (
            availableOrders.map((order) => (
              <View key={order.id} style={styles.availableCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.statusPillWait}>
                    {order.status === 'in_preparation' ? '🍳 Készül az étteremben' : '⏳ Új rendelés'}
                  </Text>
                  <Text style={styles.feeText}>+{order.deliveryFee || 700} lej díj</Text>
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
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.totalText}>Érték: {order.totalAmount} lej</Text>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleStatusChange(order.id, 'on_the_way')}
                    disabled={updatingId === order.id}
                  >
                    {updatingId === order.id ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.acceptBtnText}>Rendelés felvétele →</Text>
                    )}
                  </TouchableOpacity>
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