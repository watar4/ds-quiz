import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookMarked, Lightbulb, Repeat, Search } from 'lucide-react';
import { CATEGORY_SHORT, type Category } from '../types/question';
import { categoryColor } from '../components/CategoryBadge';

/** 頻出用語（カテゴリ別） */
interface Term {
  term: string;
  reading?: string;
  category: Category;
  def: string;
}

/** 混同しやすいペア */
interface Confusable {
  title: string;
  a: { label: string; desc: string };
  b: { label: string; desc: string };
  hint?: string;
}

/** 特に難しい・落とし穴になりやすい論点 */
interface HardTopic {
  title: string;
  body: string;
}

const TERMS: Term[] = [
  // データサイエンス力
  { term: '平均・中央値・最頻値', category: 'データサイエンス力', def: '代表値。右に歪んだ分布では「最頻値 < 中央値 < 平均値」。中央値・最頻値は外れ値に強く、平均値は引っ張られやすい。' },
  { term: '標準偏差・分散', category: 'データサイエンス力', def: 'ばらつきの指標。標準偏差は分散の平方根で、単位が元データと同じ。分散はその2乗。' },
  { term: '相関係数', reading: 'そうかんけいすう', category: 'データサイエンス力', def: '2変数の直線的関係の強さ。-1〜+1の範囲。0は直線相関なし。相関≠因果に注意。' },
  { term: '標準化（zスコア）', category: 'データサイエンス力', def: '(値−平均)÷標準偏差。変換後は平均0・標準偏差1。単位の違う変数を比較可能にする。偏差値は平均50・標準偏差10。' },
  { term: '正規分布の68-95-99.7則', category: 'データサイエンス力', def: '±1σに約68%、±2σに約95%、±3σに約99.7%が含まれる経験則。' },
  { term: '中心極限定理', category: 'データサイエンス力', def: '母集団の分布によらず、標本平均の分布は標本サイズが大きいと正規分布に近づく。推定・検定の土台。' },
  { term: 'p値・有意水準', category: 'データサイエンス力', def: 'p値が有意水準(例:0.05)未満なら帰無仮説を棄却。p値は「帰無仮説が正しい確率」でも「効果の大きさ」でもない。' },
  { term: '帰無仮説・対立仮説', category: 'データサイエンス力', def: '帰無仮説は「差がない」、対立仮説は「差がある（示したい主張）」。検定は帰無仮説を棄却できるかを調べる。' },
  { term: '第一種・第二種の過誤', category: 'データサイエンス力', def: '第一種(α)＝正しい帰無仮説を棄却（あわてんぼう）。第二種(β)＝誤った帰無仮説を棄却できない（ぼんやり）。' },
  { term: '信頼区間', category: 'データサイエンス力', def: '同じ手順を繰り返すと約95%の区間が母平均を含む、という頻度論的な意味。「この区間に95%で入る」は誤り。' },
  { term: '決定係数 R²', category: 'データサイエンス力', def: '回帰で目的変数の変動のうちモデルで説明できる割合(0〜1)。変数を増やすほど上がるため自由度調整済R²で補正。' },
  { term: '過学習・汎化', category: 'データサイエンス力', def: '過学習＝学習データに適合しすぎて未知データの性能(汎化性能)が低下。正則化・交差検証・データ分割で対策。' },
  { term: '正則化（L1/L2）', category: 'データサイエンス力', def: 'モデルの複雑さに罰則を与え過学習を抑制。L1(ラッソ)は係数を0にし変数選択効果。L2(リッジ)は係数を小さく。' },
  { term: '交差検証（k-fold）', category: 'データサイエンス力', def: 'データをk分割し順にテスト用として評価を繰り返し平均。限られたデータで汎化性能を安定評価。' },
  { term: '混同行列', category: 'データサイエンス力', def: 'TP/FP/FN/TNの表。適合率・再現率・F1・正解率の計算の基礎。' },
  { term: '適合率・再現率', category: 'データサイエンス力', def: '適合率=TP/(TP+FP)＝予測の正確さ。再現率=TP/(TP+FN)＝取りこぼしの少なさ。両者はトレードオフ。' },
  { term: 'F1スコア', category: 'データサイエンス力', def: '適合率と再現率の調和平均。不均衡データで両者のバランスを見る。' },
  { term: 'ROC曲線・AUC', category: 'データサイエンス力', def: '閾値を変えた真陽性率と偽陽性率の関係がROC、その下の面積がAUC。1に近いほど良く0.5でランダム。' },
  { term: '主成分分析（PCA）', category: 'データサイエンス力', def: '情報(分散)を保ちつつ変数を少数の合成変数に圧縮する次元削減(教師なし)。可視化・多重共線性緩和に。' },
  { term: '教師あり/なし/強化学習', category: 'データサイエンス力', def: '教師あり＝正解ラベルで学習(分類・回帰)。教師なし＝ラベルなし(クラスタリング・次元削減)。強化＝報酬最大化。' },
  // データエンジニアリング力
  { term: 'WHERE / HAVING', category: 'データエンジニアリング力', def: 'WHEREは行の絞り込み、HAVINGはGROUP BYで集計した後の条件。集計関数の条件はHAVING。' },
  { term: 'JOINの種類', category: 'データエンジニアリング力', def: 'INNER＝両方一致のみ。LEFT OUTER＝左を全保持(右なしはNULL)。FULL OUTER＝両方保持。CROSS＝直積。' },
  { term: 'NULLの扱い', category: 'データエンジニアリング力', def: '「値が不明」。= では判定できず IS NULL / IS NOT NULL を使う。COUNT(列)はNULLを除外。0や空文字とは別。' },
  { term: '主キー・外部キー', category: 'データエンジニアリング力', def: '主キー＝行を一意識別(重複・NULL不可)。外部キー＝他表の主キーを参照し参照整合性を保つ。' },
  { term: '正規化（DB設計）', category: 'データエンジニアリング力', def: 'データの重複や更新時異常を抑える設計。検索速度最大化や暗号化が目的ではない。※統計の正規化とは別物。' },
  { term: 'ACID特性', category: 'データエンジニアリング力', def: 'トランザクションの性質。Atomicity/Consistency/Isolation/Durability。可用性(Availability)は含まない。' },
  { term: '構造化/非構造化データ', category: 'データエンジニアリング力', def: '表・CSVは構造化。テキスト・画像・音声・動画は非構造化。JSON/XMLは半構造化。' },
  { term: 'ETL / ELT', category: 'データエンジニアリング力', def: 'Extract(抽出)→Transform(変換)→Load(格納)。順序を入れ替えたELTもある。' },
  { term: 'DWH/データレイク/データマート', category: 'データエンジニアリング力', def: 'DWH＝整理済の構造化データ蓄積。データレイク＝生データ含め多様な形式を大量蓄積。データマート＝用途特化の小規模版。' },
  { term: '標準化 / Min-Max正規化', category: 'データエンジニアリング力', def: '標準化＝平均0・分散1。Min-Max正規化＝0〜1に収める。Min-Maxは外れ値の影響を受けやすい。' },
  { term: 'one-hotエンコーディング', category: 'データエンジニアリング力', def: '順序のないカテゴリを0/1の列に展開。整数(1,2,3)割当は誤った大小関係を学習させるため不可。' },
  { term: '共通鍵/公開鍵暗号', category: 'データエンジニアリング力', def: '共通鍵＝暗号化・復号で同じ鍵(高速・鍵配送が課題)。公開鍵＝公開鍵で暗号化し秘密鍵で復号(鍵配送に強い・電子署名)。' },
  { term: '認証 / 認可', category: 'データエンジニアリング力', def: '認証＝本人確認(誰か)。認可＝権限付与(何を許すか)。ログインが認証、操作範囲の制御が認可。' },
  { term: 'IaaS/PaaS/SaaS', category: 'データエンジニアリング力', def: '基盤提供(IaaS)→開発環境込み(PaaS)→完成アプリ(SaaS)の順に利用者の管理範囲が小さくなる。' },
  // ビジネス力
  { term: 'MECE', reading: 'ミーシー', category: 'ビジネス力', def: 'Mutually Exclusive, Collectively Exhaustive＝漏れなくダブりなく分類する考え方。' },
  { term: '演繹法・帰納法', category: 'ビジネス力', def: '演繹＝一般則を個別に適用。帰納＝個別事例から一般則を導く。向きが逆。' },
  { term: '仮説思考', category: 'ビジネス力', def: '先に仮の答えを立て検証に必要な分析へ集中する。網羅的に集めてから考えるより効率的。' },
  { term: 'KGI / KPI', category: 'ビジネス力', def: 'KGI＝最終目標。KPI＝その達成度を測る中間指標。KPIツリーで分解し、定量・測定可能に設計。' },
  { term: 'PoC', reading: 'ピーオーシー', category: 'ビジネス力', def: '概念実証。本格導入前に小規模に試し実現性・効果を検証する。' },
  { term: 'ROI', category: 'ビジネス力', def: '投資収益率＝利益÷投資額。施策の費用対効果を測る。' },
  { term: '個人情報', category: 'ビジネス力', def: '生存する個人を識別できる情報。他情報と容易に照合し識別できる場合も含む。' },
  { term: '要配慮個人情報', category: 'ビジネス力', def: '人種・信条・病歴・犯罪歴など差別・偏見につながりうる情報。取得に原則本人同意が必要。オプトアウト不可。' },
  { term: '匿名加工/仮名加工情報', category: 'ビジネス力', def: '匿名加工＝特定・復元不可に加工(条件付で第三者提供可)。仮名加工＝他情報と照合しなければ特定不可(主に内部利用)。' },
  { term: 'オプトイン/オプトアウト', category: 'ビジネス力', def: 'オプトイン＝事前同意が前提。オプトアウト＝拒否されない限り可(第三者提供では通知・公表等が条件)。' },
  { term: 'GDPR', category: 'ビジネス力', def: 'EUの一般データ保護規則。域外移転を規制し違反に高額制裁金。日本企業もEU住民データを扱えば対象。' },
  { term: '著作権', category: 'ビジネス力', def: '創作的表現に創作時点で自動発生(無方式主義)。アイデアや単なる事実は対象外。保護期間に限りあり。' },
  { term: '営業秘密', category: 'ビジネス力', def: '不正競争防止法。秘密管理性・有用性・非公知性の3要件。特許登録は要件でない(むしろ公開され非公知性と相反)。' },
  { term: '確証バイアス', category: 'ビジネス力', def: '自説に都合のよい情報ばかり集め反証を軽視する偏り。' },
  { term: '生存者バイアス', category: 'ビジネス力', def: '残った(成功した)対象だけを見て脱落を見落とす偏り。' },
  { term: '擬似相関・交絡', category: 'ビジネス力', def: '共通要因(交絡因子)で見かけ上現れる相関。相関から安易に因果を結論づけない。' },
  // 数理・DS・AIリテラシー
  { term: 'AI⊃機械学習⊃深層学習', category: '数理・データサイエンス・AIリテラシー', def: '最も広いのがAI、一部が機械学習、さらに一部の手法がディープラーニング。' },
  { term: 'ニューラルネットワーク', category: '数理・データサイエンス・AIリテラシー', def: '神経細胞を模したユニットを層状に結合。中間層を多数重ねたものが深層学習。' },
  { term: 'CNN / NLP', category: '数理・データサイエンス・AIリテラシー', def: 'CNN＝画像の局所特徴抽出に強い。NLP＝自然言語処理(翻訳・要約・チャットボット等)。' },
  { term: 'ハルシネーション', category: '数理・データサイエンス・AIリテラシー', def: '生成AIがもっともらしいが誤った内容を生成すること。出力は要検証。' },
  { term: 'ビッグデータの3V', category: '数理・データサイエンス・AIリテラシー', def: 'Volume(量)・Velocity(速度)・Variety(多様性)。Veracity(正確性)を加える説も。Visualizationは含まない。' },
  { term: 'Society 5.0', category: '数理・データサイエンス・AIリテラシー', def: 'サイバー空間と現実空間を融合し課題解決と経済発展を両立する人間中心の社会(日本が提唱)。' },
  { term: 'DX', category: '数理・データサイエンス・AIリテラシー', def: 'デジタル技術で事業・組織・業務・価値提供を変革。単なるIT化にとどまらない点が要点。' },
  { term: 'XAI（説明可能AI）', category: '数理・データサイエンス・AIリテラシー', def: 'AIの判断根拠を人間が理解できるようにする技術・考え方。説明責任・透明性に重要。' },
  { term: 'バイアス・公平性', category: '数理・データサイエンス・AIリテラシー', def: '学習データの偏りは特定属性に不公平な判断を生む。量を増やしても偏りの方向は是正されない。' },
  { term: 'ELSI', category: '数理・データサイエンス・AIリテラシー', def: '倫理的・法的・社会的課題。AI/データ活用の社会実装で併せて検討する観点。' },
];

