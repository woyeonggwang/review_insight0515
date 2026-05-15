/**
 * AI Sentiment Analyzer - Frontend Logic
 * 사용자의 입력을 처리하고, API를 호출하며, 결과를 모달로 표시합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 요소 선택 ---
    const textarea = document.querySelector("#sentimentText");
    const analyzeButton = document.querySelector("#analyzeButton");
    const charCountDisplay = document.querySelector("#charCount");
    const errorMessage = document.querySelector("#errorMessage");

    const modalBackdrop = document.querySelector("#resultModalBackdrop");
    const modal = document.querySelector("#resultModal");
    const modalCloseButton = document.querySelector("#modalCloseButton");
    const modalConfirmButton = document.querySelector("#modalConfirmButton");

    const resultLabel = document.querySelector("#resultLabel");
    const resultConfidence = document.querySelector("#resultConfidence");
    const resultReason = document.querySelector("#resultReason");

    // 감성별 색상 매핑 (디자인 시스템 기준)
    const sentimentColors = {
        positive: "#00754A", // 긍정: 스타벅스 그린 계열
        negative: "#c82014", // 부정: 레드 계열
        neutral: "rgba(0,0,0,0.58)" // 중립: 그레이 계열
    };

    // --- 기능 1: 글자 수 체크 인터랙션 ---
    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        charCountDisplay.textContent = `${length.toLocaleString()} / 1,000`;
        
        // 1,000자 초과 시 시각적 경고
        if (length > 1000) {
            charCountDisplay.style.color = "var(--color-error)";
        } else {
            charCountDisplay.style.color = "var(--color-text-sub)";
        }

        // 입력 시 기존 에러 메시지 숨김
        if (length > 0) {
            errorMessage.style.display = "none";
        }
    });

    // --- 기능 2: 모달 제어 로직 ---
    
    // 모달 열기
    function showModal(data) {
        // 데이터 바인딩
        resultLabel.textContent = data.sentimentLabel || "분석 불가";
        resultConfidence.textContent = `신뢰도 ${data.confidence}%`;
        resultReason.textContent = data.reason;

        // 감성별 색상 적용
        const color = sentimentColors[data.sentiment] || sentimentColors.neutral;
        resultLabel.style.color = color;

        // 모달 표시 (CSS transition 활용)
        modalBackdrop.classList.add('show');
    }

    // 모달 닫기
    function closeModal() {
        modalBackdrop.classList.remove('show');
    }

    // 이벤트 바인딩: 닫기/확인 버튼
    modalCloseButton.addEventListener('click', closeModal);
    modalConfirmButton.addEventListener('click', closeModal);

    // 이벤트 바인딩: 바깥 영역 클릭 시 닫기
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModal();
        }
    });

    // 이벤트 바인딩: ESC 키 입력 시 닫기
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('show')) {
            closeModal();
        }
    });

    // --- 기능 3: API 호출 및 상태 관리 ---

    async function handleAnalyze() {
        const text = textarea.value.trim();

        // [검증] 빈 값 체크
        if (!text) {
            errorMessage.textContent = "분석할 텍스트를 입력해주세요.";
            errorMessage.style.display = "block";
            textarea.focus();
            return;
        }

        // [검증] 글자 수 체크
        if (text.length > 1000) {
            errorMessage.textContent = "텍스트는 최대 1,000자까지 입력할 수 있습니다.";
            errorMessage.style.display = "block";
            return;
        }

        // --- 로딩 상태 시작 ---
        analyzeButton.disabled = true;
        analyzeButton.textContent = "분석 중...";
        errorMessage.style.display = "none";

        try {
            // 실제 API 호출 (백엔드 구현 전까지는 서버 에러가 날 수 있음)
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "감성 분석 중 문제가 발생했습니다.");
            }

            // 분석 결과 모달 표시
            showModal(result.data);

        } catch (error) {
            console.error("Error:", error);
            errorMessage.textContent = error.message || "서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.";
            errorMessage.style.display = "block";
        } finally {
            // --- 로딩 상태 종료 ---
            analyzeButton.disabled = false;
            analyzeButton.textContent = "감성분석";
        }
    }

    // 분석 버튼 클릭 이벤트
    analyzeButton.addEventListener('click', handleAnalyze);
});
