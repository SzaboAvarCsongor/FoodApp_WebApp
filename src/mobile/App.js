import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import AuthScreen from './screens/AuthScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); 

  return (
    <>
      <StatusBar style="auto" />
      {currentScreen === 'home' ? (
        <HomeScreen onNavigateToAuth={() => setCurrentScreen('auth')} />
      ) : (
        <AuthScreen onNavigateToHome={() => setCurrentScreen('home')} />
      )}
    </>
  );
}