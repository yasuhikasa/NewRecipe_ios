// hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

interface SubscriptionStatus {
  isValid: boolean;
  status: string | null;
  expiresAt?: string;
  loading: boolean;
  error: string | null;
}

const useSubscription = (): SubscriptionStatus => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setLoading(true);
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) {
          setIsValid(false);
          setStatus(null);
          setLoading(false);
          return;
        }

        const { data: userSubs, error: userSubError } = await supabase
          .from('user_subscriptions')
          .select('original_transaction_id')
          .eq('user_id', userId);

        if (userSubError) throw userSubError;

        if (!userSubs || userSubs.length === 0) {
          setIsValid(false);
          setStatus(null);
          setLoading(false);
          return;
        }

        const transactionIds = userSubs.map(
          (sub) => sub.original_transaction_id,
        );

        const { data: subs, error: subsError } = await supabase
          .from('subscriptions')
          .select('status, expires_at')
          .in('original_transaction_id', transactionIds);

        if (subsError) throw subsError;

        if (!subs || subs.length === 0) {
          setIsValid(false);
          setStatus(null);
          setLoading(false);
          return;
        }

        // expires_atをUTCとして扱うために"YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ssZ"に変換
        const now = new Date();
        const validSubs = subs.filter((sub) => {
          // statusがactiveなら常に有効
          if (sub.status === 'active') {
            return true;
          }

          // activeでない場合、expires_atを確認
          if (!sub.expires_at || sub.expires_at === '0000-00-00 00:00:00') {
            // expires_atが無効または存在しない場合、activeでないなら無効
            return false;
          }

          // "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ssZ" へ変換
          const isoString = sub.expires_at.replace(' ', 'T') + 'Z';
          const subExpiry = new Date(isoString);

          // 有効な日付オブジェクトかチェック（不正な日付なら無効）
          if (isNaN(subExpiry.getTime())) {
            return false;
          }

          // 有効期限が現在より未来なら有効
          return subExpiry > now;
        });

        if (validSubs.length > 0) {
          setIsValid(true);
          const anyActive = validSubs.some((sub) => sub.status === 'active');
          setStatus(anyActive ? 'active' : 'valid');

          const latestExpiry = validSubs.reduce((latest, sub) => {
            const isoString = sub.expires_at.replace(' ', 'T') + 'Z';
            const subExpiry = new Date(isoString);
            return subExpiry > latest ? subExpiry : latest;
          }, new Date(0));
          setExpiresAt(latestExpiry.toISOString());
        } else {
          setIsValid(false);
          setStatus('expired');
        }
      } catch (err: any) {
        console.error(
          'サブスクリプションステータス取得中にエラーが発生しました:',
          err.message,
        );
        setError(err.message);
        setIsValid(false);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  return { isValid, status, expiresAt, loading, error };
};

export default useSubscription;
