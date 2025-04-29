import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const { isDarkTheme, toggleTheme } = useTheme();

  // Скрипт: кликаем по вкладке и парсим расписание
  const clickAndParseScript = `
    (function() {
      const tab = document.getElementById('ui-id-3');
      if (tab) {
        tab.click();
        setTimeout(() => {
          const table = document.querySelector('table');
          const rows = Array.from(table?.querySelectorAll('tr')).slice(1);
          const data = rows
            .map(row => {
              const cells = row.querySelectorAll('td');
              return {
                time: cells[0]?.innerText.trim() || '',
                subject: cells[1]?.innerText.trim() || ''
              };
            })
            .filter(item => item.time && item.subject);
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }, 1000);
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: "Вкладка не найдена" }));
      }
    })();
    true;
  `;

  // Выполняем при повторном входе на экран
  useFocusEffect(
    useCallback(() => {
      setWebViewKey(prev => prev + 1);
      setLoading(true);
    }, [])
  );

  // Ручное обновление расписания
  const refreshSchedule = () => {
    setLoading(true);
    webViewRef.current?.injectJavaScript(clickAndParseScript);
  };

  // Обработка сообщения от WebView
  const handleMessage = (event) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.error) {
        console.error(parsed.error);
        setSchedule([]);
      } else {
        setSchedule(parsed);
      }
    } catch (e) {
      console.error('Ошибка парсинга:', e);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 ,backgroundColor: isDarkTheme ? '#121212' : '#F9F9F9' ,color: isDarkTheme ? '#fff' : '#000'}}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={refreshSchedule} style={styles.tabButton}>
          <Text style={styles.tabText}>Обновить расписание</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ uri: 'https://lk.chuvsu.ru/student/tt.php' }}
        javaScriptEnabled
        onMessage={handleMessage}
        onLoadEnd={() => {
          // Кликаем по нужной вкладке и парсим после полной загрузки страницы
          webViewRef.current?.injectJavaScript(clickAndParseScript);
        }}
        style={{ height: 0, width: 0 }}
      />

      {!loading && (
        <FlatList
          data={schedule}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.subject}>{item.subject}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4682B4',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  subject: {
    fontSize: 16,
    color: '#000',
  },
});
