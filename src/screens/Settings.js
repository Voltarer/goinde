import React from 'react';
import { View, Text, Switch } from 'react-native';
import { globalStyles } from '../styles/styles';

import { useTheme } from '../context/ThemeContext';

import { TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
// остальное как раньше

export default function Settings() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[globalStyles.main, { backgroundColor: isDarkTheme ? '#121212' : '#F9F9F9' }]}>
      <Text style={[globalStyles.HeaderText, { color: isDarkTheme ? '#fff' : '#000' }]}>
        Настройки
      </Text>

      {/* Переключатель темы */}
      <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: isDarkTheme ? '#fff' : '#000', fontSize: 16 }}>Тёмная тема</Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} style={{ marginLeft: 10 }} />
      </View>

    </View>
  );
}


