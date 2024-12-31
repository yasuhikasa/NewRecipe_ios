export type RootStackParamList = {
  Login: undefined;
  Subscription: undefined;
  AboutApp: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  CommercialTransaction: undefined;
  AppOperator: undefined;
  LoginHelp: undefined;
  Contact: undefined;
  Dashboard: undefined;
  RecipeCreate: undefined;
  KidsCreate: undefined;
  DietCreate: undefined;
  LunchboxCreate: undefined;
  BeautyCreate: undefined;
  SnsCreate: undefined;
  SweetCreate: undefined;
  SpicyCreate: undefined;
  TraditionalJapaneseCreate: undefined;
  WesternDishCreate: undefined;
  BistroCreate: undefined;
  CocktailCreate: undefined;
  SpecialDayCreate: undefined;
  RecipeList: undefined;
  LabelManagement: undefined;
  Purchase: undefined;
  HowToUse: undefined;
};

export type Recipe = {
  id: string;
  title: string;
  recipe: string; // Markdown content
  labels: Label[];
  form_data: any; // 必要に応じて型を調整
  created_at: string;
  updated_at: string;
};

export type Label = {
  id: number;
  name: string;
};
