import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  initConnection,
  endConnection,
  requestSubscription,
  getSubscriptions,
  getAvailablePurchases,
} from 'react-native-iap';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'Subscription'
>;

const SubscriptionScreen: React.FC = () => {
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp>();
  const [receiptData, setReceiptData] = useState<string | null>(null);

  const subscriptionId = 'com.example.careapp.premium_monthly_v3';

  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: '#FFF8E1',
      padding: isLargeScreen ? (isLandscape ? 40 : 30) : 20,
    },
    container: {
      flex: 1,
      backgroundColor: '#FFF8E1',
      alignItems: 'center',
      marginBottom: isLargeScreen ? 70 : 50,
    },
    title: {
      fontSize: isLargeScreen ? 32 : 24,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 24 : 16,
      color: '#FF7043',
    },
    section: {
      marginBottom: isLargeScreen ? 32 : 24,
      width: '100%',
      backgroundColor: '#FFF',
      padding: isLargeScreen ? 24 : 16,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    heading: {
      fontSize: isLargeScreen ? 22 : 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#455A64',
    },
    text: {
      fontSize: isLargeScreen ? 20 : 16,
      marginBottom: 8,
      color: '#37474F',
    },
    listItem: {
      fontSize: isLargeScreen ? 20 : 16,
      marginLeft: 16,
      marginBottom: 4,
      color: '#37474F',
    },
    question: {
      fontSize: isLargeScreen ? 20 : 16,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#37474F',
    },
    answer: {
      fontSize: isLargeScreen ? 20 : 16,
      marginBottom: 8,
      color: '#37474F',
    },
    subscriptionStatus: {
      fontSize: isLargeScreen ? 22 : 18,
      fontWeight: 'bold',
      marginTop: 8,
      marginBottom: 16,
    },
    active: {
      color: 'green',
    },
    inactive: {
      color: 'red',
    },
    subscribeButton: {
      backgroundColor: '#FF7043',
      paddingVertical: isLargeScreen ? 16 : 12,
      paddingHorizontal: isLargeScreen ? 28 : 24,
      borderRadius: 25,
      marginTop: isLargeScreen ? 16 : 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: isLargeScreen ? 24 : 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginLeft: 8, // ActivityIndicatorとの間にスペース
    },
  });

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        setLoading(true);
        await initConnection();
        console.log('IAP接続が確立されました');
      } catch (error) {
        console.error('IAP初期化エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeIAP();

    return () => {
      endConnection();
    };
  }, []);

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const products = await getSubscriptions({
        skus: ['com.example.careapp.premium_monthly_v3'],
      });
      console.log('取得した商品:', products);

      const userId = (await supabase.auth.getUser()).data.user?.id;

      const purchase = await requestSubscription({ sku: subscriptionId });
      console.log('購入成功:', purchase);
      const purchaseData = Array.isArray(purchase) ? purchase[0] : purchase;

      if (purchaseData) {
        const receipt = purchaseData.transactionReceipt;
        if (receipt) {
          setReceiptData(receipt);
          console.log('レシート情報を設定:', receipt);

          const response = await fetch(
            'https://mail-backend-iota.vercel.app/api/newcare/verify-receipt',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                receiptData: receipt,
                userId: userId,
              }),
            },
          );

          const responseData = await response.json();
          console.log('サーバーからのレスポンス:', responseData);
          Alert.alert('購入完了', 'サブスクリプションが有効になりました！');
        } else {
          console.log('レシート情報が見つかりません');
        }
      } else {
        console.log('購入情報が見つかりません');
      }
    } catch (error) {
      console.error('購入エラー:', error);
      Alert.alert(
        'エラー',
        `購入処理中に問題が発生しました`,
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmPurchase = () => {
    Alert.alert(
      '確認',
      'サブスクリプションを購入しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'OK', onPress: handlePurchase },
      ],
      { cancelable: false },
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>サブスクリプションについて</Text>

        {/* サブスクリプション状態 */}
        <View style={styles.section}>
          <Text style={styles.heading}>サブスクリプションの価格</Text>
          <Text style={styles.text}>月額:500円</Text>

          {!subscriptionActive && (
            <TouchableOpacity
              style={[styles.subscribeButton, loading && styles.disabledButton]}
              onPress={confirmPurchase}
              disabled={loading} // ローディング中はボタンを押せない
            >
              {loading && <ActivityIndicator color="#fff" />}
              <Text style={styles.buttonText}>サブスクリプションを購入</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* サブスクリプションの内容 */}
        <View style={styles.section}>
          <Text style={styles.heading}>サブスクリプションの内容</Text>
          <Text style={styles.text}>
            このアプリでは、月額500円のサブスクリプションで食事記録機能に加え、以下の機能が利用可能です:
          </Text>
          <Text style={styles.listItem}>・排泄記録機能</Text>
          <Text style={styles.listItem}>・睡眠記録機能</Text>
          <Text style={styles.listItem}>・バイタル記録機能</Text>
          <Text style={styles.listItem}>・活動記録機能</Text>
          <Text style={styles.listItem}>・PDF出力機能</Text>
          <Text style={styles.listItem}>・介護情報の閲覧</Text>
          <Text style={styles.listItem}>・カレンダー機能</Text>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.heading}>FAQ</Text>
          <Text style={styles.question}>
            Q: サブスクリプションを解約した場合、すぐに利用できなくなりますか？
          </Text>
          <Text style={styles.answer}>
            A: いいえ、解約してもサブスクリプションの有効期限まで利用できます。
          </Text>
        </View>

        {/* 解約方法 */}
        <View style={styles.section}>
          <Text style={styles.heading}>サブスクリプションの解約方法</Text>
          <Text style={styles.text}>
            以下の手順に従って、サブスクリプションを解約することができます:
          </Text>
          <Text style={styles.listItem}>
            1. iPhoneの「設定」アプリを開きます。
          </Text>
          <Text style={styles.listItem}>
            2. 一番上にある自分の名前をタップします。
          </Text>
          <Text style={styles.listItem}>
            3. 「サブスクリプション」を選択します。
          </Text>
          <Text style={styles.listItem}>
            4.
            このアプリを選び、「サブスクリプションをキャンセル」をタップします。
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SubscriptionScreen;
