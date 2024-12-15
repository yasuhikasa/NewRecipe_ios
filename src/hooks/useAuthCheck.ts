import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import supabase from '../config/supabaseClient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

/**
 * ユーザー認証が完了しているかチェックするカスタムフック
 * チェック後、未ログインの場合はログイン画面に遷移する
 */
const useAuthCheck = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isChecked, setIsChecked] = useState(false); // チェックが一度だけ行われるように管理

  useEffect(() => {
    if (isChecked) return; // すでにチェックが行われた場合、再度実行しない

    const checkUser = async () => {
      try {
        const { data: user, error } = await supabase.auth.getUser();

        if (error) {
          console.error('ユーザー情報取得エラー:', error.message);
          // Alert.alert('エラー', 'ユーザー情報の確認に失敗しました。');
          navigation.navigate('Login'); // ログイン画面に遷移
          return;
        }

        if (user) {
          // ユーザー情報が取得できた場合（ログイン中）、何もしない
          return;
        } else {
          // ユーザー情報がない場合（未ログイン）、Login画面に遷移
          Alert.alert('エラー', '認証が切れました。再度ログインしてください。');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('ユーザー情報取得中にエラー:', error);
        Alert.alert('エラー', '予期しないエラーが発生しました。');
        navigation.navigate('Login');
      } finally {
        setIsChecked(true); // チェック後に一度だけ実行されるようにフラグを設定
      }
    };

    checkUser(); // 初回チェック
  }, [navigation, isChecked]); // チェック済みでない場合にのみ実行
};

export default useAuthCheck;
