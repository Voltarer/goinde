import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  //Main.js
  main: {
    width:'100%',
    height:'100%',
    backgroundColor: '#121C2C',
  },
  dateText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: 'white',
  },
  Header: {
    paddingTop: 30,
    height: 60,
    paddingLeft:15,
  },
  HeaderText: {
    fontSize: 25,
    color: 'white',
    textAlign: 'left',
  },
  formContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  //ListItem.js
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    fontSize: 24,
    flexWrap: 'wrap',
    color:'white',
  },
  text: {
    fontSize: 24,
    flexWrap: 'wrap',
    color:'white',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#464a47',
    borderColor: 'white',
    borderWidth: 2,
    marginLeft: 10,
    marginRight: 15
  },
  upcomingDate: {
    color: '#fff', // Белый цвет текста
    fontStyle: 'italic', // Курсив
    fontSize: 16, // Чуть крупнее для читабельности
    marginTop: 10, // Отступ сверху (дополнительно)
    marginLeft: 10, // Отступ слева
  },
  dateText2: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
    color: 'white',
    paddingLeft:20,
  },
});
