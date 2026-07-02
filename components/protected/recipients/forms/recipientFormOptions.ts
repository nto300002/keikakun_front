export const GENDER_OPTIONS = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'other', label: 'その他' },
];

export const FORM_OF_RESIDENCE_OPTIONS = [
  { value: 'home_with_family', label: '自宅（家族と同居）' },
  { value: 'home_alone', label: '自宅（一人暮らし）' },
  { value: 'group_home', label: 'グループホーム' },
  { value: 'institution', label: '入所施設' },
  { value: 'hospital', label: '病院・医療機関' },
  { value: 'other', label: 'その他' },
];

export const MEANS_OF_TRANSPORTATION_OPTIONS = [
  { value: 'walk', label: '徒歩' },
  { value: 'bicycle', label: '自転車' },
  { value: 'motorbike', label: 'バイク・原付' },
  { value: 'car_self', label: '自家用車（自分で運転）' },
  { value: 'car_transport', label: '自家用車（送迎）' },
  { value: 'public_transport', label: '公共交通機関（電車・バス）' },
  { value: 'welfare_transport', label: '福祉輸送サービス' },
  { value: 'other', label: 'その他' },
];

export const LIVELIHOOD_PROTECTION_OPTIONS = [
  { value: 'not_receiving', label: 'なし' },
  { value: 'receiving_with_allowance', label: 'あり（他人介護料有り）' },
  { value: 'receiving_without_allowance', label: 'あり（他人介護料無し）' },
  { value: 'applying', label: '申請中' },
  { value: 'planning', label: '申請予定' },
];

export const DISABILITY_CATEGORY_OPTIONS = [
  { value: 'physical_handbook', label: '身体障害者手帳' },
  { value: 'intellectual_handbook', label: '療育手帳' },
  { value: 'mental_health_handbook', label: '精神障害者保健福祉手帳' },
  { value: 'disability_basic_pension', label: '障害基礎年金' },
  { value: 'other_disability_pension', label: 'その他の障害年金' },
  { value: 'public_assistance', label: '生活保護' },
];

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'acquired', label: '取得済み' },
  { value: 'applying', label: '申請中' },
  { value: 'planning', label: '申請予定' },
  { value: 'not_applicable', label: '該当なし' },
];

export const PHYSICAL_DISABILITY_TYPE_OPTIONS = [
  { value: 'visual', label: '視覚障害' },
  { value: 'hearing', label: '聴覚障害' },
  { value: 'limb', label: '肢体不自由' },
  { value: 'internal', label: '内部障害' },
  { value: 'other', label: 'その他' },
];

export const RELATIONSHIP_OPTIONS = [
  '父',
  '母',
  '配偶者',
  '子',
  '兄弟姉妹',
  '相談支援専門員',
  'ケースワーカー',
  '医療機関',
  '友人・知人',
  'その他',
];

export const GRADE_LEVEL_OPTIONS = {
  physical_handbook: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
    { value: '3', label: '3級' },
    { value: '4', label: '4級' },
    { value: '5', label: '5級' },
    { value: '6', label: '6級' },
  ],
  intellectual_handbook: [
    { value: 'A', label: 'A（重度）' },
    { value: 'B1', label: 'B1（中度）' },
    { value: 'B2', label: 'B2（軽度）' },
    { value: 'C', label: 'C（境界域）' },
  ],
  mental_health_handbook: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
    { value: '3', label: '3級' },
  ],
  disability_basic_pension: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
  ],
  other_disability_pension: [
    { value: '1', label: '1級' },
    { value: '2', label: '2級' },
    { value: '3', label: '3級' },
  ],
  public_assistance: [
    { value: '介護扶助', label: '介護扶助' },
    { value: '医療扶助', label: '医療扶助' },
    { value: '生活扶助', label: '生活扶助' },
    { value: 'その他', label: 'その他' },
  ],
};