const CONFUSABLES: Confusable[] = [
  {
    title: '適合率（Precision） vs 再現率（Recall）',
    a: { label: '適合率 = TP/(TP+FP)', desc: '陽性と「予測」したものの正確さ。誤検知を減らしたい時に重視。' },
    b: { label: '再現率 = TP/(TP+FN)', desc: '「実際の陽性」をどれだけ拾えたか。見逃しを減らしたい時に重視（病気検出等）。' },
    hint: '分母が「予測した陽性」か「実際の陽性」かで区別。両者はトレードオフ、バランスはF1。',
  },
  {
    title: '第一種の過誤 vs 第二種の過誤',
    a: { label: '第一種（α・あわてんぼう）', desc: '正しい帰無仮説を誤って棄却。「効果がないのにあると判断」。' },
    b: { label: '第二種（β・ぼんやり）', desc: '誤った帰無仮説を棄却できない。「効果があるのに見逃す」。' },
  },
  {
    title: '相関 vs 因果',
    a: { label: '相関', desc: '2変数が一緒に変動する傾向。-1〜+1の相関係数で表す。' },
    b: { label: '因果', desc: '一方が他方の原因。相関があっても因果とは限らない（交絡・擬似相関）。' },
    hint: 'アイス売上と水難事故＝気温という交絡因子による擬似相関の典型。',
  },
  {
    title: '標準化 vs 正規化（用語の多義性に注意）',
    a: { label: '標準化（zスコア）', desc: '平均0・標準偏差1にする。値の範囲は固定されない。' },
    b: { label: 'Min-Max正規化', desc: '0〜1の範囲に収める。外れ値の影響を受けやすい。' },
    hint: 'DBの「正規化」は重複排除のための設計手法で全くの別概念。文脈で判断する。',
  },
  {
    title: '過学習 vs 未学習（バイアス・バリアンス）',
    a: { label: '過学習（高バリアンス）', desc: 'モデルが複雑すぎ学習データに過適合。未知データで精度低下。' },
    b: { label: '未学習（高バイアス）', desc: 'モデルが単純すぎて学習データにも当てはまらない。' },
    hint: '両者はトレードオフ。適切な複雑さ・正則化・交差検証で調整。',
  },
  {
    title: 'WHERE vs HAVING（SQL）',
    a: { label: 'WHERE', desc: 'グループ化の前に行を絞り込む。集計関数は使えない。' },
    b: { label: 'HAVING', desc: 'GROUP BYで集計した後の条件指定。SUM()等の集計関数を条件にできる。' },
  },
  {
    title: 'INNER JOIN vs OUTER JOIN',
    a: { label: 'INNER JOIN', desc: '結合キーが両方のテーブルで一致する行のみ返す。' },
    b: { label: 'LEFT OUTER JOIN', desc: '左テーブルの全行を保持。右に一致がなければNULLで補う。' },
  },
  {
    title: '認証 vs 認可',
    a: { label: '認証（Authentication）', desc: '本人であることの確認（誰であるか）。例：ログイン。' },
    b: { label: '認可（Authorization）', desc: '許可する操作・資源の決定（何を許すか）。例：操作権限の制御。' },
  },
  {
    title: '匿名加工情報 vs 仮名加工情報',
    a: { label: '匿名加工情報', desc: '特定・復元できないよう加工。一定条件で本人同意なく第三者提供も可。' },
    b: { label: '仮名加工情報', desc: '他情報と照合しなければ特定できないよう加工。原則は内部での利活用向け。' },
  },
  {
    title: 'オプトイン vs オプトアウト',
    a: { label: 'オプトイン', desc: '事前の同意がある場合のみ可。広告メールは原則こちら。' },
    b: { label: 'オプトアウト', desc: '拒否がない限り可。第三者提供では通知・公表・委員会届出等が条件。要配慮個人情報は不可。' },
  },
  {
    title: '演繹法 vs 帰納法',
    a: { label: '演繹法', desc: '一般的な法則を個別事例に当てはめて結論を導く（三段論法）。' },
    b: { label: '帰納法', desc: '複数の個別事例から一般的な法則を見出す。' },
  },
  {
    title: '組み合わせ vs 順列',
    a: { label: '組み合わせ C(n,r)', desc: '順序を区別しない選び方。C(4,2)=6。' },
    b: { label: '順列 P(n,r)', desc: '順序を区別する並べ方。P(4,2)=12。' },
  },
];

