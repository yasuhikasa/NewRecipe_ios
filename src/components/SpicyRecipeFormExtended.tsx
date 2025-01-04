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
} from 'react-native';
import axios from 'axios';
import RecipeModal from './RecipeModal'; // 別ファイルからインポート
import CustomSelect from './CustomSelect'; // カスタムセレクトボックス
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  spiceLevel: string;
  spiceType: string;
  cookingMethod: string;
  mainIngredient: string;
  flavorTheme: string;
  dishTexture: string;
  finalTouch: string;
};

const initialFormData: FormData = {
  spiceLevel: '',
  spiceType: '',
  cookingMethod: '',
  mainIngredient: '',
  flavorTheme: '',
  dishTexture: '',
  finalTouch: '',
};

const spiceLevelOptions = [
  { label: '控えめ', value: '控えめ' },
  { label: '中辛', value: '中辛' },
  { label: '大辛', value: '大辛' },
  { label: '激辛', value: '激辛' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const spiceTypeOptions = [
  { label: '唐辛子', value: '唐辛子' },
  { label: '胡椒', value: '胡椒' },
  { label: 'わさび', value: 'わさび' },
  { label: 'マスタード', value: 'マスタード' },
  { label: 'ラー油', value: 'ラー油' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingMethodOptions = [
  { label: '炒める', value: '炒める' },
  { label: '煮込む', value: '煮込む' },
  { label: '焼く', value: '焼く' },
  { label: '揚げる', value: '揚げる' },
  { label: '蒸す', value: '蒸す' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const mainIngredientOptions = [
  { label: '豚肉', value: '豚肉' },
  { label: '鶏肉', value: '鶏肉' },
  { label: 'シーフード', value: 'シーフード' },
  { label: '豆腐', value: '豆腐' },
  { label: '野菜', value: '野菜' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const flavorThemeOptions = [
  { label: '和風', value: '和風' },
  { label: '中華風', value: '中華風' },
  { label: '韓国風', value: '韓国風' },
  { label: 'タイ風', value: 'タイ風' },
  { label: 'メキシカン', value: 'メキシカン' },
  { label: 'インド風', value: 'インド風' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const dishTextureOptions = [
  { label: 'サクサク', value: 'サクサク' },
  { label: 'カリッと', value: 'カリッと' },
  { label: '柔らかい', value: '柔らかい' },
  { label: '濃厚', value: '濃厚' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const finalTouchOptions = [
  { label: 'ご飯に合う', value: 'ご飯に合う' },
  { label: '麺に合う', value: '麺に合う' },
  { label: 'おつまみ向け', value: 'おつまみ向け' },
  { label: 'サラダ仕立て', value: 'サラダ仕立て' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const SpicyRecipeFormExtended = () => {
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
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-spicy-recipe',
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
      !formData.spiceLevel &&
      !formData.spiceType &&
      !formData.cookingMethod &&
      !formData.mainIngredient &&
      !formData.flavorTheme &&
      !formData.dishTexture &&
      !formData.finalTouch
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
            🔥 ピリ辛料理のこだわりを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <CustomSelect
            label="❤️‍🔥辛さのレベル"
            selectedValue={formData.spiceLevel}
            onValueChange={(value) => handleSelectChange('spiceLevel', value)}
            options={spiceLevelOptions}
          />
          <CustomSelect
            label="👅辛味の種類"
            selectedValue={formData.spiceType}
            onValueChange={(value) => handleSelectChange('spiceType', value)}
            options={spiceTypeOptions}
          />
          <CustomSelect
            label="🫕調理法"
            selectedValue={formData.cookingMethod}
            onValueChange={(value) =>
              handleSelectChange('cookingMethod', value)
            }
            options={cookingMethodOptions}
          />
          <CustomSelect
            label="🫑メインの食材"
            selectedValue={formData.mainIngredient}
            onValueChange={(value) =>
              handleSelectChange('mainIngredient', value)
            }
            options={mainIngredientOptions}
          />
          <CustomSelect
            label="☠️風味のテーマ"
            selectedValue={formData.flavorTheme}
            onValueChange={(value) => handleSelectChange('flavorTheme', value)}
            options={flavorThemeOptions}
          />
          <CustomSelect
            label="🏴‍☠️食感"
            selectedValue={formData.dishTexture}
            onValueChange={(value) => handleSelectChange('dishTexture', value)}
            options={dishTextureOptions}
          />
          <CustomSelect
            label="🔥仕上げ"
            selectedValue={formData.finalTouch}
            onValueChange={(value) => handleSelectChange('finalTouch', value)}
            options={finalTouchOptions}
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

export default SpicyRecipeFormExtended;
