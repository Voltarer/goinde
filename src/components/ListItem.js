import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, View, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../styles/styles';
import { useTheme } from '../context/ThemeContext';

export default function ListItem({ el, deleteHandler, onToggleFavorite, onEditDate }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;

  const { themeStyles } = useTheme();

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
    onToggleFavorite(el.key, newState);
  };

  const toggleComplete = () => {
    setIsCompleted(true);
    Animated.spring(checkScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    setTimeout(() => deleteHandler(el.key), 300);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    const hasTime = dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0;

    const date = dateObj.toLocaleDateString('ru-RU');
    const time = hasTime
      ? dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      : 'Весь день';

    return `${date}, ${time}`;
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={toggleFavorite}>
        <Icon
          name={isFavorite ? 'star' : 'star-o'}
          size={24}
          color="gold"
          style={globalStyles.icon}
        />
      </TouchableOpacity>

      <View style={globalStyles.textContainer}>
        <Text
          style={[
            globalStyles.text,
            { color: themeStyles.textColor},
            isCompleted && { textDecorationLine: 'line-through', opacity: 0.6 },
          ]}
        >
          {el.text}
        </Text>
      </View>

      <TouchableOpacity onPress={() => onEditDate(el.key)}>
        <Icon
          name="calendar"
          size={22}
          style={{
            color: themeStyles.textColor,
            backgroundColor: themeStyles.secondaryColor,
            marginRight: 10,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleComplete}>
        <View
          style={{
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: themeStyles.textColor,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isCompleted ? themeStyles.textColor : 'transparent',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {isCompleted && (
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Icon name="check" size={16} color={themeStyles.backgroundColor} />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
