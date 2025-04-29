import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { setLogin, setPassword } = useContext(AuthContext);
  const [tempLogin, setTempLogin] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleLogin = () => {
    setLogin(tempLogin);
    setPassword(tempPassword);
    navigation.navigate('LkChuvsu');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход в ЧувГУ</Text>
      <TextInput
        placeholder="Логин"
        value={tempLogin}
        onChangeText={setTempLogin}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Пароль"
        value={tempPassword}
        onChangeText={setTempPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Войти" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});
