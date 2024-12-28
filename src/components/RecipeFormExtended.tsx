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
  budgetOptions,
  peopleOptions,
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
  budget: string;
  effort: string[];
  preferredIngredients: string;
  avoidedIngredients: string;
  people: string;
  preference: string;
};

type Option = {
  label: string;
  value: string;
};

const RecipeFormExtended = () => {
  const [formData, setFormData] = useState<FormData>({
    mood: '',
    time: '',
    mealTime: '',
    budget: '',
    effort: [],
    preferredIngredients: '',
    avoidedIngredients: '',
    people: '',
    preference: '',
  });

  const [generatedRecipe, setGeneratedRecipe] = useState<string>('');
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

  // チェックボックスの変更ハンドラー
  const handleCheckboxChange = (
    name: keyof FormData,
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => {
      const currentArray = prev[name] as string[];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return {
          ...prev,
          [name]: currentArray.filter((item) => item !== value),
        };
      }
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
    const pointsToConsume = 2; // レシピ1回あたり消費するポイント
    let pointsConsumed = false; // ポイント消費フラグ

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

        // ポイントを消費する
        const { error: consumeError } = await supabase.rpc('update_points', {
          p_user_id: userId,
          p_added_points: -pointsToConsume, // 負の値でポイント消費
        });

        if (consumeError) {
          throw new Error('ポイント消費に失敗しました。');
        }

        pointsConsumed = true; // ポイント消費成功フラグを設定
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('レシピ生成中にエラーが発生しました。');

      // ポイントを消費していた場合にのみロールバック
      if (pointsConsumed) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.id) {
            await supabase.rpc('update_points', {
              p_user_id: userData.user.id,
              p_added_points: pointsToConsume, // ポイントを戻す
            });
          }
        } catch (rollbackError) {
          console.error(
            'ポイントロールバック中にエラーが発生しました:',
            rollbackError,
          );
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // フォーム送信
  const handleSubmit = async () => {
    if (!formData.mood || !formData.time) {
      setError('気分と調理時間は必須項目です！');
      return;
    }
    setError(null);
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
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>🍳 あなたのこだわりレシピを探そう</Text>

          <CustomSelect
            label="今日の気分😃"
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
            label="予算💰"
            selectedValue={formData.budget}
            onValueChange={(value) => handleSelectChange('budget', value)}
            options={budgetOptions}
          />

          {/* 人数のセレクトボックスを追加 */}
          <CustomSelect
            label="人数👥"
            selectedValue={formData.people}
            onValueChange={(value) => handleSelectChange('people', value)}
            options={peopleOptions}
          />

          <View style={styles.section}>
            <Text style={styles.label}>手間</Text>
            {effortOptions.map((option: Option) => (
              <CustomCheckbox
                key={option.value}
                value={formData.effort.includes(option.value)}
                onValueChange={(newValue) =>
                  handleCheckboxChange('effort', option.value, newValue)
                }
                label={option.label}
              />
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="使いたい食材 🥕 (例: 鶏肉, トマト)"
            value={formData.preferredIngredients}
            onChangeText={(value) =>
              handleInputChange('preferredIngredients', value)
            }
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>レシピを探す 🚀</Text>
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
