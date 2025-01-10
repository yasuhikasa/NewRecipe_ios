// src/utils/api.ts
import axios from 'axios';
import supabase from '../config/supabaseClient';
import { Label, Recipe } from '../types/types';

// APIのベースURL
const API_BASE_URL = 'https://recipeapp-096ac71f3c9b.herokuapp.com/api';

// ユーザー情報取得
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('ユーザーが認証されていません。');
  }
  return data.user;
};

// ラベル取得
export const fetchLabels = async (user_id: string): Promise<Label[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/labels`, {
      params: { user_id },
    });

    console.log('Fetch Labels Response:', response.data);

    if (response.status === 200) {
      return response.data.labels;
    } else {
      throw new Error('Failed to fetch labels');
    }
  } catch (error) {
    console.error('Error in fetchLabels:', error);
    throw new Error('ラベルの取得に失敗しました');
  }
};

// ラベル追加
export const addLabel = async (
  user_id: string,
  name: string,
): Promise<Label> => {
  const response = await axios.post(`${API_BASE_URL}/labels`, {
    user_id,
    name,
  });

  if (response.status === 201) {
    return response.data.label;
  } else {
    throw new Error('ラベルの追加に失敗しました。');
  }
};

// ラベル削除
export const deleteLabel = async (label_id: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/labels/${label_id}`);

  if (response.status !== 200) {
    throw new Error('ラベルの削除に失敗しました。');
  }
};

// レシピ取得（オプションでラベルフィルタ）
export const fetchRecipes = async (
  user_id: string,
  label_id?: string,
): Promise<Recipe[]> => {
  const params: Record<string, string | undefined> = { user_id };
  if (label_id) {
    params.label_id = label_id;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/recipes`, { params });

    console.log('Fetch Recipes Response:', response.data);

    if (response.status === 200) {
      return response.data.recipes;
    } else {
      throw new Error('Failed to fetch recipes');
    }
  } catch (error) {
    console.error('Error in fetchRecipes:', error);
    throw new Error('レシピの取得に失敗しました');
  }
};

// 割り当て済みのラベルを取得
export const fetchAssignedLabels = async (
  recipeId: string,
): Promise<Label[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/recipes/${recipeId}/labels`,
    );
    console.log('FetchAssignedLabels Response:', response.data);

    // サーバーからのレスポンス型を明示的に定義
    const labels = response.data.labels as {
      label_id: number;
      labels: { name: string };
    }[];

    // 重複を排除するために Set を使用
    const uniqueLabels = Array.from(
      new Map(
        labels.map((label) => [
          label.label_id,
          { id: label.label_id, name: label.labels.name },
        ]),
      ).values(),
    );

    console.log('Unique Labels:', uniqueLabels);
    return uniqueLabels; // 重複を取り除いた結果を返す
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn('ラベルが見つかりませんでした。空配列を返します。');
        return [];
      }
      console.error('割り当て済みラベルの取得エラー:', error.response?.data);
    }
    console.error('不明なエラー:', error);
    return [];
  }
};

// レシピにラベルを割り当てる
export const assignLabelToRecipe = async (
  recipeId: string,
  labelId: string,
): Promise<void> => {
  try {
    console.log('Sending POST request to Heroku:', {
      recipeId,
      labelId,
    });
    const response = await axios.post(
      `${API_BASE_URL}/recipes/${recipeId}/labels`,
      { label_id: labelId },
    );

    if (response.status !== 200) {
      throw new Error(
        `Failed to assign label ${labelId} to recipe ${recipeId}`,
      );
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error in assignLabelToRecipe:', error.response?.data);
    }
    throw error; // エラーを上位で処理
  }
};

// レシピからラベルを削除する
export const removeLabelFromRecipe = async (
  recipeId: string,
  labelId: string,
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/recipes/${recipeId}/labels`, {
    data: { label_id: labelId },
  });
};

// 統合されたデータを取得
export const fetchRecipesWithLabels = async (
  user_id: string,
  label_id?: string,
  limit: number = 20,
  offset: number = 0,
  sortField: string = 'created_at', // 並び替えフィールド
  sortOrder: string = 'desc', // 並び替え順
): Promise<{ labels: Label[]; recipes: Recipe[] }> => {
  const params: Record<string, string | number | undefined> = {
    user_id,
    limit,
    offset,
    sortField, // 新しく追加
    sortOrder, // 新しく追加
  };
  if (label_id) {
    params.label_id = label_id;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/recipesWithLabels`, {
      params,
    });

    if (response.status === 200) {
      const { recipes, labels } = response.data;
      return { recipes: recipes || [], labels: labels || [] };
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error: any) {
    console.error('Error in fetchRecipesWithLabels:', error.message);
    throw new Error('データの取得に失敗しました');
  }
};
