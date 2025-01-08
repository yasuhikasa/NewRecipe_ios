import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import axios from 'axios';
import CustomSelect from './CustomSelect';
import RecipeModal from './RecipeModal';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  baseCuisine: string;
  fusionElement: string;
  flavorProfile: string;
  cookingMethod: string;
  preferredIngredients: string;
};

const initialFormData: FormData = {
  baseCuisine: '',
  fusionElement: '',
  flavorProfile: '',
  cookingMethod: '',
  preferredIngredients: '',
};

const cuisineOptions = [
  { label: '和食', value: '和食' },
  { label: 'イタリアン', value: 'イタリアン' },
  { label: 'フレンチ', value: 'フレンチ' },
  { label: '中華', value: '中華' },
  { label: 'インド料理', value: 'インド料理' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const fusionElementOptions = [
  { label: 'アジアンテイスト', value: 'アジアンテイスト' },
  { label: '地中海風', value: '地中海風' },
  { label: 'メキシカン', value: 'メキシカン' },
  { label: 'アメリカンダイナー風', value: 'アメリカンダイナー風' },
  { label: '北欧スタイル', value: '北欧スタイル' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const flavorProfileOptions = [
  { label: '甘じょっぱい', value: '甘じょっぱい' },
  { label: 'ピリ辛', value: 'ピリ辛' },
  { label: '酸味が効いた', value: '酸味が効いた' },
  { label: 'クリーミー', value: 'クリーミー' },
  { label: '軽い風味', value: '軽い風味' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingMethodOptions = [
  { label: 'グリル', value: 'グリル' },
  { label: '煮込む', value: '煮込む' },
  { label: '蒸し料理', value: '蒸し料理' },
  { label: 'オーブン焼き', value: 'オーブン焼き' },
  { label: '生で仕上げる', value: '生で仕上げる' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const FusionRecipeForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generatedRecipe, setGeneratedRecipe] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-fusion-recipe',
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
      !formData.baseCuisine &&
      !formData.fusionElement &&
      !formData.flavorProfile &&
      !formData.cookingMethod
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
            🌏 こだわりの異文化ミックス料理を作ろう！
          </Text>
          <CustomSelect
            label="ベースの料理スタイル"
            selectedValue={formData.baseCuisine}
            onValueChange={(value) => handleSelectChange('baseCuisine', value)}
            options={cuisineOptions}
          />
          <CustomSelect
            label="フュージョン（組み合わせ）の要素"
            selectedValue={formData.fusionElement}
            onValueChange={(value) =>
              handleSelectChange('fusionElement', value)
            }
            options={fusionElementOptions}
          />
          <CustomSelect
            label="味の特徴"
            selectedValue={formData.flavorProfile}
            onValueChange={(value) =>
              handleSelectChange('flavorProfile', value)
            }
            options={flavorProfileOptions}
          />
          <CustomSelect
            label="調理方法"
            selectedValue={formData.cookingMethod}
            onValueChange={(value) =>
              handleSelectChange('cookingMethod', value)
            }
            options={cookingMethodOptions}
          />
          <Text style={styles.label}>その他使いたい食材🥕</Text>
          <TextInput
            style={styles.input}
            placeholder="その他使いたい食材 🥕 20文字以内"
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
              <Text style={styles.submitButtonText}>レシピを作る 🚀</Text>
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

export default FusionRecipeForm;
