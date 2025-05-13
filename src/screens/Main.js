import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StatusBar,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import ListItem from '../components/ListItem';
import Form from '../components/Form';
import { getCurrentDate } from '../utils/getCurrentDate';
import { formatDateTime } from '../utils/formatDateTime';
import BottomNav from '../utils/bottompanel';
import { globalStyles } from '../styles/styles';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useTheme } from '../context/ThemeContext';

export default function Main() {
  const [listOfItems, setListOfItems] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [view, setView] = useState('today');
  const [editTaskKey, setEditTaskKey] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [introVisible, setIntroVisible] = useState(false); // Модалка приветствия

  const navigation = useNavigation();
  const { isDarkTheme, themeStyles } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedList = await AsyncStorage.getItem('tasks');
        if (storedList !== null) {
          let parsedList = JSON.parse(storedList);
          parsedList = parsedList.map(task => ({
            ...task,
            date: task.date || new Date().toISOString(),
          }));
          setListOfItems(parsedList);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных', error);
      }
    };

    const checkIntroShown = async () => {
      try {
        // const hasShown = await AsyncStorage.getItem('introShown');
        // if (!hasShown) {
          setIntroVisible(true);
        // }
      } catch (error) {
        console.error('Ошибка при проверке introShown:', error);
      }
    };

    loadData();
    setCurrentDate(getCurrentDate());
    checkIntroShown();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(listOfItems));
      } catch (error) {
        console.error('Ошибка сохранения данных', error);
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [listOfItems]);

  const addHandler = (text, date) => {
    if (!text.trim()) return;

    const parsedDate = new Date(date);
    const newTask = {
      key: Date.now().toString(),
      text,
      date: parsedDate.toISOString(),
      isFavorite: false,
    };

    setListOfItems((prevList) => [...prevList, newTask]);

    showMessage({
      message: 'Задача добавлена!',
      description: `"${text}" успешно создана`,
      type: 'success',
      icon: 'success',
      duration: 1500,
    });
  };

  const deleteHandler = (key) => {
    setListOfItems((prevList) => prevList.filter(task => task.key !== key));
  };

  const toggleFavoriteHandler = (key) => {
    setListOfItems((prevList) =>
      prevList.map(task =>
        task.key === key ? { ...task, isFavorite: !task.isFavorite } : task
      )
    );
  };

  const onEditDate = (key) => {
    setEditTaskKey(key);
    setModalVisible(true);
  };

  const updateTaskDate = (key, newDate) => {
    const isoDate = newDate.toISOString();
    setListOfItems(prevList =>
      prevList.map(task =>
        task.key === key ? { ...task, date: isoDate } : task
      )
    );
    setModalVisible(false);
  };

  const today = new Date();

  const filteredTasks = useMemo(() => {
    return listOfItems
      .filter(task => {
        if (!task.date) return false;

        const taskDate = new Date(task.date);
        const isSameDay = taskDate.toDateString() === today.toDateString();

        if (view === 'today') return isSameDay;
        if (view === 'upcoming') return taskDate > today;
        return true;
      })
      .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
  }, [listOfItems, view]);

  const groupedTasks = useMemo(() => {
    const groups = filteredTasks.reduce((acc, task) => {
      const groupKey = new Date(task.date).toISOString();
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(task);
      return acc;
    }, {});
    return groups;
  }, [filteredTasks]);

  const upcomingList = useMemo(() => {
    return Object.entries(groupedTasks)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, tasks]) => ({ date, tasks }));
  }, [groupedTasks]);

  const closeIntro = async () => {
    setIntroVisible(false);
    await AsyncStorage.setItem('introShown', 'true');
  };

  return (
    <View style={[globalStyles.main, { backgroundColor: themeStyles.backgroundColor }]}>
      <StatusBar
        barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
        backgroundColor={themeStyles.backgroundColor}
      />
      <View style={globalStyles.Header}>
        <Text style={[globalStyles.HeaderText, { color: themeStyles.textColor }]}>
          {view === 'today' ? 'Сегодня' : 'Предстоящее'}
        </Text>
        <Icon
          name="settings"
          size={24}
          color={themeStyles.textColor}
          style={{ position: 'absolute', right: 20 }}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {view === 'today' && (
        <Text style={[globalStyles.dateText, { color: themeStyles.textColor }]}>
          {currentDate}
        </Text>
      )}

      {view === 'today' ? (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View>
              {(() => {
                const now = new Date();

                const tasksToday = filteredTasks
                  .filter(task => {
                    const taskDate = new Date(task.date);
                    return (
                      taskDate.toDateString() === today.toDateString() &&
                      taskDate.getTime() >= now.getTime()
                    );
                  })
                  .sort((a, b) => new Date(a.date) - new Date(b.date));

                const tasksPast = filteredTasks
                  .filter(task => {
                    const taskDate = new Date(task.date);
                    return (
                      taskDate.toDateString() === today.toDateString() &&
                      taskDate.getTime() < now.getTime()
                    );
                  })
                  .sort((a, b) => new Date(a.date) - new Date(b.date));

                const formatTime = (iso) => {
                  const d = new Date(iso);
                  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                };

                return (
                  <>
                    {tasksToday.length > 0 && (
                      <>
                        <Text style={[globalStyles.upcomingDate, { color: themeStyles.textColor }]}>
                          Сегодня
                        </Text>
                        {tasksToday.map(task => (
                          <View key={task.key}>
                            <Text style={[globalStyles.dateText2, { color: themeStyles.subTextColor }]}>
                              {formatTime(task.date)}
                            </Text>
                            <ListItem
                              el={task}
                              deleteHandler={deleteHandler}
                              onToggleFavorite={toggleFavoriteHandler}
                              onEditDate={onEditDate}
                            />
                          </View>
                        ))}
                      </>
                    )}

                    {tasksPast.length > 0 && (
                      <>
                        <Text style={[globalStyles.upcomingDate, { color: themeStyles.textColor }]}>
                          Прошедшие
                        </Text>
                        {tasksPast.map(task => (
                          <View key={task.key}>
                            <Text style={[globalStyles.dateText2, { color: themeStyles.subTextColor }]}>
                              {formatTime(task.date)}
                            </Text>
                            <ListItem
                              el={task}
                              deleteHandler={deleteHandler}
                              onToggleFavorite={toggleFavoriteHandler}
                              onEditDate={onEditDate}
                            />
                          </View>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </View>
          }
          ListFooterComponent={<View style={{ height: 125 }} />}
          keyExtractor={(item, index) => index.toString()}
          renderItem={null}
        />
      ) : (
        <FlatList
          data={upcomingList}
          extraData={listOfItems}
          ListFooterComponent={<View style={{ height: 125 }} />}
          renderItem={({ item, index }) => (
            <View style={{ marginTop: index === 0 ? 20 : 0 }}>
              <Text style={[globalStyles.upcomingDate, { color: themeStyles.textColor }]}>
                {formatDateTime(item.date)}
              </Text>
              {item.tasks.map(task => (
                <ListItem
                  key={task.key}
                  el={task}
                  deleteHandler={deleteHandler}
                  onToggleFavorite={toggleFavoriteHandler}
                  onEditDate={onEditDate}
                />
              ))}
            </View>
          )}
          keyExtractor={(item) => item.date}
        />
      )}

      <View style={globalStyles.formContainer}>
        <Form addHandler={addHandler} view={view} />
      </View>
      <BottomNav setView={setView} />

      {modalVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            if (date) {
              setSelectedDate(date);
              updateTaskDate(editTaskKey, date);
            } else {
              setModalVisible(false);
            }
          }}
        />
      )}

      <FlashMessage position="top" />

      {/* Модальное окно приветствия */}
      <Modal
        visible={introVisible}
        transparent
        animationType="fade"
        onRequestClose={closeIntro}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 20,
            width: '80%',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 16, marginBottom: 15 }}>
              Добро пожаловать!
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 15 }}>
              Обновление 3.0.0
            </Text>
            <View style={{ alignItems: 'flex-start', marginLeft: 10 }}>
              <Text style={{ fontSize: 15, marginBottom: 5 }}>• Обновленнный дизайн добавления задачи</Text>
              <Text style={{ fontSize: 15, marginBottom: 5 }}>• Новый дизайн Аккаунта(Вывели ФИО,группу и фото)</Text>
              <Text style={{ fontSize: 15, marginBottom: 5 }}>• Уведомление о Обновление</Text>
              <Text style={{ fontSize: 15, marginBottom: 5 }}>• Ваня ЛОХ</Text>
            </View>

            <TouchableOpacity
              onPress={closeIntro}
              style={{
                backgroundColor: '#2196F3',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
