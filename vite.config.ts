import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// GitHub Pages（https://hirayama-byte.github.io/moji-monster/）で動くよう、公開先のフォルダ名を base に入れる。
// 書き出し先は docs/（Pages は main ブランチの docs フォルダを公開）
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/moji-monster/',
  build: { outDir: 'docs' },
})
