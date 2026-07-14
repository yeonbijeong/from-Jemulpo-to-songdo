// 편집 페이지의 저장 요청을 받아 GitHub에 커밋하는 서버 함수.
// - 비밀번호(ADMIN_PASSWORD 환경변수)로 보호
// - GitHub 토큰(GITHUB_TOKEN 환경변수)은 서버에만 존재 — 브라우저에 노출되지 않음
// - index.html 과 assets/gallery/ 이미지에만 쓰기 허용
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    }
    if (!process.env.ADMIN_PASSWORD) {
      return res.status(500).json({ error: '서버에 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. Vercel → Settings → Environment Variables에서 설정 후 Redeploy 하세요.' });
    }
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: '서버에 GITHUB_TOKEN 환경변수가 설정되지 않았습니다. Vercel → Settings → Environment Variables에서 설정 후 Redeploy 하세요.' });
    }
    const body = req.body || {};
    const { password, path, content, message, sha } = body;
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
    }
    const pathOk =
      path === 'index.html' ||
      /^assets\/gallery\/[\w.-]+\.(png|jpe?g|webp)$/i.test(path || '');
    if (!pathOk) {
      return res.status(400).json({ error: '허용되지 않은 경로입니다: ' + path });
    }
    if (!content || !message) {
      return res.status(400).json({ error: 'content/message가 없습니다.' });
    }
    const payload = { message, branch: 'main', content };
    if (sha) payload.sha = sha;
    const r = await fetch(
      'https://api.github.com/repos/yeonbijeong/from-Jemulpo-to-songdo/contents/' + path,
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'portfolio-admin',
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: '서버 오류: ' + e.message });
  }
};
