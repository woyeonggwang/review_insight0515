const { OpenAI } = require('openai');
const { supabase } = require('../lib/supabase');
const crypto = require('crypto');
require('dotenv').config();

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 암호화 설정 (Rule 8: 보안 및 암호화 준수)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_characters_!!'; // 32자 권장
const IV_LENGTH = 16; // AES용 IV 길이

/**
 * 데이터를 암호화하는 함수
 * @param {string} text 암호화할 문자열
 * @returns {string} 암호화된 데이터 (iv:encryptedData 형식)
 */
function encrypt(text) {
  if (!text) return text;
  
  // SHA-256을 사용하여 어떤 길이의 키가 들어와도 항상 32바이트 키를 생성합니다. (Rule 8 보안 강화)
  const hashedKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', hashedKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * 감성 분석 API 핸들러
 * OpenAI로 분석하고, 보안을 위해 원문을 암호화하여 Supabase에 저장합니다.
 */
async function analyzeSentiment(req, res) {
  try {
    const { text } = req.body;

    // 1. 입력값 검증
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "분석할 텍스트를 입력해주세요." });
    }

    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: "텍스트는 최대 1,000자까지 입력할 수 있습니다." });
    }

    // 2. OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 한국어 텍스트의 감성을 분석하는 AI입니다. 반드시 JSON 형식으로 응답하세요. {sentiment: 'positive'|'negative'|'neutral', confidence: 0-100, reason: '2~3문장'}"
        },
        {
          role: "user",
          content: `다음 텍스트를 분석하세요: ${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(response.choices[0].message.content);
    
    const sentimentLabelMap = { positive: "긍정", negative: "부정", neutral: "중립" };
    const resultData = {
      sentiment: aiResponse.sentiment,
      sentimentLabel: sentimentLabelMap[aiResponse.sentiment] || "알 수 없음",
      confidence: aiResponse.confidence,
      reason: aiResponse.reason
    };

    // 3. Supabase에 분석 결과 저장 (사용자 요청에 따라 원문 그대로 저장)
    supabase.from('sentiment_analyses').insert({
      input_text: text, // 암호화 없이 원문을 그대로 저장합니다.
      sentiment: resultData.sentiment,
      sentiment_label: resultData.sentimentLabel,
      confidence: resultData.confidence,
      reason: resultData.reason
    }).then(({ error }) => {
      if (error) console.error('❌ 저장 실패:', error.message);
      else console.log('✅ 원문 텍스트가 DB에 저장되었습니다.');
    });

    return res.status(200).json({ success: true, data: resultData });

  } catch (error) {
    console.error("❌ 서버 오류:", error);

    // OpenAI API 인증 관련 오류 처리 (API 키 누락/오류)
    if (error.code === 'invalid_api_key' || (error.message && error.message.includes("API key"))) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API 키가 올바르지 않거나 설정되지 않았습니다. .env 파일을 확인해 주세요."
      });
    }

    return res.status(500).json({
      success: false,
      message: "감성 분석 중 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    });
  }
}

module.exports = analyzeSentiment;
