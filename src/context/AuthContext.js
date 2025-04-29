import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState('');

  // Загружаем данные при запуске приложения
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedLogin = await AsyncStorage.getItem('login');
        const storedPassword = await AsyncStorage.getItem('password');
        const storedName = await AsyncStorage.getItem('fullName');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');

        if (storedLogin && storedPassword) {
          setLogin(storedLogin);
          setPassword(storedPassword);
        }

        if (storedName) setFullName(storedName);
        if (loggedIn === 'true') setIsLoggedIn(true);
      } catch (e) {
        console.error('Ошибка загрузки auth-данных:', e);
      }
    };

    loadAuthData();
  }, []);

  // Сохраняем данные при изменении
  useEffect(() => {
    const saveAuthData = async () => {
      try {
        await AsyncStorage.setItem('login', login);
        await AsyncStorage.setItem('password', password);
        await AsyncStorage.setItem('isLoggedIn', isLoggedIn.toString());
        await AsyncStorage.setItem('fullName', fullName);
      } catch (e) {
        console.error('Ошибка сохранения auth-данных:', e);
      }
    };

    saveAuthData();
  }, [login, password, isLoggedIn, fullName]);

  return (
    <AuthContext.Provider
      value={{
        login,
        password,
        setLogin,
        setPassword,
        isLoggedIn,
        setIsLoggedIn,
        fullName,
        setFullName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
