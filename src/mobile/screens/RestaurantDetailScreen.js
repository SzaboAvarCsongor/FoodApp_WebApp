import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { fetchWithAuth } from '../services/api';

export default function RestaurantDetailScreen({ restaurantId, onBack, onAddToCart }) {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError('');
      setRestaurant(null);
      setMenuItems([]);

      const [restResult, menuResult] = await Promise.allSettled([
        fetchWithAuth(`/restaurants/${restaurantId}`),
        fetchWithAuth(`/restaurants/${restaurantId}/menu`),
      ]);

      if (!active) return;

      if (restResult.status === 'fulfilled') {
        setRestaurant(restResult.value);
      } else {
        console.error('Étterem betöltési hiba:', restResult.reason);
      }

      if (menuResult.status === 'fulfilled' && Array.isArray(menuResult.value)) {
        setMenuItems(menuResult.value);
      } else {
        console.error('Menü betöltési hiba:', menuResult.reason);
      }

      if (
        restResult.status === 'rejected' ||
        menuResult.status === 'rejected' ||
        !Array.isArray(menuResult.value)
      ) {
        setLoadError('Nem sikerült betölteni az étterem adatait.');
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
      </SafeAreaView>
    );
  }

  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Egyéb';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const deliveryTime =
    restaurant?.delivery_time_min && restaurant?.delivery_time_max
      ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max} perc`
      : '20-30 perc';

  const deliveryFee = restaurant?.delivery_fee ? `${restaurant.delivery_fee} lej` : 'Ingyenes';

  const categoryNames = Object.keys(groupedMenu);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Vissza az éttermekhez</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {restaurant?.image_url ? (
            <Image source={{ uri: restaurant.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderIcon}>🍽️</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsHeader}>
          <Text style={styles.categoryBadge}>{restaurant?.category || 'ÉTTEREM'}</Text>
          <Text style={styles.restaurantTitle}>{restaurant?.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.statText}>
                {restaurant?.rating > 0 ? restaurant.rating : 'Új'}
              </Text>
            </View>

            <View style={styles.statChip}>
              <Text style={styles.statIcon}>⏱</Text>
              <Text style={styles.statText}>{deliveryTime}</Text>
            </View>

            <View style={styles.statChip}>
              <Text style={styles.statText}>Szállítás: {deliveryFee}</Text>
            </View>
          </View>

          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
        </View>

        <View style={styles.menuContainer}>
          {categoryNames.length === 0 && !loadError ? (
            <Text style={styles.emptyText}>Nincs elérhető menü.</Text>
          ) : null}

          {categoryNames.map((categoryName) => (
            <View key={categoryName} style={styles.section}>
              <Text style={styles.sectionTitle}>{categoryName}</Text>

              {groupedMenu[categoryName].map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price} lej</Text>
                  </View>

                  <Text style={styles.itemDescription}>{item.description}</Text>

                  <View style={styles.itemFooterRow}>
                    <View style={styles.macroBadges}>
                      {item.kcal != null && (
                        <View style={styles.macroBadge}>
                          <Text style={styles.macroText}>{item.kcal} kcal</Text>
                        </View>
                      )}
                      {item.protein != null && (
                        <View style={styles.macroBadge}>
                          <Text style={styles.macroText}>F {item.protein}</Text>
                        </View>
                      )}
                      {item.carbs != null && (
                        <View style={styles.macroBadge}>
                          <Text style={styles.macroText}>Sz {item.carbs}</Text>
                        </View>
                      )}
                      {item.fat != null && (
                        <View style={styles.macroBadge}>
                          <Text style={styles.macroText}>Zs {item.fat}</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.addToCartBtn}
                      onPress={() => onAddToCart?.(item)}
                    >
                      <Text style={styles.addToCartText}>+ Kosárba</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  imageContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
  },
  heroPlaceholderIcon: {
    fontSize: 56,
  },
  detailsHeader: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  restaurantTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEBE4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  starIcon: {
    color: '#FFB800',
    fontSize: 12,
  },
  statIcon: {
    fontSize: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#C62828',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    paddingVertical: 24,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBE4',
    marginBottom: 12,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    paddingRight: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  itemDescription: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 14,
    lineHeight: 18,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  macroBadge: {
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  macroText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  addToCartBtn: {
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addToCartText: {
    color: '#FF5722',
    fontWeight: 'bold',
    fontSize: 13,
  },
});