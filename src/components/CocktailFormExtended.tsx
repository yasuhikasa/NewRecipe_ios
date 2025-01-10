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
import RecipeModal from './RecipeModal';
import CustomSelect from './CustomSelect';
import supabase from '../config/supabaseClient';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type FormData = {
  baseAlcohol: string;
  flavorProfile: string;
  garnish: string;
  style: string;
  strength: string;
};

const initialFormData: FormData = {
  baseAlcohol: '',
  flavorProfile: '',
  garnish: '',
  style: '',
  strength: '',
};

const baseAlcoholOptions = [
  { label: 'ウォッカ', value: 'ウォッカ' },
  { label: 'ジン', value: 'ジン' },
  { label: 'ラム', value: 'ラム' },
  { label: 'テキーラ', value: 'テキーラ' },
  { label: 'ウイスキー', value: 'ウイスキー' },
  { label: 'ブランデー', value: 'ブランデー' },
  { label: 'リキュール', value: 'リキュール' },
  { label: 'ノンアルコール', value: 'ノンアルコール' },
];

const flavorProfileOptions = [
  { label: 'フルーティー', value: 'フルーティー' },
  { label: 'ハーバル', value: 'ハーバル' },
  { label: 'スモーキー', value: 'スモーキー' },
  { label: 'スパイシー', value: 'スパイシー' },
  { label: 'チョコレート風味', value: 'チョコレート風味' },
  { label: '酸味が強い', value: '酸味が強い' },
  { label: '甘さ控えめ', value: '甘さ控えめ' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const garnishOptions = [
  { label: 'ライム', value: 'ライム' },
  { label: 'レモン', value: 'レモン' },
  { label: 'オレンジ', value: 'オレンジ' },
  { label: 'ベリー類', value: 'ベリー類' },
  { label: 'パイナップル', value: 'パイナップル' },
  { label: 'キュウリ', value: 'キュウリ' },
  { label: 'ミント', value: 'ミント' },
  { label: 'ローズマリー', value: 'ローズマリー' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const styleOptions = [
  { label: 'クラシック', value: 'クラシック' },
  { label: 'トロピカル', value: 'トロピカル' },
  { label: 'シンプルで洗練された', value: 'シンプルで洗練された' },
  { label: '層を作るビジュアル', value: '層を作るビジュアル' },
  { label: 'ロックグラスでシックに', value: 'ロックグラスでシックに' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const strengthOptions = [
  { label: 'ライト', value: 'ライト' },
  { label: 'ミディアム', value: 'ミディアム' },
  { label: 'ストロング', value: 'ストロング' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const CocktailForm = () => {
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
    const pointsToConsume = 2; // レシピ1回あたり消費するポイント
    // let pointsConsumed = false; // ポイント消費フラグ

    try {
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

      // ポイントが足りている場合、以下の処理を続行
      setIsGenerating(true);
      setGeneratedRecipe(''); // 初期化
      setModalOpen(true); // モーダルを先に開く

      console.log('formData:', formData);

      // レシピ生成 API を呼び出す
      const response = await axios.post(
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-cocktail-recipe',
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
    if (!formData.baseAlcohol && !formData.flavorProfile && !formData.garnish) {
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
            🍸 カクテルのこだわりを選択してください
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <CustomSelect
            label="ベースのお酒🍹"
            selectedValue={formData.baseAlcohol}
            onValueChange={(value) => handleSelectChange('baseAlcohol', value)}
            options={baseAlcoholOptions}
          />
          <CustomSelect
            label="フレーバープロファイル🌿"
            selectedValue={formData.flavorProfile}
            onValueChange={(value) =>
              handleSelectChange('flavorProfile', value)
            }
            options={flavorProfileOptions}
          />
          <CustomSelect
            label="使用する果物・ハーブ🍋"
            selectedValue={formData.garnish}
            onValueChange={(value) => handleSelectChange('garnish', value)}
            options={garnishOptions}
          />
          <CustomSelect
            label="仕上げのスタイル🎨"
            selectedValue={formData.style}
            onValueChange={(value) => handleSelectChange('style', value)}
            options={styleOptions}
          />
          <CustomSelect
            label="カクテルの強さ💪"
            selectedValue={formData.strength}
            onValueChange={(value) => handleSelectChange('strength', value)}
            options={strengthOptions}
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

export default CocktailForm;
