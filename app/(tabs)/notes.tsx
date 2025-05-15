import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NoteScreen() {
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadUserEmailAndNote = async () => {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        await loadNote(savedEmail); // Appel correct ici
      }
    };

    loadUserEmailAndNote();
  }, []);

  // ✅ Fonction bien définie avec paramètre utilisé
  const loadNote = async (userEmail) => {
    try {
      const savedNote = await AsyncStorage.getItem(`note_${userEmail}`);
      if (savedNote) {
        setNote(savedNote);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger la note');
    }
  };

  const saveNote = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Email utilisateur manquant');
      return;
    }

    try {
      await AsyncStorage.setItem(`note_${email}`, note);
      Alert.alert('Succès', 'Note enregistrée');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la note');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Écrivez votre note ici..."
      />
      <Button title="Enregistrer" onPress={saveNote} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  textInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
});
