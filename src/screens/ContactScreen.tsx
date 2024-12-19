import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import useAuthCheck from '../hooks/useAuthCheck';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type ContactScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Contact'>;
  route: RouteProp<RootStackParamList, 'Contact'>;
};

const ContactScreen: React.FC<ContactScreenProps> = ({ navigation }) => {
  useAuthCheck(); // ユーザー認証が完了しているかチェック

  const [email, setEmail] = useState<string>(''); // ログイン用メールアドレス
  const [subject, setSubject] = useState<string>(''); // お問い合わせ件名
  const [message, setMessage] = useState<string>(''); // お問い合わせ内容
  const [confirmEmail, setConfirmEmail] = useState<string>(''); // 確認用メールアドレス
  const [isLoading, setIsLoading] = useState(false); // ローディング状態

  const { isLandscape } = useDeviceOrientation();
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth > 768; // iPadサイズ判定

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: isLargeScreen ? (isLandscape ? 50 : 40) : 20,
      backgroundColor: '#FFF8E1',
      paddingBottom: isLargeScreen ? 150 : 100,
    },
    label: {
      fontSize: isLargeScreen ? 24 : 18,
      marginBottom: 10,
      alignSelf: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#AED581',
      borderRadius: 8,
      padding: isLargeScreen ? 14 : 10,
      backgroundColor: '#FFF',
      marginBottom: 20,
      height: isLargeScreen ? 60 : 50,
      fontSize: isLargeScreen ? 24 : 16,
      width: isLargeScreen ? '80%' : '100%',
      alignSelf: 'center',
    },
    textArea: {
      borderWidth: 1,
      borderColor: '#AED581',
      borderRadius: 8,
      padding: isLargeScreen ? 14 : 10,
      backgroundColor: '#FFF',
      marginBottom: 20,
      fontSize: isLargeScreen ? 18 : 16,
      width: isLargeScreen ? '80%' : '100%',
      alignSelf: 'center',
      height: isLargeScreen ? 200 : 150,
      textAlignVertical: 'top',
    },
    submitButton: {
      backgroundColor: '#FFB74D',
      paddingVertical: isLargeScreen ? 18 : 15,
      paddingHorizontal: isLargeScreen ? 40 : 20,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 20,
      width: isLargeScreen ? '40%' : '80%',
      alignSelf: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: isLargeScreen ? 26 : 18,
      fontWeight: 'bold',
    },
  });

  useEffect(() => {
    navigation.setOptions({
      title: 'お問い合わせ', // タイトルを設定
    });
  }, [navigation]);

  const handleSubmit = async () => {
    if (subject.length > 20) {
      Alert.alert('エラー', '件名は20文字以内で入力してください');
      return;
    }

    if (message.length > 1000) {
      Alert.alert('エラー', 'お問い合わせ内容は1000文字以内で入力してください');
      return;
    }

    if (!email || !subject || !message) {
      Alert.alert('エラー', '全ての項目を入力してください');
      return;
    }

    if (email !== confirmEmail) {
      Alert.alert('エラー', 'メールアドレスが一致しません');
      return;
    }

    Alert.alert('確認', 'お問い合わせ内容を送信してよろしいですか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '送信',
        onPress: async () => {
          try {
            setIsLoading(true); // 送信中はローディング表示
            const userId = (await supabase.auth.getUser()).data.user?.id;

            if (!userId) {
              Alert.alert('エラー', 'ユーザー情報の取得に失敗しました。');
              return;
            }

            // Supabaseで問い合わせ内容を保存
            const { error } = await supabase.from('contact_requests').insert([
              {
                user_id: userId,
                email: email,
                subject: subject,
                message: message,
                created_at: new Date(),
              },
            ]);

            if (error) {
              console.error('データ保存エラー:', error);
              Alert.alert('エラー', 'お問い合わせ内容の送信に失敗しました。1');
              return;
            }

            // メール送信用のリクエスト
            const response = await fetch(
              'https://recipeapp-096ac71f3c9b.herokuapp.com/api/send-email',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  toEmail: email,
                  subject: subject,
                  message: message,
                }),
              },
            );
            console.log('メール送信レスポンス:', response);

            if (response.ok) {
              Alert.alert(
                '送信完了',
                'お問い合わせ内容が正常に送信されました。後ほど記入いただいたアドレス宛に回答いたします。',
              );
              setEmail('');
              setConfirmEmail('');
              setSubject('');
              setMessage('');
            } else {
              console.error('メール送信エラー', response.statusText);
              Alert.alert('エラー', 'お問い合わせ内容の送信に失敗しました。2');
            }
          } catch (e) {
            console.error('データ保存中にエラーが発生しました:', e);
            Alert.alert('エラー', 'お問い合わせ内容の送信に失敗しました。3');
          } finally {
            setIsLoading(false); // ローディング終了
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>返信先メールアドレス</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="メールアドレスを入力してください"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>メールアドレス確認</Text>
        <TextInput
          style={styles.input}
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          placeholder="確認用メールアドレスを再度入力してください"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>件名 (20文字以内)</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="お問い合わせ件名を入力してください"
          maxLength={20}
        />

        <Text style={styles.label}>お問い合わせ内容 (1000文字以内)</Text>
        <TextInput
          style={[styles.input, { height: 150 }]}
          value={message}
          onChangeText={setMessage}
          placeholder="お問い合わせ内容をここに入力してください"
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={styles.submitButton}
          disabled={isLoading}
          onPress={handleSubmit}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" /> // スピナー表示
          ) : (
            <Text style={styles.buttonText}>問い合わせる</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ContactScreen;
