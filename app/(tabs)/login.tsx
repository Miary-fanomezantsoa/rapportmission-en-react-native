import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as SQLite from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet,Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';


const db = SQLite.openDatabaseSync('local.db');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    createLocalTable();
    checkLocalLogin();
  }, []);

  const createLocalTable = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        );
      `);
      console.log('✅ Table locale créée (nouvelle API)');
    } catch (error) {
      console.error('❌ Erreur création table locale (nouvelle API)', error);
    }
  };

  const checkLocalLogin = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        router.push('/(tabs)/home');
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion locale :", error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      let localLoginSuccess = false;

      // 🔍 Vérifie l'utilisateur avec SQLite (nouvelle API)
      const result = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (result) {
        console.log('✅ Connexion locale réussie !');
        await AsyncStorage.setItem('userToken', 'local-login');
        await AsyncStorage.setItem('userEmail', email);
        router.push('/(tabs)/home');
        localLoginSuccess = true;
      }

      if (!localLoginSuccess) {
        await loginWithSupabase();
      }
    } catch (err) {
      console.error('❌ Erreur SQLite locale', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithSupabase = async () => {
    try {
      const { user, session, error  } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erreur', error.message || 'Connexion Supabase échouée');
      } else if (session) {
        await AsyncStorage.setItem('userToken', session.access_token);
        await AsyncStorage.setItem('userEmail', email);
        router.push('/(tabs)/home');
      }
    } catch (err) {
      Alert.alert('Erreur réseau', 'Veillez verifier votre connexion');
    }
  };

  return (
    <LinearGradient colors={['#1E3C72', '#2A5298']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Image source={require('../../assets/images/logo1.jpeg')} style={styles.logo} />
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
        <TouchableOpacity onPress={() => router.push('/(tabs)/SignUpScreen')}>
          <Text style={{color: '#fff', marginTop: 20, textAlign: 'center'}}>
            Pas de compte ? Inscrivez-vous
          </Text>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  buttonText: {
    color: '#1E3C72',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
