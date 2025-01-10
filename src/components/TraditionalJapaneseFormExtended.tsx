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
import RecipeModal from './RecipeModal'; // 別ファイルからインポート
import CustomSelect from './CustomSelect'; // カスタムセレクトボックス
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  season: string;
  dashi: string;
  seasoning: string;
  cookingMethod: string;
  platingStyle: string;
  preferredIngredients: string;
};

const initialFormData: FormData = {
  season: '',
  dashi: '',
  seasoning: '',
  cookingMethod: '',
  platingStyle: '',
  preferredIngredients: '',
};

const seasonOptions = [
  { label: '春', value: '春' },
  { label: '夏', value: '夏' },
  { label: '秋', value: '秋' },
  { label: '冬', value: '冬' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const dashiOptions = [
  { label: '鰹出汁', value: '鰹出汁' },
  { label: '昆布出汁', value: '昆布出汁' },
  { label: '煮干し出汁', value: '煮干し出汁' },
  { label: '干し椎茸出汁', value: '干し椎茸出汁' },
  { label: '合わせ出汁', value: '合わせ出汁' },
];

const seasoningOptions = [
  { label: '薄口醤油', value: '薄口醤油' },
  { label: '濃口醤油', value: '濃口醤油' },
  { label: '味噌', value: '味噌' },
  { label: 'みりん', value: 'みりん' },
  { label: '酢', value: '酢' },
  { label: '砂糖', value: '砂糖' },
  { label: '酒', value: '酒' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingMethodOptions = [
  { label: '煮物', value: '煮物' },
  { label: '焼き物', value: '焼き物' },
  { label: '蒸し物', value: '蒸し物' },
  { label: '揚げ物', value: '揚げ物' },
  { label: '炊き込みご飯', value: '炊き込みご飯' },
  { label: '汁物', value: '汁物' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const platingStyleOptions = [
  { label: '一汁三菜', value: '一汁三菜' },
  { label: '和モダンスタイル', value: '和モダンスタイル' },
  { label: '伝統的な盛り付け', value: '伝統的な盛り付け' },
  { label: '小鉢を複数使う', value: '小鉢を複数使う' },
  { label: 'お膳スタイル', value: 'お膳スタイル' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const TraditionalJapaneseForm = () => {
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

      // ポイントが足りている場合、以下の処理を続行
      setIsGenerating(true);
      setGeneratedRecipe(''); // 初期化
      setModalOpen(true); // モーダルを先に開く

      console.log('formData:', formData);
      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-japanese-recipe',
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
      !formData.season &&
      !formData.dashi &&
      !formData.seasoning &&
      !formData.cookingMethod &&
      !formData.platingStyle
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
            🍶 和食レシピのこだわりを選んでください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <CustomSelect
            label="季節（提案する食材の季節）🌸"
            selectedValue={formData.season}
            onValueChange={(value) => handleSelectChange('season', value)}
            options={seasonOptions}
          />
          <CustomSelect
            label="出汁の種類🍲"
            selectedValue={formData.dashi}
            onValueChange={(value) => handleSelectChange('dashi', value)}
            options={dashiOptions}
          />
          <CustomSelect
            label="調味料のこだわり🍶"
            selectedValue={formData.seasoning}
            onValueChange={(value) => handleSelectChange('seasoning', value)}
            options={seasoningOptions}
          />
          <CustomSelect
            label="調理法🔪"
            selectedValue={formData.cookingMethod}
            onValueChange={(value) =>
              handleSelectChange('cookingMethod', value)
            }
            options={cookingMethodOptions}
          />
          <CustomSelect
            label="盛り付けスタイル🍱"
            selectedValue={formData.platingStyle}
            onValueChange={(value) => handleSelectChange('platingStyle', value)}
            options={platingStyleOptions}
          />
          <Text style={styles.label}>使いたい食材🐟</Text>
          <TextInput
            style={styles.input}
            placeholder="使いたい食材 🥕 (例: 筍, 秋刀魚)20文字以内"
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
        {/* モーダル */}
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

export default TraditionalJapaneseForm;
