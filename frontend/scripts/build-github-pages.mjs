import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const distDir = path.join(rootDir, 'dist')

const FEEDBACK_API = 'https://coptic-psalmody.web.app/api/submitFeedback'

const [, repoName = 'coptic-language'] = (process.env.GITHUB_REPOSITORY ?? 'tonymelek/coptic-language').split('/')
const isUserPages = repoName.endsWith('.github.io')
const pagesBase = isUserPages ? '/' : `/${repoName}/`
const deployBase = `${pagesBase}app/`.replace(/\/{2,}/g, '/')

console.log(`Building for GitHub Pages`)
console.log(`  pages base: ${pagesBase}`)
console.log(`  app base:   ${deployBase}`)

execSync('npm run build', {
  cwd: rootDir,
  env: { ...process.env, DEPLOY_BASE: deployBase },
  stdio: 'inherit',
})

const repoSegment = pagesBase === '/' ? null : pagesBase.replace(/^\/|\/$/g, '')
const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js', '.xml'])
const TEXT_FILENAMES = new Set(['manifest.webmanifest'])

function prefixRootPaths(content) {
  if (pagesBase === '/') return content

  const skipAlreadyPrefixed = repoSegment
    ? `(?!${repoSegment}/)`
    : ''

  let next = content
    .replace(
      new RegExp(`(\\b(?:href|src|action)=["'])\\/${skipAlreadyPrefixed}`, 'g'),
      `$1${pagesBase}`,
    )
    .replace(
      new RegExp(`(<loc>)\\/${skipAlreadyPrefixed}`, 'g'),
      `$1${pagesBase}`,
    )
    .replace(/"start_url":\s*"\/"/g, `"start_url": "${pagesBase}"`)

  next = next.replace(
    "fetch('/api/submitFeedback'",
    `fetch('${FEEDBACK_API}'`,
  )

  return next
}

function shouldRewrite(filePath) {
  const rel = path.relative(distDir, filePath)
  if (rel.startsWith(`assets${path.sep}`) || rel.includes(`${path.sep}assets${path.sep}`)) {
    return false
  }

  const base = path.basename(filePath)
  if (TEXT_FILENAMES.has(base)) return true
  return TEXT_EXTENSIONS.has(path.extname(filePath))
}

function walkDist(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDist(filePath)
      continue
    }
    if (!shouldRewrite(filePath)) continue
    const rewritten = prefixRootPaths(fs.readFileSync(filePath, 'utf8'))
    fs.writeFileSync(filePath, rewritten)
  }
}

walkDist(distDir)

const appDistDir = path.join(distDir, 'app')
fs.mkdirSync(appDistDir, { recursive: true })

/** SPA fetches dictionary data and shared assets via import.meta.env.BASE_URL (/…/app/). */
const APP_PUBLIC_PATHS = [
  'dictionary_pages',
  'dictionary_index',
  'images',
  'fonts',
  'icons',
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  'manifest.webmanifest',
]

for (const name of APP_PUBLIC_PATHS) {
  const source = path.join(distDir, name)
  if (!fs.existsSync(source)) continue
  fs.cpSync(source, path.join(appDistDir, name), { recursive: true })
}

const builtAssets = path.join(distDir, 'assets')
if (fs.existsSync(builtAssets)) {
  fs.renameSync(builtAssets, path.join(appDistDir, 'assets'))
}

fs.writeFileSync(path.join(distDir, '.nojekyll'), '')

function removeDsStore(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      removeDsStore(filePath)
    } else if (entry.name === '.DS_Store') {
      fs.rmSync(filePath, { force: true })
    }
  }
}

const appHtml = path.join(distDir, 'app.html')
if (fs.existsSync(appHtml)) {
  fs.copyFileSync(appHtml, path.join(distDir, '404.html'))
  fs.copyFileSync(appHtml, path.join(appDistDir, 'index.html'))
}

removeDsStore(distDir)

console.log('GitHub Pages build ready in dist/')
