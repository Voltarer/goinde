export const getCurrentDate = () => {
    const date = new Date();
    const options = { day: 'numeric', month: 'long' };
    const formattedDate = date.toLocaleDateString('ru-RU', options);
    
    const weekdayOptions = { weekday: 'long' };
    let weekday = date.toLocaleDateString('ru-RU', weekdayOptions);
    weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1); // Делаем первую букву заглавной
  
    return `${formattedDate}, ${weekday}`;
  };
  