const HARD_TOPICS: HardTopic[] = [
  {
    title: 'ベイズの定理（陽性的中率の罠）',
    body: '有病率が低いと、感度の高い検査でも「陽性なのに実は健康」が多くなる。陽性的中率 = (有病率×感度) ÷ (有病率×感度 + (1−有病率)×偽陽性率)。有病率1%・感度90%・偽陽性率10%なら陽性的中率は約8%。直感に反するため頻出。',
  },
  {
    title: 'p値・有意水準・信頼区間の正しい解釈',
    body: 'p値は「帰無仮説が正しいと仮定したとき、観測以上に極端な結果が出る確率」。「帰無仮説が正しい確率」でも「効果の大きさ」でもない。95%信頼区間は「同じ手順を繰り返すと約95%の区間が母平均を含む」意味で、特定の1区間に95%で入る、という表現は誤り。',
  },
  {
    title: '不均衡データでの正解率の落とし穴',
    body: '陽性が1%しかないデータでは、すべて陰性と答えるだけで正解率99%になる。正解率(Accuracy)だけで判断せず、再現率・適合率・F1スコア・AUCを併用する。',
  },
  {
    title: '多重共線性',
    body: '重回帰で説明変数どうしの相関が強いと、回帰係数の推定が不安定になり符号が直感と反することも。VIF（分散拡大係数）で診断し、変数の削除や主成分分析などで対処する。',
  },
  {
    title: '尺度水準（名義・順序・間隔・比例）',
    body: '名義＝分類のみ(性別)、順序＝順序に意味(満足度)、間隔＝差に意味だが原点が任意(摂氏温度)、比例＝差も比も意味あり絶対原点(重量・長さ)。摂氏は間隔尺度で「2倍暑い」は言えない点が頻出。',
  },
  {
    title: 'データ分割と情報リーク',
    body: 'ハイパーパラメータ調整は検証データで、最終評価は学習に一度も使っていないテストデータで行う。テストデータを前処理の基準算出や調整に使うと評価が甘くなる（情報リーク）。',
  },
  {
    title: '用語の多義性（正規化・正則化・正規分布・正規表現）',
    body: '読みが似た別概念。正規化＝DB設計の重複排除/統計のMin-Maxスケーリング、正則化＝過学習抑制の罰則、正規分布＝確率分布、正規表現＝文字列パターン。文脈で判断する。',
  },
  {
    title: '個人情報の周辺概念の整理',
    body: '個人情報→識別できる情報。要配慮個人情報→差別につながりうる情報で取得に原則同意・オプトアウト不可。匿名加工/仮名加工→加工の程度と利用範囲が異なる。第三者提供のオプトイン/オプトアウトの条件も頻出。',
  },
];

