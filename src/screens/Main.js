import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, Text, StatusBar, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import ListItem from '../components/ListItem';
import Form from '../components/Form';
import { getCurrentDate } from '../utils/getCurrentDate';
import BottomNav from '../utils/bottompanel';
import { globalStyles } from '../styles/styles';

export default function Main() {
  const [listOfItems, setListOfItems] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [view, setView] = useState('today');
  const [editTaskKey, setEditTaskKey] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    const newTask = {
      key: Date.now().toString(),
      text,
      date,
      isFavorite: false,
    };
    setListOfItems((prevList) => [...prevList, newTask]);
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
  const todayDateString = today.toLocaleDateString('ru-RU');

  const filteredTasks = useMemo(() => {
    return listOfItems
      .filter(task => {
        if (!task.date) return false;
        const taskDate = new Date(task.date.split('.').reverse().join('-'));
        if (view === 'today') return task.date === todayDateString;
        if (view === 'upcoming') return taskDate > today;
        if (view === 'past') return taskDate < today;
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
      .sort(([dateA], [dateB]) => new Date(dateA.split('.').reverse().join('-')) - new Date(dateB.split('.').reverse().join('-')))
      .map(([date, tasks]) => ({ date, tasks }));
  }, [groupedTasks]);

  return (
    <View style={globalStyles.main}>
      <StatusBar barStyle="light-content" backgroundColor="#010a0a" />
      <View style={globalStyles.Header}>
        <Text style={globalStyles.HeaderText}>
          {view === 'today' ? 'Сегодня' : view === 'upcoming' ? 'Предстоящее' : 'Прошедшие'}
        </Text>
      </View>
      {view === 'today' && <Text style={globalStyles.dateText}>{currentDate}</Text>}
      {view === 'today' ? (
        <FlatList
          data={filteredTasks}
          extraData={listOfItems}
          ListFooterComponent={<View style={{ height: 125 }} />}
          renderItem={({ item }) => (
            <ListItem
              el={item}
              deleteHandler={deleteHandler}
              onToggleFavorite={toggleFavoriteHandler}
              onEditDate={onEditDate}
            />
          )}
          keyExtractor={(item) => item.key}
        />
      ) : (
        <FlatList
          data={upcomingList}
          extraData={listOfItems}
          ListFooterComponent={<View style={{ height: 125 }} />}
          renderItem={({ item, index }) => (
            <View style={{ marginTop: index === 0 ? 20 : 0 }}>
              <Text style={globalStyles.upcomingDate}>{item.date}</Text>
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
    </View>
  );
}
