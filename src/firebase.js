import { initializeApp } from 'firebase/app';

// Toba Effect Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAxVOQg7rnrgUaOyvSXxrgelEqyLEcUo6c',
  authDomain: 'eco2track-new.firebaseapp.com',
  projectId: 'eco2track-new',
  storageBucket: 'eco2track-new.firebasestorage.app',
  messagingSenderId: '647174491993',
  appId: '1:647174491993:web:78ac9f0a7449e39d7d0648'
};

export const app = initializeApp(firebaseConfig);