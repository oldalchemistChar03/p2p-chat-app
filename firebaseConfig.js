import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAeW-rJd-ic0TFeWMv78cmsS_hmhbQ81es",
  authDomain: "peer2peer-a815f.firebaseapp.com",
  projectId: "peer2peer-a815f",
  storageBucket: "peer2peer-a815f.appspot.com", // ✅ fixed here
  messagingSenderId: "826745315767",
  appId: "1:826745315767:web:f9df086d32e779f4e40832"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
