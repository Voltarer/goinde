import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { globalStyles } from '../styles/styles';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function Account() {
  const { isDarkTheme } = useTheme();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [hasInjected, setHasInjected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [loadPersonalData, setLoadPersonalData] = useState(false);
  const webviewRef = useRef(null);
  const personalDataRef = useRef(null);
  const navigation = useNavigation();

  // Загрузка сохранённых данных
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const savedLogin = await AsyncStorage.getItem('login');
        const savedPassword = await AsyncStorage.getItem('password');
        const savedFullName = await AsyncStorage.getItem('fullName');
        const savedPhotoUrl = await AsyncStorage.getItem('photoUrl');

        if (savedLogin && savedPassword) {
          setLogin(savedLogin);
          setPassword(savedPassword);
          if (savedFullName && savedPhotoUrl) {
            setFullName(savedFullName);
            setPhotoUrl(savedPhotoUrl);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.log('Ошибка загрузки кэшированных данных', error);
      }
    };

    loadCachedData();
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
      setWebViewVisible(false);
      setLoadPersonalData(true);
    }
  };

  const handlePersonalDataLoad = () => {
    const jsParse = `
      (async function() {
        const fam = document.getElementById('id_fam')?.value || '';
        const nam = document.getElementById('id_nam')?.value || '';
        const oth = document.getElementById('id_oth')?.value || '';
        const group = document.getElementById('id_groupname')?.value || '';

        const img = document.getElementById('id_face');
        if (img) {
          try {
            const response = await fetch(img.src);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = function() {
              const base64data = reader.result;
              const data = { fam, nam, oth, group, photo: base64data };
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            };
            reader.readAsDataURL(blob);
          } catch (e) {
            const data = { fam, nam, oth, group, photo: '' };
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
          }
        } else {
          const data = { fam, nam, oth, group, photo: '' };
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      })();
      true;
    `;
    personalDataRef.current?.injectJavaScript(jsParse);
  };

  const handlePersonalDataMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const fullNameStr = `${data.fam} ${data.nam} ${data.oth} (${data.group})`;
      setPhotoUrl(data.photo);
      setFullName(fullNameStr);

      await AsyncStorage.setItem('fullName', fullNameStr);
      await AsyncStorage.setItem('photoUrl', data.photo);
    } catch (e) {
      console.log('Ошибка парсинга данных:', e);
    }
    setLoadPersonalData(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
    setLogin('');
    setPassword('');
    setFullName('');
    setPhotoUrl('');
    setStatus('');
  };

  return (
    <View style={[globalStyles.main, { padding: 20, backgroundColor: isDarkTheme ? '#121212' : '#F9F9F9' }]}>
      <Text style={[globalStyles.HeaderText, { marginBottom: 10, color: isDarkTheme ? '#fff' : '#000' }]}>Аккаунт</Text>

      {!isLoggedIn && (
        <>
          <TextInput
            style={[globalStyles.input2, { fontSize: 20, color: isDarkTheme ? '#fff' : '#000' }]}
            placeholder="Логин"
            value={login}
            onChangeText={(text) => {
              setLogin(text);
              setStatus('');
            }}
          />
          <TextInput
            style={[globalStyles.input2, { fontSize: 20, color: isDarkTheme ? '#fff' : '#000' }]}
            placeholder="Пароль"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setStatus('');
            }}
          />
          <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
            <Text style={[globalStyles.buttonText, { marginTop: 20,color: isDarkTheme ? '#fff' : '#000' }]}>Войти в кабинет</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'Вход...' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={{ marginLeft: 10, color: isDarkTheme ? '#fff' : '#000' }}>{status}</Text>
        </View>
      ) : (
        status !== '' && <Text style={{ marginTop: 10, color: isDarkTheme ? '#fff' : '#000' }}>{status}</Text>
      )}

      {isLoggedIn && (
        <>
          {fullName !== '' && (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ fontSize: 18, marginBottom: 10, color: isDarkTheme ? '#fff' : '#000' }}>{fullName}</Text>
              {photoUrl !== '' && (
                <Image
                  source={{ uri: photoUrl }}
                  style={{ width: 200, height: 200, borderRadius: 10 }}
                />
              )}
            </View>
          )}

          <TouchableOpacity
            style={[globalStyles.button, { marginTop: 10 }]}
            onPress={() => navigation.navigate('Schedule', { login, password })}
          >
            <Text style={[globalStyles.buttonText, { color: isDarkTheme ? '#fff' : '#000' }]}>Посмотреть расписание</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { marginTop: 20, }]}
            onPress={handleLogout}
          >
            <Text style={[globalStyles.buttonText, { color: '#fff' }]}>Выйти</Text>
          </TouchableOpacity>
        </>
      )}

      {webViewVisible && (
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://lk.chuvsu.ru/info/login.php' }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={handleWebViewLoad}
          onMessage={handleMessage}
          style={{ width: 0, height: 0 }}
        />
      )}

      {loadPersonalData && (
        <WebView
          ref={personalDataRef}
          source={{ uri: 'https://lk.chuvsu.ru/student/personal_data.php' }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={handlePersonalDataLoad}
          onMessage={handlePersonalDataMessage}
          style={{ width: 0, height: 0 }}
        />
      )}
    </View>
  );
}
