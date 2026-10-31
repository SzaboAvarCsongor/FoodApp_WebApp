import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentScreen('restaurant');
  };

  return (
    <>
      <StatusBar style="auto" />
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToAuth={() => setCurrentScreen('auth')}
          onSelectRestaurant={handleSelectRestaurant}
        />
      )}

      {currentScreen === 'auth' && (
        <AuthScreen onNavigateToHome={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'restaurant' && (
        <RestaurantDetailScreen
          restaurantId={selectedRestaurantId}
          onBack={() => setCurrentScreen('home')}
          onAddToCart={(item) => console.log('Kosárba téve:', item)}
        />
      )}
    </>
  );
}