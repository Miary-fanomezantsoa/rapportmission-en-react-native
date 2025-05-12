import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté localement
    checkLocalLogin();
  }, []);

  const checkLocalLogin = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      // Si l'utilisateur est trouvé localement, rediriger vers la bonne page
      navigation.navigate('Home'); // Exemple pour la page d'accueil
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // D'abord vérifier localement (si un utilisateur est enregistré sur le téléphone)
      const storedUserEmail = await AsyncStorage.getItem('userEmail');
      if (storedUserEmail === email) {
        // Si l'email correspond, on assume qu'il est enregistré localement
        // Récupérer les autres informations nécessaires et continuer
        navigation.navigate('Home');  // Exemple vers l'accueil
        return;
      }

      // Si l'utilisateur n'est pas local, on fait une requête au serveur
      const response = await axios.post('https://your-server.com/api/login', {
        email,
        password,
      });

      // Si le login est réussi
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userEmail', email);  // Stocke l'email localement
        navigation.navigate('Home');  // Rediriger vers la page d'accueil
      } else {
        Alert.alert('Erreur', 'Utilisateur ou mot de passe incorrect');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter au serveur');
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#1E3C72', '#2A5298']}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Adresse Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Chargement...' : 'Se connecter'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: '#1E3C72',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
