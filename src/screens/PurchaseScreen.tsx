import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import RNIap, {
  Product as IAPProduct,
  initConnection,
  requestPurchase,
  finishTransaction,
  getProducts,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const skuToPointsMap: Record<string, number> = {
  'com.evample.recipe.points_100': 40,
  'com.evample.recipe.points_200': 100,
};

const PurchaseScreen: React.FC = () => {
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const { isLandscape } = useDeviceOrientation();

  const isLargeScreen = screenWidth > 768; // iPadかどうか判定

  useEffect(() => {
    const initializeIAP = async () => {
      try {
        console.log('Initializing IAP connection...');
        await initConnection();
        console.log('IAP connection initialized.');

        const items = await getProducts({ skus: Object.keys(skuToPointsMap) });
        console.log('Fetched products:', items);
        setProducts(items);
      } catch (error) {
        console.error('IAP Initialization Failed:', error);
        Alert.alert('エラー', 'IAPの初期化に失敗しました');
      }
    };

    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase) => {
        try {
          console.log('Purchase completed:', purchase);

          const pointsToAdd = skuToPointsMap[purchase.productId];
          if (!pointsToAdd) {
            throw new Error('購入アイテムが不明です');
          }

          console.log('Updating points in Supabase...');
          await updatePointsInSupabase(pointsToAdd);

          console.log('Finishing transaction...');
          await finishTransaction({
            purchase,
            isConsumable: true,
          });

          console.log('Transaction finished successfully.');
          Alert.alert('購入成功', 'ポイントが追加されました！');
        } catch (err) {
          console.error('Finish Transaction Failed:', err);
        } finally {
          setIsProcessing(false);
        }
      },
    );

    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.error('購入エラー:', error);
      setIsProcessing(false);
    });

    initializeIAP();

    return () => {
      console.log('Cleaning up IAP listeners...');
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, []);

  const updatePointsInSupabase = async (pointsToAdd: number): Promise<void> => {
    try {
      console.log('Fetching user data from Supabase...');
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user)
        throw new Error('ユーザー認証情報が取得できませんでした。');

      const userId = data.user.id;

      const { data: existingPoints, error: fetchError } = await supabase
        .from('points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingPoints)
        throw new Error('ポイント取得に失敗しました。');

      const newTotalPoints = existingPoints.total_points + pointsToAdd;

      const { error: updateError } = await supabase
        .from('points')
        .update({ total_points: newTotalPoints })
        .eq('user_id', userId);

      if (updateError) throw new Error('ポイント更新に失敗しました。');

      console.log(`ポイント更新成功: ${newTotalPoints}`);
    } catch (error) {
      console.error('ポイント更新エラー:', error);
      throw error;
    }
  };

  const handlePurchase = async (sku: string): Promise<void> => {
    try {
      console.log(`Requesting purchase for SKU: ${sku}`);
      setIsProcessing(true);
      await requestPurchase({ sku });
    } catch (error) {
      console.error('Purchase Request Failed:', error);
      setIsProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF8E1', padding: 20 },
    title: {
      fontSize: isLargeScreen ? 32 : 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    item: {
      margin: 12,
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    description: {
      fontSize: isLargeScreen ? 24 : 20,
      textAlign: 'center',
      marginBottom: 10,
    },
    button: {
      backgroundColor: '#FF7043',
      padding: isLargeScreen ? 16 : 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: isLargeScreen ? 22 : 18,
      color: '#FFFFFF',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
      marginTop: 16,
      fontSize: 18,
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ポイント購入</Text>
      {products.map((product) => (
        <View key={product.productId} style={styles.item}>
          <Text style={styles.description}>
            {product.title || product.localizedPrice}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePurchase(product.productId)}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>購入</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#FF7043" />
          <Text style={styles.modalText}>購入処理中です...</Text>
        </View>
      </Modal>
    </View>
  );
};

export default PurchaseScreen;
