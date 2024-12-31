import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import axios from 'axios';
import RecipeModal from './RecipeModal';
import CustomSelect from './CustomSelect';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  sauce: string;
  cookingStyle: string;
  garnish: string;
  winePairing: string;
  platingStyle: string;
  preferredIngredients: string;
};

const initialFormData: FormData = {
  sauce: '',
  cookingStyle: '',
  garnish: '',
  winePairing: '',
  platingStyle: '',
  preferredIngredients: '',
};

const sauceOptions = [
  { label: '赤ワインソース', value: '赤ワインソース' },
  { label: 'ベアルネーズソース', value: 'ベアルネーズソース' },
  { label: 'ホワイトソース', value: 'ホワイトソース' },
  { label: 'バルサミコソース', value: 'バルサミコソース' },
  { label: 'マスタードソース', value: 'マスタードソース' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingStyleOptions = [
  { label: 'ロースト（肉や魚）', value: 'ロースト（肉や魚）' },
  { label: '煮込み料理', value: '煮込み料理' },
  { label: 'ラタトゥイユ', value: 'ラタトゥイユ' },
  { label: 'グリル', value: 'グリル' },
  { label: 'フランス風パイ包み', value: 'フランス風パイ包み' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const garnishOptions = [
  { label: 'ポテトグラタン', value: 'ポテトグラタン' },
  { label: 'サラダニソワーズ', value: 'サラダニソワーズ' },
  { label: 'グリル野菜', value: 'グリル野菜' },
  { label: 'ハーブを使った添え物', value: 'ハーブを使った添え物' },
  {
    label: 'トリュフ風味のマッシュポテト',
    value: 'トリュフ風味のマッシュポテト',
  },
  { label: 'おまかせ', value: 'おまかせ' },
];

const winePairingOptions = [
  { label: '赤ワイン', value: '赤ワイン' },
  { label: '白ワイン', value: '白ワイン' },
  { label: 'ロゼワイン', value: 'ロゼワイン' },
  { label: 'シャンパン', value: 'シャンパン' },
  { label: 'ノンアルコール', value: 'ノンアルコール' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const platingStyleOptions = [
  { label: 'シンプルで上品な盛り付け', value: 'シンプルで上品な盛り付け' },
  { label: 'カジュアルなビストロ風', value: 'カジュアルなビストロ風' },
  { label: 'アート的な配置', value: 'アート的な配置' },
  {
    label: 'テーブル全体をコーディネート',
    value: 'テーブル全体をコーディネート',
  },
  { label: 'おまかせ', value: 'おまかせ' },
];

const BistroDishForm = () => {
  const [generatedRecipe, setGeneratedRecipe] = useState<string>('');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLargeScreen, isLandscape } = useDeviceOrientation();

  const styles = StyleSheet.create({
    container: {
      padding: isLargeScreen ? (isLandscape ? 32 : 24) : 16,
      flexGrow: 1,
      backgroundColor: '#fffaf0',
    },
    innerContainer: {
      padding: isLargeScreen ? 24 : 20,
      borderRadius: 8,
      backgroundColor: '#fff',
      marginBottom: isLargeScreen ? 30 : 20,
    },
    title: {
      fontSize: isLargeScreen ? 28 : 24,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 20 : 16,
      textAlign: 'center',
      color: '#ff6347',
    },
    label: {
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: '600',
      marginBottom: isLargeScreen ? 10 : 8,
      color: '#333',
    },
    input: {
      borderWidth: 1,
      padding: isLargeScreen ? 14 : 10,
      borderRadius: 8,
      marginBottom: isLargeScreen ? 20 : 16,
      backgroundColor: '#fff',
      borderColor: '#ccc',
    },
    submitButton: {
      backgroundColor: '#ff6347',
      padding: isLargeScreen ? 18 : 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: isLargeScreen ? 24 : 16,
    },
    submitButtonText: {
      textAlign: 'center',
      color: '#fff',
      fontSize: isLargeScreen ? 18 : 16,
      fontWeight: 'bold',
    },
    section: {
      marginBottom: isLargeScreen ? 30 : 20,
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      marginTop: 10,
      fontSize: isLargeScreen ? 16 : 14,
    },
  });

  // セレクトボックスの変更ハンドラー
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // テキストフィールドの変更ハンドラー
  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // レシピ生成関数（ストリーミング無効化）
  const generateRecipe = async () => {
    const pointsToConsume = 2; // レシピ1回あたり消費するポイント
    // let pointsConsumed = false; // ポイント消費フラグ

    try {
      setIsGenerating(true);
      setGeneratedRecipe(''); // 初期化
      setModalOpen(true); // モーダルを先に開く

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user?.id) {
        Alert.alert('エラー', 'ユーザー情報の取得に失敗しました。');
        return;
      }
      const userId = userData.user.id;

      // 現在のポイントを取得
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (pointsError || !pointsData) {
        Alert.alert('エラー', '現在のポイントを取得できませんでした。');
        return;
      }

      const currentPoints = pointsData.total_points;

      // ポイント不足を確認
      if (currentPoints < pointsToConsume) {
        Alert.alert(
          'エラー',
          'ポイントが不足しています。ポイントを購入してください。',
        );
        return;
      }

      console.log('formData:', formData);

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-bistro-recipe',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data && response.data.recipe) {
        // レシピ生成が成功した場合
        setGeneratedRecipe(response.data.recipe);

        // 消費後のポイントを計算
        const newTotalPoints = currentPoints - pointsToConsume;

        // ポイントを更新
        const { error: updateError } = await supabase
          .from('points')
          .update({ total_points: newTotalPoints })
          .eq('user_id', userId);

        if (updateError) {
          console.error('ポイント更新エラー:', updateError);
          throw new Error('ポイント消費に失敗しました。');
        }

        // pointsConsumed = true; // ポイント消費成功フラグを設定
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('レシピ生成中にエラーが発生しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  // フォーム送信
  const handleSubmit = async () => {
    if (
      !formData.sauce &&
      !formData.cookingStyle &&
      !formData.garnish &&
      !formData.winePairing &&
      !formData.platingStyle &&
      !formData.preferredIngredients
    ) {
      Alert.alert('いずれかの項目を入力してください！');
      return;
    }
    await generateRecipe();
  };

  // レシピ保存
  const handleSave = async (title: string) => {
    if (!generatedRecipe) {
      Alert.alert('Error', '保存するレシピがありません。');
      return;
    }

    try {
      // Supabase から uid を取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.id) {
        Alert.alert(
          'エラー',
          'ユーザーが認証されていません。ログインしてください。',
        );
        return;
      }

      const user_id = user.id;

      // サーバーにレシピデータを送信
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/save-recipe',
        {
          recipe: generatedRecipe,
          formData,
          title,
          user_id, // uid を送信
        },
      );

      if (response.status === 200) {
        Alert.alert('成功', response.data.message);
        setModalOpen(false);
      } else {
        Alert.alert('エラー', 'レシピの保存に失敗しました。');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      Alert.alert('エラー', 'レシピの保存中にエラーが発生しました。');
    }
  };

  // モーダルを閉じる
  const handleClose = () => {
    setModalOpen(false);
    setFormData(initialFormData);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>
            🍷 ビストロ風料理のこだわりを選択してください
          </Text>
          <CustomSelect
            label="ソースの種類🍛"
            selectedValue={formData.sauce}
            onValueChange={(value) => handleSelectChange('sauce', value)}
            options={sauceOptions}
          />
          <CustomSelect
            label="料理スタイル🍲"
            selectedValue={formData.cookingStyle}
            onValueChange={(value) => handleSelectChange('cookingStyle', value)}
            options={cookingStyleOptions}
          />
          <CustomSelect
            label="付け合わせ🥗"
            selectedValue={formData.garnish}
            onValueChange={(value) => handleSelectChange('garnish', value)}
            options={garnishOptions}
          />
          <CustomSelect
            label="ワインペアリング🍷"
            selectedValue={formData.winePairing}
            onValueChange={(value) => handleSelectChange('winePairing', value)}
            options={winePairingOptions}
          />
          <CustomSelect
            label="盛り付けスタイル🎨"
            selectedValue={formData.platingStyle}
            onValueChange={(value) => handleSelectChange('platingStyle', value)}
            options={platingStyleOptions}
          />
          <Text style={styles.label}>使いたい食材🥩</Text>
          <TextInput
            style={styles.input}
            placeholder="使いたい食材 🥕 (例: 鴨肉, キノコ)20文字以内"
            value={formData.preferredIngredients}
            maxLength={20}
            onChangeText={(value) =>
              handleInputChange('preferredIngredients', value)
            }
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                レシピを作る（約10秒） 🚀
              </Text>
            )}
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* ストリーミングされたレシピを表示するためのモーダル */}
        {modalOpen && (
          <RecipeModal
            open={modalOpen}
            recipe={generatedRecipe}
            onClose={handleClose}
            onSave={handleSave}
            onGenerateNewRecipe={generateRecipe}
            isGenerating={isGenerating}
          />
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default BistroDishForm;
