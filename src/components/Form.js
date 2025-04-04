import React, { useState } from 'react';
import { TextInput, View, TouchableOpacity, Modal, Text, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FormStyles } from '../styles/formstyle';

export default function Form({ addHandler }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [text, setValue] = useState('');
    const [date, setDate] = useState(new Date()); 
    const [showPicker, setShowPicker] = useState(false);

    const handleAdd = () => {
        if (text.trim()) {
            addHandler(text, date.toLocaleDateString('ru-RU'));
            setValue('');
            setDate(new Date());
            setModalVisible(false);
        }
    };

    const onChangeDate = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    return (
        <View style={FormStyles.container2}>
            <TouchableOpacity style={FormStyles.floatingButton} onPress={() => setModalVisible(true)}>
                <Icon name="plus" size={24} color="white" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={FormStyles.modalContainer}>
                        <TouchableWithoutFeedback>
                            <View style={FormStyles.modalContent}>
                                <TextInput 
                                    style={[FormStyles.input]} 
                                    onChangeText={setValue} 
                                    placeholder='Название задачи' 
                                    value={text}
                                />
                                {/* выбор даты и кнопка добавления в один ряд */}
                                <View style={FormStyles.row}>
                                    <TouchableOpacity onPress={() => setShowPicker(true)} style={FormStyles.dateButton}>
                                        <Text>{date.toLocaleDateString('ru-RU')}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={FormStyles.addButton} onPress={handleAdd}>
                                        <Icon name="check" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>

                                {showPicker && (
                                    <DateTimePicker 
                                        value={date} 
                                        mode="date" 
                                        display="default" 
                                        onChange={onChangeDate} 
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}
