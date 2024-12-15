import supabase from '../config/supabaseClient';

/**
 * 指定された関数を一定回数リトライする
 * @param operation 実行する関数
 * @param retries 最大リトライ回数（デフォルト3）
 * @param delay リトライ間隔（ミリ秒、デフォルト1000ms）
 */
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await operation(); // 成功すれば結果を返す
    } catch (error) {
      attempt++;
      console.error(`リトライ ${attempt}/${retries} 失敗:`, error);

      if (attempt === retries) {
        throw new Error(`リトライ失敗: ${error}`);
      }

      // 次のリトライまで待機
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('リトライ回数を超えました');
};

/**
 * ユーザープロファイルの存在確認と作成（または更新）
 * @param originalTransactionId ユーザーのトランザクションID
 * @param email ユーザーのメールアドレス
 */
export const ensureUserProfile = async (userId: string, email: string) => {
  try {
    await retryOperation(async () => {
      const { error } = await supabase.from('user_profiles').upsert([
        {
          id: userId,
          email: email,
        },
      ]);

      if (error) {
        throw new Error(`Failed to upsert user profile: ${error.message}`);
      }
    });

    console.log('ユーザープロファイル作成または更新成功');
  } catch (error) {
    console.error('ユーザープロファイル作成または更新エラー:', error);
  }
};

/**
 * メールアドレスで user_profiles を確認する関数
 * @param email チェックするメールアドレス
 * @returns プロファイルが存在すればデータ、存在しなければ null
 */
export const checkUserProfileByEmail = async (email: string) => {
  try {
    // Supabase クエリで user_profiles を検索
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    // ユーザープロファイルデータを返す
    return data;
  } catch (err) {
    console.error('プロファイル確認エラー:', err);
    return null;
  }
};

/**
 * メールアドレスで subscriptions を確認する関数
 * @param email チェックするメールアドレス
 * @returns プロファイルが存在すればデータ、存在しなければ null
 */

export const checkSubscriptionByEmail = async (email: string) => {
  try {
    // Supabase クエリで subscriptions を検索
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    // ユーザープロファイルデータを返す
    return data;
  } catch (err) {
    console.error('サブスクリプション確認エラー:', err);
    return null;
  }
};
