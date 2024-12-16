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
  preferenceOptions,
} from '../utils/options';
import RecipeModal from './RecipeModal'; // 別ファイルからインポート
import CustomCheckbox from './CustomCheckbox'; // カスタムチェックボックス
import CustomSelect from './CustomSelect'; // カスタムセレクトボックス
import supabase from '../config/supabaseClient';

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

  // セレクトボックスの変更ハンドラー
  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // チェックボックスの変更ハンドラー
  const handleCheckboxChange = (name: keyof FormData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentArray = prev[name] as string[];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return { ...prev, [name]: currentArray.filter((item) => item !== value) };
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
    try {
      setIsGenerating(true);
      setGeneratedRecipe(''); // 初期化
      setModalOpen(true); // モーダルを先に開く

      const response = await axios.post('https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-recipe', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.recipe) {
        setGeneratedRecipe(response.data.recipe);
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
        Alert.alert('エラー', 'ユーザーが認証されていません。ログインしてください。');
        return;
      }

      const user_id = user.id;

      // サーバーにレシピデータを送信
      const response = await axios.post('https://recipeapp-096ac71f3c9b.herokuapp.com/api/save-recipe', {
        recipe: generatedRecipe,
        formData,
        title,
        user_id, // uid を送信
      });

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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            onChangeText={(value) => handleInputChange('preferredIngredients', value)}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>レシピを探す 🚀</Text>
            )}
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
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

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#fffaf0',
  },
  innerContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#ff6347',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#ff6347',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20, // 各セクションのマージン
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RecipeFormExtended;
