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
  appearanceTheme: string;
  cookingTime: string;
  taste: string;
  healthFocus: string;
  preferredIngredients: string;
};

const initialFormData: FormData = {
  preferences: [],
  appearanceTheme: '',
  cookingTime: '',
  taste: '',
  healthFocus: '',
  preferredIngredients: '',
};

const kidsPreferences = [
  { label: 'カラフルで鮮やか', value: 'カラフルで鮮やか' },
  { label: '甘い味付け', value: '甘い味付け' },
  { label: 'サクサクした食感', value: 'サクサクした食感' },
  { label: 'フワフワした食感', value: 'フワフワした食感' },
  { label: 'もちもちした食感', value: 'もちもちした食感' },
  { label: '遊び心のある見た目', value: '遊び心のある見た目' },
  { label: '手で食べやすい', value: '手で食べやすい' },
  { label: '野菜が隠れている', value: '野菜が隠れている' },
  { label: '食べやすいサイズ', value: '食べやすいサイズ' },
  { label: '片付けが簡単', value: '片付けが簡単' },
  { label: '一品で満足できる', value: '一品で満足できる' },
];

const appearanceThemeOptions = [
  { label: 'スマイルデザイン', value: 'スマイルデザイン' },
  { label: '動物のシルエット', value: '動物のシルエット' },
  { label: '星やハートの形', value: '星やハートの形' },
  { label: '自然をイメージしたデザイン', value: '自然をイメージしたデザイン' },
  { label: '虹色の配置', value: '虹色の配置' },
  { label: '幾何学模様の配置', value: '幾何学模様の配置' },
  { label: '季節感のあるトッピング', value: '季節感のあるトッピング' },
  { label: 'レイヤー状の配置', value: 'レイヤー状の配置' },
  { label: 'ひと口サイズで統一', value: 'ひと口サイズで統一' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingTimeOptions = [
  { label: '10分以内', value: '10分以内' },
  { label: '20分以内', value: '20分以内' },
  { label: '30分以内', value: '30分以内' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const tasteOptions = [
  { label: '甘い味付け', value: '甘い味付け' },
  { label: '塩味メイン', value: '塩味メイン' },
  { label: 'スパイシーでない', value: 'スパイシーでない' },
  { label: 'まろやかな味わい', value: 'まろやかな味わい' },
  { label: 'ケチャップ味', value: 'ケチャップ味' },
  { label: 'チーズ味', value: 'チーズ味' },
  { label: '軽い酸味', value: '軽い酸味' },
  { label: 'お醤油味', value: 'お醤油味' },
  { label: 'お味噌汁風', value: 'お味噌汁風' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const healthFocusOptions = [
  { label: '野菜を隠して取り入れる', value: '野菜を隠して取り入れる' },
  { label: '栄養バランスを重視', value: '栄養バランスを重視' },
  { label: '低カロリー', value: '低カロリー' },
  { label: 'オーガニック食材', value: 'オーガニック食材' },
  { label: 'カルシウムを増やす', value: 'カルシウムを増やす' },
  { label: '鉄分を強化', value: '鉄分を強化' },
  { label: '食物繊維を追加', value: '食物繊維を追加' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const LunchboxFormExtended = () => {
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
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-kids-recipe',
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
      !formData.appearanceTheme &&
      !formData.cookingTime &&
      !formData.taste &&
      !formData.healthFocus &&
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
            🍳 子供が喜ぶレシピのこだわりを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <Text style={styles.label}>子供が喜ぶポイント</Text>
          {kidsPreferences.map((option) => (
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
            label="見た目のテーマ🎡"
            selectedValue={formData.appearanceTheme}
            onValueChange={(value) =>
              handleSelectChange('appearanceTheme', value)
            }
            options={appearanceThemeOptions}
          />

          <CustomSelect
            label="調理時間⌚️"
            selectedValue={formData.cookingTime}
            onValueChange={(value) => handleSelectChange('cookingTime', value)}
            options={cookingTimeOptions}
          />

          <CustomSelect
            label="味付けのバリエーション🧂"
            selectedValue={formData.taste}
            onValueChange={(value) => handleSelectChange('taste', value)}
            options={tasteOptions}
          />

          <CustomSelect
            label="健康志向のこだわり💪"
            selectedValue={formData.healthFocus}
            onValueChange={(value) => handleSelectChange('healthFocus', value)}
            options={healthFocusOptions}
          />

          <Text style={styles.label}>使いたい食材🍆</Text>
          <TextInput
            style={styles.input}
            placeholder="使いたい食材 🥕 (例: 鶏肉, トマト)20文字以内"
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

export default LunchboxFormExtended;
