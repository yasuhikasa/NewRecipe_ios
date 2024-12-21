import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import supabase from '../config/supabaseClient';

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] =
    useState<boolean>(false);
  const [isAccountDeleteConfirmVisible, setIsAccountDeleteConfirmVisible] =
    useState<boolean>(false);
  const { isLargeScreen } = useDeviceOrientation();

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
          flex: 1,
          justifyContent: 'flex-start', // 上から始まる
          alignItems: 'center',
          backgroundColor: '#FFF8E1',
          paddingHorizontal: isLargeScreen ? 40 : 20,
          paddingTop: 20, // 余白を追加
        },
        welcomeText: {
          fontSize: isLargeScreen ? 24 : 20,
          fontWeight: 'bold',
          marginBottom: isLargeScreen ? 30 : 20,
          textAlign: 'center',
        },
        button: {
          marginTop: 20,
          padding: isLargeScreen ? 15 : 10,
          backgroundColor: '#007bff',
          borderRadius: 5,
          width: isLargeScreen ? '60%' : '80%',
          alignItems: 'center',
        },
        buttonText: {
          color: '#fff',
          fontSize: isLargeScreen ? 18 : 16,
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
        operationGuide: {
          fontSize: isLargeScreen ? 24 : 16,
          color: '#777',
          marginTop: 10,
          marginBottom: 10,
        },
      }),
    [isLargeScreen],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Dashboard!</Text>
      {/* ラベル管理画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LabelManagement')} // ラベル管理画面に遷移
      >
        <Text style={styles.buttonText}>ラベル管理へ</Text>
      </TouchableOpacity>
      {/* レシピ作成画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RecipeCreate')}
      >
        <Text style={styles.buttonText}>レシピ作成へ</Text>
      </TouchableOpacity>

      {/* レシピ一覧画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RecipeList')}
      >
        <Text style={styles.buttonText}>レシピ一覧へ</Text>
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
          {/* <TouchableOpacity
            style={styles.smallChangeButton}
            onPress={() => navigation.navigate('Help')}
          >
            <Text style={styles.smallButtonText}>各記録項目の説明</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.smallChangeButton}
            onPress={() => navigation.navigate('Contact')}
          >
            <Text style={styles.smallButtonText}>お問い合わせ</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.smallChangeButton}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Text style={styles.smallButtonText}>
              サブスクリプションの購入・更新・解約について
            </Text>
          </TouchableOpacity> */}
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
