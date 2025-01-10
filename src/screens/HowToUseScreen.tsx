import React from 'react';
import { Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import useDeviceOrientation from '../hooks/useDeviceOrientation';

const HowToUseScreen: React.FC = () => {
  const { isLandscape } = useDeviceOrientation();
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth > 768; // iPad判定

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF8E1',
    },
    contentContainer: {
      padding: isLargeScreen ? (isLandscape ? 60 : 50) : 20,
      alignItems: 'center',
    },
    title: {
      fontSize: isLargeScreen ? 28 : 22,
      fontWeight: 'bold',
      marginBottom: isLargeScreen ? 30 : 20,
      color: '#ff6347',
      textAlign: 'center',
    },
    text: {
      fontSize: isLargeScreen ? 22 : 18,
      lineHeight: isLargeScreen ? 28 : 22,
      marginBottom: isLargeScreen ? 24 : 20,
      color: '#333',
      textAlign: 'justify',
      width: isLargeScreen ? '80%' : '90%',
    },
    image: {
      width: isLargeScreen ? '80%' : '80%',
      height: isLargeScreen ? 600 : 400,
      marginBottom: isLargeScreen ? 40 : 20,
      borderRadius: 8,
      backgroundColor: '#f0f0f0',
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>このアプリの使い方</Text>

      <Text style={styles.text}>
        このアプリは各テンプレートに従って項目を埋めてあなた自身のこだわりレシピを作成するアプリケーションです。
        {'\n\n'}
        こだわりに基づいてAIがこだわり内容を認識してレシピを作成します。
      </Text>

      <Text style={styles.text}>
        気に入ったらレシピを保存して実際に料理を楽しんでもらうというコンセプトです。
        {'\n\n'}
        レシピが増えたら、任意にラベルを追加してカテゴリごとにレシピを整理することもできます。
      </Text>

      <Text style={styles.text}>
        例えば以下のようにレシピが作成されます。（実際は下までスクロールしてもっとレシピ内容が続きます。）
      </Text>

      {/* レシピ例画像 */}
      <Image
        source={require('../assets/images/example-recipe.png')} // 適切な画像パスに置き換え
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        レシピ作成後、保存するには保存ボタンをタップします。
      </Text>
      <Text style={styles.text}>
        別のレシピを見るボタンをタップすると同じこだわり内容で別のレシピが生成されますが、元のレシピは保存されません。
      </Text>

      <Text style={styles.title}>ポイントについて</Text>
      <Text style={styles.text}>
        1レシピの作成に2ポイント消費いたします。初回サインイン時にお試しで10ポイント付与していますので、どうぞお試しください。
      </Text>

      <Text style={styles.text}>
        現在、１５種類のジャンルに及ぶ、レシピ作成用のテンプレートを用意しております。
      </Text>
      <Text style={styles.text}>
        今後、こだわりを選択するテンプレートを拡張していこうと思っておりますので、よろしくお願いいたします。
      </Text>
      <Text style={styles.text}>
        フィードバックもお待ちしております。
      </Text>
      <Text style={styles.title}>レシピのデザインについて</Text>
      <Text style={styles.text}>
        統一のデザインになるようAIを調整していますが、時々レイアウトが微妙に変更されることがあります。ご了承ください。
      </Text>
    </ScrollView>
  );
};

export default HowToUseScreen;
