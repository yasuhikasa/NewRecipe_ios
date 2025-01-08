import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FusionRecipeFormExtended from '../components/FusionRecipeFormExtended';

const FusionCreateScreen: React.FC = () => {
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      enableOnAndroid={true} // Android対応
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0} // iOS用スクロール余白
    >
      <FusionRecipeFormExtended />
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

export default FusionCreateScreen;
