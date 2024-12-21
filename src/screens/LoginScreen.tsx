import React, { useCallback, useEffect } from 'react';
import { View, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppleAuthentication from '@invertase/react-native-apple-authentication';
import supabase from '../config/supabaseClient';
import { RootStackParamList } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppleAuth from '@invertase/react-native-apple-authentication';
import { AppleButton } from '@invertase/react-native-apple-authentication';

import uuid from 'react-native-uuid';

console.log('AppleAuth isSupported:', AppleAuth.isSupported);

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { width } = useWindowDimensions();  // 画面の幅を取得

  // iPadや大きな画面用にボタンのサイズを調整
  const appleButtonWidth = width > 600 ? 320 : 200;

  const handleAppleSignIn = async () => {
    try {
      // 1. `nonce` を生成
      const nonce = uuid.v4().toString();

      // 2. Appleで認証
      const appleAuthResponse = await AppleAuthentication.performRequest({
        requestedOperation: AppleAuthentication.Operation.LOGIN,
        requestedScopes: [
          AppleAuthentication.Scope.EMAIL,
          AppleAuthentication.Scope.FULL_NAME,
        ],
        nonce, // 生成した `nonce` をリクエストに含める
      });

      // 3. `identityToken` の確認
      if (!appleAuthResponse.identityToken) {
        throw new Error(
          'Apple認証に失敗しました: identityTokenが取得できませんでした',
        );
      }

      // 4. Supabaseでサインイン
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleAuthResponse.identityToken,
        nonce, // Supabaseでも同じ `nonce` を渡す
      });

      if (error) {
        throw error;
      }

      // 5. 初回サインアップ時にユーザー情報を作成
      if (appleAuthResponse) {
        const userId = data.user.id;
        console.log('ユーザーID:', userId);

        const profileResponse = await fetch(
          'https://recipeapp-096ac71f3c9b.herokuapp.com/api/NewCareCreateUserProfiles',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          },
        );

        if (!profileResponse.ok) {
          console.error(
            'プロフィール作成エラー:',
            await profileResponse.text(),
          );
        }
      }

      // 6. セッション情報を保存
      await saveSession(data.session);

      // 7. ログイン後の画面遷移
      navigation.navigate('Dashboard');
    } catch (err) {
      console.error('サインインエラー:', err);
      Alert.alert('エラー', 'サインイン中に問題が発生しました');
    }
  };

  const saveSession = async (session: any) => {
    try {
      await AsyncStorage.setItem('loginSession', JSON.stringify(session));
    } catch (error) {
      console.error('セッション保存エラー:', error);
    }
  };

  const restoreSession = useCallback(async () => {
    try {
      const savedSession = await AsyncStorage.getItem('loginSession');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        const { data, error } = await supabase.auth.setSession(parsedSession);
        if (!error) {
          console.log('セッション復元成功:', data);
          navigation.navigate('Dashboard');
        } else {
          console.error('セッション復元エラー:', error.message);
        }
      }
    } catch (error) {
      console.error('セッション確認エラー:', error);
    }
  }, [navigation]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <View style={styles.container}>
      <View style={styles.appleButtonContainer}>
        {/* Appleサインインボタン */}
        <AppleButton
          style={[styles.appleButton, { width: appleButtonWidth }]}  // 幅を動的に設定
          buttonType={AppleButton.Type.SIGN_IN}
          buttonStyle={AppleButton.Style.WHITE}
          onPress={handleAppleSignIn}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
  },
  appleButtonContainer: {
    borderWidth: 1, // 枠線の太さ
    borderColor: 'black', // 枠線の色
    borderRadius: 5, // 角丸
  },
  appleButton: {
    width: 200,
    height: 44,
    borderRadius: 5, // ボタンの角も丸める
  },
});

export default LoginScreen;
