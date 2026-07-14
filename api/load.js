// 사이트 원본(index.html)과 커밋 sha를 GitHub에서 읽어오는 서버 함수.
// 공개 저장소라 비밀번호 없이 읽기만 허용. (쓰기는 save.js에서 비밀번호 검증)
module.exports = async (req, res) => {
  try {
    const path = (req.query && req.query.path) || 'index.html';
    if (path !== 'index.html') {
      return res.status(400).json({ error: '허용되지 않은 경로입니다.' });
    }
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'portfolio-admin',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
    }
    const r = await fetch(
      'https://api.github.com/repos/yeonbijeong/from-Jemulpo-to-songdo/contents/index.html?ref=main&t=' + Date.now(),
      { headers }
    );
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: '서버 오류: ' + e.message });
  }
};
