import { StyleSheet } from 'react-native';

export const FormStyles = StyleSheet.create({
    container2: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: '100%',
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 50,
        right: 10,
        backgroundColor: '#FF3B30', //основной цвет кнопки
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    flex1: {
        flex: 1,
        marginRight: 10, // Добавляет отступ между полем ввода и кнопками
    },
    dateButton: {
        padding: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginRight: 10, // Добавляет отступ между кнопками
    },
    input2:{
        borderWidth: 1,
        borderColor: "red",
        padding: 10,
        height:'50%',
        width: '100%',
        marginBottom: 20,
    },
    modalContentMinimal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        margin: 30,
        elevation: 5,
      },
      
      inputMinimal: {
        fontSize: 18,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingBottom: 8,
        marginBottom: 20,
        color: '#333',
      },
      
      dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      },
      
      iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
      },
      
      dateText: {
        marginLeft: 6,
        fontSize: 16,
        color: '#555',
      },
      
      clearTimeButton: {
        padding: 6,
        marginLeft: 8,
      },
      
      addButtonMinimal: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
      },
      
      addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
      
});
