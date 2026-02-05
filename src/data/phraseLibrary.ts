/**
 * 离线短语库数据
 *
 * 包含 50+ 句旅行常用语，覆盖 6 大场景：
 * - 餐厅 (15 句)
 * - 购物 (12 句)
 * - 交通 (10 句)
 * - 紧急 (8 句)
 * - 住宿 (10 句)
 * - 问候 (10 句)
 */

import type { Phrase, PhraseCategory, CategoryMetadata } from '@/types/translation';

/**
 * 短语分类元数据
 */
export const PHRASE_CATEGORIES: Record<PhraseCategory, CategoryMetadata> = {
  restaurant: {
    icon: '🍜',
    name: '餐厅',
    count: 15,
  },
  shopping: {
    icon: '🛍️',
    name: '购物',
    count: 12,
  },
  transportation: {
    icon: '🚇',
    name: '交通',
    count: 10,
  },
  emergency: {
    icon: '🆘',
    name: '紧急',
    count: 8,
  },
  accommodation: {
    icon: '🏨',
    name: '住宿',
    count: 10,
  },
  greeting: {
    icon: '👋',
    name: '问候',
    count: 10,
  },
} as const;

/**
 * 餐厅短语 (15 句)
 */
const RESTAURANT_PHRASES: Phrase[] = [
  {
    id: 'restaurant_01',
    zh: '请问这个多少钱？',
    ko: '이거 얼마예요?',
    romanization: 'Igeo eolmayeyo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_02',
    zh: '我要点这个',
    ko: '이걸로 주문할게요',
    romanization: 'Igeollo jumunhalgeyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_03',
    zh: '太辣了',
    ko: '너무 매워요',
    romanization: 'Neomu maewoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_04',
    zh: '有素食吗？',
    ko: '채식 있나요?',
    romanization: 'Chaesik innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_05',
    zh: '请给我菜单',
    ko: '메뉴 주세요',
    romanization: 'Menyu juseyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_06',
    zh: '水，谢谢',
    ko: '물 주세요',
    romanization: 'Mul juseyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_07',
    zh: '结账',
    ko: '계산해 주세요',
    romanization: 'Gyesanhae juseyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_08',
    zh: '好吃！',
    ko: '맛있어요!',
    romanization: 'Masisseoyo!',
    category: 'restaurant',
  },
  {
    id: 'restaurant_09',
    zh: '有推荐吗？',
    ko: '추천해 주세요',
    romanization: 'Chucheonhae juseyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_10',
    zh: '还要点别的吗？',
    ko: '더 주문하시겠어요?',
    romanization: 'Deo jumunhasigesseoyo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_11',
    zh: '这里有人坐吗？',
    ko: '여기 앉아도 되요?',
    romanization: 'Yeogi anjado doeyo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_12',
    zh: '我预订了位置',
    ko: '예약했어요',
    romanization: 'Yeyakhaesseoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_13',
    zh: '可以打包吗？',
    ko: '포장해 주세요',
    romanization: 'Pojanghae juseyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_14',
    zh: '我不吃...',
    ko: '안 먹는 게 있어요',
    romanization: 'An meonneun ge isseoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_15',
    zh: '太咸了',
    ko: '너무 짜요',
    romanization: 'Neumo jayoyo',
    category: 'restaurant',
  },
];

/**
 * 购物短语 (12 句)
 */
const SHOPPING_PHRASES: Phrase[] = [
  {
    id: 'shopping_01',
    zh: '可以试穿吗？',
    ko: '입어봐도 되요?',
    romanization: 'Ibeobwado doeyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_02',
    zh: '有折扣吗？',
    ko: '할인되나요?',
    romanization: 'Halindoeyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_03',
    zh: '我要买这个',
    ko: '이거 살게요',
    romanization: 'Igeo salgeyo',
    category: 'shopping',
  },
  {
    id: 'shopping_04',
    zh: '这个颜色有别的吗？',
    ko: '다른 색상 있나요?',
    romanization: 'Dareun saeksaeng innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_05',
    zh: '有更大的吗？',
    ko: '더 큰 사이즈 있나요?',
    romanization: 'Deo keun saijeu innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_06',
    zh: '可以刷卡吗？',
    ko: '카드 돼나요?',
    romanization: 'Kadeu dwaenayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_07',
    zh: '能退款吗？',
    ko: '환불돼나요?',
    romanization: 'Hwanbuldwaaenayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_08',
    zh: '有发票吗？',
    ko: '영수증 있나요?',
    romanization: 'Yeongsujeung innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_09',
    zh: '多少钱？',
    ko: '얼마예요?',
    romanization: 'Eolmayeyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_10',
    zh: '太贵了',
    ko: '너무 비싸요',
    romanization: 'Neomu bissayo',
    category: 'shopping',
  },
  {
    id: 'shopping_11',
    zh: '可以便宜点吗？',
    ko: '깎아 주세요',
    romanization: 'Ggaka juseyo',
    category: 'shopping',
  },
  {
    id: 'shopping_12',
    zh: '我要看看别的',
    ko: '다른 거 볼게요',
    romanization: 'Dareun geo bolgeyo',
    category: 'shopping',
  },
];

