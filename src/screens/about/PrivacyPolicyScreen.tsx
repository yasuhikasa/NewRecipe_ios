import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import useDeviceOrientation from '../../hooks/useDeviceOrientation';

const PrivacyPolicyScreen: React.FC = () => {
  const { width } = useWindowDimensions(); // 現在の画面サイズを取得
  const { isLandscape } = useDeviceOrientation(); // デバイスの向きを判定

  const isLargeScreen = width > 768; // iPadかどうかを判定

  // 動的スタイルを生成
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#FFF8E1',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 20,
      paddingBottom: 100,
    },
    title: {
      fontSize: isLargeScreen ? (isLandscape ? 30 : 28) : 24,
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
  });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>プライバシーポリシー</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>第1条（個人情報の定義）</Text>
        <Text style={styles.text}>
          本プライバシーポリシーにおける「個人情報」とは、個人情報保護法に定義される「生存する個人に関する情報」を指します。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第2条（個人情報の収集方法）</Text>
        <Text style={styles.text}>
          当アプリでは、以下の方法によりユーザーの個人情報を収集します。
        </Text>
        <Text style={styles.text}>1. ユーザーが登録フォームに入力する情報</Text>
        <Text style={styles.text}>
          2. サービス利用に伴い自動的に収集される情報
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第3条（個人情報の利用目的）</Text>
        <Text style={styles.text}>
          収集した個人情報は、以下の目的で利用します。
        </Text>
        <Text style={styles.text}>
          1. ユーザーへのサービス提供および運営のため
        </Text>
        <Text style={styles.text}>2. ユーザーサポートのため</Text>
        <Text style={styles.text}>
          3. サービスの改善および新サービス開発のため
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第4条（個人情報の第三者提供）</Text>
        <Text style={styles.text}>
          当アプリでは、ユーザーの同意がある場合を除き、第三者に個人情報を提供することはありません。ただし、以下の場合を除きます。
        </Text>
        <Text style={styles.text}>1. 法令に基づく場合</Text>
        <Text style={styles.text}>
          2.
          人の生命、身体または財産の保護のために必要がある場合で、本人の同意を得ることが困難な場合
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第5条（個人情報の開示・訂正・削除）</Text>
        <Text style={styles.text}>
          ユーザーは、当アプリに対して自己の個人情報の開示、訂正、削除を求めることができます。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第6条（プライバシーポリシーの変更）</Text>
        <Text style={styles.text}>
          本ポリシーは、必要に応じて変更されることがあります。変更後のポリシーは、当アプリ内で通知されるものとします。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第7条（お問い合わせ）</Text>
        <Text style={styles.text}>
          プライバシーポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
        </Text>
        <Text style={styles.text}>メールアドレス: info@sinamonoinfo.com</Text>
      </View>
    </ScrollView>
  );
};


export default PrivacyPolicyScreen;
