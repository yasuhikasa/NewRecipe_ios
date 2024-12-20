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
import { getUser, fetchLabels, fetchAssignedLabels, assignLabelToRecipe, removeLabelFromRecipe } from '../utils/api';
import axios from 'axios';

type Label = { id: string; name: string };

type RecipeLabelModalProps = {
  visible: boolean;
  recipeId: string;
  onClose: () => void;
  onSaved: () => void;
};

const RecipeLabelModal: React.FC<RecipeLabelModalProps> = ({ visible, recipeId, onClose, onSaved }) => {
  const [recipeName, setRecipeName] = useState<string>('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [assignedLabels, setAssignedLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchLabelsForRecipe = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUser(); // ユーザー情報を取得
      const availableLabels = await fetchLabels(user.id); // 利用可能なラベルを取得
      const assignedLabelsResponse = await fetchAssignedLabels(recipeId); // 割り当て済みラベルを取得
      console.log('Assigned Labels Response:', assignedLabelsResponse);

      setLabels(availableLabels);
  
      // 割り当て済みラベルのIDをセット
      const assignedLabels = [...new Set(assignedLabelsResponse.map((label) => String(label.label_id)))];
    console.log('Mapped Assigned Labels:', assignedLabels);
      setAssignedLabels(assignedLabels);
      

  
      // レシピ名を取得
      const recipeResponse = await axios.get(`https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`);
      setRecipeName(recipeResponse.data.recipe.title);
    } catch (error: any) {
      console.error('Error fetching labels:', error.message);
      Alert.alert('エラー', 'ラベルの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [recipeId]);
  

  useEffect(() => {
    if (visible) {
      fetchLabelsForRecipe();
    }
  }, [visible, fetchLabelsForRecipe]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // レシピ名の更新
      if (recipeName.trim()) {
        const response = await axios.patch(
          `https://recipeapp-096ac71f3c9b.herokuapp.com/api/recipes/${recipeId}`,
          { title: recipeName.trim() }
        );
  
        if (response.status !== 200) {
          throw new Error('Failed to update recipe title');
        }
      }
  
      // ラベルの割り当て・削除
      for (const label of labels) {
        const isSelected = assignedLabels.includes(String(label.id));
        const alreadyAssigned = assignedLabels.includes(String(label.id)); // 既に割り当て済みかチェック
        
        console.log('Processing label:', { labelId: label.id, isSelected, alreadyAssigned });
      
        if (isSelected && !alreadyAssigned) { // まだ割り当てられていない場合のみ追加
          await assignLabelToRecipe(recipeId, label.id);
        } else if (!isSelected && alreadyAssigned) { // 割り当て済みなら削除
          await removeLabelFromRecipe(recipeId, label.id);
        }
      }
      
  
      Alert.alert('成功', 'レシピが更新されました。');
      onSaved(); // 親コンポーネントのリロード処理を呼び出し
      onClose(); // モーダルを閉じる
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error saving recipe details:', error.message);
        Alert.alert('エラー', 'レシピの保存中にエラーが発生しました。');
      }
    } finally {
      setSaving(false);
    }
  };
  

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
              />
              <ScrollView>
                {labels.map((label) => (
                  <View key={label.id} style={styles.labelItem}>
                    <Text style={styles.labelName}>{label.name}</Text>
                    <Switch
                    value={assignedLabels.includes(String(label.id))} // 割り当て済みかどうかをチェック
                    onValueChange={(value) =>
                      setAssignedLabels((prev) =>
                        value
                          ? [...prev, String(label.id)] // 文字列型で追加
                          : prev.filter((id) => id !== String(label.id)) // 文字列型で削除
                      )
                    }
                  />


                  </View>
                ))}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  <Text style={styles.buttonText}>{saving ? '保存中...' : '保存'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
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


const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 },
  labelItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labelName: { fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  saveButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, flex: 1, marginRight: 8 },
  cancelButton: { backgroundColor: '#f44336', padding: 12, borderRadius: 8, flex: 1, marginLeft: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default RecipeLabelModal;
