import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useGoogleAuth, handleGoogleSignIn } from '../../services/googleAuthService';
import { signIn } from '../../services/authService';
import Logo from '../../../assets/image.png';
import UsernameIcon from '../../../assets/username.svg';
import LockIcon from '../../../assets/lock.svg';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google Sign-In
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  const handleGoogleResponse = async () => {
    try {
      setLoading(true);
      await handleGoogleSignIn(response);
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Assuming username is email for now
      await signIn(username, password);
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('Signup');
  };

  const handleGoogleSignInPress = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(80, 42, 120, 1)', 'rgba(157, 89, 226, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logoImage} resizeMode="contain" />
          </View>

          {/* Username Input */}
          <View style={styles.inputWrapper}>
            <UsernameIcon width={21} height={25} style={styles.inputIcon} />
            {!username && <Text style={styles.label}>Email</Text>}
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#ffffff"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <View style={styles.underline} />
          </View>

          {/* Password Input */}
          <View style={styles.passwordWrapper}>
            <View style={styles.iconContainer}>
              <LockIcon width={21} height={27} />
            </View>
            {!password && <Text style={styles.label}>Password</Text>}
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#ffffff"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            <View style={styles.underline} />
          </View>

          {/* Log In Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#502A78" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={handleCreateAccount}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Log In With Google Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignInPress}
            disabled={loading || !request}
            activeOpacity={0.8}
          >
            <Text style={styles.googleButtonText}>Log In With Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    width: '80%',
    maxWidth: 300,
    height: 116,
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: '100%',
    maxWidth: 364,
    height: 116,
  },
  inputWrapper: {
    width: '80%',
    maxWidth: 300,
    height: 31,
    marginBottom: 30,
    overflow: 'visible',
  },
  passwordWrapper: {
    width: '80%',
    maxWidth: 300,
    height: 31,
    marginBottom: 40,
    overflow: 'visible',
  },
  iconContainer: {
    position: 'absolute',
    left: 0,
    top: 3,
    width: 21,
    height: 27,
  },
  inputIcon: {
    position: 'absolute',
    left: 0,
    top: 3,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 3,
    padding: 4,
  },
  label: {
    position: 'absolute',
    left: 89,
    top: 0,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
  input: {
    position: 'absolute',
    left: 89,
    top: 0,
    right: 0,
    height: 30,
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0,
    padding: 0,
  },
  underline: {
    position: 'absolute',
    left: 0,
    top: 30,
    width: '100%',
    height: 1,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    width: '80%',
    maxWidth: 300,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#000000',
    fontFamily: 'Itim-Regular',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
  createAccountButton: {
    width: '80%',
    maxWidth: 300,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  createAccountButtonText: {
    color: '#000000',
    fontFamily: 'Itim-Regular',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
  googleButton: {
    width: '80%',
    maxWidth: 300,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#000000',
    fontFamily: 'Itim-Regular',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 0,
  },
});
