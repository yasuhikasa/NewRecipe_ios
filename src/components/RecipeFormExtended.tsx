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
import {
  moodOptions,
  cookingTimeOptions,
  effortOptions,
  mealTimeOptions,
  mealStyleOptions,
  ingredientCategoryOptions,
} from '../utils/options';
import RecipeModal from './RecipeModal'; // 別ファイルからインポート
import CustomCheckbox from './CustomCheckbox'; // カスタムチェックボックス
import CustomSelect from './CustomSelect'; // カスタムセレクトボックス
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

// フォームデータの型定義
type FormData = {
  mood: string;
  time: string;
  mealTime: string;
  mealStyle: string;
  ingredientCategory: string;
  effort: string[];
  preferredIngredients: string;
  preference: string;
};

type Option = {
  label: string;
  value: string;
};

const initialFormData: FormData = {
  mood: '',
  time: '',
  mealTime: '',
  mealStyle: '',
  ingredientCategory: '',
  effort: [],
  preferredIngredients: '',
  preference: '',
};

const RecipeFormExtended = () => {
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
  const handleCheckboxChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev.effort;

      // 選択追加時に最大数を確認
      if (checked && currentArray.length >= MAX_SELECTION) {
        Alert.alert(
          '選択制限',
          `最大${MAX_SELECTION}つまでしか選択できません。`,
        );
        return prev; // 制限時は変更しない
      }

      return {
        ...prev,
        effort: checked
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

      console.log('フォームデータ:', formData);

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-recipe',
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
    if (!formData.mood) {
      Alert.alert('気分の選択は必須です！');
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
          <Text style={styles.title}>🍳 あなたのこだわりレシピを作ろう</Text>
          <Text style={styles.label}>気分の項目の入力が必須です</Text>
          <CustomSelect
            label="今の気分😃"
            selectedValue={formData.mood}
            onValueChange={(value) => handleSelectChange('mood', value)}
            options={moodOptions}
          />
          <CustomSelect
            label="調理時間⏰"
            selectedValue={formData.time}
            onValueChange={(value) => handleSelectChange('time', value)}
            options={cookingTimeOptions}
          />
          <CustomSelect
            label="食べる時間帯🍽️"
            selectedValue={formData.mealTime}
            onValueChange={(value) => handleSelectChange('mealTime', value)}
            options={mealTimeOptions}
          />

          {/* 予算のセレクトボックスを追加 */}
          <CustomSelect
            label="食事のスタイル🍴"
            selectedValue={formData.mealStyle}
            onValueChange={(value) => handleInputChange('mealStyle', value)}
            options={mealStyleOptions}
          />
          <CustomSelect
            label="食材カテゴリー🥦"
            selectedValue={formData.ingredientCategory}
            onValueChange={(value) =>
              handleInputChange('ingredientCategory', value)
            }
            options={ingredientCategoryOptions}
          />

          <View style={styles.section}>
            <Text style={styles.label}>手間🖐️</Text>
            {effortOptions.map((option: Option) => (
              <CustomCheckbox
                key={option.value}
                value={formData.effort.includes(option.value)}
                onValueChange={(checked) =>
                  handleCheckboxChange(option.value, checked)
                }
                label={option.label}
              />
            ))}
          </View>

          <Text style={styles.label}>使いたい食材🥕</Text>
          <TextInput
            style={styles.input}
            placeholder="使いたい食材 🥕 (例: 鶏肉, トマト)"
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

export default RecipeFormExtended;
