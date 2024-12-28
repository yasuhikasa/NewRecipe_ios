import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import useDeviceOrientation from '../../hooks/useDeviceOrientation';

const AppOperatorScreen: React.FC = () => {
  const { isLargeScreen } = useDeviceOrientation();

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#FFF8E1',
      padding: isLargeScreen ? 40 : 20, // 横向きの場合に余白を広げる
      marginBottom: 100,
      height: '100%',
    },
    title: {
      fontSize: isLargeScreen ? 28 : 24,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#FF7043',
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: isLargeScreen ? 26 : 24,
      fontWeight: 'bold',
      marginTop: isLargeScreen ? 30 : 20,
      marginBottom: isLargeScreen ? 20 : 10,
      color: '#FF7043',
    },
    text: {
      fontSize: isLargeScreen ? 20 : 20,
      color: '#37474F',
      lineHeight: isLargeScreen ? 28 : 24,
      marginBottom: 10,
    },
    note: {
      fontSize: isLargeScreen ? 20 : 16,
      color: '#777',
      fontStyle: 'italic',
      marginBottom: isLargeScreen ? 30 : 20,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>運営者について</Text>
      <Text style={styles.sectionTitle}>運営者情報</Text>
      <Text style={styles.text}>運営者名: 日笠 泰彰</Text>
      <Text style={styles.text}>
        所在地: 東京都中野区野方6-28-9ハイツエリカ201
      </Text>
      <Text style={styles.text}>連絡先: info@sinamonoinfo.com</Text>
      <Text style={styles.note}>※お問い合わせはメールでお願いいたします。</Text>
    </ScrollView>
  );
};

export default AppOperatorScreen;
