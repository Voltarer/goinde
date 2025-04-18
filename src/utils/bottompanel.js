import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function BottomNav({ setView }) {
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

      <TouchableOpacity style={styles.navButton} onPress={() => setView('past')}>
        <Icon name="history" size={20} color="white" />
        <Text style={styles.navText}>Прошедшие</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#333',
    height: 60,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#444',
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
