// よみあげ（ブラウザの音声合成）。日本語の声があれば それを使う。なければ 何もしない
let voice: SpeechSynthesisVoice | null = null

function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return
  const vs = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('ja'))
  voice = vs.find((v) => /Kyoko|O-ren|Google/.test(v.name)) ?? vs[0] ?? null
}
if (typeof speechSynthesis !== 'undefined') {
  pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export function speak(text: string, rate = 0.9) {
  try {
    if (typeof speechSynthesis === 'undefined') return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    u.rate = rate
    u.pitch = 1.15
    if (voice) u.voice = voice
    speechSynthesis.speak(u)
  } catch {
    /* 読み上げできなくても あそべる */
  }
}
