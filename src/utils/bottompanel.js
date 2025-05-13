import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function BottomNav({ setView }) {
  const navigation = useNavigation();

  return (
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.navButton} onPress={() => setView('today')}>
        <Icon name="calendar" size={20} color="white" />
        <Text style={styles.navText}>Сегодня</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => setView('upcoming')}>
        <Icon name="calendar-o" size={20} color="white" />
        <Text style={styles.navText}>Предстоящее</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Account')}>
        <Icon name="user" size={20} color="white" />
        <Text style={styles.navText}>Аккаунт</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = {
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    height: 60,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    // borderTopWidth: 1,
    // borderTopColor: '#444',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    color: 'white',
    fontSize: 14,
    marginTop: 3,
  },
};
