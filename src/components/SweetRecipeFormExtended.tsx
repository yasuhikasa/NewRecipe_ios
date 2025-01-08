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
  sweetType: string;
  sweetFlavor: string;
  sweetDecoration: string;
  sweetTexture: string;
  sweetCookingMethod: string;
  sweetIngredient: string;
};

const initialFormData: FormData = {
  sweetType: '',
  sweetFlavor: '',
  sweetDecoration: '',
  sweetTexture: '',
  sweetCookingMethod: '',
  sweetIngredient: '',
};

const sweetTypeOptions = [
  { label: 'ケーキ', value: 'ケーキ' },
  { label: 'マカロン', value: 'マカロン' },
  { label: 'カップケーキ', value: 'カップケーキ' },
  { label: 'パフェ', value: 'パフェ' },
  { label: 'クッキー', value: 'クッキー' },
  { label: '和風スイーツ', value: '和風スイーツ' },
  { label: '洋風スイーツ', value: '洋風スイーツ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const sweetFlavorOptions = [
  {
    label: 'ベリー系（イチゴ、ブルーベリー）',
    value: 'ベリー系（イチゴ、ブルーベリー）',
  },
  { label: 'チョコレート系', value: 'チョコレート系' },
  { label: '抹茶', value: '抹茶' },
  { label: 'キャラメル', value: 'キャラメル' },
  { label: 'ナッツ風味', value: 'ナッツ風味' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const sweetDecorationOptions = [
  { label: 'フルーツ盛り', value: 'フルーツ盛り' },
  { label: 'エディブルフラワー', value: 'エディブルフラワー' },
  { label: 'キラキラのトッピング', value: 'キラキラのトッピング' },
  { label: 'チョコペンでお絵かき', value: 'チョコペンでお絵かき' },
  { label: 'シンプルなデコレーション', value: 'シンプルなデコレーション' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const sweetTextureOptions = [
  { label: 'ふわふわ', value: 'ふわふわ' },
  { label: 'サクサク', value: 'サクサク' },
  { label: 'しっとり', value: 'しっとり' },
  { label: 'もちもち', value: 'もちもち' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const sweetCookingMethodOptions = [
  { label: 'オーブンで焼く', value: 'オーブンで焼く' },
  { label: '冷やして固める', value: '冷やして固める' },
  { label: '重ねる（ミルフィーユ風）', value: '重ねる（ミルフィーユ風）' },
  { label: 'フライパンで焼く', value: 'フライパンで焼く' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const sweetIngredientOptions = [
  { label: 'ベリー類', value: 'ベリー類' },
  { label: 'チョコレート', value: 'チョコレート' },
  { label: 'クリーム', value: 'クリーム' },
  { label: 'アーモンド', value: 'アーモンド' },
  { label: '抹茶', value: '抹茶' },
  { label: 'キャラメル', value: 'キャラメル' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const SweetRecipeFormExtended = () => {
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

      console.log('formData:', formData);

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-sweet-recipe',
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
      !formData.sweetType &&
      !formData.sweetFlavor &&
      !formData.sweetDecoration &&
      !formData.sweetTexture &&
      !formData.sweetCookingMethod &&
      !formData.sweetIngredient
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
            🍰 スイーツのこだわり項目を選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <CustomSelect
            label="スイーツの種類🍓"
            selectedValue={formData.sweetType}
            onValueChange={(value) => handleSelectChange('sweetType', value)}
            options={sweetTypeOptions}
          />
          <CustomSelect
            label="味のテーマ🍈"
            selectedValue={formData.sweetFlavor}
            onValueChange={(value) => handleSelectChange('sweetFlavor', value)}
            options={sweetFlavorOptions}
          />
          <CustomSelect
            label="デコレーション🍰"
            selectedValue={formData.sweetDecoration}
            onValueChange={(value) =>
              handleSelectChange('sweetDecoration', value)
            }
            options={sweetDecorationOptions}
          />
          <CustomSelect
            label="食感🍪"
            selectedValue={formData.sweetTexture}
            onValueChange={(value) => handleSelectChange('sweetTexture', value)}
            options={sweetTextureOptions}
          />
          <CustomSelect
            label="調理方法🔪"
            selectedValue={formData.sweetCookingMethod}
            onValueChange={(value) =>
              handleSelectChange('sweetCookingMethod', value)
            }
            options={sweetCookingMethodOptions}
          />
          <CustomSelect
            label="使用する食材🥚"
            selectedValue={formData.sweetIngredient}
            onValueChange={(value) =>
              handleSelectChange('sweetIngredient', value)
            }
            options={sweetIngredientOptions}
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

export default SweetRecipeFormExtended;
