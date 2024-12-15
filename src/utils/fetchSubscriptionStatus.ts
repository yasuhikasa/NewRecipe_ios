import supabase from '../config/supabaseClient';
import { getReceiptFromIAP } from './iapUtils';

type SubscriptionStatus =
  | {
      status: 'active' | 'expired';
      expiresAt: string;
    }
  | {
      status: 'not_subscribed';
    }
  | {
      status: 'error';
      message: string;
    };

const fetchSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    // レシートを取得
    const receipt = await getReceiptFromIAP();
    if (!receipt) {
      console.error('レシートの取得に失敗しました。');
      return { status: 'not_subscribed' };
    }

    // レシート解析
    let originalTransactionId: string | null = null;
    try {
      const parsedReceipt = JSON.parse(receipt);
      originalTransactionId = parsedReceipt.original_transaction_id || null;
    } catch (err) {
      console.error('レシート解析エラー:', err, 'Receipt:', receipt);
      return {
        status: 'error',
        message: 'レシート解析に失敗しました。',
      };
    }

    if (!originalTransactionId) {
      console.error('Original Transaction ID がありません。');
      return { status: 'not_subscribed' };
    }

    // Supabase からサブスクリプション状態を取得
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, expires_at')
      .eq('original_transaction_id', originalTransactionId)
      .single();

    if (error) {
      console.error(
        'サブスクリプション情報の取得に失敗しました:',
        error.message,
      );
      return {
        status: 'error',
        message: 'サブスクリプション情報の取得に失敗しました。',
      };
    }

    if (!data) {
      console.log('サブスクリプションが見つかりませんでした。');
      return { status: 'not_subscribed' };
    }

    // サブスクリプション状態を返却
    return {
      status: data.status as 'active' | 'expired',
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error(
      'サブスクリプション情報の取得中にエラーが発生しました:',
      error,
    );
    return {
      status: 'error',
      message: '予期しないエラーが発生しました。',
    };
  }
};

export default fetchSubscriptionStatus;
