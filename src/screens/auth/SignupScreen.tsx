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
  Modal,
  Appearance,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  // Google Sign-In
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => subscription?.remove();
  }, []);

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
            Alert.alert("Error", "Passwords do not match");
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
      // Navigate to ProfileCustomization, keeping Signup in navigation history
      navigation.push('ProfileCustomization');
      console.log('Navigation called');
      setLoading(false);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
      setLoading(false);
    }
  };

  const handleDevSkip = () => {
    // Fill unfilled fields with mock data
    if (!firstName) setFirstName('Alex');
    if (!lastName) setLastName('Morgan');
    if (!email) setEmail('alex.morgan@example.com');
    if (!username) setUsername('alexmorgan');
    if (!password) setPassword('password123');
    if (!confirmPassword) setConfirmPassword('password123');
    if (!dateOfBirth) setDateOfBirth('15/06/1990');
    if (!location) setLocation('Austin, TX');
    if (!termsAccepted) setTermsAccepted(true);
    
    // Navigate directly to ProfileCustomization with dev skip flag
    console.log('Dev skip activated, navigating to ProfileCustomization');
    navigation.push('ProfileCustomization', { fromDevSkip: true });
  };

  return (
    <LinearGradient
      colors={['rgba(81, 43, 121, 1)', 'rgba(149, 79, 223, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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

        <View style={styles.titleRow}>
          <Text style={styles.title}>Create Your{'\n'}Account</Text>
          
          <TouchableOpacity
            style={[styles.devSkipButton, loading && styles.buttonDisabled]}
            onPress={handleDevSkip}
            disabled={loading}
          >
            <Text style={styles.devSkipButtonText}>Dev Skip → Profile</Text>
          </TouchableOpacity>
        </View>
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
      <Text style={styles.inputLabel}>Date of Birth</Text>
      <TouchableOpacity 
        style={[
          styles.inputWrapper, 
          colorScheme === 'dark' && styles.inputWrapperDark
        ]} 
        onPress={() => {
          if (dateOfBirth) {
            const [day, month, year] = dateOfBirth.split('/');
            setSelectedDay(parseInt(day));
            setSelectedMonth(parseInt(month) - 1);
            setSelectedYear(parseInt(year));
          }
          setShowDatePicker(!showDatePicker);
        }}
      >
        <Text style={[styles.input, { color: (dateOfBirth ? '#ffffff' : '#ffffff80'), paddingTop: 2 }]}>
          {dateOfBirth || 'Select Date'}
        </Text>
        <MaterialIcons name="calendar-today" size={20} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.inputLabel}>Location</Text>
      {renderInputField(location, setLocation, 'Enter your city')}
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
      </KeyboardAvoidingView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerContainer}>
            <View style={[styles.datePickerContent, colorScheme === 'dark' && styles.datePickerDark]}>
              <Text style={[styles.datePickerTitle, colorScheme === 'dark' && styles.datePickerTitleDark]}>Select Date of Birth</Text>
              
              <View style={styles.pickerRow}>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        colorScheme === 'dark' && styles.pickerItemTextDark,
                        selectedDay === day && styles.pickerItemTextSelected
                      ]}>
                        {day.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === index && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(index)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        colorScheme === 'dark' && styles.pickerItemTextDark,
                        selectedMonth === index && styles.pickerItemTextSelected
                      ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        colorScheme === 'dark' && styles.pickerItemTextDark,
                        selectedYear === year && styles.pickerItemTextSelected
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerButtons}>
                <TouchableOpacity
                  style={[styles.datePickerButton, colorScheme === 'dark' && styles.datePickerButtonDark]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.datePickerButtonText, colorScheme === 'dark' && styles.datePickerButtonTextDark]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton, 
                    styles.datePickerButtonConfirm,
                    colorScheme === 'dark' && styles.datePickerButtonConfirmDark
                  ]}
                  onPress={() => {
                    const day = selectedDay.toString().padStart(2, '0');
                    const month = (selectedMonth + 1).toString().padStart(2, '0');
                    setDateOfBirth(`${day}/${month}/${selectedYear}`);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextConfirm]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontFamily: 'KdamThmorPro',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  halfWidth: {
    flex: 1,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'LeagueSpartan',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputWrapperDark: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  inputField: {
    // Same as inputWrapper
  },
  inputFieldHalf: {
    // Same as inputWrapper but for half width
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
  },
  inputRightIcon: {
    paddingLeft: 10,
  },
  confirmPasswordWrapper: {
    marginBottom: 15,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'LeagueSpartan',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  devSkipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  devSkipButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    width: '90%',
    maxWidth: 400,
  },
  datePickerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  datePickerDark: {
    backgroundColor: 'rgba(60, 30, 90, 0.98)',
  },
  datePickerTitle: {
    fontSize: 20,
    fontFamily: 'KdamThmorPro',
    color: '#502A78',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePickerTitleDark: {
    color: '#ffffff',
  },
  pickerRow: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: '#954FDF',
  },
  pickerItemText: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
    color: '#502A78',
  },
  pickerItemTextDark: {
    color: '#ffffff',
  },
  pickerItemTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#502A78',
    alignItems: 'center',
  },
  datePickerButtonDark: {
    borderColor: '#ffffff',
  },
  datePickerButtonConfirm: {
    backgroundColor: '#502A78',
  },
  datePickerButtonConfirmDark: {
    backgroundColor: '#954FDF',
  },
  datePickerButtonText: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan',
    color: '#502A78',
  },
  datePickerButtonTextDark: {
    color: '#ffffff',
  },
  datePickerButtonTextConfirm: {
    color: '#ffffff',
  },
});