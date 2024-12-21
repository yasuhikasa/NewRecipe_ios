import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import { getReceiptFromIAP, sendReceiptToServer } from '../utils/iapUtils';
import {
  checkSubscriptionByEmail,
  checkUserProfileByEmail,
  ensureUserProfile,
} from '../utils/userProfileUtils';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isTestLogin, setIsTestLogin] = useState<boolean>(false);
  // const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>(''); // 確認用メールアドレス
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']); // 6桁のOTP
  const otpRefs = useRef<(TextInput | null)[]>([]); // TextInputのrefを格納するためのuseRef
  const [isOtpModalVisible, setIsOtpModalVisible] = useState<boolean>(false); // OTP入力モーダル
  const [isSignUpModalVisible, setIsSignUpModalVisible] =
    useState<boolean>(false); // サインアップ確認モーダル
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [testEmail, setTestEmail] = useState<string>('');
  const [testPassword, setTestPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // ローディング状態

  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF8E1',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: isLargeScreen ? (isLandscape ? 50 : 40) : 20,
      paddingBottom: isLargeScreen ? 200 : 150,
    },
    title: {
      fontSize: isLargeScreen ? 32 : 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: isLargeScreen ? 40 : 20,
      color: '#333',
    },
    title2: {
      fontSize: isLargeScreen ? 26 : 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: isLargeScreen ? 40 : 30,
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#333',
    },
    label: {
      fontSize: isLargeScreen ? 24 : 16,
      marginBottom: 10,
      color: '#666',
      alignSelf: 'center',
    },
    input: {
      borderColor: '#AED581',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: isLargeScreen ? 20 : 15,
      marginBottom: isLargeScreen ? 30 : 20,
      backgroundColor: '#FFF',
      height: isLargeScreen ? 60 : 50,
      width: isLargeScreen ? '80%' : '100%',
      fontSize: isLargeScreen ? 24 : 16,
      maxWidth: 600,
      alignSelf: 'center',
    },
    button: {
      backgroundColor: '#AED581',
      paddingVertical: isLargeScreen ? (isLandscape ? 20 : 20) : 15,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: isLargeScreen ? 30 : 20,
      width: isLargeScreen ? (isLandscape ? '50%' : '70%') : '80%',
      alignSelf: 'center',
    },
    buttonText: {
      color: '#FFF',
      fontSize: isLargeScreen ? 26 : 16,
      fontWeight: 'bold',
    },
    switchText: {
      textAlign: 'center',
      color: 'blue',
      marginTop: isLargeScreen ? 25 : 15,
      fontSize: isLargeScreen ? 22 : 18,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#FFF',
      padding: isLargeScreen ? 50 : 30,
      borderRadius: 15,
      width: isLargeScreen ? '70%' : '90%',
      alignItems: 'center',
      elevation: 10,
    },
    modalTitle: {
      fontSize: isLargeScreen ? 28 : 20,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      textAlign: 'center',
    },
    modalText: {
      fontSize: isLargeScreen ? 24 : 16,
      marginBottom: isLargeScreen ? 25 : 20,
      textAlign: 'center',
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      marginBottom: isLargeScreen ? 30 : 20,
    },
    otpInput: {
      width: '16%',
      height: isLargeScreen ? 70 : 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      fontSize: isLargeScreen ? 28 : 20,
      backgroundColor: '#F9F9F9',
      textAlign: 'center',
    },
    cancelButton: {
      backgroundColor: '#FF7043',
      padding: isLargeScreen ? (isLandscape ? 20 : 20) : 15,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 10,
    },
  });

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        // サインアップ時、確認用メールアドレスと電話番号のバリデーション
        if (!email || !password || !confirmEmail) {
          Alert.alert('エラー', 'すべての項目を入力してください');
          return;
        }

        // メールアドレスのバリデーション
        if (!validateEmail(email)) {
          Alert.alert(
            'エラー',
            'メールアドレスの形式が正しくありません。\nまた半角で記入する必要があります。',
          );
          return;
        }

        // メールアドレスの一致確認
        if (email !== confirmEmail) {
          Alert.alert('エラー', '確認用メールアドレスが一致しません');
          return;
        }

        // // 電話番号のバリデーション
        // const cleanedPhoneNumber = phoneNumber.replace(/-/g, '');
        // if (
        //   cleanedPhoneNumber.length < 10 ||
        //   cleanedPhoneNumber.length > 11 ||
        //   isNaN(Number(cleanedPhoneNumber))
        // ) {
        //   Alert.alert(
        //     'エラー',
        //     '電話番号はハイフンなしの10桁または11桁の数値で入力してください',
        //   );
        //   return;
        // }

        // サインアップ確認モーダルを表示
        setIsSignUpModalVisible(true);
        // テスト用のログイン
      } else if ((email as string) === 'zaitakukiroku@gmail.com') {
        setIsTestLogin(true);
      } else {
        // ログイン時
        setIsLoading(true); // ローディング開始
        // メールアドレスのバリデーション
        if (!validateEmail(email)) {
          Alert.alert('エラー', 'メールアドレスの形式が正しくありません');
          return;
        }
        // ログイン時にOTPを送信
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          },
        });
        if (error) throw error;
        if (data) {
          setIsOtpModalVisible(true); // OTP入力モーダルを表示
        }
      }
    } catch (error: any) {
      Alert.alert(
        'エラー',
        'メールの送信に失敗しました。\n\nメールアドレスが正しいか確認してください。\n\nサインアップ時の確認メール内のURLをクリックしたか確認してください。\n\nサインアップが完了している場合はもう一度「確認メールを送る」をクリックしてください。',
      );
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const confirmSignUp = async () => {
    let userId: string | null = null; // ユーザーIDを格納
    try {
      setIsLoading(true); // ローディング開始
      //0.ユーザーの重複確認
      // user_profiles でメール確認
      const existingProfile = await checkUserProfileByEmail(email);

      if (existingProfile) {
        console.log('このメールアドレスは既に登録されています。');
        Alert.alert(
          'エラー',
          'このメールアドレスは既に登録されています。ログインしてください。',
        );
        return;
      }
      // subscriptions でメール確認
      const existingSubscription = await checkSubscriptionByEmail(email);
      if (existingSubscription) {
        console.log('このメールアドレスは既に登録されています。');
        Alert.alert(
          'エラー',
          'このメールアドレスは既に登録されています。ログインしてください。',
        );
        return;
      }

      // 1. サインアップ処理
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('サインアップエラー:', error.message);
        Alert.alert(
          'エラー',
          'サインアップに失敗しました。もう一度やり直してください。',
        );
        throw error;
      }

      if (!data || !data.user) {
        console.error(
          'サインアップ失敗: ユーザーが作成されませんでした。',
          data,
        );
        Alert.alert(
          'サインアップエラー',
          'ユーザー作成に失敗しました。もう一度やりなおしててください。',
        );
        return;
      }

      userId = data.user.id; // ユーザーIDを取得

      // // 2. レシート取得
      // const receipt = await getReceiptFromIAP();
      // if (!receipt) {
      //   console.warn('レシート取得エラー');
      // }

      // // レシートデータを解析してoriginal_transaction_idを抽出
      // let originalTransactionId: string | null = null;
      // try {
      //   const parsedReceipt = JSON.parse(receipt); // レシートがJSON文字列の場合
      //   originalTransactionId = parsedReceipt.original_transaction_id || null;
      // } catch (err) {
      //   console.warn('レシート解析エラー:', err);
      // }

      // if (!originalTransactionId) {
      //   console.warn('レシートに original_transaction_id が含まれていません。');
      // }

      // 3. ユーザープロファイル作成
      if (data && data.user) {
        const profileResponse = await fetch(
          'https://recipeapp-096ac71f3c9b.herokuapp.com/api/NewCareCreateUserProfiles',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              email,
              // phoneNumber,
              // originalTransactionId,
            }),
          },
        );

        if (!profileResponse.ok) {
          console.error(
            'プロフィール作成エラー:',
            await profileResponse.text(),
          );
        }
      }

      // // 4. サブスクリプション更新
      // if (receipt) {
      //   const subscriptionResponse = await sendReceiptToServer(receipt, email);

      //   if (!subscriptionResponse.ok) {
      //     console.error(
      //       'サブスクリプション更新エラー:',
      //       await subscriptionResponse.text(),
      //     );
      //   }
      // }

      // 5. 成功メッセージ
      Alert.alert(
        '※登録はまだ完了しておりません。',
        '登録いただいたメールアドレスに確認メールを送信しました。\nメール内のリンクをクリックしてサインアップが完了となります。\n\n（すでに登録済みの場合メールは届きません。）',
      );

      // 入力内容をリセット
      setEmail('');
      setPassword('');
      // setPhoneNumber('');
      setConfirmEmail('');
      setIsSignUp(false); // サインアップ状態をリセット

      // ログイン画面に戻る
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('エラー:', error.message);
      Alert.alert(
        'エラー',
        'サインアップ中にエラーが発生しました。もう一度やり直してください。',
      );
    } finally {
      setIsLoading(false); // ローディング終了
      setIsSignUpModalVisible(false);
    }
  };

  // OTPの確認
  const handleOtpSubmit = async () => {
    try {
      const otpCode = otp.join(''); // 入力された6桁のコードを結合

      // 本番環境でのOTP確認
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      console.log('OTP確認:', data);

      if (error) {
        Alert.alert(
          'エラー',
          '確認に失敗しました。もう一度数字を入力してください。\n期限が切れている場合は再度ワンタイムパスワードを取得してください。',
        );
        return;
      }

      if (data && data.session) {
        await saveSession(data.session);

        const userId = data.session.user.id;
        const email = data.session.user.email;

        if (userId && email) {
          // // 1. レシート取得
          // const receipt = await fetchSubscriptionReceipt();
          // // レシートデータを解析してoriginal_transaction_idを抽出
          // let originalTransactionId: string | null = null;
          // if (receipt) {
          //   try {
          //     const parsedReceipt = JSON.parse(receipt); // レシートがJSON文字列の場合
          //     originalTransactionId =
          //       parsedReceipt.original_transaction_id || null;
          //   } catch (err) {
          //     console.error('レシート解析エラー:', err);
          //   }
          // }

          // if (!originalTransactionId) {
          //   console.error(
          //     'originalTransactionId が取得できなかったため、プロファイルの更新はスキップされました。',
          //   );
          // } else {
          //   // originalTransactionId が存在する場合のみ ensureUserProfile を呼び出す
          //   await ensureUserProfile(originalTransactionId, email);
          // }

          // // 3. サブスクリプション更新
          // if (receipt) {
          //   const subscriptionResponse = await sendReceiptToServer(
          //     receipt,
          //     email,
          //   );

          //   if (!subscriptionResponse.ok) {
          //     console.error(
          //       'サブスクリプション更新エラー:',
          //       await subscriptionResponse.text(),
          //     );
          //   }
          // }
          await ensureUserProfile(userId, email);

          Alert.alert('ログイン成功', 'ログインしました。');
          resetOtpState();
          navigation.navigate('Dashboard');
        } else {
          // 万が一 userId または email がない場合
          console.error(
            'ログイン成功しましたが、ユーザー情報が不完全です:',
            data.session.user,
          );
          Alert.alert(
            'エラー',
            'ユーザー情報が不完全です。ログアウトしてやり直してください。',
          );
        }
      }
    } catch (error: any) {
      console.log('OTP確認エラー:', error);
      Alert.alert('エラー', 'OTPの確認に失敗しました。');
    }
  };

  // // テスト用のログイン
  // const testLogin = async () => {
  //   try {
  //     {
  //       const { data, error } = await supabase.auth.signInWithPassword({
  //         email: testEmail,
  //         password: testPassword,
  //       });
  //       if (error) throw error;
  //       if (data && data.user) {
  //         Alert.alert('ログイン成功', '正常にログインしました。');
  //         navigation.navigate('CareRecipient');
  //       }
  //     }
  //   } catch (error: any) {
  //     Alert.alert('エラー', error.message);
  //   }
  // };

  // セッション情報を保存
  async function saveSession(session: any) {
    try {
      await AsyncStorage.setItem('loginSession', JSON.stringify(session));
    } catch (error) {
      console.error('セッション保存エラー:', error);
    }
  }

  // OTPの状態をリセット
  function resetOtpState() {
    setIsOtpModalVisible(false); // モーダルを閉じる
    setIsSignUp(false); // サインアップ状態をリセット
    setEmail('');
    setOtp(['', '', '', '', '', '']); // OTPをリセット
  }

  // OTP入力を1つずつ管理
  const handleChangeOtp = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // 次のフィールドに移動
    if (text && index < otp.length - 1) {
      const nextField = index + 1;
      const nextInput = otpRefs.current[nextField];
      if (nextInput) nextInput.focus(); // 次のTextInputにフォーカスを移動
    }
  };

  // 文字を削除したときに前のフィールドにフォーカスを戻す
  const handleBackspace = (index: number) => {
    if (otp[index] === '') {
      // 前のフィールドにフォーカス
      if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // メールアドレスのバリデーション
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleToggle = () => {
    setEmail('');
    setPassword('');
    // setPhoneNumber('');
    setConfirmEmail('');
    setIsSignUp(!isSignUp);
  };

  const cancelAction = () => {
    Keyboard.dismiss();
    setIsOtpModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOSでのキーボード回避の動作を設定
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // キーボードが出ていてもタップを処理できるようにする
      >
        <Text style={styles.title}>
          {isSignUp ? 'サインアップ' : 'ログイン'}
        </Text>

        <Text style={styles.label}>メールアドレス:</Text>
        <TextInput
          style={styles.input}
          placeholder={
            isSignUp
              ? 'メールアドレスに認証用のメールが届きます'
              : 'メールアドレスを入力してください'
          }
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {isSignUp && (
          <>
            <Text style={styles.label}>確認用メールアドレス:</Text>
            <TextInput
              style={styles.input}
              placeholder="もう一度メールアドレスを入力してください"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
            />

            {/* <Text style={styles.label}>電話番号:</Text>
            <TextInput
              style={styles.input}
              placeholder="ハイフンなしで10桁または11桁"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            /> */}

            <Text style={styles.label}>パスワード:</Text>
            <TextInput
              style={styles.input}
              placeholder={
                isSignUp
                  ? '6文字以上の半角英数字、記号'
                  : 'パスワードを入力してください'
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={isLoading} // ローディング中はボタン無効化
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" /> // スピナー表示
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'サインアップ' : 'ワンタイムパスワードを送る'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.switchText} onPress={handleToggle}>
          {isSignUp
            ? '既にアカウントをお持ちの方はこちら(ログイン)'
            : 'アカウントをお持ちでない方はこちら（サインアップ）'}
        </Text>
        <Text
          style={styles.switchText}
          onPress={() => navigation.navigate('LoginHelp')}
        >
          新規登録、ログインにお困りの方へ
        </Text>
        {/* テスト用のログイン画面 */}
      </ScrollView>

      {/* OTPモーダル */}
      <Modal
        transparent={true}
        visible={isOtpModalVisible}
        animationType="fade"
        onRequestClose={() => setIsOtpModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => Keyboard.dismiss()}
        >
          {/* <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> */}
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              確認メール記載の６桁の認証コードを入力してください
            </Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleChangeOtp(text, index)}
                  onKeyPress={(e) => {
                    if (e.nativeEvent.key === 'Backspace') {
                      handleBackspace(index); // Backspaceが押されたときに前の入力に戻る
                    }
                  }}
                  keyboardType={
                    Platform.OS === 'ios' ? 'number-pad' : 'numeric'
                  }
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                  ref={(el) => (otpRefs.current[index] = el)} // refを設定
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.button}
              disabled={isLoading} // ローディング中はボタン無効化
              onPress={handleOtpSubmit}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" /> // スピナー表示
              ) : (
                <Text style={styles.buttonText}>ログインする</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelAction}
            >
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
          {/* </TouchableWithoutFeedback> */}
        </TouchableOpacity>
      </Modal>

      {/* サインアップ確認モーダル */}
      <Modal
        transparent={true}
        visible={isSignUpModalVisible}
        animationType="slide"
        onRequestClose={() => setIsSignUpModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {}}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                サインアップ確認メールの送信
              </Text>
              <Text style={styles.modalText}>
                確認メール内のURLをクリックしてサインアップが完了します。その後ログインができるようになります。
              </Text>
              <Text style={styles.modalText}>
                メールが届かない場合、迷惑フォルダもご確認ください。
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={confirmSignUp}
                disabled={isLoading} // ローディング中はボタン無効化
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" /> // スピナー表示
                ) : (
                  <Text style={styles.buttonText}>確認メールを送る</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsSignUpModalVisible(false)}
              >
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
