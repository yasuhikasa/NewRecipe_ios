// src/components/BeautyRecipeFormExtended.tsx
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
import CustomCheckbox from './CustomCheckbox';
import CustomSelect from './CustomSelect';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  preferences: string[];
  skinCare: string;
  detox: string;
  flavor: string;
  cookingMethod: string;
  ingredients: string[];
  preferredIngredients: string;
};

const initialFormData: FormData = {
  preferences: [],
  skinCare: '',
  detox: '',
  flavor: '',
  cookingMethod: '',
  ingredients: [],
  preferredIngredients: '',
};

const beautyPreferences = [
  { label: '抗酸化作用', value: '抗酸化作用' },
  { label: '美肌効果（透明感）', value: '美肌効果（透明感）' },
  { label: 'コラーゲン補給', value: 'コラーゲン補給' },
  { label: 'シミやシワ対策', value: 'シミやシワ対策' },
  { label: '髪のツヤ改善', value: '髪のツヤ改善' },
  {
    label: '腸内環境を整える（デトックス）',
    value: '腸内環境を整える（デトックス）',
  },
  { label: 'むくみ解消', value: 'むくみ解消' },
  { label: 'リラックス効果', value: 'リラックス効果' },
  { label: 'エイジングケア', value: 'エイジングケア' },
  { label: '冷え性改善', value: '冷え性改善' },
  { label: '免疫力アップ', value: '免疫力アップ' },
];

const skinCareOptions = [
  { label: '保湿を重視', value: '保湿を重視' },
  { label: '油分をコントロール', value: '油分をコントロール' },
  { label: '透明感を高める', value: '透明感を高める' },
  { label: '肌のキメを整える', value: '肌のキメを整える' },
  { label: '赤みや炎症を抑える', value: '赤みや炎症を抑える' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const detoxOptions = [
  { label: '腸活（発酵食品を活用）', value: '腸活（発酵食品を活用）' },
  { label: 'デトックススープ', value: 'デトックススープ' },
  { label: '体を温める食材', value: '体を温める食材' },
  { label: '水分補給を促す', value: '水分補給を促す' },
  { label: '低GI食品', value: '低GI食品' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const beautyFlavorOptions = [
  { label: 'フルーティーで爽やか', value: 'フルーティーで爽やか' },
  {
    label: 'ハーブ風味（ミントやバジル）',
    value: 'ハーブ風味（ミントやバジル）',
  },
  { label: 'レモンや柑橘系の酸味', value: 'レモンや柑橘系の酸味' },
  { label: '優しい甘さ（蜂蜜など）', value: '優しい甘さ（蜂蜜など）' },
  { label: '控えめな塩味', value: '控えめな塩味' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const beautyCookingMethods = [
  { label: 'スムージーやジュース', value: 'スムージーやジュース' },
  { label: 'スープ（温冷どちらも）', value: 'スープ（温冷どちらも）' },
  { label: '蒸し料理（ビタミン保持）', value: '蒸し料理（ビタミン保持）' },
  { label: 'サラダ（新鮮な野菜）', value: 'サラダ（新鮮な野菜）' },
  { label: 'オーブンで焼く', value: 'オーブンで焼く' },
  { label: '煮込む', value: '煮込む' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const beautyIngredientOptions = [
  { label: 'アサイー', value: 'アサイー' },
  { label: 'ブルーベリー', value: 'ブルーベリー' },
  { label: 'アボカド', value: 'アボカド' },
  { label: 'サーモン（オメガ3）', value: 'サーモン（オメガ3）' },
  { label: 'スイートポテト', value: 'スイートポテト' },
  { label: 'ほうれん草', value: 'ほうれん草' },
  { label: 'トマト（リコピン）', value: 'トマト（リコピン）' },
  { label: 'キヌア', value: 'キヌア' },
  { label: 'ナッツ', value: 'ナッツ' },
  { label: '豆乳', value: '豆乳' },
  { label: 'オリーブオイル', value: 'オリーブオイル' },
  {
    label: '発酵食品（味噌、ヨーグルト）',
    value: '発酵食品（味噌、ヨーグルト）',
  },
];

const BeautyRecipeFormExtended = () => {
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

  const MAX_SELECTION = 3;
  // チェックボックスの変更ハンドラー
  const handleCheckboxChange = (
    name: keyof FormData,
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[name] as string[];

      if (checked && currentArray.length >= MAX_SELECTION) {
        Alert.alert(
          '選択制限',
          `最大${MAX_SELECTION}つまでしか選択できません。`,
        );
        return prev; // 選択制限を超えた場合は何も変更しない
      }

      return {
        ...prev,
        [name]: checked
          ? [...currentArray, value] // 選択を追加
          : currentArray.filter((item) => item !== value), // 選択を解除
      };
    });
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

      console.log('formdata:', formData);

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-beauty-recipe',
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
      !formData.preferences.length &&
      !formData.skinCare &&
      !formData.detox &&
      !formData.flavor &&
      !formData.cookingMethod &&
      !formData.ingredients.length &&
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
            🍓 美容・アンチエイジングのこだわりポイントを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          {/* 美容のこだわりポイント */}
          <Text style={styles.label}>美容のこだわりポイント💄</Text>
          {beautyPreferences.map((option) => (
            <CustomCheckbox
              key={option.value}
              value={formData.preferences.includes(option.value)}
              onValueChange={(checked) =>
                handleCheckboxChange('preferences', option.value, checked)
              }
              label={option.label}
            />
          ))}

          {/* 肌質改善のこだわり */}
          <CustomSelect
            label="肌質改善のこだわり🧴"
            selectedValue={formData.skinCare}
            onValueChange={(value) => handleSelectChange('skinCare', value)}
            options={skinCareOptions}
          />

          {/* デトックスや代謝促進 */}
          <CustomSelect
            label="デトックスや代謝促進🌱"
            selectedValue={formData.detox}
            onValueChange={(value) => handleSelectChange('detox', value)}
            options={detoxOptions}
          />

          {/* 味付けの選択肢 */}
          <CustomSelect
            label="味付けのこだわり🍋"
            selectedValue={formData.flavor}
            onValueChange={(value) => handleSelectChange('flavor', value)}
            options={beautyFlavorOptions}
          />

          {/* 調理法 */}
          <CustomSelect
            label="調理法🍳"
            selectedValue={formData.cookingMethod}
            onValueChange={(value) =>
              handleSelectChange('cookingMethod', value)
            }
            options={beautyCookingMethods}
          />

          {/* 使用する食材 */}
          <Text style={styles.label}>使用する食材🍅</Text>
          {beautyIngredientOptions.map((option) => (
            <CustomCheckbox
              key={option.value}
              value={formData.ingredients.includes(option.value)}
              onValueChange={(checked) =>
                handleCheckboxChange('ingredients', option.value, checked)
              }
              label={option.label}
            />
          ))}

          {/* その他の食材 */}
          <Text style={styles.label}>その他使いたい食材🥑</Text>
          <TextInput
            style={styles.input}
            placeholder="その他使いたい食材 🥑 20文字以内"
            value={formData.preferredIngredients}
            maxLength={20}
            onChangeText={(value) =>
              handleInputChange('preferredIngredients', value)
            }
          />

          {/* レシピ検索ボタン */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                レシピを作る（約10秒） 🚀
              </Text>
            )}
          </TouchableOpacity>

          {/* エラーメッセージ */}
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

export default BeautyRecipeFormExtended;
