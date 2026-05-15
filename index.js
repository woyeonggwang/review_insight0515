const express = require('express');
const cors = require('cors');
const path = require('path');
const analyzeSentiment = require('./api/analyze');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 정적 파일 제공 (public 폴더 내의 index.html, css, js 등)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * API 라우트 설정
 * Vercel 환경에서는 api/*.js가 자동으로 라우팅되지만, 
 * 로컬 테스트를 위해 express 서버에서 직접 연결합니다.
 */
app.post('/api/analyze', analyzeSentiment);

// 메인 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`
  🚀 AI Sentiment Analyzer 서버가 시작되었습니다!
  🔗 접속 주소: http://localhost:${PORT}
  
  -- 서버가 정상 작동하려면 .env 파일에 다음 값이 설정되어야 합니다:
     1. OPENAI_API_KEY
     2. SUPABASE_URL
     3. SUPABASE_SERVICE_ROLE_KEY
  `);
});
