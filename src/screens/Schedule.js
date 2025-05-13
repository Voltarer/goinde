import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, Text, ScrollView, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { globalStyles } from '../styles/styles';
import cheerio from 'cheerio-without-node-native';

export default function Schedule() {
  const { isDarkTheme } = useTheme();
  const webviewRef = useRef(null);
  const [status, setStatus] = useState('Загрузка...');
  const [hasInjected, setHasInjected] = useState(false);
  const [tbodyContent, setTbodyContent] = useState('');
  const [filteredContent, setFilteredContent] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentWeekInfo, setCurrentWeekInfo] = useState('');

  const route = useRoute();
  const { login, password } = route.params || {};

  const injectedScript = `
    (function() {
      const loginField = document.getElementById('wname');
      const passField = document.getElementById('wpass');
      const loginButton = document.getElementById('auth');

      function goToSchedule() {
        window.location.href = 'https://tt.chuvsu.ru/index/grouptt/gr/7377';
        window.ReactNativeWebView.postMessage("✅ Перешли на расписание группы напрямую");
      }

      if (loginField && passField && loginButton) {
        loginField.value = "${login}";
        passField.value = "${password}";
        loginButton.click();
        setTimeout(goToSchedule, 7000);
        window.ReactNativeWebView.postMessage("🔐 Выполнен вход, ожидаем переход");
      } else {
        goToSchedule();
        window.ReactNativeWebView.postMessage("ℹ️ Уже авторизован, переходим на расписание");
      }
    })();
    true;
  `;

  const extractTbodyScript = `
    (function() {
      const tbody = document.querySelector('tbody[role="alert"]');
      const weekInfo = document.querySelector('p');
      if (tbody) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          tbody: tbody.innerHTML,
          week: weekInfo ? weekInfo.innerText : ""
        }));
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: "tbody не найден" }));
      }
    })();
    true;
  `;

  const handleWebViewLoad = ({ nativeEvent }) => {
    const url = nativeEvent.url;

    if (!hasInjected && webviewRef.current) {
      webviewRef.current.injectJavaScript(injectedScript);
      setHasInjected(true);
    }

    if (url.includes('/grouptt/gr/7377') && webviewRef.current) {
      setTimeout(() => {
        webviewRef.current.injectJavaScript(extractTbodyScript);
      }, 3000);
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.tbody) {
        setTbodyContent(data.tbody);
        setCurrentWeekInfo(data.week || '');
        setStatus("📋 Расписание загружено");
        applyFilter(data.tbody, filterType);
      } else if (data.error) {
        setStatus(`⚠️ ${data.error}`);
      }
    } catch (e) {
      setStatus(event.nativeEvent.data);
    }
  };

  const applyFilter = (html, type) => {
    const $ = cheerio.load(`<table><tbody>${html}</tbody></table>`);
    const rows = $('tr');
    const results = [];
    let currentDay = '';
    let pairNumber = 1;

    rows.each((i, row) => {
      const pairInfo = $(row).find('.trfd').text().trim();
      const pairContent = $(row).find('.want').html() || '';

      const hasOdd = pairContent.includes('<sup>*</sup>');
      const hasEven = pairContent.includes('<sup>**</sup>');

      const show =
        type === 'all' ||
        (type === 'odd' && hasOdd) ||
        (type === 'even' && hasEven);

      if (show) {
        const rawDay = $(row).prevAll('tr').find('.trfd').first().text();
        const dayOfWeek = getDayOfWeek(rawDay) || currentDay;
        currentDay = dayOfWeek;

        const cleanText = $(row).text().replace(/\s+/g, ' ').trim();

        results.push(`=== ${dayOfWeek} ===\n${pairNumber} пара: ${cleanText}`);
        pairNumber++;
      }
    });

    setFilteredContent(results.length ? results.join('\n\n') : 'Нет пар для выбранной недели');
  };

  const getDayOfWeek = (text) => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    for (const day of days) {
      if (text.includes(day)) return day;
    }
    return null;
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    applyFilter(tbodyContent, type);
  };

  return (
    <View style={[globalStyles.main, { backgroundColor: isDarkTheme ? '#121212' : '#FFFFFF', flex: 1 }]}>
      <Text style={[globalStyles.HeaderText, { color: isDarkTheme ? '#fff' : '#000', marginBottom: 10 }]}>
        Расписание
      </Text>

      <Text style={{ marginBottom: 10, color: isDarkTheme ? '#ccc' : '#333' }}>
        {status}
      </Text>

      {currentWeekInfo ? (
        <Text style={{ color: isDarkTheme ? '#aaa' : '#555', marginBottom: 10 }}>
          📆 {currentWeekInfo}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
        <Button title="Показать всё" onPress={() => handleFilterChange('all')} />
        <Button title="(*)" onPress={() => handleFilterChange('odd')} />
        <Button title="(**)" onPress={() => handleFilterChange('even')} />
      </View>

      {filteredContent ? (
        <ScrollView style={{ flex: 1 }}>
          <View style={{ padding: 10 }}>
            <Text style={{ color: isDarkTheme ? '#fff' : '#000' }}>{filteredContent}</Text>
          </View>
        </ScrollView>
      ) : (
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://tt.chuvsu.ru' }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={handleWebViewLoad}
          onMessage={handleMessage}
          style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
        />
      )}
    </View>
  );
}
