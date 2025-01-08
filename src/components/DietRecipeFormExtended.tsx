// src/components/RecipeFormExtended.tsx
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
import RecipeModal from './RecipeModal'; // 別ファイルからインポート
import CustomCheckbox from './CustomCheckbox'; // カスタムチェックボックス
import CustomSelect from './CustomSelect'; // カスタムセレクトボックス
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  preferences: string[];
  dietFlavor: string;
  cookingTime: string;
  dietCookingMethods: string;
  dietIngredient: string[];
  preferredIngredients: string;
};

const initialFormData: FormData = {
  preferences: [],
  dietFlavor: '',
  cookingTime: '',
  dietCookingMethods: '',
  dietIngredient: [],
  preferredIngredients: '',
};

const dietPreferences = [
  { label: '低糖質', value: '低糖質' },
  { label: '高タンパク', value: '高タンパク' },
  { label: 'ローカロリー', value: 'ローカロリー' },
  { label: '食物繊維を多く含む', value: '食物繊維を多く含む' },
  { label: '脂質を抑えたメニュー', value: '脂質を抑えたメニュー' },
  { label: '満腹感を重視', value: '満腹感を重視' },
  { label: 'グルテンフリー', value: 'グルテンフリー' },
  { label: 'ビーガン対応', value: 'ビーガン対応' },
  { label: '糖質制限対応', value: '糖質制限対応' },
  { label: 'カロリーコントロール', value: 'カロリーコントロール' },
];

const dietFlavorOptions = [
  { label: 'さっぱり系', value: 'さっぱり系' },
  { label: 'ピリ辛', value: 'ピリ辛' },
  { label: 'ハーブやスパイス風味', value: 'ハーブやスパイス風味' },
  { label: '塩味が控えめ', value: '塩味が控えめ' },
  { label: '和風（醤油や味噌）', value: '和風（醤油や味噌）' },
  { label: '洋風（バターやクリーム）', value: '洋風（バターやクリーム）' },
  {
    label: 'エスニック（ココナッツやカレー）',
    value: 'エスニック（ココナッツやカレー）',
  },
  { label: '酸味を活かした味付け', value: '酸味を活かした味付け' },
  { label: '甘辛い味付け', value: '甘辛い味付け' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingTimeOptions = [
  { label: '10分以内', value: '10分以内' },
  { label: '20分以内', value: '20分以内' },
  { label: '30分以内', value: '30分以内' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const dietCookingMethods = [
  { label: '蒸し料理', value: '蒸し料理' },
  { label: 'グリル', value: 'グリル' },
  { label: 'スープ', value: 'スープ' },
  { label: 'サラダ', value: 'サラダ' },
  { label: 'ボウルスタイル', value: 'ボウルスタイル' },
  { label: 'ロースト', value: 'ロースト' },
  { label: '炒め料理', value: '炒め料理' },
  { label: 'オーブン料理', value: 'オーブン料理' },
  { label: '簡単な電子レンジ料理', value: '簡単な電子レンジ料理' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const dietIngredientOptions = [
  { label: '鶏胸肉', value: '鶏胸肉' },
  { label: 'サーモン', value: 'サーモン' },
  { label: 'ブロッコリー', value: 'ブロッコリー' },
  { label: 'アボカド', value: 'アボカド' },
  { label: '卵', value: '卵' },
  { label: '玄米', value: '玄米' },
  { label: '豆腐', value: '豆腐' },
  { label: 'ほうれん草', value: 'ほうれん草' },
  { label: 'トマト', value: 'トマト' },
  { label: 'ズッキーニ', value: 'ズッキーニ' },
  { label: 'キヌア', value: 'キヌア' },
  { label: 'ナッツ', value: 'ナッツ' },
  { label: '鶏ささみ', value: '鶏ささみ' },
  { label: 'カリフラワー', value: 'カリフラワー' },
  { label: 'ヨーグルト', value: 'ヨーグルト' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const DietRecipeFormExtended = () => {
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
        return prev; // 制限を超えた場合は変更しない
      }

      return {
        ...prev,
        [name]: checked
          ? [...currentArray, value] // 新しい値を追加
          : currentArray.filter((item) => item !== value), // 値を削除
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

      console.log('formData:', formData);

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-diet-recipe',
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
      !formData.dietFlavor &&
      !formData.cookingTime &&
      !formData.dietCookingMethods &&
      !formData.dietIngredient.length &&
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
            🍳 ダイエットレシピのこだわりを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <Text style={styles.label}>ダイエットのこだわりポイント💪</Text>
          {dietPreferences.map((option) => (
            <CustomCheckbox
              key={option.value}
              value={formData.preferences.includes(option.value)}
              onValueChange={(checked) =>
                handleCheckboxChange('preferences', option.value, checked)
              }
              label={option.label}
            />
          ))}

          <CustomSelect
            label="味付けのこだわり🧀"
            selectedValue={formData.dietFlavor}
            onValueChange={(value) => handleSelectChange('dietFlavor', value)}
            options={dietFlavorOptions}
          />

          <CustomSelect
            label="調理時間⌚️"
            selectedValue={formData.cookingTime}
            onValueChange={(value) => handleSelectChange('cookingTime', value)}
            options={cookingTimeOptions}
          />

          <CustomSelect
            label="調理法🫕"
            selectedValue={formData.dietCookingMethods}
            onValueChange={(value) =>
              handleSelectChange('dietCookingMethods', value)
            }
            options={dietCookingMethods}
          />

          <Text style={styles.label}>使用する食材🐓</Text>
          {dietIngredientOptions.map((option) => (
            <CustomCheckbox
              key={option.value}
              value={formData.dietIngredient.includes(option.value)}
              onValueChange={(checked) =>
                handleCheckboxChange('dietIngredient', option.value, checked)
              }
              label={option.label}
            />
          ))}

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

export default DietRecipeFormExtended;
