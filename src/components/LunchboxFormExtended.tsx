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
  bentoBoxType: string;
  cookingTime: string;
  ingredientType: string;
  flavor: string;
  storageMethod: string;
  preferredIngredients: string;
};

const initialFormData: FormData = {
  preferences: [],
  bentoBoxType: '',
  cookingTime: '',
  ingredientType: '',
  flavor: '',
  storageMethod: '',
  preferredIngredients: '',
};

const bentoPreferences = [
  { label: '冷めても美味しい', value: '冷めても美味しい' },
  { label: '作り置き可能', value: '作り置き可能' },
  { label: '崩れにくい', value: '崩れにくい' },
  { label: '見た目重視', value: '見た目重視' },
  { label: '野菜を多めに', value: '野菜を多めに' },
  { label: '詰めやすい形状', value: '詰めやすい形状' },
  { label: 'ヘルシー志向', value: 'ヘルシー志向' },
  { label: 'ボリューム満点', value: 'ボリューム満点' },
  { label: '簡単手軽', value: '簡単手軽' },
  { label: '高タンパク', value: '高タンパク' },
  { label: '低カロリー', value: '低カロリー' },
  { label: '塩分控えめ', value: '塩分控えめ' },
  { label: '甘めの味付け', value: '甘めの味付け' },
  { label: '辛めの味付け', value: '辛めの味付け' },
];

const bentoBoxOptions = [
  { label: '普通サイズ', value: '普通サイズ' },
  { label: '大容量', value: '大容量' },
  { label: '小分け容器', value: '小分け容器' },
  { label: 'ランチジャー', value: 'ランチジャー' },
  { label: 'おにぎり専用', value: 'おにぎり専用' },
  { label: 'サラダボックス', value: 'サラダボックス' },
  { label: 'キャラ弁用', value: 'キャラ弁用' },
  { label: 'アウトドア用', value: 'アウトドア用' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const cookingTimeOptions = [
  { label: '10分以内', value: '10分以内' },
  { label: '20分以内', value: '20分以内' },
  { label: '30分以内', value: '30分以内' },
  { label: '1時間以内', value: '1時間以内' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const ingredientTypeOptions = [
  { label: '主菜（肉）', value: '主菜（肉）' },
  { label: '主菜（魚）', value: '主菜（魚）' },
  { label: '副菜（野菜）', value: '副菜（野菜）' },
  { label: '炭水化物（ご飯やパン）', value: '炭水化物（ご飯やパン）' },
  { label: '豆類やナッツ', value: '豆類やナッツ' },
  { label: '卵料理', value: '卵料理' },
  { label: '乳製品', value: '乳製品' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const flavorOptions = [
  { label: '和風（醤油ベース）', value: '和風（醤油ベース）' },
  { label: '和風（味噌や砂糖）', value: '和風（味噌や砂糖）' },
  { label: '洋風（ハーブやバター）', value: '洋風（ハーブやバター）' },
  { label: '洋風（トマトソース）', value: '洋風（トマトソース）' },
  { label: '中華風（醤油ベース）', value: '中華風（醤油ベース）' },
  { label: '中華風（オイスターソース）', value: '中華風（オイスターソース）' },
  {
    label: 'エスニック風（カレー粉、スパイス）',
    value: 'エスニック風（カレー粉、スパイス）',
  },
  { label: '甘辛い味付け（照り焼き風）', value: '甘辛い味付け（照り焼き風）' },
  { label: '塩味メイン', value: '塩味メイン' },
  { label: 'スパイシー', value: 'スパイシー' },
  { label: 'さっぱり系', value: 'さっぱり系' },
  { label: 'おまかせ', value: 'おまかせ' },
];

const storageMethodOptions = [
  { label: '冷蔵保存可能', value: '冷蔵保存可能' },
  { label: '冷凍保存可能', value: '冷凍保存可能' },
  { label: '当日中に消費', value: '当日中に消費' },
  { label: '電子レンジ加熱対応', value: '電子レンジ加熱対応' },
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
        return prev; // 選択制限を超えた場合は何も変更しない
      }

      return {
        ...prev,
        [name]: checked
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
        'https://recipeapp-096ac71f3c9b.herokuapp.com/api/ai-lunchbox',
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
      !formData.bentoBoxType &&
      !formData.cookingTime &&
      !formData.ingredientType &&
      !formData.flavor &&
      !formData.storageMethod
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
            🍳 あなたのこだわりお弁当レシピを作ろう
          </Text>
          <Text style={styles.label}>いずれかの項目の入力が必要です</Text>
          <Text style={styles.label}>お弁当のこだわり</Text>
          {bentoPreferences.map((option) => (
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
            label="お弁当箱のタイプ🍱"
            selectedValue={formData.bentoBoxType}
            onValueChange={(value) => handleSelectChange('bentoBoxType', value)}
            options={bentoBoxOptions}
          />
          <CustomSelect
            label="調理時間🕰️"
            selectedValue={formData.cookingTime}
            onValueChange={(value) => handleSelectChange('cookingTime', value)}
            options={cookingTimeOptions}
          />
          <CustomSelect
            label="食材のタイプ🍖"
            selectedValue={formData.ingredientType}
            onValueChange={(value) =>
              handleSelectChange('ingredientType', value)
            }
            options={ingredientTypeOptions}
          />
          <CustomSelect
            label="味付けのバリエーション🧂"
            selectedValue={formData.flavor}
            onValueChange={(value) => handleSelectChange('flavor', value)}
            options={flavorOptions}
          />
          <CustomSelect
            label="保存方法🧊"
            selectedValue={formData.storageMethod}
            onValueChange={(value) =>
              handleSelectChange('storageMethod', value)
            }
            options={storageMethodOptions}
          />
          <Text style={styles.label}>使いたい食材🍱</Text>
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
