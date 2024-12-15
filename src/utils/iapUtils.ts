import * as RNIap from 'react-native-iap';

/**
 * 指定回数リトライする汎用関数
 * @param operation 実行する非同期関数
 * @param retries 最大リトライ回数
 * @param delay リトライ間隔（ミリ秒）
 * @returns 実行結果
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await operation(); // 成功すれば結果を返す
    } catch (error) {
      attempt++;
      console.error(`Retry ${attempt}/${retries} failed:`, error);
      if (attempt === retries) throw error; // リトライ回数を超えたらエラーをスロー
      await new Promise((resolve) => setTimeout(resolve, delay)); // リトライ前に指定時間待機
    }
  }
  throw new Error('Max retries exceeded'); // 理論上ここには到達しない
}

/**
 * iOS用のレシートを取得（リトライ付き）
 * @returns レシートデータ（文字列）
 */
export const getReceiptFromIAP = async () => {
  try {
    // IAPの接続を初期化
    await RNIap.initConnection();
    console.log('IAP接続が確立されました');

    // 購入したすべてのアイテムを取得
    const availablePurchases = await RNIap.getAvailablePurchases();
    console.log('利用可能な購入:', availablePurchases);

    // 対象の商品IDを持つサブスクリプションを見つける
    const subscription = availablePurchases.find(
      (purchase) =>
        purchase.productId === 'com.example.careapp.premium_monthly_v3',
    );

    // レシート情報があれば、それを返す
    if (subscription) {
      return subscription.transactionReceipt || null;
    }

    return null; // 購入がない場合
  } catch (error) {
    console.error('レシートの取得に失敗しました:', error);
    return null;
  }
};

/**
 * レシート検証をサーバーに送信
 * @param receipt レシートデータ
 * @param userId サインアップしたユーザーのID
 * @returns サーバーからのレスポンス
 */
export async function sendReceiptToServer(
  receipt: string,
  email?: string,
): Promise<any> {
  try {
    const response = await fetch(
      'https://mail-backend-iota.vercel.app/api/newcare/NewCareUpdateSubscription',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt, email }),
      },
    );

    if (!response.ok) {
      console.error('Server Error:', response.statusText);
      throw new Error(`Server Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send receipt to server:', error);
    throw error;
  }
}
