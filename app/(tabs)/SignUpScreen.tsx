import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase'; // Assure-toi que ce fichier est bien configuré
import { useRouter } from 'expo-router';


// Ouvre ou crée la base SQLite locale
const db = SQLite.openDatabaseSync('local.db');

export default function SignUpScreen({ navigation }) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

  // Crée la table locale si elle n'existe pas
  const createLocalTable = async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
  };

  // Inscription de l'utilisateur
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    try {
      // 1. Inscription en ligne via Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert('Erreur', error.message || 'Inscription en ligne échouée');
        setLoading(false);
        return; // Stoppe si erreur en ligne
      }

      // 2. Inscription locale en SQLite
      await db.withTransactionAsync(async (tx) => {
        await tx.executeSql(
          'INSERT INTO users (email, password) VALUES (?, ?);',
          [email, password]
        );
      });

      Alert.alert('Succès', 'Inscription réussie !');
      setEmail('');
      setPassword('');
        router.push('/(tabs)/login');
    } catch (e) {
      Alert.alert('Erreur', 'Erreur inconnue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1E3C72', '#2A5298']} style={styles.container}>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Adresse Email"
          placeholderTextColor="#ccc"
          keyboardType="email-address"
          autoCapitalize="none"
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
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Chargement...' : 'S\'inscrire'}
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
  buttonText: {
    color: '#1E3C72',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
