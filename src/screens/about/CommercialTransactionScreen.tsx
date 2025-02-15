import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import useDeviceOrientation from '../../hooks/useDeviceOrientation';

const CommercialTransactionScreen: React.FC = () => {
  const { isLargeScreen, isLandscape } = useDeviceOrientation(); // カスタムフックで画面情報を取得

  // 動的スタイルを生成
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: '#FFF8E1',
      padding: isLargeScreen ? (isLandscape ? 60 : 40) : 20,
    },
    title: {
      fontSize: isLargeScreen ? 30 : 24,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#FF7043',
      textAlign: 'center',
    },
    section: {
      marginBottom: isLargeScreen ? 30 : 20,
    },
    heading: {
      fontSize: isLargeScreen ? 20 : 18,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 15 : 10,
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
      <Text style={styles.title}>特定商取引法に基づく表記</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>第1条（事業者名）</Text>
        <Text style={styles.text}>事業者名: 日笠 泰彰</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第2条（運営責任者）</Text>
        <Text style={styles.text}>運営責任者: 日笠 泰彰</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第3条（所在地）</Text>
        <Text style={styles.text}>
          所在地: 東京都中野区野方6-28-9ハイツエリカ201
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第4条（連絡先）</Text>
        <Text style={styles.text}>電話番号: 080-6759-6376</Text>
        <Text style={styles.text}>メールアドレス: nkun04183@gmail.com</Text>
        <Text style={styles.note}>
          ※お問い合わせはメールでお願いいたします。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第5条（販売価格）</Text>
        <Text style={styles.text}>アプリ内課金100円、200円（税込）</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第6条（支払い時期および方法）</Text>
        <Text style={styles.text}>1. 支払い方法: クレジットカード決済</Text>
        <Text style={styles.text}>2. 支払い時期: 購入時に決済</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第7条（商品代金以外に必要な料金）</Text>
        <Text style={styles.text}>
          本サービスの利用には、別途インターネット通信料が発生します。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第8条（サービスの提供時期）</Text>
        <Text style={styles.text}>
          購入手続き完了後、即時ご利用いただけます。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第9条（返品およびキャンセル）</Text>
        <Text style={styles.text}>
          1. サービスの性質上、返品・キャンセルはお受けできません。
        </Text>
        <Text style={styles.text}>
          2. 購入後のトラブルについては、サポート窓口にお問い合わせください。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第10条（動作環境）</Text>
        <Text style={styles.text}>1. iOS 13以上</Text>
        <Text style={styles.text}>2. Android 10以上</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第11条（特記事項）</Text>
        <Text style={styles.text}>
          1. 本サービスの内容については予告なく変更される場合があります。
        </Text>
        <Text style={styles.text}>
          2. ご利用規約をご確認のうえ、本サービスをご利用ください。
        </Text>
      </View>
    </ScrollView>
  );
};

export default CommercialTransactionScreen;
