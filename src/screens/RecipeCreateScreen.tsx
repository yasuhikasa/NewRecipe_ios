// src/screens/RecipeCreateScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import RecipeFormExtended from '../components/RecipeFormExtended';

const RecipeCreateScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <RecipeFormExtended />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
});

export default RecipeCreateScreen;
