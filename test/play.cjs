// node test/play.cjs — 実際に指で書くのと同じように、お手本の画をなぞって遊んでみる（既定は iPad 横 1180x820。W/H で変更）
// 先に npm run build。docs/ を内蔵サーバーで配信する
const pw = require(process.env.PW || 'playwright')
const http = require('http'), fs = require('fs'), path = require('path')
const root = path.join(__dirname, '..', 'docs'), shots = path.join(__dirname, 'shots')
const KANA = require('../src/data/kana.json')
fs.mkdirSync(shots, { recursive: true })
let pass = 0, fail = 0
const TYPES_CT = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/moji-monster/, '')
  if (u === '/' || !u) u = '/index.html'
  const f = path.join(root, u)
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end() }
  r.writeHead(200, { 'Content-Type': TYPES_CT[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(r)
})
srv.listen(8792, async () => {
  const b = await pw.chromium.launch({ channel: 'chrome' })
  const vw = +(process.env.W || 1180), vh = +(process.env.H || 820), tag = process.env.TAG || ''
  const p = await b.newPage({ viewport: { width: vw, height: vh } })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  await p.addInitScript(() => { if (window.speechSynthesis) window.speechSynthesis.speak = () => {} })
  async function t(name, fn) {
    try { await fn(); pass++; console.log('  ok  ' + name) } catch (e) { fail++; console.log('  NG  ' + name + '\n      ' + e.message.split('\n')[0]) }
  }
  const shot = (n) => p.screenshot({ path: path.join(shots, tag + n + '.png') })
  // 1文字を お手本どおりに なぞる（reverse で逆向き、order で書く順、once で1画だけ）
  async function drawChar(ch, opts = {}) {
    const box = await p.locator('canvas').boundingBox()
    const strokes = KANA[ch]
    const order = opts.order || strokes.map((_, i) => i)
    for (const i of order) {
      let pts = await p.evaluate((d) => {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        s.setAttribute('d', d)
        const L = s.getTotalLength()
        return Array.from({ length: 16 }, (_, k) => { const q = s.getPointAtLength((L * k) / 15); return [q.x, q.y] })
      }, strokes[i])
      if (opts.reverse) pts = pts.reverse()
      const sc = box.width / 109
      await p.mouse.move(box.x + pts[0][0] * sc, box.y + pts[0][1] * sc)
      await p.mouse.down()
      for (const [x, y] of pts.slice(1)) await p.mouse.move(box.x + x * sc, box.y + y * sc, { steps: 2 })
      await p.mouse.up()
      await p.waitForTimeout(120)
      if (opts.once) return
    }
  }
  async function writeName() {
    const cells = await p.locator('[data-cell]').allTextContents()
    for (let i = 0; i < cells.length; i++) { await p.waitForTimeout(550); await drawChar(cells[i]) }
    await p.waitForSelector('#celebTitle', { timeout: 6000 })
  }
  async function readCelebs() {
    const titles = []
    while (await p.locator('#celebNext').count()) { titles.push(await p.textContent('#celebTitle')); await p.click('#celebNext'); await p.waitForTimeout(250) }
    return titles
  }

  await p.goto(process.env.BASE || 'http://localhost:8792/moji-monster/') // BASE=公開URL で本番を試せる
  await p.evaluate(() => localStorage.clear())
  await p.reload()
  await p.waitForSelector('#writeBtn')
  await t('しま: はじめは なかま0ひき・4つの エリア', async () => {
    if (!/0 ひき/.test(await p.textContent('#monCount'))) throw new Error(await p.textContent('#monCount'))
    if ((await p.locator('[data-area]').count()) !== 4) throw new Error('エリア')
    await shot('1-island-empty')
  })
  await t('えらぶ: さいしょは 4たい（タイプごと1つ）かけて、ほかは ？？？', async () => {
    await p.click('#writeBtn'); await p.waitForSelector('[data-pick]')
    const enabled = await p.locator('[data-pick]:not([disabled])').count()
    if (enabled !== 4) throw new Error('えらべる ' + enabled)
    await shot('2-pick')
  })
  await t('かく: 書き順ちがい・逆向きは おしえてくれて すすまない', async () => {
    await p.click('[data-pick="achimo"]'); await p.waitForSelector('canvas')
    await drawChar('ア', { order: [1], once: true }); await p.waitForSelector('[role=status]')
    const m = await p.textContent('[role=status]'); if (!/ちがう|もういちど/.test(m)) throw new Error('書き順 ' + m)
    await p.waitForTimeout(300)
    await drawChar('ア', { order: [0], reverse: true, once: true }); await p.waitForTimeout(250)
    const m2 = await p.textContent('[role=status]'); if (!/ぎゃく|もういちど/.test(m2)) throw new Error('逆 ' + m2)
  })
  await t('ヒント: おすと つぎの せんが うすく出る', async () => {
    await p.click('#hintBtn'); await p.waitForTimeout(250)
    await shot('3-write-hint')
  })
  await t('アチモを かくと しまに 1ぴき ふえる', async () => {
    await writeName()
    const titles = await readCelebs()
    if (!/アチモが ふえた/.test(titles[0])) throw new Error(titles.join(' / '))
    if (!/1 ひき/.test(await p.textContent('#monCount'))) throw new Error(await p.textContent('#monCount'))
  })
  await t('3かい かくと しんか（アチモ → アチモス）', async () => {
    let last = []
    for (let k = 0; k < 2; k++) {
      await p.click('#writeBtn'); await p.click('[data-pick="achimo"]'); await p.waitForSelector('canvas'); await writeName()
      if (k === 1) await shot('4-evolve')
      last = await readCelebs()
    }
    if (!/しんか/.test(last[0])) throw new Error(last.join(' / '))
    await p.click('#writeBtn'); const nm = await p.textContent('[data-pick="achimo"]'); if (!/アチモス/.test(nm)) throw new Error('つぎは アチモス ' + nm)
    await p.click('text=← しまに もどる')
  })
  await t('4かい めで やせいの モンスターが くる → つよい タイプだけ えらべる → かくと なかまに なる', async () => {
    await p.click('#writeBtn'); await p.click('[data-pick="zabun"]'); await p.waitForSelector('canvas'); await writeName()
    let titles = await readCelebs()
    if (!titles.some((x) => /やせい/.test(x))) throw new Error('やせいが こない ' + titles.join(' / '))
    await p.waitForSelector('#wildBtn'); await shot('5-wild')
    await p.click('#wildBtn'); await p.waitForSelector('[data-pick]')
    const ok = await p.locator('[data-pick]:not([disabled])').count(); if (ok < 1) throw new Error('えらべない')
    await shot('6-wild-pick')
    await p.locator('[data-pick]:not([disabled])').first().click(); await p.waitForSelector('canvas'); await writeName()
    titles = await readCelebs()
    if (!titles.some((x) => /なかまに なった/.test(x))) throw new Error('なかまに ならない ' + titles.join(' / '))
    await p.click('#writeBtn'); const en = await p.locator('[data-pick]:not([disabled])').count(); if (en !== 5) throw new Error('えらべる数 ' + en)
    await p.click('text=← しまに もどる')
  })
  await t('ほぞん: ひらきなおしても なかまが のこる・ずかん', async () => {
    const before = await p.textContent('#monCount'); await p.reload(); await p.waitForSelector('#monCount')
    if ((await p.textContent('#monCount')) !== before) throw new Error('きえた')
    await shot('7-island')
    await p.click('#bookBtn'); await p.waitForSelector('#bookCount')
    const c = await p.textContent('#bookCount'); if (!/^[3-9] \/ 24/.test(c)) throw new Error('ずかん ' + c)
    await shot('8-book')
  })
  await t('よこはみだし なし', async () => {
    const o = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); if (o) throw new Error('よこに はみ出す')
  })
  await t('JSエラーなし', async () => { if (errs.length) throw new Error(errs.join(' | ')) })
  console.log(`\n${pass} 件 OK` + (fail ? `・NG ${fail}` : ''))
  await b.close(); srv.close(); process.exitCode = fail ? 1 : 0
})
