import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import useDeviceOrientation from '../../hooks/useDeviceOrientation';

const LoginHelpScreen: React.FC = () => {
  const { width } = useWindowDimensions(); // 現在の画面サイズを取得
  const { isLandscape } = useDeviceOrientation(); // カスタムフックで向きを判定

  const isLargeScreen = width > 768; // iPadサイズを判定

  // 動的スタイルを生成
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#FFF8E1',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 20,
    },
    title: {
      fontSize: isLargeScreen ? 30 : 24,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#FF7043',
      textAlign: 'center',
    },
    section: {
      marginBottom: isLargeScreen ? 25 : 20,
    },
    heading: {
      fontSize: isLargeScreen ? 22 : 18,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 12 : 10,
      color: '#37474F',
    },
    text: {
      fontSize: isLargeScreen ? 20 : 16,
      color: '#37474F',
      lineHeight: isLargeScreen ? 28 : 24,
      marginBottom: 10,
    },
    note: {
      fontSize: isLargeScreen ? 18 : 14,
      color: '#757575',
      marginTop: 5,
    },
  });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>新規登録・ログインにお困りの方へ</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>第1条（新規登録について）</Text>
        <Text style={styles.text}>
          本アプリは、アプリをインストールしただけではご利用いただけません。
          必ずサインアップを行い、登録を完了する必要があります。
        </Text>
        <Text style={styles.text}>
          サインアップ時に登録いただいたメールアドレス宛に確認メールを送信します。
          確認メール内のURLをクリックしていただくことで、登録が完了となります。
        </Text>
        <Text style={styles.note}>
          ※URLをクリックしない場合、アカウントが有効化されませんのでご注意ください。
          アカウントが有効になった後、ログインが可能となります。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第2条（ログインについて）</Text>
        <Text style={styles.text}>
          ログインはメールに送信されるワンタイムパスワード（OTP）形式を採用しています。
        </Text>
        <Text style={styles.text}>
          サインアップ時に登録したメールアドレスを入力し、メールアドレス宛に送信されるワンタイムパスワードでログインしてください。
        </Text>
        <Text style={styles.note}>
          ※ワンタイムパスワードは一定時間で無効になりますので、お早めに入力をお願いします。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第3条（お問い合わせ）</Text>
        <Text style={styles.text}>
          新規登録やログインでお困りの場合は、以下のメールアドレスにお問い合わせください。
        </Text>
        <Text style={styles.text}>お問い合わせ先: info@sinamonoinfo.com</Text>
        <Text style={styles.note}>
          ※メールにてお問い合わせの際は、具体的な状況（例:
          どのような不具合が発生したか等）を記載いただけるとスムーズに対応できます。
        </Text>
        <Text style={styles.note}>
          ※件名に「介護記録アプリ（サインアップorログイン）のお問い合わせ」と記載していただくと、迅速に対応できます。
        </Text>
        <Text style={styles.note}>
          ※ログインに際してのお問い合わせは、登録いただいたメールアドレスを記載してください。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第4条（注意事項）</Text>
        <Text style={styles.text}>
          サインアップ時に登録したメールアドレスは正確にご入力ください。
          誤った情報を入力されるとログインができなくなる場合があります。
        </Text>
        <Text style={styles.note}>
          ※登録した情報を紛失した場合、再登録が必要になる場合があります。
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoginHelpScreen;
