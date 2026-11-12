# 🏝️ もじモンスターの しま

6さい向け・指で **ひらがな／カタカナ** を書く練習ゲーム（iPad 想定）。
モンスターの名前を書くと、そのモンスターが島にどんどん増えていきます。

- 公開: https://hirayama-byte.github.io/moji-monster/ （GitHub Pages・検索に出ない設定 noindex）
- もとになったもの: 「もじペットのおせわ」（../moji-pet）の書き順判定（`src/lib/strokes.ts`）と書くキャンバス（`src/components/CanvasDraw.tsx`）

## あそびかた

1. しまの「✏️ なまえを かく」→ 書きたいモンスターをえらぶ（さいしょは4たい：アチモ・ザブン・モリモ・ぱち）
2. 名前が読み上げられるので、1もじずつ指で書く。1画ずつ書き順・向きを見て、ちがうと教えてくれる。困ったら「💡 ヒント」（1回め＝つぎの線をうすく、2回め＝ぜんぶうすく）
3. 書けると島に1ぴき増える。同じモンスターを3回書くと **しんか**（3だんかい）
4. 4回書くごとに **やせいのモンスター** が来る。相性のいいタイプ（ほのお←みず、みず←くさ・でんき、くさ←ほのお、でんき←くさ）の仲間の名前を書くと、仲間になって書けるモンスターが増える
5. 「📖 ずかん」で 24 のすがたを集める
6. 進み具合はこの端末のブラウザ（localStorage `moji-monster-v1`）に保存

## モンスター

- すべてオリジナル（既存作品のキャラクター・名前・見た目は使わない）。`src/data/monsters.ts`（4タイプ × 2けいとう × 3だんかい）
- 見た目は `src/components/MonsterArt.tsx` が SVG で描く（体の形 × タイプの飾り。だんかいで飾りが増える）。`?gallery` で一覧
- 名前を変えたら `node scripts/fetch-kana.mjs` で新しいかなの画データを取る（`src/data/kana.json`）
- しんかの回数は `EVOLVE_AT`、やせいが来る間隔は `useIsland.ts` の `WILD_EVERY`

## かきじゅんデータ

[KanjiVG](https://kanjivg.tagaini.net/)（Ulrich Apel ほか, CC BY-SA 3.0）の SVG から画を取り出しています。

## 開発

```bash
npm install
npm run dev      # http://localhost:5173/moji-monster/
npm run build    # docs/ に書き出し（Pages は main の /docs）
PW=<playwright のパス> node test/play.cjs   # 自動で書いて遊ぶテスト（W=820 H=1180 でたて画面）
```
