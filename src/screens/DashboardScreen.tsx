import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types'; // RootStackParamList をインポート

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Dashboard!</Text>
      
      {/* レシピ作成画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RecipeCreate')} // 他のスクリーンに遷移
      >
        <Text style={styles.buttonText}>レシピ作成へ</Text>
      </TouchableOpacity>
      
      {/* レシピ一覧画面への遷移ボタン */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RecipeList')} // レシピ一覧画面に遷移
      >
        <Text style={styles.buttonText}>レシピ一覧へ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DashboardScreen;
