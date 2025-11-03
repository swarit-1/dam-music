import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signUp } from '../../services/authService';
import { useGoogleAuth, handleGoogleSignIn } from '../../services/googleAuthService';

export default function SignupScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
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
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    value:string,
    onChangeText: (text: string) => void,
    placeholder: string,
    style?: any,
    rightIcon?: React.ReactNode,
    secureTextEntry?: boolean
  ) => (
    <View style={[styles.inputWrapper, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ffffff"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {rightIcon && <View style={styles.inputRightIcon}>{rightIcon}</View>}
    </View>
  )

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !dateOfBirth || !location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (!termsAccepted) {
      Alert.alert('Error', 'Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, `${firstName} ${lastName}`);
      console.log('Signup successful, navigating to ProfileCustomization');
      // Reset navigation stack to ProfileCustomization, removing Login and Signup from history
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileCustomization' }],
      });
      console.log('Navigation reset called');
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
      setLoading(false);
    }
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
      colors={['rgba(81, 43, 121, 1)', 'rgba(149, 79, 223, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/*Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLine}/>
          <View style={[styles.progressLine, styles.progressLineInactive]}/>
          <View style={[styles.progressLine, styles.progressLineInactive, { marginRight: 0 }]}/>
        </View>

        <Text style={styles.title}>Create Your{'\n'}Account</Text>
      <View style={styles.row}>
        <View style={[styles.halfWidth, { marginRight: 10 }]}>
          <Text style={styles.inputLabel}>First Name</Text>
          {renderInputField(
            firstName,
            setFirstName,
            '',
            styles.inputFieldHalf
          )}
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.inputLabel}>Last Name</Text>
          {renderInputField(
            lastName,
            setLastName,
            '',
            styles.inputFieldHalf
          )}
        </View>
      </View>
      <Text style={styles.inputLabel}>Email</Text>
      {renderInputField(email, setEmail, '', styles.inputField)}
      <Text style={styles.inputLabel}>Username</Text>
      {renderInputField(username, setUsername, '', styles.inputField)}
      <Text style={styles.inputLabel}>Password</Text>
      {renderInputField(
        password,
        setPassword,
        '',
        styles.inputField,
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <MaterialIcons 
            name={showPassword ? "visibility" : "visibility-off"} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>,
        !showPassword
      )}
      <View style={styles.confirmPasswordWrapper}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        {renderInputField(
          confirmPassword,
          setConfirmPassword,
          '',
          styles.inputField,
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <MaterialIcons 
              name={showConfirmPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>,
          !showConfirmPassword
        )}
      </View>
      <Text style={styles.inputLabel}>DD/MM/YYYY</Text>
      {renderInputField(
        dateOfBirth,
        setDateOfBirth,
        '',
        styles.inputFieldWhite,
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffffff" />
      )}
      <Text style={styles.inputLabel}>Location</Text>
      {renderInputField(
        location,
        setLocation,
        '',
        styles.inputFieldWhite,
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffffff" />
      )}
      <View style={styles.termsContainer}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          {termsAccepted && <MaterialIcons name="check" size={20} color="#ffffff" />}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing you are agreeing to VibeCheck's terms and conditions
        </Text>
      </View>
      <View style={styles.dividerLine} />
      <TouchableOpacity
        style={[styles.createAccountButton, loading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={loading || !termsAccepted}
      >
        {loading ? (
          <ActivityIndicator color="#502A78" />
        ) : (
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    flexGrow: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  progressLine: {
    height: 4,
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginRight: 10,
  },
  progressLineInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    fontFamily: 'serif',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Itim-Regular',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#b9b9b9',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputField: {
    // Same as inputWrapper
  },
  inputFieldHalf: {
    // Same as inputWrapper but for half width
  },
  inputFieldWhite: {
    borderColor: '#ffffff',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Itim-Regular',
  },
  inputRightIcon: {
    paddingLeft: 10,
  },
  confirmPasswordWrapper: {
    marginBottom: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Itim-Regular',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#ffffff',
    marginVertical: 10,
  },
  createAccountButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  createAccountButtonText: {
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Itim-Regular',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});