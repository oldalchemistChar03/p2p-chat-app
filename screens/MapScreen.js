import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, AppState } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';  
import * as Location from 'expo-location';

export default function MapScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      const usersList = snapshot.docs.map(doc => doc.data());
      setUsers(usersList);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);


  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (!currentUser) return;

      const userRef = doc(db, 'users', currentUser.uid);

      try {
        if (nextAppState === 'active') {
          await updateDoc(userRef, { isOnline: true });
        } else {
          await updateDoc(userRef, { isOnline: false });
        }
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [currentUser]);


  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const findNearestUser = () => {
    if (!currentUser || users.length === 0) return null;

    const currentUserData = users.find(user => user.uid === currentUser.uid);
    if (!currentUserData || !currentUserData.location) return null;

    let nearestUser = null;
    let shortestDistance = Infinity;

    users.forEach(user => {
      if (!user.location || user.uid === currentUser.uid) return;

      const distance = getDistance(
        currentUserData.location.latitude,
        currentUserData.location.longitude,
        user.location.latitude,
        user.location.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestUser = { ...user, distance };
      }
    });

    return nearestUser;
  };

  const nearestUser = findNearestUser();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map and users...</Text>
      </View>
    );
  }

  const currentUserData = users.find(user => user.uid === currentUser.uid);

  if (!currentUserData || !currentUserData.location) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Your location is not available. Please login again.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
   
      {nearestUser && (
        <View style={styles.nearestUserContainer}>
          <Text style={styles.nearestUserText}>
            Nearest user: {nearestUser.email} ({nearestUser.distance.toFixed(2)} km away)
          </Text>
        </View>
      )}

      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentUserData.location.latitude,
          longitude: currentUserData.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {users.map(user => {
          if (!user.location) return null;

          const isCurrentUser = user.uid === currentUser.uid;

          return (
            <Marker
              key={user.uid}
              coordinate={{
                latitude: user.location.latitude,
                longitude: user.location.longitude,
              }}
              title={isCurrentUser ? 'You' : user.isAnonymous ? 'Anonymous' : user.fullName}
              description={isCurrentUser ? 'This is your location' : user.email}
              pinColor={
                isCurrentUser ? 'blue' : user.isOnline ? 'green' : 'red'
              }
              onPress={() => {
                if (!isCurrentUser) {
                  navigation.navigate('Chat', { selectedUser: user });
                }
              }}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  nearestUserContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    zIndex: 999,
  },
  nearestUserText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
});
