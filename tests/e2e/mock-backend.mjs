import http from "node:http"
import { URL } from "node:url"

const HOST = "127.0.0.1"
const PORT = Number(process.env.E2E_API_PORT ?? 18000)

const SURAHS = [
  {
    number: 1,
    arabic_name: "ٱلْفَاتِحَة",
    transliteration: "Al-Fātiḥah",
    english_name: "The Opening",
    ayah_count: 7,
    revelation_place: "meccan",
  },
  {
    number: 2,
    arabic_name: "ٱلْبَقَرَة",
    transliteration: "Al-Baqarah",
    english_name: "The Cow",
    ayah_count: 286,
    revelation_place: "medinan",
  },
  {
    number: 114,
    arabic_name: "ٱلنَّاس",
    transliteration: "An-Nās",
    english_name: "Mankind",
    ayah_count: 6,
    revelation_place: "meccan",
  },
]

function sendJson(res, status, payload, headers = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "http://127.0.0.1:3000",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "Content-Type, X-CSRFToken",
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    ...headers,
  })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8")
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
    req.on("error", reject)
  })
}

function hasSessionCookie(req) {
  const cookie = req.headers.cookie ?? ""
  return cookie.includes("session=1")
}

function quranAyahs(number, page, pageSize) {
  const total = Math.min(
    20,
    SURAHS.find((s) => s.number === number)?.ayah_count ?? 6
  )
  const start = (page - 1) * pageSize
  const end = Math.min(total, start + pageSize)
  const results = []
  for (let i = start + 1; i <= end; i += 1) {
    results.push({
      number_global: number * 1000 + i,
      surah_number: number,
      number_in_surah: i,
      text_ar: `آية ${i}`,
    })
  }
  const hasMore = end < total
  return {
    count: total,
    next: hasMore
      ? `http://${HOST}:${PORT}/api/v1/quran/surahs/${number}/ayahs/?page=${
          page + 1
        }&page_size=${pageSize}`
      : null,
    previous: null,
    results,
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { detail: "Bad request" })
    return
  }

  const method = req.method.toUpperCase()
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const pathname = url.pathname

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "http://127.0.0.1:3000",
      "access-control-allow-credentials": "true",
      "access-control-allow-headers": "Content-Type, X-CSRFToken",
      "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
    })
    res.end()
    return
  }

  if (method === "GET" && pathname === "/healthz") {
    sendJson(res, 200, { ok: true })
    return
  }

  if (
    (method === "POST" || method === "GET") &&
    pathname === "/api/auth/csrf/"
  ) {
    sendJson(
      res,
      200,
      { csrfToken: "e2e-csrf-token" },
      {
        "set-cookie":
          "csrftoken=e2e-csrf-token; Path=/; HttpOnly; SameSite=Lax",
      }
    )
    return
  }

  if (method === "POST" && pathname === "/api/auth/jwt/create/") {
    const body = await readBody(req)
    if (body?.email === "inactive@example.com") {
      sendJson(res, 401, {
        code: "inactive_user",
        detail: "This user account is disabled.",
      })
      return
    }
    if (body?.password === "wrong") {
      sendJson(res, 401, { detail: "No active account found." })
      return
    }
    sendJson(
      res,
      200,
      {
        id: 1,
        email: body?.email ?? "user@example.com",
        first_name: "QGraph",
        last_name: "User",
      },
      {
        "set-cookie": "session=1; Path=/; HttpOnly; SameSite=Lax",
      }
    )
    return
  }

  if (method === "POST" && pathname === "/api/auth/jwt/logout/") {
    sendJson(
      res,
      200,
      {},
      {
        "set-cookie": "session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
      }
    )
    return
  }

  if (method === "POST" && pathname === "/api/auth/jwt/refresh/") {
    sendJson(res, 200, {})
    return
  }

  if (method === "GET" && pathname === "/api/auth/users/me/") {
    if (!hasSessionCookie(req)) {
      sendJson(res, 401, { detail: "Authentication credentials were not provided." })
      return
    }
    sendJson(res, 200, {
      id: 1,
      email: "user@example.com",
      first_name: "QGraph",
      last_name: "User",
    })
    return
  }

  if (method === "GET" && pathname === "/api/v1/quran/surahs/") {
    const pageSize = Number(url.searchParams.get("page_size") ?? SURAHS.length)
    const page = Number(url.searchParams.get("page") ?? 1)
    const start = (page - 1) * pageSize
    const results = SURAHS.slice(start, start + pageSize)
    sendJson(res, 200, {
      count: SURAHS.length,
      next: null,
      previous: null,
      results,
    })
    return
  }

  const surahDetailMatch = pathname.match(/^\/api\/v1\/quran\/surahs\/(\d+)\/$/)
  if (method === "GET" && surahDetailMatch) {
    const number = Number(surahDetailMatch[1])
    const found = SURAHS.find((s) => s.number === number)
    if (!found) {
      sendJson(res, 404, { detail: "Not found" })
      return
    }
    sendJson(res, 200, found)
    return
  }

  const ayahsMatch = pathname.match(/^\/api\/v1\/quran\/surahs\/(\d+)\/ayahs\/$/)
  if (method === "GET" && ayahsMatch) {
    const number = Number(ayahsMatch[1])
    const page = Number(url.searchParams.get("page") ?? 1)
    const pageSize = Number(url.searchParams.get("page_size") ?? 20)
    sendJson(res, 200, quranAyahs(number, page, pageSize))
    return
  }

  sendJson(res, 404, { detail: "Not found" })
})

server.listen(PORT, HOST, () => {
  console.log(`[mock-backend] listening on http://${HOST}:${PORT}`)
})

function shutdown() {
  server.close(() => {
    process.exit(0)
  })
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
