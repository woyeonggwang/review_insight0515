const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 환경변수에서 Supabase 설정 정보를 가져옵니다.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

// Supabase 클라이언트 초기화
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };
