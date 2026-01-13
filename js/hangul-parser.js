/**
 * 한글 유니코드 분해 유틸리티
 * 한글 완성형 문자를 초성, 중성, 종성으로 분해
 */

// 한글 유니코드 범위: 0xAC00 ~ 0xD7A3
const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;

// 초성 19개
const CHOSUNG_LIST = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
    'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 중성 21개
const JUNGSUNG_LIST = [
    'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
    'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

// 종성 28개 (첫 번째는 받침 없음)
const JONGSUNG_LIST = [
    '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
    'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ',
    'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 복합 종성을 단일 자음으로 분해
const JONGSUNG_DECOMPOSE = {
    'ㄳ': ['ㄱ', 'ㅅ'],
    'ㄵ': ['ㄴ', 'ㅈ'],
    'ㄶ': ['ㄴ', 'ㅎ'],
    'ㄺ': ['ㄹ', 'ㄱ'],
    'ㄻ': ['ㄹ', 'ㅁ'],
    'ㄼ': ['ㄹ', 'ㅂ'],
    'ㄽ': ['ㄹ', 'ㅅ'],
    'ㄾ': ['ㄹ', 'ㅌ'],
    'ㄿ': ['ㄹ', 'ㅍ'],
    'ㅀ': ['ㄹ', 'ㅎ'],
    'ㅄ': ['ㅂ', 'ㅅ']
};

/**
 * 문자가 한글인지 확인
 * @param {string} char - 단일 문자
 * @returns {boolean}
 */
function isHangul(char) {
    if (!char || char.length !== 1) return false;
    const code = char.charCodeAt(0);
    return code >= HANGUL_START && code <= HANGUL_END;
}

/**
 * 문자가 한글 자모인지 확인
 * @param {string} char - 단일 문자
 * @returns {boolean}
 */
function isJamo(char) {
    if (!char || char.length !== 1) return false;
    return CHOSUNG_LIST.includes(char) || JUNGSUNG_LIST.includes(char);
}

/**
 * 한글 문자 하나를 초성, 중성, 종성으로 분해
 * @param {string} char - 한글 문자 하나 ('가', '한' 등)
 * @returns {object} {chosung, jungsung, jongsung}
 */
function decomposeChar(char) {
    if (!isHangul(char)) {
        console.warn(`한글이 아닌 문자: ${char}`);
        return null;
    }

    const code = char.charCodeAt(0) - HANGUL_START;
    
    const chosungIndex = Math.floor(code / 588);
    const jungsungIndex = Math.floor((code % 588) / 28);
    const jongsungIndex = code % 28;

    return {
        chosung: CHOSUNG_LIST[chosungIndex],
        jungsung: JUNGSUNG_LIST[jungsungIndex],
        jongsung: JONGSUNG_LIST[jongsungIndex]
    };
}

/**
 * 한글 문자열을 자음/모음 배열로 완전히 분해
 * @param {string} text - 한글 문자열 ('라면', '한글' 등)
 * @returns {string[]} 자음/모음 배열 (['ㄹ', 'ㅏ', 'ㅁ', 'ㅕ', 'ㄴ'])
 */
function decomposeHangul(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const result = [];
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // 공백은 건너뛰기
        if (char === ' ') {
            continue;
        }
        
        // 이미 자모인 경우
        if (isJamo(char)) {
            result.push(char);
            continue;
        }
        
        // 한글 완성형 분해
        if (isHangul(char)) {
            const decomposed = decomposeChar(char);
            if (decomposed) {
                result.push(decomposed.chosung);
                result.push(decomposed.jungsung);
                
                // 종성이 있는 경우
                if (decomposed.jongsung) {
                    // 복합 종성은 분해
                    if (JONGSUNG_DECOMPOSE[decomposed.jongsung]) {
                        result.push(...JONGSUNG_DECOMPOSE[decomposed.jongsung]);
                    } else {
                        result.push(decomposed.jongsung);
                    }
                }
            }
        } else {
            console.warn(`처리할 수 없는 문자: ${char}`);
        }
    }
    
    return result;
}

/**
 * 문자열이 한글만 포함하는지 검증
 * @param {string} text - 검증할 문자열
 * @returns {boolean}
 */
function isOnlyHangul(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    
    // 한글 완성형(가-힣)과 자모(ㄱ-ㅎ, ㅏ-ㅣ), 공백만 허용
    const hangulRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣ\s]+$/;
    return hangulRegex.test(text);
}

/**
 * 문자열 검증 및 분해 (한 번에 처리)
 * @param {string} text - 입력 문자열
 * @returns {object} {valid: boolean, jamoArray: string[], error: string}
 */
function validateAndDecompose(text) {
    // 빈 문자열 체크
    if (!text || text.trim() === '') {
        return {
            valid: false,
            jamoArray: [],
            error: '생성할 블럭이 없습니다.'
        };
    }
    
    // 한글만 포함 체크
    if (!isOnlyHangul(text)) {
        return {
            valid: false,
            jamoArray: [],
            error: '한글만 입력 가능합니다.'
        };
    }
    
    // 분해
    const jamoArray = decomposeHangul(text);
    
    if (jamoArray.length === 0) {
        return {
            valid: false,
            jamoArray: [],
            error: '생성할 블럭이 없습니다.'
        };
    }
    
    return {
        valid: true,
        jamoArray: jamoArray,
        error: null
    };
}
