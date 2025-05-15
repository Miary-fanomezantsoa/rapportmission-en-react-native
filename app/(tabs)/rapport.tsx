import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, FlatList, Image,
  TouchableOpacity, StyleSheet
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚙️ Configuration Supabase
const supabaseUrl = 'https://xxxxxxxx.supabase.co'; // remplace par ton URL
const supabaseKey = 'your-anon-key'; // remplace par ta clé
const supabase = createClient(supabaseUrl, supabaseKey);

const RapportMissionScreen = ({ userEmail }) => {
  const [rapport, setRapport] = useState('');
  const [totalDepenses, setTotalDepenses] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([
    { name: 'Alice', email: 'alice@example.com', selected: false },
    { name: 'Bob', email: 'bob@example.com', selected: false },
    { name: 'Charlie', email: 'charlie@example.com', selected: false },
  ]);

  const toggleUser = (email) => {
    setUsers(prev =>
      prev.map(u => u.email === email ? { ...u, selected: !u.selected } : u)
    );
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ ENREGISTRER LOCAL
  const handleSaveLocal = async () => {
    const data = {
      rapport,
      totalDepenses,
      startDate,
      endDate,
      membres: users.filter(u => u.selected).map(u => u.email),
    };
    await AsyncStorage.setItem('rapportMission', JSON.stringify(data));
    alert('Rapport enregistré localement');
  };

  // ✅ ENVOYER EN LIGNE (PARTAGE SUPABASE)
  const handleSendOnline = async () => {
    const membres = users.filter(u => u.selected).map(u => u.email);
    if (!rapport || membres.length === 0) {
      alert('Veuillez remplir le rapport et choisir des membres');
      return;
    }

    const { error } = await supabase.from('rapports').insert({
      auteur: userEmail,
      membres,
      rapport,
      date_debut: startDate.toISOString(),
      date_fin: endDate.toISOString(),
      depenses: parseFloat(totalDepenses),
    });

    if (error) {
      console.log(error);
      alert("Erreur d'envoi du rapport");
    } else {
      alert("Rapport envoyé avec succès !");
    }
  };

  // ✅ CHARGER DONNÉES LOCALES
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('rapportMission');
      if (saved) {
        const d = JSON.parse(saved);
        setRapport(d.rapport);
        setTotalDepenses(d.totalDepenses);
        setStartDate(new Date(d.startDate));
        setEndDate(new Date(d.endDate));
        setUsers(prev =>
          prev.map(u => ({
            ...u,
            selected: d.membres.includes(u.email),
          }))
        );
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo1.jpeg')} style={styles.logo} />

      <View style={styles.dates}>
        <TouchableOpacity onPress={() => setShowStart(true)}>
          <Text>Date début: {startDate.toDateString()}</Text>
        </TouchableOpacity>
        {showStart && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(e, d) => {
              setShowStart(false);
              if (d) setStartDate(d);
            }}
          />
        )}

        <TouchableOpacity onPress={() => setShowEnd(true)}>
          <Text>Date fin: {endDate.toDateString()}</Text>
        </TouchableOpacity>
        {showEnd && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(e, d) => {
              setShowEnd(false);
              if (d) setEndDate(d);
            }}
          />
        )}
      </View>

      <TextInput
        style={styles.search}
        placeholder="Rechercher un membre"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <CheckBox
              value={item.selected}
              onValueChange={() => toggleUser(item.email)}
            />
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <TextInput
        style={styles.rapport}
        placeholder="Écrire le rapport ici..."
        multiline
        value={rapport}
        onChangeText={setRapport}
      />

      <View style={styles.bottom}>
        <TextInput
          style={styles.depense}
          placeholder="Dépenses totales"
          value={totalDepenses}
          onChangeText={setTotalDepenses}
          keyboardType="numeric"
        />

        <View>
          <Button title="Enregistrer" onPress={handleSaveLocal} />
          <View style={{ marginTop: 10 }}>
            <Button title="Envoyer" onPress={handleSendOnline} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  logo: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center' },
  dates: { marginTop: 10, marginBottom: 10 },
  search: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 8, marginBottom: 10
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  rapport: {
    borderWidth: 1, borderColor: '#aaa', borderRadius: 8,
    height: 120, textAlignVertical: 'top', padding: 10, marginBottom: 10
  },
  depense: {
    borderWidth: 1, borderColor: '#aaa', borderRadius: 8,
    padding: 8, width: 140
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  }
});

export default RapportMissionScreen;
