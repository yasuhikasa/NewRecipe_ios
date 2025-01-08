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
  snsAppearance: string;
  snsColorTheme: string;
  snsPlatingIdea: string;
  snsDishType: string;
  snsIngredient: string;
};

const initialFormData: FormData = {
  snsAppearance: '',
  snsColorTheme: '',
  snsPlatingIdea: '',
  snsDishType: '',
  snsIngredient: '',
};

const snsAppearanceOptions = [
  { label: 'カラフルで鮮やか', value: 'カラフルで鮮やか' },
  { label: '盛り付けが美しい', value: '盛り付けが美しい' },
  { label: 'ユニークな形状', value: 'ユニークな形状' },
  { label: '立体感のあるデザイン', value: '立体感のあるデザイン' },
  { label: '写真映えするデザート', value: '写真映えするデザート' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const snsColorThemeOptions = [
  { label: 'パステルカラー', value: 'パステルカラー' },
  { label: 'レインボーカラー', value: 'レインボーカラー' },
  { label: 'モノクローム', value: 'モノクローム' },
  { label: 'グリーン＆ナチュラル', value: 'グリーン＆ナチュラル' },
  { label: 'ビビッドトーン', value: 'ビビッドトーン' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const snsPlatingIdeas = [
  { label: '高さを出す盛り付け', value: '高さを出す盛り付け' },
  { label: 'パターンを描く盛り付け', value: 'パターンを描く盛り付け' },
  { label: '複数の小皿を使用', value: '複数の小皿を使用' },
  { label: 'テーブル全体を使った配置', value: 'テーブル全体を使った配置' },
  { label: 'ユニークな器を使う', value: 'ユニークな器を使う' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const snsDishTypeOptions = [
  {
    label: 'スイーツ（例：ケーキ、マカロン）',
    value: 'スイーツ（例：ケーキ、マカロン）',
  },
  {
    label: 'ドリンク（例：ラテアート、スムージー）',
    value: 'ドリンク（例：ラテアート、スムージー）',
  },
  { label: 'ブランチメニュー', value: 'ブランチメニュー' },
  { label: '和風デザインの料理', value: '和風デザインの料理' },
  { label: '個性的なバーガーやピザ', value: '個性的なバーガーやピザ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const snsIngredientOptions = [
  {
    label: 'ベリー類（例：ブルーベリー、ストロベリー）',
    value: 'ベリー類（例：ブルーベリー、ストロベリー）',
  },
  { label: 'エディブルフラワー', value: 'エディブルフラワー' },
  { label: 'アボカド', value: 'アボカド' },
  {
    label: 'カラフルな野菜（例：パプリカ、ズッキーニ）',
    value: 'カラフルな野菜（例：パプリカ、ズッキーニ）',
  },
  {
    label: 'ハーブ（例：バジル、ミント）',
    value: 'ハーブ（例：バジル、ミント）',
  },
  {
    label: 'シーフード（例：エビ、サーモン）',
    value: 'シーフード（例：エビ、サーモン）',
  },
  { label: 'おまかせ', value: 'おまかせ' },
];

const SnsRecipeFormExtended = () => {
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

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-sns-recipe',
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
      !formData.snsAppearance &&
      !formData.snsColorTheme &&
      !formData.snsPlatingIdea &&
      !formData.snsDishType &&
      !formData.snsIngredient
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
            📸 SNS映え料理のこだわりを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <CustomSelect
            label="見た目のこだわり❤️"
            selectedValue={formData.snsAppearance}
            onValueChange={(value) =>
              handleSelectChange('snsAppearance', value)
            }
            options={snsAppearanceOptions}
          />
          <CustomSelect
            label="色合いのテーマ🩵"
            selectedValue={formData.snsColorTheme}
            onValueChange={(value) =>
              handleSelectChange('snsColorTheme', value)
            }
            options={snsColorThemeOptions}
          />
          <CustomSelect
            label="盛り付けアイデア🍓"
            selectedValue={formData.snsPlatingIdea}
            onValueChange={(value) =>
              handleSelectChange('snsPlatingIdea', value)
            }
            options={snsPlatingIdeas}
          />
          <CustomSelect
            label="料理の種類🍳"
            selectedValue={formData.snsDishType}
            onValueChange={(value) => handleSelectChange('snsDishType', value)}
            options={snsDishTypeOptions}
          />
          <CustomSelect
            label="使用する食材🐟"
            selectedValue={formData.snsIngredient}
            onValueChange={(value) =>
              handleSelectChange('snsIngredient', value)
            }
            options={snsIngredientOptions}
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

export default SnsRecipeFormExtended;
