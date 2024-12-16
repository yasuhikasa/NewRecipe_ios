import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import ContactScreen from './src/screens/ContactScreen';
import { RootStackParamList } from './src/types/types';
import supabase from './src/config/supabaseClient';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import AboutAppScreen from './src/screens/about/AboutAppScreen';
import TermsOfServiceScreen from './src/screens/about/TermsOfServiceScreen';
import PrivacyPolicyScreen from './src/screens/about/PrivacyPolicyScreen';
import CommercialTransactionScreen from './src/screens/about/CommercialTransactionScreen';
import AppOperatorScreen from './src/screens/about/AppOperatorScreen';
import LoginHelpScreen from './src/screens/about/LoginHelpScreen';
import { restoreSession } from './src/utils/restoreSession';
import DashboardScreen from './src/screens/DashboardScreen';
import RecipeCreateScreen from './src/screens/RecipeCreateScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const [isLoading, setIsLoading] = useState(true); // セッション復元中の状態
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態

  // イベントリスナーを使ってログイン状態を監視
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await AsyncStorage.setItem('loginSession', JSON.stringify(session));
        console.log('セッション更新:', session);
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        await AsyncStorage.removeItem('loginSession');
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe(); // クリーンアップ
  }, []);

  // セッション復元処理
  useEffect(() => {
    const initializeApp = async () => {
      await restoreSession(); // セッション復元
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
      }
      setIsLoading(false); // ローディングを終了
    };

    initializeApp();
  }, []);

  if (isLoading) {
    // セッション復元中はローディング画面を表示
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'レシピアプリ' }}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'ダッシュボード' }}
        />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ title: 'サブスクリプションについて' }}
        />
        <Stack.Screen
          name="AboutApp"
          component={AboutAppScreen}
          options={{ title: 'このアプリについて' }}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{ title: '利用規約' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'プライバシーポリシー' }}
        />
        <Stack.Screen
          name="LoginHelp"
          component={LoginHelpScreen}
          options={{ title: '新規登録、ログインでお困りの方へ' }}
        />
        <Stack.Screen
          name="CommercialTransaction"
          component={CommercialTransactionScreen}
          options={{ title: '特定商取引法に基づく記載' }}
        />
        <Stack.Screen
          name="AppOperator"
          component={AppOperatorScreen}
          options={{ title: '運営者について' }}
        />
        <Stack.Screen
          name="RecipeCreate"
          component={RecipeCreateScreen}
          options={{ title: 'レシピを投稿' }}
        />
        <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ title: '保存されたレシピ' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
