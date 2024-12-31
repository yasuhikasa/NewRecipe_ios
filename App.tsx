import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import ContactScreen from './src/screens/ContactScreen';
import { RootStackParamList } from './src/types/types';
import supabase from './src/config/supabaseClient';
import PurchaseScreen from './src/screens/PurchaseScreen';
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
import LabelManagementScreen from './src/screens/LabelManagementScreen';
import HowToUseScreen from './src/screens/HowToUseScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DietCreateScreen from './src/screens/DietCreateScreen';
import BeautyRecipeCreateScreen from './src/screens/BeautyRecipeScreen';
import KidsCreateScreen from './src/screens/KidsCreateScreen';
import SnsCreateScreen from './src/screens/SnsCreateScreen';
import LunchboxCreateScreen from './src/screens/LunchboxCreateScreen';
import SweetCreateScreen from './src/screens/SweetCreateScreen';
import SpicyCreateScreen from './src/screens/SpicyCreateScreen';
import TraditionalJapaneseCreateScreen from './src/screens/TraditionalJapaneseCreateScreen';
import WesternDishCreateScreen from './src/screens/WesternDishCreateScreen';
import BistroDishCreateScreen from './src/screens/BistroDishCreateScreen';
import CocktailCreateScreen from './src/screens/CocktailCreateScreen';
import SpecialDayCreateScreen from './src/screens/SpecialDayCreateScreen';

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
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'こだわりの創作料理レシピ' }}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'ダッシュボード' }}
        />
        <Stack.Screen name="Contact" component={ContactScreen} />
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
          options={{ title: '今の気分でレシピを作成' }}
        />
        <Stack.Screen
          name="DietCreate"
          component={DietCreateScreen}
          options={{ title: 'ダイエットレシピを作成' }}
        />
        <Stack.Screen
          name="BeautyCreate"
          component={BeautyRecipeCreateScreen}
          options={{ title: '美容レシピを作成' }}
        />
        <Stack.Screen
          name="KidsCreate"
          component={KidsCreateScreen}
          options={{ title: '子供向けレシピを作成' }}
        />
        <Stack.Screen
          name="LunchboxCreate"
          component={LunchboxCreateScreen}
          options={{ title: 'お弁当レシピを作成' }}
        />
        <Stack.Screen
          name="SnsCreate"
          component={SnsCreateScreen}
          options={{ title: 'SNS映えレシピを作成' }}
        />
        <Stack.Screen
          name="SweetCreate"
          component={SweetCreateScreen}
          options={{ title: 'スイーツレシピを作成' }}
        />
        <Stack.Screen
          name="SpicyCreate"
          component={SpicyCreateScreen}
          options={{ title: 'ピリ辛レシピを作成' }}
        />
        <Stack.Screen
          name="TraditionalJapaneseCreate"
          component={TraditionalJapaneseCreateScreen}
          options={{ title: '和食レシピを作成' }}
        />
        <Stack.Screen
          name="WesternDishCreate"
          component={WesternDishCreateScreen}
          options={{ title: '洋食レシピを作成' }}
        />
        <Stack.Screen
          name="BistroCreate"
          component={BistroDishCreateScreen}
          options={{ title: 'ビストロ風レシピを作成' }}
        />
        <Stack.Screen
          name="CocktailCreate"
          component={CocktailCreateScreen}
          options={{ title: 'カクテルレシピを作成' }}
        />
        <Stack.Screen
          name="SpecialDayCreate"
          component={SpecialDayCreateScreen}
          options={{ title: '特別な日のレシピを作成' }}
        />
        <Stack.Screen
          name="LabelManagement"
          component={LabelManagementScreen}
          options={{ title: 'ラベル（カテゴリ）作成' }}
        />
        <Stack.Screen
          name="RecipeList"
          component={RecipeListScreen}
          options={{ title: '保存されたレシピ' }}
        />
        <Stack.Screen
          name="Purchase"
          component={PurchaseScreen}
          options={{ title: 'ポイント購入' }}
        />
        <Stack.Screen
          name="HowToUse"
          component={HowToUseScreen}
          options={{ title: 'このアプリの使い方' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
