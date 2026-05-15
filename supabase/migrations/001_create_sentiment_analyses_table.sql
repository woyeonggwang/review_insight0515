-- 001_create_sentiment_analyses_table.sql
-- 사용자의 감성 분석 결과를 저장하기 위한 테이블 생성

CREATE TABLE IF NOT EXISTS sentiment_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_label text NOT NULL CHECK (sentiment_label IN ('긍정', '부정', '중립')),
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 생성일시 기준 인덱스 (최신순 조회를 위해)
CREATE INDEX IF NOT EXISTS sentiment_analyses_created_at_idx ON sentiment_analyses (created_at DESC);

-- 감성 유형별 인덱스
CREATE INDEX IF NOT EXISTS sentiment_analyses_sentiment_idx ON sentiment_analyses (sentiment);
