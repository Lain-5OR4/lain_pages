# React API の使い方レビュー (2026-07-07)

クライアントコンポーネント全体を対象にした「React API の使い方が下手な部分」のレビュー記録。
同日中にすべて修正済み(下記の対応状況を参照)。

## 1. Background.tsx — rAF ループが unmount 後も止まらない【実バグ】

`drawRain()` が `requestAnimationFrame` で自己再帰するが、cleanup が resize リスナーの解除のみで
`cancelAnimationFrame` を呼んでいなかった。

- ホームから別ページへクライアント遷移した後も、外れた canvas への描画ループが永久に走る(CPU浪費+リーク)
- 開発時は StrictMode がエフェクトを2回実行するため、ループが2本走り雨が2倍速になっていた

**修正**: frame id を保持して cleanup で `cancelAnimationFrame`。

## 2. WalkingCharacter.tsx — state updater 内で副作用【アンチパターン】

`setPosition((pos) => { ... setTarget(...); setDirection(...); ... })` と、
純粋であるべき updater 関数の中で別の setState を呼んでいた(StrictMode では updater が
2回実行されるため乱数抽選も2重に走る)。あわせて:

- 16ms の `setInterval` → `requestAnimationFrame` が定石
- `left/top` の毎フレーム更新 → `transform: translate` が定石(レイアウトを汚さない)

**修正**: シミュレーション状態(位置・目標・向き)をエフェクト内のローカル変数に持ち、
毎フレーム純粋な setState 1回だけで描画値を反映する構造に書き換え。rAF + cleanup 付き。

## 3. useBackgroundMusic.tsx — `play()` の Promise 未処理【状態不整合】

`audio.play()` は自動再生ポリシーで reject され得る Promise を返すが、握りつぶして
楽観的に `setIsPlaying(true)` していた。特に visibilitychange からの自動再開は
ユーザー操作起点でないためブロックされやすく、その場合 unhandled rejection +
「再生中表示なのに無音」になる。

また `wasPlayingBeforeHidden` は再レンダー不要の値なのに state で持っており、
visibilitychange リスナーが deps 変化のたびに張り直されていた。

**修正**: `play()` の成否で `setIsPlaying` を確定させる。`wasPlayingBeforeHidden` は
ref 化し、再生中かどうかは `audio.paused` で判定してリスナーの購読を1回に。

## 4. useTypingEffect.tsx — フックが render 関数を返す設計【設計】

`renderTypingEffect()` という JSX を返す関数をフックから返していた。この形だと
1文字打つたびに呼び出し元(ホームページ全体)が再レンダーされる。

**修正**: `<TypingEffect text="..." />` コンポーネント化
(`src/components/animation/TypingEffect.tsx`)。再レンダーがコンポーネント内に閉じる。
旧フックは削除。

## 5. PhotoLightbox — prop→state 初期化の潜在トラップ【保険】

`useState(initialPhotoIndex)` は「閉じると unmount される」親の構造に偶然守られている。
将来「開いたまま entry を切り替える」改修をすると state がリセットされず壊れる。

**修正**: 呼び出し側(diary/page.tsx)で `key={lightbox.entry.id}` を付与。

## 良かった点(変更不要)

- `src/app/diary/page.tsx` の `use()` + Suspense + ErrorBoundary + retry は React 19 の推奨形
- ミニアプリ3つ(VoidSpace / PhysicsTextGrid / Microscope)のエフェクト後始末は模範的
  (rAF解除・リスナー解除・three.js の dispose 完備)
- `JellyfishCharacter` の `<style jsx>` は App Router でも SWC がコンパイルしており動作に問題なし
  (ブラウザで警告なし・アニメーション適用を確認済み)
