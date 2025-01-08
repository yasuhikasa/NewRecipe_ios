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
  // garnish: string;
  cheese: string;
  cookingPreference: string;
  preferredIngredients: string;
};

const initialFormData: FormData = {
  sauce: '',
  cookingStyle: '',
  // garnish: '',
  cheese: '',
  cookingPreference: '',
  preferredIngredients: '',
};

const sauceOptions = [
  { label: 'デミグラスソース', value: 'デミグラスソース' },
  { label: 'ホワイトソース', value: 'ホワイトソース' },
  { label: 'トマトソース', value: 'トマトソース' },
  { label: 'ガーリックソース', value: 'ガーリックソース' },
  { label: 'バターソース', value: 'バターソース' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingStyleOptions = [
  { label: 'グラタン', value: 'グラタン' },
  { label: 'ステーキ', value: 'ステーキ' },
  { label: 'オムライス', value: 'オムライス' },
  { label: 'パスタ', value: 'パスタ' },
  { label: 'ハンバーグ', value: 'ハンバーグ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

// const garnishOptions = [
//   { label: '温野菜', value: '温野菜' },
//   { label: 'フレンチフライ', value: 'フレンチフライ' },
//   { label: 'ポテトサラダ', value: 'ポテトサラダ' },
//   { label: 'ほうれん草ソテー', value: 'ほうれん草ソテー' },
//   { label: 'コールスロー', value: 'コールスロー' },
//   { label: 'おまかせ', value: 'おまかせ' },
// ];

const cheeseOptions = [
  { label: 'モッツァレラ', value: 'モッツァレラ' },
  { label: 'チェダー', value: 'チェダー' },
  { label: 'パルメザン', value: 'パルメザン' },
  { label: 'ゴーダ', value: 'ゴーダ' },
  { label: 'ブルーチーズ', value: 'ブルーチーズ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingPreferenceOptions = [
  { label: '焼く', value: '焼く' },
  { label: '煮る', value: '煮る' },
  { label: '蒸す', value: '蒸す' },
  { label: '揚げる', value: '揚げる' },
  { label: 'グリル', value: 'グリル' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const WesternDishForm = () => {
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
    const pointsToConsume = 3; // レシピ1回あたり消費するポイント
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
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-western-recipe',
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
      // !formData.garnish &&
      !formData.cheese &&
      !formData.cookingPreference
    ) {
      Alert.alert('いずれかの項目を選択してください！');
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
            🍽 洋食レシピのこだわりを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <CustomSelect
            label="ソースの種類🍛"
            selectedValue={formData.sauce}
            onValueChange={(value) => handleSelectChange('sauce', value)}
            options={sauceOptions}
          />
          <CustomSelect
            label="料理スタイル🍝"
            selectedValue={formData.cookingStyle}
            onValueChange={(value) => handleSelectChange('cookingStyle', value)}
            options={cookingStyleOptions}
          />
          {/* <CustomSelect
            label="付け合わせ🥗"
            selectedValue={formData.garnish}
            onValueChange={(value) => handleSelectChange('garnish', value)}
            options={garnishOptions}
          /> */}
          <CustomSelect
            label="チーズの種類🧀"
            selectedValue={formData.cheese}
            onValueChange={(value) => handleSelectChange('cheese', value)}
            options={cheeseOptions}
          />
          <CustomSelect
            label="調理プロセスの好み🥩"
            selectedValue={formData.cookingPreference}
            onValueChange={(value) =>
              handleSelectChange('cookingPreference', value)
            }
            options={cookingPreferenceOptions}
          />
          <Text style={styles.label}>🍅 使いたい食材</Text>
          <TextInput
            style={styles.input}
            placeholder="使いたい食材🦐（例: トマト, エビ）20文字以内"
            value={formData.preferredIngredients}
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

export default WesternDishForm;
