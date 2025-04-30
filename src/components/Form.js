import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  TouchableOpacity,
  Modal,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FormStyles } from '../styles/formstyle';

export default function Form({ addHandler }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [timeSelected, setTimeSelected] = useState(false);

  const inputRef = useRef(null);

  const handleAdd = () => {
    if (text.trim()) {
      addHandler(text, date.toISOString());
      setText('');
      setDate(new Date());
      setTimeSelected(false);
      setModalVisible(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const onChangeDateTime = (event, selected) => {
    setShowPicker(false);
    if (event?.type === 'set' && selected) {
      const newDate = new Date(date);
      if (pickerMode === 'date') {
        newDate.setFullYear(selected.getFullYear());
        newDate.setMonth(selected.getMonth());
        newDate.setDate(selected.getDate());
      } else {
        newDate.setHours(selected.getHours());
        newDate.setMinutes(selected.getMinutes());
        setTimeSelected(true);
      }
      setDate(newDate);
    }
  };

  const formatDate = () => date.toLocaleDateString('ru-RU');

  const formatTime = () =>
    date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={FormStyles.container2}>
      <TouchableOpacity style={FormStyles.floatingButton} onPress={openModal}>
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setModalVisible(false);
          }}
        >
          <View style={FormStyles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={FormStyles.modalContentMinimal}
              >
                <TextInput
                  ref={inputRef}
                  style={FormStyles.inputMinimal}
                  placeholder="Что нужно сделать?"
                  value={text}
                  onChangeText={setText}
                  placeholderTextColor="#999"
                />

                <View style={FormStyles.dateRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setPickerMode('date');
                      setShowPicker(true);
                    }}
                    style={FormStyles.iconButton}
                  >
                    <Icon name="calendar" size={20} color="#555" />
                    <Text style={FormStyles.dateText}>{formatDate()}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setPickerMode('time');
                      setShowPicker(true);
                    }}
                    style={FormStyles.iconButton}
                  >
                    <Icon name="clock-o" size={20} color="#555" />
                    <Text style={FormStyles.dateText}>
                      {timeSelected ? formatTime() : 'Весь день'}
                    </Text>
                  </TouchableOpacity>

                  {timeSelected && (
                    <TouchableOpacity
                      onPress={() => {
                        const cleared = new Date(date);
                        cleared.setHours(0, 0, 0, 0);
                        setDate(cleared);
                        setTimeSelected(false);
                      }}
                      style={FormStyles.clearTimeButton}
                    >
                      <Icon name="times" size={16} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={FormStyles.addButtonMinimal}
                  onPress={handleAdd}
                >
                  <Text style={FormStyles.addButtonText}>Добавить</Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode={pickerMode}
                    display="default"
                    onChange={onChangeDateTime}
                  />
                )}
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
