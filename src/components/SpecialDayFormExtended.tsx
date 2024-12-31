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
  TextInput,
} from 'react-native';
import axios from 'axios';
import RecipeModal from './RecipeModal';
import CustomSelect from './CustomSelect';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  event: string;
  theme: string;
  style: string;
  ingredient: string;
  tableSetting: string;
  customNotes: string;
};

const initialFormData: FormData = {
  event: '',
  theme: '',
  style: '',
  ingredient: '',
  tableSetting: '',
  customNotes: '',
};

const eventOptions = [
  { label: '誕生日', value: '誕生日' },
  { label: '記念日', value: '記念日' },
  { label: 'プロポーズ', value: 'プロポーズ' },
  { label: '家族の集まり', value: '家族の集まり' },
  { label: '友人とのディナー', value: '友人とのディナー' },
  { label: 'その他特別な日', value: 'その他特別な日' },
];

const themeOptions = [
  { label: '豪華さ重視', value: '豪華さ重視' },
  { label: 'シンプルで上品', value: 'シンプルで上品' },
  { label: '季節感のある料理', value: '季節感のある料理' },
  { label: '異国の雰囲気', value: '異国の雰囲気' },
  { label: '健康的でヘルシー', value: '健康的でヘルシー' },
  { label: 'サプライズ性がある料理', value: 'サプライズ性がある料理' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const styleOptions = [
  { label: 'コース料理', value: 'コース料理' },
  { label: 'ワンプレートディッシュ', value: 'ワンプレートディッシュ' },
  { label: 'ビュッフェスタイル', value: 'ビュッフェスタイル' },
  { label: 'ロマンティックなセット', value: 'ロマンティックなセット' },
  { label: '子ども向けの楽しい料理', value: '子ども向けの楽しい料理' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const ingredientOptions = [
  { label: '高級食材', value: '高級食材' },
  { label: '魚介類', value: '魚介類' },
  { label: 'お肉', value: 'お肉' },
  { label: '季節の野菜', value: '季節の野菜' },
  { label: 'デザート用フルーツ', value: 'デザート用フルーツ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const tableSettingOptions = [
  { label: 'キャンドルライト', value: 'キャンドルライト' },
  { label: 'フラワーアレンジメント', value: 'フラワーアレンジメント' },
  { label: 'シンプルで上品な食器', value: 'シンプルで上品な食器' },
  { label: 'カラフルで楽しい飾り付け', value: 'カラフルで楽しい飾り付け' },
  { label: 'おしゃれなカフェ風', value: 'おしゃれなカフェ風' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const SpecialDayForm = () => {
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
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-specialday-recipe',
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
      !formData.event &&
      !formData.theme &&
      !formData.style &&
      !formData.ingredient &&
      !formData.tableSetting
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
            🎉 特別な日のこだわりを選択してください
          </Text>
          <CustomSelect
            label="イベントの種類🌟"
            selectedValue={formData.event}
            onValueChange={(value) => handleSelectChange('event', value)}
            options={eventOptions}
          />
          <CustomSelect
            label="料理のテーマ🍽️"
            selectedValue={formData.theme}
            onValueChange={(value) => handleSelectChange('theme', value)}
            options={themeOptions}
          />
          <CustomSelect
            label="料理のスタイル🍴"
            selectedValue={formData.style}
            onValueChange={(value) => handleSelectChange('style', value)}
            options={styleOptions}
          />
          <CustomSelect
            label="使いたい食材🥩"
            selectedValue={formData.ingredient}
            onValueChange={(value) => handleSelectChange('ingredient', value)}
            options={ingredientOptions}
          />
          <CustomSelect
            label="テーブルセッティング🎨"
            selectedValue={formData.tableSetting}
            onValueChange={(value) => handleSelectChange('tableSetting', value)}
            options={tableSettingOptions}
          />
          <Text style={styles.label}>特別な希望やメモ</Text>
          <TextInput
            style={styles.input}
            placeholder="特別な希望やメモ 📝　20文字以内"
            value={formData.customNotes}
            maxLength={20}
            onChangeText={(value) => handleInputChange('customNotes', value)}
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

export default SpecialDayForm;
