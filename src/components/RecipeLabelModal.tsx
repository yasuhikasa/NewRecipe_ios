import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  getUser,
  fetchLabels,
  fetchAssignedLabels,
  assignLabelToRecipe,
  removeLabelFromRecipe,
} from '../utils/api';
import axios from 'axios';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

type Label = { id: number; name: string };

type RecipeLabelModalProps = {
  visible: boolean;
  recipeId: string;
  onClose: () => void;
  onSaved: () => void;
};

const RecipeLabelModal: React.FC<RecipeLabelModalProps> = ({
  visible,
  recipeId,
  onClose,
  onSaved,
}) => {
  const [recipeName, setRecipeName] = useState<string>('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [assignedLabels, setAssignedLabels] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const { isLargeScreen } = useDeviceOrientation();

  // レシピとラベルのデータ取得
  const fetchLabelsForRecipe = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUser();
      const availableLabels = await fetchLabels(user.id);
      const assignedLabelsResponse = await fetchAssignedLabels(recipeId);

      setLabels(availableLabels);
      setAssignedLabels(assignedLabelsResponse.map((label) => label.id));

      const recipeResponse = await axios.get(
        `https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`,
      );
      setRecipeName(recipeResponse.data.recipe.title);
    } catch (error: any) {
      console.error('Error fetching labels:', error.message);
      Alert.alert('エラー', 'データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    if (visible) {
      fetchLabelsForRecipe();
    }
  }, [visible, fetchLabelsForRecipe]);

  // ラベルの保存処理
  const handleSave = async () => {
    setSaving(true);
    try {
      // レシピ名の更新
      if (recipeName.trim()) {
        await axios.patch(
          `https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`,
          {
            title: recipeName.trim(),
          },
        );
      }

      // 最新の割り当て済みラベルを取得
      const assignedLabelsResponse = await fetchAssignedLabels(recipeId);

      // レスポンス構造の確認と安全なデータ取得
      if (!Array.isArray(assignedLabelsResponse)) {
        throw new Error('Invalid response format from fetchAssignedLabels');
      }

      const currentAssignedLabelsSet = new Set(
        assignedLabelsResponse
          .filter((label) => label && typeof label.id === 'number') // 安全なフィルタリング
          .map((label) => label.id),
      );

      console.log(
        'Current assigned labels:',
        Array.from(currentAssignedLabelsSet),
      );

      // ラベルの追加・削除
      const promises: Promise<void>[] = [];
      labels.forEach((label) => {
        const isSelected = assignedLabels.includes(label.id);
        const alreadyAssigned = currentAssignedLabelsSet.has(label.id);

        if (isSelected && !alreadyAssigned) {
          console.log('Assigning label:', label.name);
          promises.push(assignLabelToRecipe(recipeId, String(label.id)));
          currentAssignedLabelsSet.add(label.id); // 即時反映
        } else if (!isSelected && alreadyAssigned) {
          console.log('Removing label:', label.name);
          promises.push(removeLabelFromRecipe(recipeId, String(label.id)));
          currentAssignedLabelsSet.delete(label.id); // 即時反映
        }
      });

      await Promise.all(promises); // 非同期処理の完了を待機

      Alert.alert('成功', 'レシピが更新されました。');
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving recipe details:', error.message);
      Alert.alert('エラー', '保存中にエラーが発生しました。');
    } finally {
      setSaving(false);
    }
  };

  // モーダルを閉じる処理
  const handleClose = () => {
    onClose();
  };

  if (!visible) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: isLargeScreen ? 40 : 20,
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: isLargeScreen ? 24 : 16,
      width: isLargeScreen ? '80%' : '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: isLargeScreen ? 24 : 20,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 20 : 16,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: isLargeScreen ? 14 : 10,
      marginBottom: isLargeScreen ? 20 : 16,
      fontSize: isLargeScreen ? 18 : 16,
    },
    labelItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isLargeScreen ? 14 : 10,
    },
    labelName: {
      fontSize: isLargeScreen ? 18 : 16,
      color: '#333',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isLargeScreen ? 20 : 12,
    },
    saveButton: {
      backgroundColor: '#4CAF50',
      padding: isLargeScreen ? 16 : 12,
      borderRadius: 8,
      flex: 1,
      marginRight: 8,
    },
    cancelButton: {
      backgroundColor: '#f44336',
      padding: isLargeScreen ? 16 : 12,
      borderRadius: 8,
      flex: 1,
      marginLeft: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: isLargeScreen ? 18 : 16,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ff6347" />
          ) : (
            <>
              <Text style={styles.modalTitle}>レシピを編集</Text>
              <TextInput
                style={styles.input}
                value={recipeName}
                onChangeText={setRecipeName}
                placeholder="レシピ名を入力"
                maxLength={30}
              />
              <ScrollView>
                {labels.map((label) => {
                  const isSelected = assignedLabels.includes(label.id); // 割り当て済みかどうかチェック

                  return (
                    <View key={label.id} style={[styles.labelItem]}>
                      <Text style={[styles.labelName]}>{label.name}</Text>
                      <Switch
                        value={isSelected} // 割り当て済みかどうかをチェック
                        onValueChange={(value) =>
                          setAssignedLabels(
                            (prev) =>
                              value
                                ? [...prev, label.id] // 選択したら追加
                                : prev.filter((id) => id !== label.id), // 選択解除したら削除
                          )
                        }
                      />
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? '保存中...' : '保存'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.buttonText}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default RecipeLabelModal;