type Tab = 'terms' | 'confusable' | 'hard';

const CAT_FILTERS: (Category | 'all')[] = [
  'all',
  'データサイエンス力',
  'データエンジニアリング力',
  'ビジネス力',
  '数理・データサイエンス・AIリテラシー',
];

export default function Glossary() {
  const [tab, setTab] = useState<Tab>('terms');
  const [keyword, setKeyword] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');

  const filteredTerms = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return TERMS.filter((t) => {
      if (cat !== 'all' && t.category !== cat) return false;
      if (!kw) return true;
      return (
        t.term.toLowerCase().includes(kw) ||
        (t.reading ?? '').toLowerCase().includes(kw) ||
        t.def.toLowerCase().includes(kw)
      );
    });
  }, [keyword, cat]);

  const filteredConfusables = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return CONFUSABLES;
    return CONFUSABLES.filter((c) =>
      [c.title, c.a.label, c.a.desc, c.b.label, c.b.desc, c.hint ?? '']
        .join(' ')
        .toLowerCase()
        .includes(kw),
    );
  }, [keyword]);

  const filteredHard = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return HARD_TOPICS;
    return HARD_TOPICS.filter((h) => (h.title + h.body).toLowerCase().includes(kw));
  }, [keyword]);

  const tabs: { key: Tab; label: string; icon: typeof BookMarked; count: number }[] = [
    { key: 'terms', label: '頻出用語', icon: BookMarked, count: filteredTerms.length },
    { key: 'confusable', label: '混同しやすい', icon: Repeat, count: filteredConfusables.length },
    { key: 'hard', label: '難所・落とし穴', icon: AlertTriangle, count: filteredHard.length },
  ];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="mb-1 text-xl font-bold">解説 ・ 用語まとめ</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          DS検定★の頻出単語、間違えやすい・混同しやすいもの、特に難しい論点をまとめました。演習の前後の知識整理にどうぞ。
        </p>
      </section>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="用語・キーワードで検索（例: 再現率, JOIN, 匿名加工）"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === key
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={15} />
            {label}
            <span className={`tabular-nums text-xs ${tab === key ? 'text-brand-100' : 'text-slate-400'}`}>{count}</span>
          </button>
        ))}
      </div>

      {tab === 'terms' && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {CAT_FILTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`chip transition ${
                  cat === c
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {c === 'all' ? 'すべて' : CATEGORY_SHORT[c]}
              </button>
            ))}
          </div>
          {filteredTerms.length === 0 ? (
            <p className="card text-center text-sm text-slate-500">該当する用語がありません。</p>
          ) : (
            <ul className="space-y-2">
              {filteredTerms.map((t) => (
                <li key={t.term} className="card !p-3">
                  <div className="mb-1 flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold">{t.term}</span>
                    {t.reading && <span className="text-xs text-slate-400">{t.reading}</span>}
                    <span className={`chip ml-auto ${categoryColor(t.category)}`}>{CATEGORY_SHORT[t.category]}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t.def}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'confusable' && (
        <>
          {filteredConfusables.length === 0 ? (
            <p className="card text-center text-sm text-slate-500">該当する項目がありません。</p>
          ) : (
            <ul className="space-y-3">
              {filteredConfusables.map((c) => (
                <li key={c.title} className="card !p-3">
                  <h3 className="mb-2 font-semibold">{c.title}</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[c.a, c.b].map((side, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800/50"
                      >
                        <div className="mb-0.5 text-sm font-medium text-brand-700 dark:text-brand-300">{side.label}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">{side.desc}</div>
                      </div>
                    ))}
                  </div>
                  {c.hint && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                      <Lightbulb size={14} className="mt-0.5 shrink-0" />
                      <span>{c.hint}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'hard' && (
        <>
          {filteredHard.length === 0 ? (
            <p className="card text-center text-sm text-slate-500">該当する項目がありません。</p>
          ) : (
            <ul className="space-y-2">
              {filteredHard.map((h) => (
                <li key={h.title} className="card !p-3">
                  <h3 className="mb-1 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle size={15} className="shrink-0 text-amber-500" />
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{h.body}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <section className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">用語を確認したら、演習で定着させましょう。</span>
        <Link to="/setup?mode=random" className="btn-primary self-start sm:self-auto">
          ランダム演習へ
        </Link>
      </section>
    </div>
  );
}
