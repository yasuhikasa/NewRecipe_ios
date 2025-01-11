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
import RecipeModal from './TrialRecipeModal';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import CustomSelect from './CustomSelect';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FormData = {
  mealStyle: string; // 食事のスタイル
  ingredientCategory: string;
  mood: string;
  purpose: string; // 新しく追加された項目
};

const initialFormData: FormData = {
  mealStyle: '',
  ingredientCategory: '',
  mood: '',
  purpose: '', // 初期値
};

const mealStyleOptions = [
  { label: '家庭料理', value: '家庭料理' },
  { label: 'デザート', value: 'デザート' },
  { label: '軽食', value: '軽食' },
  { label: 'お弁当向け', value: 'お弁当向け' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const ingredientCategoryOptions = [
  { label: '野菜中心', value: '野菜中心' },
  { label: '肉中心', value: '肉中心' },
  { label: '魚中心', value: '魚中心' },
  { label: 'ビーガン', value: 'ビーガン' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const moodOptions = [
  { label: '疲れて元気がない', value: '疲れて元気がない' },
  { label: '料理でテンションを上げたい', value: '料理でテンションを上げたい' },
  { label: '食べる人を喜ばせたい', value: '食べる人を喜ばせたい' },
  { label: 'リラックスしたい', value: 'リラックスしたい' },
  { label: 'やる気を出したい', value: 'やる気を出したい' },
  { label: '時短で作りたい', value: '時短で作りたい' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const purposeOptions = [
  { label: '健康', value: '健康' },
  { label: 'リフレッシュ', value: 'リフレッシュ' },
  { label: '満腹感を得たい', value: '満腹感を得たい' },
  { label: 'エネルギーチャージ', value: 'エネルギーチャージ' }, // 追加
  { label: 'ダイエット', value: 'ダイエット' }, // 追加
  { label: 'ヘルシー志向', value: 'ヘルシー志向' },
  { label: 'スタミナ重視', value: 'スタミナ重視' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const Free2RecipeForm = () => {
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

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkRequestLimit = async () => {
    try {
      const lastRequestDate = await AsyncStorage.getItem(
        'free2_lastRequestDate',
      );
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式

      if (lastRequestDate === today) {
        Alert.alert(
          '制限',
          'お試し版は1日1回です（午前9時更新）。続きはサインイン後にご利用ください。',
        );
        return false;
      }

      await AsyncStorage.setItem('free2_lastRequestDate', today);
      return true;
    } catch (err) {
      console.error('Error checking request limit:', err);
      Alert.alert('エラー', 'リクエスト制限の確認中に問題が発生しました。');
      return false;
    }
  };

  const generateRecipe = async () => {
    try {
      const canProceed = await checkRequestLimit(); // 非同期の戻り値を待つ
      if (!canProceed) {
        return; // 制限に達している場合は処理を終了
      }

      setIsGenerating(true);
      setGeneratedRecipe('');
      setModalOpen(true);

      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-free2-recipe',
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

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

  const handleSubmit = async () => {
    if (!formData.mood) {
      Alert.alert('エラー', '気分の選択は必須です！');
      return;
    }
    await generateRecipe();
  };

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
          <Text style={styles.title}>🍽 今日の1皿</Text>
          <CustomSelect
            label="今の気分🌟"
            selectedValue={formData.mood}
            onValueChange={(value) => handleInputChange('mood', value)}
            options={moodOptions}
          />
          <CustomSelect
            label="料理の目的💪"
            selectedValue={formData.purpose}
            onValueChange={(value) => handleInputChange('purpose', value)}
            options={purposeOptions}
          />
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
            isGenerating={isGenerating}
          />
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default Free2RecipeForm;
