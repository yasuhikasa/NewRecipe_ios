import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import useAuthCheck from '../hooks/useAuthCheck';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import supabase from '../config/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  useAuthCheck(); // ユーザー認証が完了しているかチェック

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [points, setPoints] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] =
    useState<boolean>(false);
  const [isAccountDeleteConfirmVisible, setIsAccountDeleteConfirmVisible] =
    useState<boolean>(false);
  const { isLargeScreen } = useDeviceOrientation();

  // ポイント情報を取得する関数
  const fetchPoints = useCallback(async () => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        console.error(
          'ユーザー情報取得エラー:',
          userError?.message || 'ユーザー情報が見つかりません',
        );
        return;
      }

      const userId = userData.user.id;

      const { data, error } = await supabase
        .from('points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('ポイント取得エラー:', error.message);
      } else if (data) {
        setPoints(data.total_points);
      }
    } catch (err) {
      console.error('ポイント取得中にエラーが発生しました:', err);
    }
  }, []);

  // 画面フォーカス時にポイントを更新
  useFocusEffect(
    useCallback(() => {
      fetchPoints();
    }, [fetchPoints]),
  );

  // プルリフレッシュ時にポイントを更新
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPoints();
    setIsRefreshing(false);
  };

  // メニューの開閉を切り替える関数
  const toggleMenu = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  // ログアウト処理
  const handleLogout = async () => {
    setIsLogoutConfirmVisible(true);
  };

  const confirmLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('エラー', 'ログアウトに失敗しました。');
        return;
      }
      navigation.reset({
        index: 0, // 新しいスタックのトップにする画面のインデックス
        routes: [{ name: 'Login' }], // `Login` 画面だけをスタックに残す
      });
      setIsLogoutConfirmVisible(false); //ログアウト確認モーダルを閉じる
    } catch (e) {
      console.error('ログアウト中にエラーが発生しました:', e);
    }
  };

  // アカウント削除処理
  const handleAccountDelete = async () => {
    setIsAccountDeleteConfirmVisible(true);
  };

  const confirmAccountDelete = async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        Alert.alert('エラー', 'セッション情報が取得できませんでした。');
        return;
      }

      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;

      if (!userId) {
        Alert.alert('エラー', 'ユーザー情報が取得できませんでした。');
        return;
      }

      console.log('送信するユーザーID:', userId);

      const response = await fetch(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/AccountDelete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ userId }),
        },
      );

      console.log('レスポンスステータス:', response.status);
      const result = await response.json();
      console.log('レスポンスデータ:', result);

      if (response.ok) {
        Alert.alert('アカウント削除完了', 'アカウントが削除されました。');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('エラー', result.error || 'アカウント削除に失敗しました。');
      }
    } catch (e) {
      console.error('アカウント削除中にエラーが発生しました:', e);
      Alert.alert('エラー', 'アカウント削除中に問題が発生しました。');
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          justifyContent: 'flex-start', // 上から始まる
          alignItems: 'center',
          backgroundColor: '#FFF8E1',
          paddingHorizontal: isLargeScreen ? 40 : 20,
          paddingTop: 20, // 余白を追加
          paddingBottom: 20, // 下部余白を追加
        },
        welcomeText: {
          fontSize: isLargeScreen ? 24 : 20,
          fontWeight: 'bold',
          marginBottom: isLargeScreen ? 30 : 20,
          textAlign: 'center',
        },
        operationGuide: {
          fontSize: isLargeScreen ? 24 : 18,
          color: '#777',
          marginTop: 10,
          marginBottom: 10,
        },
        guideButton: {
          backgroundColor: '#FF9800', // オレンジ系
          paddingVertical: isLargeScreen ? 20 : 15,
          paddingHorizontal: isLargeScreen ? 60 : 40,
          borderRadius: 10,
          marginVertical: 10,
          alignItems: 'center',
          width: isLargeScreen ? '60%' : '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        guideButtonText: {
          color: '#FFFFFF',
          fontSize: isLargeScreen ? 20 : 16,
          fontWeight: 'bold',
        },
        button: {
          backgroundColor: '#4CAF50', // 緑系
          paddingVertical: isLargeScreen ? 20 : 15,
          paddingHorizontal: isLargeScreen ? 60 : 40,
          borderRadius: 10,
          marginVertical: 10,
          alignItems: 'center',
          width: isLargeScreen ? '60%' : '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        createButton: {
          backgroundColor: '#2196F3', // 青系
          paddingVertical: isLargeScreen ? 20 : 15,
          paddingHorizontal: isLargeScreen ? 60 : 40,
          borderRadius: 10,
          marginVertical: 10,
          alignItems: 'center',
          width: isLargeScreen ? '60%' : '80%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        buttonText: {
          color: '#FFFFFF',
          fontSize: isLargeScreen ? 20 : 16,
          fontWeight: 'bold',
        },
        recipientLabel2: {
          fontSize: isLargeScreen ? 26 : 18,
          fontWeight: 'bold',
          marginTop: 30,
          textAlign: 'center',
        },
        menuChangeButton: {
          backgroundColor: '#FFF8E1',
          paddingVertical: isLargeScreen ? 12 : 8,
          paddingHorizontal: 15,
          borderWidth: 1,
          borderColor: '#000000',
          borderRadius: 8,
          marginTop: 20,
          width: isLargeScreen ? '60%' : '80%',
          alignItems: 'center',
        },
        menuButtonText: {
          color: '#000000',
          fontSize: isLargeScreen ? 20 : 16,
          textAlign: 'center',
        },
        actionButtonsContainer: {
          flexDirection: 'column',
          justifyContent: 'flex-start', // 上寄せ
          alignItems: 'center', // 中央揃え
          width: isLargeScreen ? '80%' : '100%', // 横幅を調整
          marginTop: 20,
          gap: 10, // ボタン間の間隔
          paddingBottom: 30, // 下部余白を追加
        },
        smallChangeButton: {
          backgroundColor: '#D3D3D3',
          paddingVertical: isLargeScreen ? 12 : 8,
          paddingHorizontal: 14,
          borderRadius: 15,
          marginTop: 10,
          alignItems: 'center',
          width: '80%',
        },
        smallButtonText: {
          color: '#000000',
          fontSize: isLargeScreen ? 16 : 14,
          textAlign: 'center',
        },
        logoutButton: {
          backgroundColor: '#D3D3D3',
          paddingVertical: isLargeScreen ? 12 : 8,
          paddingHorizontal: 15,
          borderRadius: 15,
          marginTop: 10,
          alignItems: 'center',
          width: '80%',
        },
        logout2Button: {
          backgroundColor: '#D3D3D3',
          paddingVertical: isLargeScreen ? 12 : 8,
          paddingHorizontal: 15,
          borderRadius: 15,
          marginTop: 10,
          alignItems: 'center',
          width: '80%',
          marginBottom: 50,
        },
        addButton: {
          backgroundColor: '#AED581',
          paddingVertical: isLargeScreen ? 16 : 12,
          paddingHorizontal: isLargeScreen ? 40 : 20,
          borderRadius: 20,
          marginVertical: 15,
        },
        modalContent: {
          width: isLargeScreen ? '50%' : '80%',
          backgroundColor: '#FFF',
          padding: isLargeScreen ? 40 : 20,
          borderRadius: 10,
          alignItems: 'center',
        },
        modalContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        cancelButton: {
          backgroundColor: '#FF7043',
          padding: isLargeScreen ? 18 : 15,
          borderRadius: 20,
          alignItems: 'center',
          marginTop: 10,
        },
      }),
    [isLargeScreen],
  );

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { flexGrow: 1, paddingBottom: isLargeScreen ? 100 : 60 }, // スクロール余白を追加
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.welcomeText}>Welcome to the Dashboard!</Text>
      <Text style={styles.operationGuide}>⭐️現在{points}ポイントです。</Text>
      {/* ポイント購入画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.guideButton}
        onPress={() => navigation.navigate('Purchase')} // ポイント購入画面に遷移
      >
        <Text style={styles.guideButtonText}>ポイント購入</Text>
      </TouchableOpacity>
      {/* このアプリの使い方画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.guideButton}
        onPress={() => navigation.navigate('HowToUse')} // このアプリの使い方画面に遷移
      >
        <Text style={styles.guideButtonText}>このアプリの使い方</Text>
      </TouchableOpacity>
      <Text style={styles.recipientLabel2}>⭐️レシピ管理</Text>
      {/* ラベル管理画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LabelManagement')} // ラベル管理画面に遷移
      >
        <Text style={styles.buttonText}>ラベル管理へ</Text>
      </TouchableOpacity>

      {/* レシピ一覧画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RecipeList')}
      >
        <Text style={styles.buttonText}>レシピ一覧へ</Text>
      </TouchableOpacity>

      <Text style={styles.recipientLabel2}>⭐️レシピ作成へ</Text>
      {/* レシピ作成画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('RecipeCreate')}
      >
        <Text style={styles.buttonText}>今の気分でレシピ作成</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('LunchboxCreate')}
      >
        <Text style={styles.buttonText}>こだわりのお弁当レシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('DietCreate')}
      >
        <Text style={styles.buttonText}>こだわりのダイエットレシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('BeautyCreate')}
      >
        <Text style={styles.buttonText}>
          こだわりの美容・アンチエイジングレシピ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('SnsCreate')}
      >
        <Text style={styles.buttonText}>こだわりのSNS映えレシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('LeftoverCreate')}
      >
        <Text style={styles.buttonText}>冷蔵庫の余り物で工夫レシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('KidsCreate')}
      >
        <Text style={styles.buttonText}>こだわりの子供向けレシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('SweetCreate')}
      >
        <Text style={styles.buttonText}>こだわりのスイーツレシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('SpicyCreate')}
      >
        <Text style={styles.buttonText}>こだわりのピリ辛レシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('TraditionalJapaneseCreate')}
      >
        <Text style={styles.buttonText}>こだわりの和食レシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('WesternDishCreate')}
      >
        <Text style={styles.buttonText}>こだわりの洋食レシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('BistroCreate')}
      >
        <Text style={styles.buttonText}>こだわりのビストロレシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('SpecialDayCreate')}
      >
        <Text style={styles.buttonText}>こだわりの特別な日レシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('FusionRecipeCreate')}
      >
        <Text style={styles.buttonText}>こだわりの異文化ミックスレシピ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CocktailCreate')}
      >
        <Text style={styles.buttonText}>こだわりのカクテルレシピ</Text>
      </TouchableOpacity>

      <Text style={styles.recipientLabel2}>⭐️その他メニュー</Text>

      {/* メニュー開閉ボタン */}
      <TouchableOpacity style={styles.menuChangeButton} onPress={toggleMenu}>
        <Text style={styles.menuButtonText}>
          {isOpenMenu ? '-メニュー項目を閉じる' : '+メニュー項目を開く'}
        </Text>
      </TouchableOpacity>

      {/* メニュー項目の条件付きレンダリング */}
      {isOpenMenu && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.smallChangeButton}
            onPress={() => navigation.navigate('Contact')}
          >
            <Text style={styles.smallButtonText}>お問い合わせ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallChangeButton}
            onPress={() => navigation.navigate('AboutApp')}
          >
            <Text style={styles.smallButtonText}>このアプリについて</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleAccountDelete}
          >
            <Text style={styles.smallButtonText}>アカウントを削除する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logout2Button} onPress={handleLogout}>
            <Text style={styles.smallButtonText}>ログアウト</Text>
          </TouchableOpacity>

          {/* アカウント削除確認モーダル */}
          <Modal
            transparent={true}
            visible={isAccountDeleteConfirmVisible}
            animationType="slide"
            onRequestClose={() => setIsAccountDeleteConfirmVisible(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setIsAccountDeleteConfirmVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.operationGuide}>
                    本当にアカウントを削除しますか？
                  </Text>
                  <Text style={styles.operationGuide}>
                    ※注意：削除したアカウントは復元できません。記録したデータも全て削除されます。
                  </Text>
                  <Text style={styles.operationGuide}>
                    購入したポイントも全て失われます。
                  </Text>
                  <Text style={styles.operationGuide}>
                    データ復元はできませんので、ご注意ください。
                  </Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={confirmAccountDelete}
                  >
                    <Text style={styles.buttonText}>アカウントを削除する</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsAccountDeleteConfirmVisible(false)}
                  >
                    <Text style={styles.buttonText}>キャンセル</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* ログアウト確認モーダル */}
          <Modal
            transparent={true}
            visible={isLogoutConfirmVisible}
            animationType="slide"
            onRequestClose={() => setIsLogoutConfirmVisible(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => setIsLogoutConfirmVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.operationGuide}>
                    本当にログアウトしますか？
                  </Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={confirmLogout}
                  >
                    <Text style={styles.buttonText}>ログアウトする</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsLogoutConfirmVisible(false)}
                  >
                    <Text style={styles.buttonText}>キャンセル</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      )}
    </ScrollView>
  );
};

export default DashboardScreen;
