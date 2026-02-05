/**
 * 离线短语库数据
 *
 * 包含 200+ 句旅行常用语，覆盖 6 大场景：
 * - 餐厅 (35 句)
 * - 购物 (30 句)
 * - 交通 (30 句)
 * - 紧急 (25 句)
 * - 住宿 (30 句)
 * - 问候 (25 句)
 */

import type { Phrase, PhraseCategory, CategoryMetadata } from '@/types/translation';

/**
 * 短语分类元数据
 */
export const PHRASE_CATEGORIES: Record<PhraseCategory, CategoryMetadata> = {
  restaurant: {
    icon: '🍜',
    name: '餐厅',
    count: 35,
  },
  shopping: {
    icon: '🛍️',
    name: '购物',
    count: 30,
  },
  transportation: {
    icon: '🚇',
    name: '交通',
    count: 30,
  },
  emergency: {
    icon: '🆘',
    name: '紧急',
    count: 25,
  },
  accommodation: {
    icon: '🏨',
    name: '住宿',
    count: 30,
  },
  greeting: {
    icon: '👋',
    name: '问候',
    count: 25,
  },
} as const;

/**
 * 餐厅短语 (35 句)
 * 包含：预订、点餐、特殊要求、结账、投诉等场景
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
  // ==================== 新增短语 ====================
  // 预订相关
  {
    id: 'restaurant_16',
    zh: '我想预订今晚7点的位置',
    ko: '오늘 저녁 7시에 예약하고 싶어요',
    romanization: 'Oneul jeonyeok 7sie yeyakago sipeoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_17',
    zh: '有2个人的位置吗？',
    ko: '2명 자리 있나요?',
    romanization: '2myeong jari innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_18',
    zh: '可以订靠窗的位置吗？',
    ko: '창가 자리로 예약할 수 있나요?',
    romanization: 'Changga jariro yeyakhal su innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_19',
    zh: '请问电话号码是多少？',
    ko: '전화번호 알려주세요',
    romanization: 'Jeonhwabeo alryeojuseyo',
    category: 'restaurant',
  },
  // 点餐细节
  {
    id: 'restaurant_20',
    zh: '可以不要太辣吗？',
    ko: '안 매운 걸로 해주세요',
    romanization: 'An maeun geollo haejuseyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_21',
    zh: '这是热的还是冰的？',
    ko: '이거 뜨거운 거예요? 차가운 거예요?',
    romanization: 'Igeo tteugeoun geoyeo? Chagaun geoyeo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_22',
    zh: '可以加饭吗？',
    ko: '밥 더 주실 수 있나요?',
    romanization: 'Bap deo jusil su innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_23',
    zh: '这个份量大吗？',
    ko: '양 많나요?',
    romanization: 'Yang manna yo?',
    category: 'restaurant',
  },
  // 特殊饮食要求
  {
    id: 'restaurant_24',
    zh: '我对海鲜过敏',
    ko: '해산물 알레르기 있어요',
    romanization: 'Haesanmul allereugi isseoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_25',
    zh: '有清真食品吗？',
    ko: '할랄 음식 있나요?',
    romanization: 'Hallal eumsik innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_26',
    zh: '我不吃牛肉',
    ko: '소고기 안 먹어요',
    romanization: 'Sogogi an meogeoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_27',
    zh: '可以不放蒜吗？',
    ko: '마늘 빼주세요',
    romanization: 'Manul ppaejuseyo',
    category: 'restaurant',
  },
  // 结账方式
  {
    id: 'restaurant_28',
    zh: '可以分开付吗？',
    ko: '따로 계산할 수 있나요?',
    romanization: 'Ttaro gyesanhal su innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_29',
    zh: '这里可以刷卡吗？',
    ko: '카드 돼요?',
    romanization: 'Kadeu dwaeyo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_30',
    zh: '含税吗？',
    ko: '세금 포함돼어 있나요?',
    romanization: 'Segeom pohamdoeo innayo?',
    category: 'restaurant',
  },
  {
    id: 'restaurant_31',
    zh: '要给小费吗？',
    ko: '팁 주어야 하나요?',
    romanization: 'Tip jueoya hanayo?',
    category: 'restaurant',
  },
  // 投诉和表扬
  {
    id: 'restaurant_32',
    zh: '这个菜太咸了',
    ko: '반찬 너무 짜요',
    romanization: 'Banchan neomu jayo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_33',
    zh: '等太久了',
    ko: '너무 오래 기다렸어요',
    romanization: 'Neomu orae gidaryeosseoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_34',
    zh: '菜里面有头发',
    ko: '음식에 머리카락이 들어있어요',
    romanization: 'Eumsige meorikaraki deureoissoyo',
    category: 'restaurant',
  },
  {
    id: 'restaurant_35',
    zh: '服务真好',
    ko: '서비스 좋아요',
    romanization: 'Seobisu joayo',
    category: 'restaurant',
  },
];

/**
 * 购物短语 (30 句)
 * 包含：询问商品、讲价折扣、退换货、配送包装、会员等场景
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
  // ==================== 新增短语 ====================
  // 询问商品信息
  {
    id: 'shopping_13',
    zh: '这是真品吗？',
    ko: '이거 정품이에요?',
    romanization: 'Igeo jeongpumieyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_14',
    zh: '这是什么材质的？',
    ko: '이게 어떤 재질이에요?',
    romanization: 'Ige eotteon jaejirieyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_15',
    zh: '可以洗吗？',
    ko: '세탁돼나요?',
    romanization: 'Setakdwaenayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_16',
    zh: '有保修吗？',
    ko: '보증 있나요?',
    romanization: 'Bojeung innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_17',
    zh: '什么时候到期？',
    ko: '언제까지예요?',
    romanization: 'Eonjekkajeyeyo?',
    category: 'shopping',
  },
  // 讲价和折扣
  {
    id: 'shopping_18',
    zh: '可以给个折扣吗？',
    ko: '더 깎아 주실 수 있나요?',
    romanization: 'Deo ggaka jusil su innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_19',
    zh: '这是最低价吗？',
    ko: '이게 제일 싼 거예요?',
    romanization: 'Ige jeil ssan geoyeo?',
    category: 'shopping',
  },
  {
    id: 'shopping_20',
    zh: '还有其他优惠吗？',
    ko: '다른 혜택 없나요?',
    romanization: 'Dareun hyeotaek eomnayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_21',
    zh: '买两个有折扣吗？',
    ko: '2개 사면 할인돼요?',
    romanization: '2gae samyeon halindwaeyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_22',
    zh: '可以用优惠券吗？',
    ko: '쿠폰 쓸 수 있나요?',
    romanization: 'Kupon ssul su innayo?',
    category: 'shopping',
  },
  // 退换货
  {
    id: 'shopping_23',
    zh: '可以换货吗？',
    ko: '교환할 수 있나요?',
    romanization: 'Gyohwanhal su innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_24',
    zh: '退换货期限是几天？',
    ko: '교환 기간 며칠이에요?',
    romanization: 'Gyohwan gigan myeochilieyo?',
    category: 'shopping',
  },
  {
    id: 'shopping_25',
    zh: '我想退货',
    ko: '반품하고 싶어요',
    romanization: 'Banpumago sipeoyo',
    category: 'shopping',
  },
  {
    id: 'shopping_26',
    zh: '可以换成别的颜色吗？',
    ko: '다른 색으로 바꿀 수 있나요?',
    romanization: 'Dareun saegeuro bakkwal su innayo?',
    category: 'shopping',
  },
  // 配送和包装
  {
    id: 'shopping_27',
    zh: '可以送货吗？',
    ko: '배송해 주실 수 있나요?',
    romanization: 'Baesonghae jusil su innayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_28',
    zh: '需要额外费用吗？',
    ko: '추가 비용 드나요?',
    romanization: 'Chuga biyong deunayo?',
    category: 'shopping',
  },
  {
    id: 'shopping_29',
    zh: '可以送礼物包装吗？',
    ko: '선물 포장해 주세요',
    romanization: 'Seonmul pojanghae juseyo',
    category: 'shopping',
  },
  // 会员和积分
  {
    id: 'shopping_30',
    zh: '有会员卡吗？',
    ko: '회원카드 있나요?',
    romanization: 'Hoewonkadeu innayo?',
    category: 'shopping',
  },
];

/**
 * 交通短语 (30 句)
 * 包含：问路导航、买票充值、交通方式、换乘转车、交通卡等场景
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
  // ==================== 新增短语 ====================
  // 问路和导航
  {
    id: 'transportation_11',
    zh: '请问去...怎么走？',
    ko: '...怎么 가는지 알려주세요',
    romanization: '...eotteon ganeunji alryeojuseyo',
    category: 'transportation',
  },
  {
    id: 'transportation_12',
    zh: '这里在地图上的哪里？',
    ko: '지도상에서 어디예요?',
    romanization: 'Jidosangeseo eodiyeyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_13',
    zh: '我迷路了',
    ko: '길 잃었어요',
    romanization: 'Gil ireosseoyo',
    category: 'transportation',
  },
  {
    id: 'transportation_14',
    zh: '这附近有...吗？',
    ko: '이 근처에 ... 있나요?',
    romanization: 'I geuncheoe ... innayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_15',
    zh: '往左还是往右？',
    ko: '왼쪽이에요? 오른쪽이에요?',
    romanization: 'Wenjog ieyo? Oreunjog ieyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_16',
    zh: '需要走多久？',
    ko: '걸어서 얼마나 걸려요?',
    romanization: 'Georeseo eolmana geollyeoyo?',
    category: 'transportation',
  },
  // 买票和充值
  {
    id: 'transportation_17',
    zh: '我要买一张票',
    ko: '티켓 한 장 주세요',
    romanization: 'Tiket han jang juseyo',
    category: 'transportation',
  },
  {
    id: 'transportation_18',
    zh: '往返票多少钱？',
    ko: '왕복 티켓 얼마예요?',
    romanization: 'Wangbok tiket eolmayeyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_19',
    zh: '我要充值交通卡',
    ko: '교통카드 충전해 주세요',
    romanization: 'Gyotongkadeu chungchonhae juseyo',
    category: 'transportation',
  },
  {
    id: 'transportation_20',
    zh: '这张票可以用几次？',
    ko: '이 티켓 몇 번 쓸 수 있나요?',
    romanization: 'I tiket myeot beon ssul su innayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_21',
    zh: '一天票多少钱？',
    ko: '1일권 얼마예요?',
    romanization: '1ilgwon eolmayeyo?',
    category: 'transportation',
  },
  // 交通方式询问
  {
    id: 'transportation_22',
    zh: '有公交吗？',
    ko: '버스 있나요?',
    romanization: 'Beoseu innayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_23',
    zh: '可以打车吗？',
    ko: '택시 탈 수 있나요?',
    romanization: 'Taeksi tal su innayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_24',
    zh: '坐地铁快还是打车快？',
    ko: '지하철이 빨라요? 택시가 빨라요?',
    romanization: 'Jihacheori ppallayo? Taeksiga ppallayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_25',
    zh: '需要换乘吗？',
    ko: '환승해야 하나요?',
    romanization: 'Hwanseunghaeya hanayo?',
    category: 'transportation',
  },
  // 换乘和转车
  {
    id: 'transportation_26',
    zh: '我应该坐哪辆车？',
    ko: '어떤 버스 타야 돼요?',
    romanization: 'Eotteon beoseu taya dwaeyo?',
    category: 'transportation',
  },
  {
    id: 'transportation_27',
    zh: '这班车到...吗？',
    ko: '이 버스 ... 가요?',
    romanization: 'I beoseu ... gayo?',
    category: 'transportation',
  },
  {
    id: 'transportation_28',
    zh: '错过站了怎么办？',
    ko: '역을 지나치면 어떻게 해요?',
    romanization: 'Yeogeul jinachimyeon eotteoke haeyo?',
    category: 'transportation',
  },
  // 交通卡问题
  {
    id: 'transportation_29',
    zh: '交通卡余额不足',
    ko: '교통카드 잔액 부족해요',
    romanization: 'Gyotongkadeu janeog bujokhaeyo',
    category: 'transportation',
  },
  {
    id: 'transportation_30',
    zh: '在哪里充值？',
    ko: '어디서 충전할 수 있나요?',
    romanization: 'Eodiseo chungchonhal su innayo?',
    category: 'transportation',
  },
];

/**
 * 紧急短语 (25 句)
 * 包含：医疗急救、丢失物品、警察报案、使馆联系、紧急情况等场景
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
  // ==================== 新增短语 ====================
  // 医疗急救
  {
    id: 'emergency_09',
    zh: '叫救护车',
    ko: '구급차 불러주세요',
    romanization: 'Gupgeucha bulleojuseyo',
    category: 'emergency',
  },
  {
    id: 'emergency_10',
    zh: '我肚子疼',
    ko: '배가 아파요',
    romanization: 'Bega apayo',
    category: 'emergency',
  },
  {
    id: 'emergency_11',
    zh: '我头痛',
    ko: '머리가 아파요',
    romanization: 'Meoriga apayo',
    category: 'emergency',
  },
  {
    id: 'emergency_12',
    zh: '我有心脏病',
    ko: '심장병 있어요',
    romanization: 'Simjangbyeong isseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_13',
    zh: '我对...过敏',
    ko: '...에 알레르기 있어요',
    romanization: '...e allereugi isseoyo',
    category: 'emergency',
  },
  // 丢失物品
  {
    id: 'emergency_14',
    zh: '我手机丢了',
    ko: '휴대폰 잃어버렸어요',
    romanization: 'Hyudaepon ireobeoryeosseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_15',
    zh: '我护照丢了',
    ko: '여권 잃어버렸어요',
    romanization: 'Yeogwon ireobeoryeosseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_16',
    zh: '行李丢了',
    ko: '짐을 잃어버렸어요',
    romanization: 'Jimeul ireobeoryeosseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_17',
    zh: '在哪里可以报案？',
    ko: '어디서 신고할 수 있나요?',
    romanization: 'Eodiseo singohal su innayo?',
    category: 'emergency',
  },
  // 警察报案
  {
    id: 'emergency_18',
    zh: '我被偷了',
    ko: '도둑맞았어요',
    romanization: 'Dodukmatasseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_19',
    zh: '我被抢劫了',
    ko: '강도를 당했어요',
    romanization: 'Gangdoreul danghaesseoyo',
    category: 'emergency',
  },
  {
    id: 'emergency_20',
    zh: '我要报警',
    ko: '경찰에 신고할게요',
    romanization: 'Gyeongchale singohalgeyo',
    category: 'emergency',
  },
  {
    id: 'emergency_21',
    zh: '派出所怎么走？',
    ko: '파출소 어떻게 가요?',
    romanization: 'Pachulso eotteoke gayo?',
    category: 'emergency',
  },
  // 使馆联系
  {
    id: 'emergency_22',
    zh: '中国大使馆电话',
    ko: '중국 대사관 전화번호',
    romanization: 'Jungguk daesagwan jeonhwabeo',
    category: 'emergency',
  },
  {
    id: 'emergency_23',
    zh: '需要翻译',
    ko: '번역사 필요해요',
    romanization: 'Beonyeoksa piryohaeyo',
    category: 'emergency',
  },
  // 其他紧急情况
  {
    id: 'emergency_24',
    zh: '着火了！',
    ko: '불이야!',
    romanization: 'Buriya!',
    category: 'emergency',
  },
  {
    id: 'emergency_25',
    zh: '请快一点',
    ko: '빨리 좀 해주세요',
    romanization: 'Ppalli jom haejuseyo',
    category: 'emergency',
  },
];

/**
 * 住宿短语 (30 句)
 * 包含：入住退房、房间服务、维修投诉、延长住宿、邻居噪音等场景
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
  // ==================== 新增短语 ====================
  // 入住和退房
  {
    id: 'accommodation_11',
    zh: '我要办理入住',
    ko: '체크인할게요',
    romanization: 'Cheukeuinhageyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_12',
    zh: '请给我房卡',
    ko: '키주세요',
    romanization: 'Ki juseyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_13',
    zh: '需要押金吗？',
    ko: '보증금 필요해요?',
    romanization: 'Bojeumgeum piryohaeyo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_14',
    zh: '房间在几楼？',
    ko: '방이 몇 층이에요?',
    romanization: 'Bangi myeot cheungieyo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_15',
    zh: '电梯在哪里？',
    ko: '엘리베이터 어디예요?',
    romanization: 'Ellibeiteo eodiyeyo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_16',
    zh: '我要退房',
    ko: '체크아웃할게요',
    romanization: 'Chekeuauteuhageyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_17',
    zh: '账单请给我',
    ko: '계산서 주세요',
    romanization: 'Gyesanseo juseyo',
    category: 'accommodation',
  },
  // 房间服务和设施
  {
    id: 'accommodation_18',
    zh: '可以要更多毛巾吗？',
    ko: '수건 더 주실 수 있나요?',
    romanization: 'Sugeon deo jusil su innayo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_19',
    zh: '有吹风机吗？',
    ko: '드라이어 있나요?',
    romanization: 'Deuraieo innayo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_20',
    zh: '热水不热',
    ko: '뜨거운 물 안 나와요',
    romanization: 'Tteugeon mul an nawayo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_21',
    zh: '没电了',
    ko: '전기 안 들어와요',
    romanization: 'Jeonji an deureowayo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_22',
    zh: 'WiFi密码是什么？',
    ko: '와이파이 비밀번호 뭐예요?',
    romanization: 'Waipai bimilbeonseo mwoyeyo?',
    category: 'accommodation',
  },
  {
    id: 'accommodation_23',
    zh: '可以叫醒服务吗？',
    ko: '모닝콜 해주세요',
    romanization: 'Moningkol haejuseyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_24',
    zh: '有叫餐服务吗？',
    ko: '룸서비스 있나요?',
    romanization: 'Roomseobiseu innayo?',
    category: 'accommodation',
  },
  // 维修和投诉
  {
    id: 'accommodation_25',
    zh: '马桶坏了',
    ko: '화장실 고장 났어요',
    romanization: 'Hwangsiril gojang nasseoyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_26',
    zh: '门锁不好用',
    ko: '문 잠금 잘 안 돼요',
    romanization: 'Mun jamgeum jal an dwaeyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_27',
    zh: '房间不干净',
    ko: '방이 더러워요',
    romanization: 'Bangi deoreowoyo',
    category: 'accommodation',
  },
  // 延长住宿
  {
    id: 'accommodation_28',
    zh: '我想再住一晚',
    ko: '하루 더 묵고 싶어요',
    romanization: 'Haru deo mukgo sipeoyo',
    category: 'accommodation',
  },
  {
    id: 'accommodation_29',
    zh: '有空房吗？',
    ko: '빈 방 있나요?',
    romanization: 'Bin bang innayo?',
    category: 'accommodation',
  },
  // 其他
  {
    id: 'accommodation_30',
    zh: '可以寄存行李吗？',
    ko: '짐 맡길 수 있나요?',
    romanization: 'Jim matggil su innayo?',
    category: 'accommodation',
  },
];

/**
 * 问候短语 (25 句)
 * 包含：日常问候、礼貌用语、感谢道歉、道别祝福、闲聊话题等场景
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
  // ==================== 新增短语 ====================
  // 日常问候
  {
    id: 'greeting_11',
    zh: '早上好',
    ko: '좋은 아침이에요',
    romanization: 'Joeun achimieyo',
    category: 'greeting',
  },
  {
    id: 'greeting_12',
    zh: '晚上好',
    ko: '좋은 저녁이에요',
    romanization: 'Joeun jeonyeogieyo',
    category: 'greeting',
  },
  {
    id: 'greeting_13',
    zh: '晚安',
    ko: '안녕히 주무세요',
    romanization: 'Annyeonghi jumuseyo',
    category: 'greeting',
  },
  // 礼貌用语
  {
    id: 'greeting_14',
    zh: '不好意思',
    ko: '죄송해요',
    romanization: 'Joesonghaeyo',
    category: 'greeting',
  },
  {
    id: 'greeting_15',
    zh: '麻烦你了',
    ko: '번거로워드려서 죄송해요',
    romanization: 'Beongeoroweodyeureoseo joesonghaeyo',
    category: 'greeting',
  },
  {
    id: 'greeting_16',
    zh: '请稍等',
    ko: '잠시만요',
    romanization: 'Jamsimanyo',
    category: 'greeting',
  },
  {
    id: 'greeting_17',
    zh: '请慢用',
    ko: '맛있게 드세요',
    romanization: 'Masseoge deuseyo',
    category: 'greeting',
  },
  // 感谢和道歉
  {
    id: 'greeting_18',
    zh: '非常感谢',
    ko: '대단히 감사합니다',
    romanization: 'Daedanhi gamsahamnida',
    category: 'greeting',
  },
  {
    id: 'greeting_19',
    zh: '没关系',
    ko: '별말씀을요',
    romanization: 'Byeomalsseumeulyo',
    category: 'greeting',
  },
  {
    id: 'greeting_20',
    zh: '我明白了',
    ko: '알겠습니다',
    romanization: 'Algetseumnida',
    category: 'greeting',
  },
  {
    id: 'greeting_21',
    zh: '没关系',
    ko: '괜찮습니다',
    romanization: 'Gwaenchamseumnida',
    category: 'greeting',
  },
  // 道别和祝福
  {
    id: 'greeting_22',
    zh: '祝你今天愉快',
    ko: '좋은 하루 보내세요',
    romanization: 'Joeun haru bonaeseyo',
    category: 'greeting',
  },
  {
    id: 'greeting_23',
    zh: '旅途愉快',
    ko: '즐거운 여행 되세요',
    romanization: 'Jeulgeoun yeohaeng doeseyo',
    category: 'greeting',
  },
  // 闲聊话题
  {
    id: 'greeting_24',
    zh: '今天天气真好',
    ko: '오늘 날씨 좋네요',
    romanization: 'Oneul nalssi johneyo',
    category: 'greeting',
  },
  {
    id: 'greeting_25',
    zh: '从哪里来？',
    ko: '어디서 오셨어요?',
    romanization: 'Eodiseo osyeosseoyo?',
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
