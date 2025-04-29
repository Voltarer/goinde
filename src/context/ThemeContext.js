// context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkTheme(savedTheme === 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const themeStyles = {
    backgroundColor: isDarkTheme ? '#121212' : '#FFFFFF',
    textColor: isDarkTheme ? '#FFFFFF' : '#000000',
    secondaryColor: isDarkTheme ? '#1F1F1F' : '#F2F2F2',
    accentColor: isDarkTheme ? '#BB86FC' : '#6200EE',
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
