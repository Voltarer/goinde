import React, { useState, useEffect } from 'react';
import {TouchableOpacity, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../styles/styles';

export default function ListItem({ el, deleteHandler, onToggleFavorite }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadFavoriteState = async () => {
      try {
        const storedState = await AsyncStorage.getItem(`favorite-${el.key}`);
        if (storedState !== null) {
          setIsFavorite(JSON.parse(storedState));
        }
      } catch (error) {
        console.error('Ошибка загрузки состояния', error);
      }
    };
    loadFavoriteState();
  }, []);

  const toggleFavorite = async () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    try {
      await AsyncStorage.setItem(`favorite-${el.key}`, JSON.stringify(newState));
    } catch (error) {
      console.error('Ошибка сохранения состояния', error);
    }
    onToggleFavorite(el.key, newState); // Передаем в Main.js
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={toggleFavorite}>
        <Icon name={isFavorite ? 'star' : 'star-o'} size={24} color="gold" style={globalStyles.icon} />
      </TouchableOpacity>
      <View style={globalStyles.textContainer}>
        <Text style={globalStyles.text}>{el.text}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteHandler(el.key)}>
        <View style={globalStyles.circle} />
      </TouchableOpacity>
    </View>
  );
}