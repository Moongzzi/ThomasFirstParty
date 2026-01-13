// 공통 유틸리티 함수

// JSON 파일 로드 함수
async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('JSON 로드 실패:', error);
        return null;
    }
}

// 로컬 스토리지 유틸리티
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
        }
    },
    
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('로컬 스토리지 읽기 실패:', error);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('로컬 스토리지 삭제 실패:', error);
        }
    }
};

// URL 파라미터 가져오기
function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 이미지 로드 확인
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 간단한 알림 구현 (향후 개선 가능)
    alert(message);
}

console.log('공통 스크립트 로드됨');