/**
 * 交通短语 (10 句)
 */
const TRANSPORTATION_PHRASES: Phrase[] = [
  {
    id: 'transportation_01',
    zh: '请问地铁站在哪？',
    ko: '지하철역 어디예요?',
    romanization: 'Jihacheoryeog eidiyeyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_02',
    zh: '我要去...',
    ko: '...에 가고 싶어요',
    romanization: '...e gago sipeoyo',
    category: 'transportation',
  },
  {
    id: 'transportation_03',
    zh: '这是几号线？',
    ko: '이거 몇 호선이에요?',
    romanization: 'Igeo myeot hoseonieyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_04',
    zh: '到...需要多久？',
    ko: '...까지 얼마나 걸려요?',
    romanization: '...kkaji eolmana geollyeoyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_05',
    zh: '在哪换乘？',
    ko: '어디서 환승해요?',
    romanization: 'Eodiseo hwanseunghaeyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_06',
    zh: '这是往...方向的车吗？',
    ko: '이거 ...행이에요?',
    romanization: 'Igeo ...haengieyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_07',
    zh: '请停车',
    ko: '세워 주세요',
    romanization: 'Sewo juseyo',
    category: 'transportation',
  },
  {
    id: 'transportation_08',
    zh: '下一站是哪里？',
    ko: '다음 역이 어디예요?',
    romanization: 'Daeum yeogi eodiyeyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_09',
    zh: '去机场怎么走？',
    ko: '공항怎么 가요?',
    romanization: 'Gonghang-eotteon gayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_10',
    zh: '有地图吗？',
    ko: '지도 있나요?',
    romanization: 'Jido innayo?',
    category: 'transportation',
  },
];

/**
 * 紧急短语 (8 句)
 */
const EMERGENCY_PHRASES: Phrase[] = [
  {
    id: 'emergency_01',
    zh: '救命！',
    ko: '살려주세요!',
    romanization: 'Sallyeojuseyo!',
    category: 'emergency',
  },
  {
    id: 'emergency_02',
    zh: '请叫警察',
    ko: '경찰 불러주세요',
    romanization: 'Gyeongchal bulleojuseyo',
    category: 'emergency',
  },
  {
    id: 'emergency_03',
    zh: '我迷路了',
    ko: '길을 잃었어요',
    romanization: 'Gireul ireosseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_04',
    zh: '我丢钱包了',
    ko: '지갑 잃어버렸어요',
    romanization: 'Jigap ireobeoryeosseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_05',
    zh: '去医院',
    ko: '병원에 가주세요',
    romanization: 'Byeongwone gajuseyo',
    category: 'emergency',
  },
  {
    id: 'emergency_06',
    zh: '我受伤了',
    ko: '다쳤어요',
    romanization: 'Dachyeosseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_07',
    zh: '请帮我',
    ko: '도와주세요',
    romanization: 'Dowajuseyo',
    category: 'emergency',
  },
  {
    id: 'emergency_08',
    zh: '可以说中文吗？',
    ko: '중국어 할 수 있나요?',
    romanization: 'Junguggeo hal su innayo?',
    category: 'emergency',
  },
];

/**
 * 住宿短语 (10 句)
 */
