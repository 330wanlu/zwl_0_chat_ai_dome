const https = require('https')
const http = require('http')

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const urlObj = new URL(url)

    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (url.startsWith('https:') ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || 15000
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        })
      })
    })

    req.on('error', reject)
    req.on('timeout', () => reject(new Error('Request timeout')))

    if (options.body) req.write(options.body)
    req.end()
  })
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function extractRealUrl(rawUrl) {
  if (!rawUrl) return ''
  try {
    const normalized = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl
    const url = new URL(normalized)
    const uddg = url.searchParams.get('uddg')
    return uddg ? decodeURIComponent(uddg) : normalized
  } catch {
    return rawUrl
  }
}

function parseDuckDuckGoHtml(html) {
  const results = []
  const blocks = html.split('class="result results_links')

  for (let i = 1; i < blocks.length && results.length < 5; i++) {
    const block = blocks[i]
    const titleMatch = block.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/)
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/)

    if (!titleMatch) continue

    results.push({
      title: decodeHtml(titleMatch[2].replace(/<[^>]+>/g, '').trim()),
      snippet: snippetMatch
        ? decodeHtml(snippetMatch[1].replace(/<[^>]+>/g, '').trim())
        : '',
      url: extractRealUrl(titleMatch[1])
    })
  }

  return results.filter(item => item.title || item.snippet)
}

async function searchWithSerper(query) {
  const key = process.env.SERPER_API_KEY
  if (!key) return null

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': key
    },
    body: JSON.stringify({ q: query, num: 5 })
  })

  if (!res.ok) {
    throw new Error(`Serper 搜索失败 (${res.status})`)
  }

  const data = await res.json()
  return (data.organic || []).map(item => ({
    title: item.title || '',
    snippet: item.snippet || '',
    url: item.link || ''
  })).filter(item => item.title || item.snippet)
}

async function searchWithDuckDuckGo(query) {
  try {
    const body = new URLSearchParams({ q: query })
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: body.toString(),
      timeout: 30000
    })

    if (!res.ok) {
      throw new Error(`DuckDuckGo 搜索失败 (${res.status})`)
    }

    const html = await res.text()
    return parseDuckDuckGoHtml(html)
  } catch (err) {
    console.error('DuckDuckGo search error:', err.message)
    throw err
  }
}

async function searchWeb(query) {
  try {
    if (process.env.SERPER_API_KEY) {
      try {
        const serperResults = await searchWithSerper(query)
        if (serperResults?.length) return serperResults
      } catch (err) {
        console.error('Serper failed, falling back to DuckDuckGo:', err.message)
      }
    }

    const ddgResults = await searchWithDuckDuckGo(query)
    if (ddgResults.length) return ddgResults

    throw new Error('搜索失败：无法连接到 DuckDuckGo。建议配置 SERPER_API_KEY 使用 Google 搜索，或检查网络连接。')
  } catch (err) {
    console.error('searchWeb error:', err.message)
    throw err
  }
}

module.exports = { searchWeb }
