import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppleAuthentication from '@invertase/react-native-apple-authentication';
import supabase from '../config/supabaseClient';
import { RootStackParamList } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import RecipeSampleModal from '../components/RecipeSampleModal';
import AppleAuth from '@invertase/react-native-apple-authentication';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import uuid from 'react-native-uuid';

console.log('AppleAuth isSupported:', AppleAuth.isSupported);

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isModalVisible, setModalVisible] = useState(false);
  const { isLandscape, isLargeScreen } = useDeviceOrientation();

  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#FFF8E1',
      paddingVertical: isLargeScreen ? (isLandscape ? 80 : 60) : 40,
      paddingHorizontal: isLargeScreen ? 40 : 20,
    },
    description: {
      fontSize: isLargeScreen ? 20 : 16,
      color: '#333',
      textAlign: 'center',
      marginBottom: isLargeScreen ? 30 : 20,
    },
    announcementText: {
      fontSize: isLargeScreen ? 22 : 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: isLargeScreen ? 30 : 20,
    },
    announcementText2: {
      fontSize: isLargeScreen ? 22 : 18,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 30,
      marginBottom: isLargeScreen ? 30 : 20,
    },
    appleButtonContainer: {
      marginVertical: isLargeScreen ? 30 : 20,
    },
    appleButton: {
      width: isLargeScreen ? 300 : 200,
      height: isLargeScreen ? 60 : 44,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#000',
    },
    switchText: {
      textAlign: 'center',
      color: 'blue',
      marginVertical: isLargeScreen ? 15 : 10,
      fontSize: isLargeScreen ? 22 : 18,
    },
    recipeButton: {
      backgroundColor: '#ff6347',
      padding: isLargeScreen ? 20 : 14,
      borderRadius: 8,
      marginVertical: isLargeScreen ? 20 : 10,
      width: '80%',
      alignItems: 'center',
      marginBottom: isLargeScreen ? 30 : 20,
    },
    recipeButtonText: {
      color: '#fff',
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: 'bold',
    },
  });

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

      console.log('サインイン成功:', data);
      const userId = data?.user?.id;
      console.log('ユーザーID:', userId);
      if (error) {
        console.error('サインインエラー:', error);
        throw error;
      }
      if (!userId) {
        throw new Error('ユーザーIDが取得できませんでした');
      }

      const { data: userProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && !userProfile) {
        console.log(
          '新規サインアップ: プロファイル作成とポイント付与を開始します',
        );
        await createUserProfile(userId);
        await addSignupPoints(userId);
      } else if (fetchError) {
        throw fetchError;
      }

      // 7. セッション情報を保存
      await saveSession(data.session);

      // 8. ログイン後の画面遷移
      navigation.replace('Dashboard');
    } catch (err) {
      console.error('サインインエラー:', err);
      Alert.alert('エラー', 'サインイン中に問題が発生しました');
    }
  };

  // プロファイル作成処理
  const createUserProfile = async (userId: string) => {
    try {
      const response = await fetch(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/NewCareCreateUserProfiles',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }
      console.log('プロファイル作成成功:', userId);
    } catch (error) {
      console.error('プロファイル作成エラー:', error);
    }
  };

  // 初回ボーナスポイント付与処理
  const addSignupPoints = async (userId: String) => {
    try {
      // 新規作成
      console.log('ポイントを新規作成します:', userId);
      const { error: insertError } = await supabase.from('points').insert({
        user_id: userId,
        total_points: 15,
      });

      if (insertError) {
        console.error('ポイント追加エラー:', insertError);
        throw insertError;
      }

      console.log('ポイントを新規作成しました:', userId);
    } catch (error) {
      console.error('ポイント追加エラー:', error);
      throw error;
    }
  };

  // セッション情報保存
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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.description}>
          本アプリでは、ポイント課金制でAIによる様々なこだわりによるレシピ作成を提供しています。
          {'\n'}
          ポイントを適切に管理し、安全にサービスを利用していただくため、アカウント登録が必要です。
        </Text>
        <Text style={styles.announcementText}>⭐️サインインはこちらから</Text>
        <View style={styles.appleButtonContainer}>
          <AppleButton
            style={styles.appleButton}
            buttonType={AppleButton.Type.SIGN_IN}
            buttonStyle={AppleButton.Style.WHITE}
            onPress={handleAppleSignIn}
          />
        </View>
        <Text style={styles.announcementText2}>
          ⭐️このアプリの使い方はこちらから
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('HowToUse')}>
          <Text style={styles.switchText}>
            このアプリの使い方（How to use）
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.switchText}>作成されたサンプルレシピを見る</Text>
        </TouchableOpacity>
        <Text style={styles.announcementText2}>
          ⭐️無料のお試し版でレシピを作成してみる
        </Text>
        {/* Free1RecipeCreate への遷移ボタン */}
        <Text style={styles.description}>
          🍳 お試しレシピ1: 冷蔵庫の余り物でこだわりレシピを作る
        </Text>
        <TouchableOpacity
          style={styles.recipeButton}
          onPress={() => navigation.navigate('Free1RecipeCreate')}
        >
          <Text style={styles.recipeButtonText}>
            冷蔵庫レシピを作成（約10秒） 🚀
          </Text>
        </TouchableOpacity>

        {/* Free2RecipeCreate への遷移ボタン */}
        <Text style={styles.description}>
          🍴 お試しレシピ2: 今の気分や食材でレシピを作成する
        </Text>
        <TouchableOpacity
          style={styles.recipeButton}
          onPress={() => navigation.navigate('Free2RecipeCreate')}
        >
          <Text style={styles.recipeButtonText}>
            気分で選ぶレシピを作成 （約10秒）🌟
          </Text>
        </TouchableOpacity>
        <RecipeSampleModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