const ACCOMMODATION_PHRASES: Phrase[] = [
  {
    id: 'accommodation_01',
    zh: '我预订了房间',
    ko: '예약했어요',
    romanization: 'Yeyakhaesseoyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_02',
    zh: '几点早餐？',
    ko: '아침 식사 몇 시예요?',
    romanization: 'Achim sigsa myeot siyeyo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_03',
    zh: '有WiFi吗？',
    ko: '와이파이 있나요?',
    romanization: 'Waipai innayo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_04',
    zh: '几点退房？',
    ko: '체크아웃 몇 시예요?',
    romanization: 'Chekeuauteu myeot siyeyo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_05',
    zh: '可以延迟退房吗？',
    ko: '늦게 체크아웃할 수 있나요?',
    romanization: 'Eutge chekeuauteul su innayo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_06',
    zh: '有毛巾吗？',
    ko: '수건 있나요?',
    romanization: 'Sugeon innayo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_07',
    zh: '空调坏了',
    ko: '에어컨 고장 났어요',
    romanization: 'Eokeo gojang nasseoyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_08',
    zh: '房间很吵',
    ko: '방이 시끄러워요',
    romanization: 'Bangi sikkeureowoyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_09',
    zh: '能换房间吗？',
    ko: '방 바꿀 수 있나요?',
    romanization: 'Bang bakkwal su innayo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_10',
    zh: '有洗衣服务吗？',
    ko: '세탁 서비스 있나요?',
    romanization: 'Setak seobiseu innayo?',
    category: 'accommodation',
  },
];

/**
 * 问候短语 (10 句)
 */
const GREETING_PHRASES: Phrase[] = [
  {
    id: 'greeting_01',
    zh: '你好',
    ko: '안녕하세요',
    romanization: 'Annyeonghaseyo',
    category: 'greeting',
  },
  {
    id: 'greeting_02',
    zh: '谢谢',
    ko: '감사합니다',
    romanization: 'Gamsahamnida',
    category: 'greeting',
  },
  {
    id: 'greeting_03',
    zh: '对不起',
    ko: '죄송합니다',
    romanization: 'Joesonghamnida',
    category: 'greeting',
  },
  {
    id: 'greeting_04',
    zh: '没关系',
    ko: '괜찮아요',
    romanization: 'Gwaenchanaeyo',
    category: 'greeting',
  },
  {
    id: 'greeting_05',
    zh: '再见',
    ko: '안녕히 가세요',
    romanization: 'Annyeonghi gaseyo',
    category: 'greeting',
  },
  {
    id: 'greeting_06',
    zh: '请问',
    ko: '저기요',
    romanization: 'Jeogiyo',
    category: 'greeting',
  },
  {
    id: 'greeting_07',
    zh: '可以吗？',
    ko: '돼나요?',
    romanization: 'Dwaenayo?',
    category: 'greeting',
  },
  {
    id: 'greeting_08',
    zh: '当然',
    ko: '물론이에요',
    romanization: 'Mullonieyo',
    category: 'greeting',
  },
  {
    id: 'greeting_09',
    zh: '真的吗？',
    ko: '정말이에요?',
    romanization: 'Jeongmalieyo?',
    category: 'greeting',
  },
  {
    id: 'greeting_10',
    zh: '不太明白',
    ko: '잘 모르겠어요',
    romanization: 'Jal moreugesseoyo',
    category: 'greeting',
  },
];

/**
 * 完整短语库（所有分类合并）
 */
export const ALL_PHRASES: Phrase[] = [
  ...RESTAURANT_PHRASES,
  ...SHOPPING_PHRASES,
  ...TRANSPORTATION_PHRASES,
  ...EMERGENCY_PHRASES,
  ...ACCOMMODATION_PHRASES,
  ...GREETING_PHRASES,
];

/**
 * 按分类分组的短语库
 */
export const PHRASES_BY_CATEGORY: Record<PhraseCategory, Phrase[]> = {
  restaurant: RESTAURANT_PHRASES,
  shopping: SHOPPING_PHRASES,
  transportation: TRANSPORTATION_PHRASES,
  emergency: EMERGENCY_PHRASES,
  accommodation: ACCOMMODATION_PHRASES,
  greeting: GREETING_PHRASES,
} as const;

/**
 * 短语库统计信息
 */
export const PHRASE_LIBRARY_STATS = {
  total: ALL_PHRASES.length,
  categories: Object.keys(PHRASE_CATEGORIES).length,
  breakdown: {
    restaurant: RESTAURANT_PHRASES.length,
    shopping: SHOPPING_PHRASES.length,
    transportation: TRANSPORTATION_PHRASES.length,
    emergency: EMERGENCY_PHRASES.length,
    accommodation: ACCOMMODATION_PHRASES.length,
    greeting: GREETING_PHRASES.length,
  },
} as const;
