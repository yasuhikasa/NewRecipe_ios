import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import RecipeModal from './RecipeModal';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import CustomSelect from './CustomSelect';
import supabase from '../config/supabaseClient';

type FormData = {
  mainIngredients: string;
  cookingTime: string;
  flavor: string;
  dishType: string;
  purpose: string;
};

const initialFormData: FormData = {
  mainIngredients: '',
  cookingTime: '',
  flavor: '',
  dishType: '',
  purpose: '',
};

const cookingTimeOptions = [
  { label: '10分以内', value: '10分以内' },
  { label: '20分以内', value: '20分以内' },
  { label: '30分以内', value: '30分以内' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const flavorOptions = [
  { label: '甘め', value: '甘め' },
  { label: '塩味', value: '塩味' },
  { label: '酸味', value: '酸味' },
  { label: '辛味', value: '辛味' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const dishTypeOptions = [
  { label: '主菜', value: '主菜' },
  { label: '副菜', value: '副菜' },
  { label: 'スープ', value: 'スープ' },
  { label: 'サラダ', value: 'サラダ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const purposeOptions = [
  { label: '健康', value: '健康' },
  { label: '美味しさ重視', value: '美味しさ重視' },
  { label: '疲労回復', value: '疲労回復' },
  { label: '栄養バランス', value: '栄養バランス' },
  { label: 'スタミナアップ', value: 'スタミナアップ' },
  { label: 'お酒のおつまみ', value: 'お酒のおつまみ' },
  { label: 'お子様向け', value: 'お子様向け' },
  { label: '節約・エコ料理', value: '節約・エコ料理' },
  { label: '時短料理', value: '時短料理' },
  { label: '作り置き', value: '作り置き' },
  { label: 'ヘルシースナック', value: 'ヘルシースナック' },
  { label: '高タンパク', value: '高タンパク' },
  { label: '低脂質', value: '低脂質' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const LeftoverRecipeForm = () => {
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
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-leftover-recipe',
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
    if (!formData.mainIngredients) {
      Alert.alert('冷蔵庫の材料は必須です！');
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
          <Text style={styles.title}>🧑‍🍳 冷蔵庫の余り物でレシピを作る</Text>
          <Text style={styles.label}>「冷蔵庫の主な材料」の記入は必須です</Text>
          <Text style={styles.label}>冷蔵庫の主な材料</Text>
          <TextInput
            style={styles.input}
            placeholder="例: 鶏肉, キャベツ（20文字以内）"
            value={formData.mainIngredients}
            maxLength={20}
            onChangeText={(value) =>
              handleInputChange('mainIngredients', value)
            }
          />
          <CustomSelect
            label="調理時間⏱"
            selectedValue={formData.cookingTime}
            onValueChange={(value) => handleSelectChange('cookingTime', value)}
            options={cookingTimeOptions}
          />
          <CustomSelect
            label="味付けの好み🍋"
            selectedValue={formData.flavor}
            onValueChange={(value) => handleSelectChange('flavor', value)}
            options={flavorOptions}
          />
          <CustomSelect
            label="料理のジャンル🍽"
            selectedValue={formData.dishType}
            onValueChange={(value) => handleSelectChange('dishType', value)}
            options={dishTypeOptions}
          />
          <CustomSelect
            label="目的💪 "
            selectedValue={formData.purpose}
            onValueChange={(value) => handleInputChange('purpose', value)}
            options={purposeOptions}
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

export default LeftoverRecipeForm;
