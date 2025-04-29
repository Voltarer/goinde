import React, { useRef, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../context/AuthContext';

export default function LkChuvsu() {
  const webViewRef = useRef(null);
  const {
    login,
    password,
    setIsLoggedIn,
    setFullName,
  } = useContext(AuthContext);

  const injectedJS = `
    document.getElementsByName('login')[0].value = '${login}';
    document.getElementsByName('password')[0].value = '${password}';
    document.querySelector('form').submit();

    setTimeout(() => {
      const name = document.querySelector('.welcome')?.innerText || '';
      window.ReactNativeWebView.postMessage(name);
    }, 2000);

    true;
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://lk.chuvsu.ru/info/login.php' }}
        javaScriptEnabled
        injectedJavaScript={injectedJS}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
        )}
        onMessage={(event) => {
          const fullName = event.nativeEvent.data;
          if (fullName && fullName.length > 1) {
            setIsLoggedIn(true);
            setFullName(fullName);
          }
        }}
      />
    </View>
  );
}
