import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { globalStyles } from '../styles/styles';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function Account() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [hasInjected, setHasInjected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const webviewRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadCredentials = async () => {
      const savedLogin = await AsyncStorage.getItem('login');
      const savedPassword = await AsyncStorage.getItem('password');
      if (savedLogin) setLogin(savedLogin);
      if (savedPassword) setPassword(savedPassword);
    };
    loadCredentials();
  }, []);

  const saveCredentials = async () => {
    await AsyncStorage.setItem('login', login);
    await AsyncStorage.setItem('password', password);
  };

  const handleLogin = async () => {
    if (!login || !password) {
      setStatus('Введите логин и пароль');
      return;
    }

    await saveCredentials();
    setStatus('Вход...');
    setHasInjected(false);
    setWebViewVisible(true);
  };

  const handleWebViewLoad = () => {
    if (webviewRef.current && !hasInjected) {
      const jsToInject = `
        setTimeout(() => {
          const emailField = document.getElementById('id_email');
          const passField = document.getElementById('id_password');
          const submitBtn = document.querySelector('.big_button');

          if (emailField && passField && submitBtn) {
            emailField.value = "${login}";
            passField.value = "${password}";
            submitBtn.click();
            window.ReactNativeWebView.postMessage("✅ Успешный вход");
          } else {
            window.ReactNativeWebView.postMessage("❌ Не удалось найти нужные элементы");
          }
        }, 1000);
        true;
      `;
      webviewRef.current.injectJavaScript(jsToInject);
      setHasInjected(true);
    }
  };

  const handleMessage = (event) => {
    const msg = event.nativeEvent.data;
    setStatus(msg);
    if (msg.includes('✅')) {
      setIsLoggedIn(true);
      setWebViewVisible(false); // скрыть после авторизации
    }
  };

  return (
    <View style={[globalStyles.main,{ padding: 20,backgroundColor: isDarkTheme ? '#121212' : '#F9F9F9' ,color: isDarkTheme ? '#fff' : '#000' }]}>
      <Text style={[globalStyles.HeaderText,{ marginBottom: 10,color: isDarkTheme ? '#fff' : '#000'  }]}>Аккаунт</Text>

      <TextInput
        style={[globalStyles.input2, {fontSize:20,color: isDarkTheme ? '#fff' : '#000' }]}
        placeholder="Логин"
        value={login}
        onChangeText={(text) => {
          setLogin(text);
          setStatus('');
        }}
      />
      <TextInput
        style={[globalStyles.input2, {fontSize:20,color: isDarkTheme ? '#fff' : '#000' }]}
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setStatus('');
        }}
      />

      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={[globalStyles.buttonText,{color: isDarkTheme ? '#fff' : '#000' }]}>Войти в кабинет</Text>
      </TouchableOpacity>

      {status === 'Вход...' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={{ marginLeft: 10 }}>{status}</Text>
        </View>
      ) : (
        status !== '' && <Text style={{ marginTop: 10,color: isDarkTheme ? '#fff' : '#000'  }}>{status}</Text>
      )}

      {isLoggedIn && (
        <TouchableOpacity
          style={[globalStyles.button, { marginTop: 20,color: isDarkTheme ? '#fff' : '#000'  }]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={[globalStyles.buttonText,{color: isDarkTheme ? '#fff' : '#000' }]}>Посмотреть расписание</Text>
        </TouchableOpacity>
      )}

      {webViewVisible && (
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://lk.chuvsu.ru/info/login.php' }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={handleWebViewLoad}
          onMessage={handleMessage}
          style={{ width: 0, height: 0 }} // скрыто
        />
      )}
    </View>
  );
}