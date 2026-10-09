import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../context/Api';
import { prefetchCatalogData } from '../../services/catalogPrefetch';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  useEffect(() => {
    // Pre-warm home catalog in background during login
    prefetchCatalogData().catch(() => {});
  }, []);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(true);
  const [errMessage, setErrMessage] = useState('');

  // Format full international number
  const getFullPhone = () => {
    const cleaned = phoneNumber.replace(/^0+/, ''); // remove leading zero if entered
    return `+234${cleaned}`;
  };

  // Custom Keypad Press Handler
  const handleKeyPress = (val: string) => {
    if (errMessage) setErrMessage('');

    if (val === 'backspace') {
      if (step === 'phone') {
        setPhoneNumber((prev) => prev.slice(0, -1));
      } else {
        const newOtp = [...otpCode];
        for (let i = newOtp.length - 1; i >= 0; i--) {
          if (newOtp[i] !== '') {
            newOtp[i] = '';
            break;
          }
        }
        setOtpCode(newOtp);
      }
      return;
    }

    if (step === 'phone') {
      if (phoneNumber.length < 11) {
        setPhoneNumber((prev) => prev + val);
      }
    } else {
      const newOtp = [...otpCode];
      const emptyIndex = newOtp.findIndex((digit) => digit === '');
      if (emptyIndex !== -1) {
        newOtp[emptyIndex] = val;
        setOtpCode(newOtp);
      }
    }
  };

  // Clear all inputs on long press
  const handleClearAll = () => {
    if (errMessage) setErrMessage('');
    if (step === 'phone') {
      setPhoneNumber('');
    } else {
      setOtpCode(['', '', '', '', '', '']);
    }
  };

  // 1. Trigger API call to send OTP
  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 7) {
      setErrMessage('Please enter a valid mobile number');
      return;
    }

    setErrMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: getFullPhone() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to send OTP.');
      }

      setStep('otp');
    } catch (err: any) {
      setErrMessage(err.message || 'Error sending code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Trigger API call to verify OTP and Sign In
  const handleVerify = async () => {
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      setErrMessage('Please enter the complete 6-digit verification code');
      return;
    }

    setErrMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: getFullPhone(),
          code: fullCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Verification failed.');
      }

      // 1. Navigate directly to Subscription screen
      router.replace('/(subscription)' as any);

      // 2. Store session and set first timer to false
      await signIn(data.user, data.token);
    } catch (err: any) {
      setErrMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const keys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '', sub: '' },
    { num: '0', sub: '' },
    { num: 'backspace', sub: '' },
  ];

  const activeOtpIndex = otpCode.findIndex((digit) => digit === '');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {step === 'otp' ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setErrMessage('');
              setStep('phone');
            }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/asapfull.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          {step === 'phone' ? (
            <>
              <Text style={styles.title}>Ready to start streaming?</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number and we will send you a code via <Text style={styles.whatsappBold}>SMS/WhatsApp</Text>
              </Text>

              <View style={styles.phoneInputRow}>
                <View style={[
                  styles.countryCodeBox,
                  isPhoneFocused && !errMessage && styles.highlightedBorder,
                  !!errMessage && styles.errorBorder
                ]}>
                  <Text style={styles.countryCodeText}>+234</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setIsPhoneFocused(true)}
                  style={[
                    styles.inputWrapper,
                    { flex: 1 },
                    isPhoneFocused && !errMessage && styles.highlightedBorder,
                    !!errMessage && styles.errorBorder,
                  ]}>
                  <Text style={phoneNumber ? styles.inputText : styles.placeholderText}>
                    {phoneNumber || 'Enter mobile number'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!!errMessage && (
                <Text style={styles.errorText}>{errMessage}</Text>
              )}

              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleSendCode}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionButtonText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to +234 {phoneNumber}.
              </Text>

              <TouchableOpacity onPress={() => {
                setErrMessage('');
                setStep('phone');
              }}>
                <Text style={styles.changePhoneText}>Change phone number?</Text>
              </TouchableOpacity>

              <View style={styles.otpRow}>
                {otpCode.map((digit, index) => {
                  const isActive = index === (activeOtpIndex === -1 ? 5 : activeOtpIndex);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isActive && !errMessage && styles.highlightedBorder,
                        !!errMessage && styles.errorBorder,
                      ]}>
                      <Text style={styles.otpText}>{digit}</Text>
                    </View>
                  );
                })}
              </View>

              {!!errMessage && (
                <Text style={styles.errorText}>{errMessage}</Text>
              )}

              <Text style={styles.timerText}>
                This code will expire in <Text style={{ color: '#FFFFFF' }}>5 minutes</Text>.
              </Text>
              <Text style={styles.resendText}>
                Didn't get a code? <Text style={styles.resendLink} onPress={handleSendCode}>Resend code</Text>
              </Text>

              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleVerify}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionButtonText}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Custom Keypad */}
      <View style={styles.keypadContainer}>
        <View style={styles.keypadGrid}>
          {keys.map((key, idx) => {
            if (key.num === '') {
              return <View key={idx} style={styles.keyTileEmpty} />;
            }
            return (
              <TouchableOpacity
                key={idx}
                style={styles.keyTile}
                activeOpacity={0.7}
                onPress={() => handleKeyPress(key.num)}
                onLongPress={key.num === 'backspace' ? handleClearAll : undefined}
                delayLongPress={300}>
                {key.num === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={22} color="#000000" />
                ) : (
                  <>
                    <Text style={styles.keyNumText}>{key.num}</Text>
                    {key.sub ? <Text style={styles.keySubText}>{key.sub}</Text> : null}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  backButtonPlaceholder: {
    height: 32,
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 50,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 18,
    lineHeight: 18,
  },
  whatsappBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  countryCodeBox: {
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333338',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: 10,
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrapper: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333338',
    paddingHorizontal: 16,
  },
  highlightedBorder: {
    borderColor: '#3556F7',
    borderWidth: 1.5,
  },
  errorBorder: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
    fontWeight: '500',
  },
  inputText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  placeholderText: {
    color: '#777779',
    fontSize: 15,
  },
  changePhoneText: {
    color: '#38BDF8',
    fontSize: 13,
    marginBottom: 14,
    fontWeight: '500',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  otpBox: {
    width: 42,
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333338',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
    marginTop: 6,
  },
  resendText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  resendLink: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#3556F7',
    width: 180,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  keypadContainer: {
    backgroundColor: '#8E8E93',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keyTile: {
    width: '31%',
    height: 46,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyTileEmpty: {
    width: '31%',
    height: 46,
    marginBottom: 8,
  },
  keyNumText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  keySubText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4B5563',
    letterSpacing: 1,
    marginTop: -2,
  },
});