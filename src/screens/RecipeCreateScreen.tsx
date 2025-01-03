import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RecipeFormExtended from '../components/RecipeFormExtended';

const RecipeCreateScreen: React.FC = () => {
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      enableOnAndroid={true} // Androidで動作するように設定
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0} // iOS用の追加スクロール高さ
    >
      <RecipeFormExtended />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  content: {
    flexGrow: 1,
  },
});

export default RecipeCreateScreen;
