import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function MapScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    (async () => {
      try {
        // Fetch all users from Firestore
        const usersCollection = await getDocs(collection(db, 'users'));
        const usersList = usersCollection.docs.map(doc => doc.data());
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load map data.');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map and users...</Text>
      </View>
    );
  }

  // Get current user's Firestore location
  const currentUserData = users.find(user => user.uid === currentUser.uid);

  if (!currentUserData || !currentUserData.location) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Your location is not available. Please login again.</Text>
      </View>
    );
  }

  return (
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
            pinColor={isCurrentUser ? 'blue' : 'red'}
            onPress={() => {
              if (!isCurrentUser) {
                navigation.navigate('Chat', { selectedUser: user });
              }
            }}
          />
        );
      })}
    </MapView>
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
});
