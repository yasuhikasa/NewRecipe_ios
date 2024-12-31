// src/utils/options.ts

export interface Option {
  label: string;
  value: string;
}

// 料理時間
export const cookingTimeOptions: Option[] = [
  { label: '10分以内', value: '10分以内' },
  { label: '20分以内', value: '20分以内' },
  { label: '30分以内', value: '30分以内' },
  { label: '40分以内', value: '40分以内' },
  { label: '50分以内', value: '50分以内' },
  { label: '1時間以内', value: '1時間以内' },
  { label: '1時間以上', value: '1時間以上' },
];

// 手間
export const effortOptions: Option[] = [
  { label: '簡単な料理', value: '簡単な料理' },
  { label: '本格的な料理', value: '本格的な料理' },
  { label: '時短料理', value: '時短料理' },
  { label: '丁寧な作り方', value: '丁寧な作り方' },
  { label: '片付けが簡単', value: '片付けが簡単' },
  { label: '初心者向け', value: '初心者向け' },
  { label: '豪華な見た目', value: '豪華な見た目' },
];

// 予算
export const budgetOptions: Option[] = [
  { label: '決めていない', value: '決めていない' },
  { label: '300円以下', value: '300円以下' },
  { label: '500円以下', value: '500円以下' },
  { label: '1000円以下', value: '1000円以下' },
  { label: '2000円以下', value: '2000円以下' },
  { label: '3000円以下', value: '3000円以下' },
  { label: '4000円以下', value: '4000円以下' },
  { label: '5000円以下', value: '5000円以下' },
  { label: '6000円以下', value: '6000円以下' },
  { label: '7000円以下', value: '7000円以下' },
  { label: '8000円以下', value: '8000円以下' },
  { label: '9000円以下', value: '9000円以下' },
  { label: '10000円以下', value: '10000円以下' },
];

// 気分
export const moodOptions: Option[] = [
  { label: 'さっぱり系がいい', value: 'さっぱり系がいい' },
  { label: 'ガッツリ食べたい', value: 'ガッツリ食べたい' },
  { label: '疲れた', value: '疲れた' },
  { label: '寝起き', value: '寝起き' },
  { label: 'ヘルシー志向', value: 'ヘルシー志向' },
  { label: 'スタミナ重視', value: 'スタミナ重視' },
  { label: '甘いものが欲しい', value: '甘いものが欲しい' },
  { label: 'ピリ辛が食べたい', value: 'ピリ辛が食べたい' },
  { label: '心を落ち着けたい', value: '心を落ち着けたい' },
  { label: 'スープが飲みたい', value: 'スープが飲みたい' },
  { label: '野菜をたっぷり取りたい', value: '野菜をたっぷり取りたい' },
  { label: 'エネルギー補給したい', value: 'エネルギー補給したい' },
  { label: '手軽に食べたい', value: '手軽に食べたい' },
  { label: 'リラックスしたい', value: 'リラックスしたい' },
  { label: '罪悪感なく食べたい', value: '罪悪感なく食べたい' },
  { label: 'ホットな料理が欲しい', value: 'ホットな料理が欲しい' },
  { label: '冷たいものが欲しい', value: '冷たいものが欲しい' },
  { label: '塩味が食べたい', value: '塩味が食べたい' },
  { label: '炭水化物を取りたい', value: '炭水化物を取りたい' },
  { label: 'プロテイン補給したい', value: 'プロテイン補給したい' },
];

// 食べる時間帯
export const mealTimeOptions: Option[] = [
  { label: '朝食', value: '朝食' },
  { label: '昼食', value: '昼食' },
  { label: '夕食', value: '夕食' },
  { label: '夜食', value: '夜食' },
];

// 人数
export const peopleOptions: Option[] = [
  { label: '1人分', value: '1人分' },
  { label: '2人分', value: '2人分' },
  { label: '3〜4人分', value: '3〜4人分' },
  { label: '5人以上', value: '5人以上' },
];

// 趣向
export const preferenceOptions: Option[] = [
  { label: '野菜多め', value: '野菜多め' },
  { label: 'お肉多め', value: 'お肉多め' },
  { label: '魚料理中心', value: '魚料理中心' },
  { label: '炭水化物メイン', value: '炭水化物メイン' },
  { label: 'おまかせ', value: 'おまかせ' },
];
