import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadData = async (setListOfItems, setCurrentDate, getCurrentDate) => {
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
  setCurrentDate(getCurrentDate());
};

export const saveData = async (listOfItems) => {
  try {
    await AsyncStorage.setItem('tasks', JSON.stringify(listOfItems));
  } catch (error) {
    console.error('Ошибка сохранения данных', error);
  }
};

export const addHandler = (text, date, setListOfItems) => {
  if (!text.trim()) return;
  const newTask = {
    key: Date.now().toString(),
    text,
    date,
    isFavorite: false,
  };
  setListOfItems(prevList => [...prevList, newTask]);
};

export const deleteHandler = (key, setListOfItems) => {
  setListOfItems(prevList => prevList.filter(task => task.key !== key));
};

export const toggleFavoriteHandler = (key, setListOfItems) => {
  setListOfItems(prevList =>
    prevList.map(task =>
      task.key === key ? { ...task, isFavorite: !task.isFavorite } : task
    )
  );
};

export const filterTasks = (listOfItems, view, todayDateString, today) => {
  return listOfItems
    .filter(task => {
      if (!task.date) return false;
      const taskDate = new Date(task.date.split('.').reverse().join('-'));
      if (view === 'today') return task.date === todayDateString;
      if (view === 'upcoming') return taskDate > today;
      return true;
    })
    .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
};

export const groupTasks = (filteredTasks) => {
  return filteredTasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});
};

export const sortUpcomingTasks = (groupedTasks) => {
  return Object.entries(groupedTasks)
    .sort(([dateA], [dateB]) => new Date(dateA.split('.').reverse().join('-')) - new Date(dateB.split('.').reverse().join('-')))
    .map(([date, tasks]) => ({ date, tasks }));
};
