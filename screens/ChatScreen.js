import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import moment from 'moment';

export default function ChatScreen({ route }) {
  const { selectedUser } = route.params;
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUserData, setCurrentUserData] = useState(null);

  const chatId = [currentUser.uid, selectedUser.uid].sort().join('_');

  useEffect(() => {
    // Fetch current user data (for name)
    const fetchCurrentUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setCurrentUserData(userDoc.data());
      }
    };

    fetchCurrentUserData();

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList);
    });

    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: input,
        senderId: currentUser.uid,
        senderName: currentUserData?.fullName || 'You',
        receiverId: selectedUser.uid,
        createdAt: serverTimestamp(),
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser.uid;
    const time = item.createdAt?.seconds
      ? moment(item.createdAt.seconds * 1000).format('h:mm A')
      : '';

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        {!isMyMessage && <Text style={styles.senderName}>{item.senderName}</Text>}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ece5dd',
    },
    messagesList: {
      padding: 10,
    },
    messageContainer: {
      padding: 10,
      borderRadius: 10,
      marginVertical: 5,
      maxWidth: '75%',
    },
    myMessage: {
      backgroundColor: '#dcf8c6', 
      alignSelf: 'flex-end',
    },
    theirMessage: {
      backgroundColor: '#fff', 
      alignSelf: 'flex-start',
    },
    messageText: {
      color: '#000', 
      marginBottom: 5,
    },
    senderName: {
      fontSize: 12,
      color: '#075e54', 
      marginBottom: 3,
    },
    timeText: {
      fontSize: 10,
      color: '#999', 
      alignSelf: 'flex-end',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      borderTopWidth: 1,
      borderColor: '#ddd',
      alignItems: 'center',
      backgroundColor: '#f7f7f7', 
    },
    input: {
      flex: 1,
      backgroundColor: '#fff', 
      padding: 10,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    sendButton: {
      backgroundColor: '#25D366', 
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 20,
    },
    sendButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });
  