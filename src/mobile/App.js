import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AuthScreen from './screens/AuthScreen';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AuthScreen />
    </>
  );
}