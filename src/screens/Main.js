import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, Text, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import ListItem from '../components/ListItem';
import Form from '../components/Form';
import { getCurrentDate } from '../utils/getCurrentDate';
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
            date: task.date || new Date().toLocaleDateString('ru-RU'),
          }));
          setListOfItems(parsedList);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных', error);
      }
    };

    loadData();
    setCurrentDate(getCurrentDate());
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
  
    const formattedDate =
      typeof date === 'string'
        ? date
        : date.toLocaleDateString('ru-RU');
  
    const newTask = {
      key: Date.now().toString(),
      text,
      date: formattedDate,
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
    const formattedDate = newDate.toLocaleDateString('ru-RU');
    setListOfItems(prevList =>
      prevList.map(task =>
        task.key === key ? { ...task, date: formattedDate } : task
      )
    );
    setModalVisible(false);
  };

  const today = new Date();

  const filteredTasks = useMemo(() => {
    return listOfItems
      .filter(task => {
        if (!task.date) return false;
  
        const taskDate = new Date(task.date.split('.').reverse().join('-'));
        const isSameDay = taskDate.toDateString() === today.toDateString();
  
        if (view === 'today') return isSameDay || taskDate < today;
        if (view === 'upcoming') return taskDate > today;
        return true;
      })
      .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
  }, [listOfItems, view]);
  

  const groupedTasks = useMemo(() => {
    const groups = filteredTasks.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    }, {});
    return groups;
  }, [filteredTasks]);

  const upcomingList = useMemo(() => {
    return Object.entries(groupedTasks)
      .sort(([dateA], [dateB]) =>
        new Date(dateA.split('.').reverse().join('-')) -
        new Date(dateB.split('.').reverse().join('-'))
      )
      .map(([date, tasks]) => ({ date, tasks }));
  }, [groupedTasks]);

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

      {view === 'today' && <Text style={[globalStyles.dateText, { color: themeStyles.textColor }]}>{currentDate}</Text>}

      {view === 'today' ? (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View>
              {(() => {
                const tasksToday = filteredTasks.filter(task => {
                  const taskDate = new Date(task.date.split('.').reverse().join('-'));
                  return taskDate.toDateString() === today.toDateString();
                });

                const tasksPast = filteredTasks.filter(task => {
                  const taskDate = new Date(task.date.split('.').reverse().join('-'));
                  return taskDate < today;
                });

                return (
                  <>
                    {tasksToday.length > 0 && (
                      <>
                        <Text style={[globalStyles.upcomingDate, { color: themeStyles.textColor }]}>Сегодня</Text>
                        {tasksToday.map(task => (
                          <ListItem
                            key={task.key}
                            el={task}
                            deleteHandler={deleteHandler}
                            onToggleFavorite={toggleFavoriteHandler}
                            onEditDate={onEditDate}
                          />
                        ))}
                      </>
                    )}

                    {tasksPast.length > 0 && (
                      <>
                        <Text style={[globalStyles.upcomingDate, { color: themeStyles.textColor }]}>Прошедшие</Text>
                        {tasksPast.map(task => (
                          <ListItem
                            key={task.key}
                            el={task}
                            deleteHandler={deleteHandler}
                            onToggleFavorite={toggleFavoriteHandler}
                            onEditDate={onEditDate}
                          />
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
              <Text style={[globalStyles.upcomingDate, { color: themeStyles.textColor }]}>{item.date}</Text>
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
    </View>
  );
}
