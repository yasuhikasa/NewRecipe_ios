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
import RecipeModal from './TrialRecipeModal';
import useDeviceOrientation from '../hooks/useDeviceOrientation';
import CustomSelect from './CustomSelect';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FormData = {
  mainIngredients: string;
  cookingTime: string;
  flavor: string;
  dishType: string;
};

const initialFormData: FormData = {
  mainIngredients: '',
  cookingTime: '',
  flavor: '',
  dishType: '',
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

const Free1RecipeForm = () => {
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

  // ローカルストレージでリクエスト制限を管理
  const checkRequestLimit = async () => {
    const lastRequestDate = await AsyncStorage.getItem('lastRequestDate');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式

    if (lastRequestDate === today) {
      Alert.alert('制限', 'お試し版は1日1回です（午前9時更新）。続きはサインイン後にご利用ください。');
      return false;
    }

    await AsyncStorage.setItem('lastRequestDate', today);
    return true;
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateRecipe = async () => {
    try {
      const canProceed = await checkRequestLimit(); // 非同期の戻り値を待つ
      if (!canProceed) {
        return; // 制限に達している場合は処理を終了
      }

      setIsGenerating(true);
      setGeneratedRecipe(''); // 初期化
      setModalOpen(true); // モーダルを先に開く

      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-free1-recipe',
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
    if (!formData.mainIngredients) {
      Alert.alert('エラー', '冷蔵庫の材料は必須です！');
      return;
    }
    await generateRecipe();
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
            onValueChange={(value) => handleInputChange('cookingTime', value)}
            options={cookingTimeOptions}
          />
          <CustomSelect
            label="味付けの好み🍋"
            selectedValue={formData.flavor}
            onValueChange={(value) => handleInputChange('flavor', value)}
            options={flavorOptions}
          />
          <CustomSelect
            label="料理のジャンル🍽"
            selectedValue={formData.dishType}
            onValueChange={(value) => handleInputChange('dishType', value)}
            options={dishTypeOptions}
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

export default Free1RecipeForm;
