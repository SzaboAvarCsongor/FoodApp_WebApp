import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';

// Mock adatok a képről
const CATEGORIES = [
  { id: 'all', name: 'Mindegyik', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burger', name: 'Burgerek', icon: '🍔' },
  { id: 'asian', name: 'Ázsiai', icon: '🍣' },
  { id: 'salad', name: 'Saláták', icon: '🥗' },
  { id: 'dessert', name: 'Desszertek', icon: '🍰' },
];

const RESTAURANTS = [
  {
    id: '1',
    name: 'Napoli Pizza',
    category: 'pizza',
    categoryName: 'Pizza',
    rating: 4.8,
    deliveryTime: '20-30 perc',
    deliveryFee: '5 lej',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    name: 'Burger House',
    category: 'burger',
    categoryName: 'Burgerek',
    rating: 4.7,
    deliveryTime: '25-35 perc',
    deliveryFee: '4 lej',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    name: 'Sushi Garden',
    category: 'asian',
    categoryName: 'Ázsiai',
    rating: 4.9,
    deliveryTime: '30-40 perc',
    deliveryFee: '6 lej',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    name: 'Green Bowl',
    category: 'salad',
    categoryName: 'Saláták',
    rating: 4.6,
    deliveryTime: '15-25 perc',
    deliveryFee: '3 lej',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },
];

export default function HomeScreen({ onNavigateToAuth }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRestaurants = RESTAURANTS.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch = r.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Kiszállítás ide:</Text>
          <TouchableOpacity style={styles.addressSelector}>
            <Text style={styles.addressText}>📍 Válassz címet</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.cartBtn}>
            <Text style={styles.cartIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>0</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileBtn} onPress={onNavigateToAuth}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Étterem keresése..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTag}>JÓ ÉTVÁGYAT! 🍕</Text>
            <Text style={styles.heroTitle}>A kedvenc ételed,{'\n'}egyenesen hozzád.</Text>
            <Text style={styles.heroSubtitle}>
              Fedezd fel a környéked legjobb éttermeit!
            </Text>

            <TouchableOpacity style={styles.heroCtaBtn}>
              <Text style={styles.heroCtaText}>Éttermek felfedezése →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubTitle}>MIT KÍVÁNSZ?</Text>
          <Text style={styles.sectionTitle}>Válassz kategóriát</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeaderBetween}>
          <View>
            <Text style={styles.sectionSubTitle}>VÁLOGATOTT NEKED</Text>
            <Text style={styles.sectionTitle}>Népszerű éttermek</Text>
          </View>
          <Text style={styles.restaurantCount}>{filteredRestaurants.length} étterem</Text>
        </View>

        <View style={styles.restaurantsGrid}>
          {filteredRestaurants.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.9}>
              <View style={styles.cardImageContainer}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                
                <TouchableOpacity
                  style={styles.favoriteBtn}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Text style={styles.favoriteHeart}>
                    {favorites[item.id] ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>⏱ {item.deliveryTime}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingStar}>★</Text>
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                <Text style={styles.cardCategory}>{item.categoryName}</Text>
                <Text style={styles.cardDelivery}>Szállítás: {item.deliveryFee}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>🍕 foodapp</Text>
          <Text style={styles.footerCopyright}>© 2026 FoodApp</Text>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE1',
  },
  addressContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '500',
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#8A8A8A',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E3D9',
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
  },
  heroBanner: {
    backgroundColor: '#FFF2EB',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0D1',
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C1810',
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#7A685D',
    marginBottom: 16,
  },
  heroCtaBtn: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionSubTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  restaurantCount: {
    fontSize: 12,
    color: '#888888',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8E3D9',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  restaurantsGrid: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEBE4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteHeart: {
    fontSize: 14,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  cardInfo: {
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingStar: {
    color: '#FFB800',
    fontSize: 14,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
  },
  cardCategory: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 4,
  },
  cardDelivery: {
    fontSize: 12,
    color: '#999999',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#EFEBE4',
  },
  footerLogo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },
});