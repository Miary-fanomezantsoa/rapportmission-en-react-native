import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';


const WelcomeScreen = ({ navigation }) => {
  const router = useRouter();
  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/logo1.jpeg')} style={styles.logo} />
        <Text style={styles.appTitle}>Mission Report</Text>
        <Text style={styles.subtitle}>Simplifiez la gestion de vos rapports de mission</Text>
      </View>


      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Commencer</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.6,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 50,
  },
  buttonText: {
    color: '#2c5364',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
