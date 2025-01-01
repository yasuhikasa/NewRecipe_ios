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
        <Text style={styles.text}>メールアドレス: info@sinamonoinfo.com</Text>
        <Text style={styles.note}>
          ※お問い合わせはメールでお願いいたします。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>第5条（販売価格）</Text>
        <Text style={styles.text}>アプリ内課金100円、200円（税込）</Text>
      </View>

      <Text style={styles.heading}>第6条（ポイント課金に関する規定）</Text>
      <Text style={styles.text}>
        本サービスでは、AIレシピ生成機能の利用にポイント課金制度を採用しています。
        {'\n\n'}
        ポイントはアプリ内課金を通じて購入することができ、購入したポイントを使用してAIによるレシピ生成が可能となります。
        {'\n\n'}
        各ポイントパッケージの価格および購入可能数は、アプリ内で表示される内容に従います。
        {'\n\n'}
        購入されたポイントは、購入者本人のアカウントにのみ適用され、第三者への譲渡、貸与、または売買はできません。
      </Text>

      <Text style={styles.heading}>第7条（ポイント管理および利用規約）</Text>
      <Text style={styles.text}>
        ユーザーは、購入したポイントを適切に管理し、AIレシピ生成機能にのみ使用するものとします。
        {'\n\n'}
        一度消費されたポイントは復元されません。アカウント削除時には未使用のポイントも削除されます。
        {'\n\n'}
        未使用のポイントは、有効期限が設定されている場合、その期限内に使用する必要があります。ポイントの有効期限についてはアプリ内で通知されます。
        {'\n\n'}
        ポイント購入後のキャンセルおよび返金は、各ストア（App Store または Google
        Play）のポリシーに従います。
      </Text>

      <Text style={styles.heading}>第8条（返金ポリシー）</Text>
      <Text style={styles.text}>
        ポイント購入後の返金は、各ストア（App Store または Google
        Play）の返金ポリシーに従います。
        {'\n\n'}
        運営者は、直接の返金対応を行いません。返金を希望される場合は、各ストアのサポートへお問い合わせください。
      </Text>

      <Text style={styles.heading}>第9条（免責事項）</Text>
      <Text style={styles.text}>
        本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
        {'\n\n'}
        サーバーの障害やメンテナンスなどにより、一時的にポイント利用やAIレシピ生成ができなくなる場合があります。
      </Text>

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
