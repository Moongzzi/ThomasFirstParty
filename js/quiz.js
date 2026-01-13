// 퀴즈 관련 스크립트

let quizzesData = null;
let currentQuiz = null;

// 퀴즈 목록 페이지 초기화
function initQuizList() {
    const quizGridElement = document.getElementById('quiz-grid');
    if (!quizGridElement) return;

    // 1~13번 퀴즈 아이템 생성
    quizGridElement.innerHTML = '';
    for (let i = 1; i <= 13; i++) {
        const item = createQuizItem(i);
        quizGridElement.appendChild(item);
    }
}

// 퀴즈 아이템 생성
function createQuizItem(number) {
    const item = document.createElement('div');
    item.className = 'quiz-item common-box';
    item.onclick = () => goToQuiz(number);
    
    const span = document.createElement('span');
    span.textContent = number;
    item.appendChild(span);
    
    return item;
}

// 퀴즈 페이지로 이동
function goToQuiz(quizId) {
    window.location.href = `quiz-play.html?id=${quizId}`;
}

// 퀴즈 플레이 페이지 초기화
async function initQuizPlay() {
    const quizId = parseInt(getURLParameter('id'));
    if (!quizId) {
        alert('잘못된 퀴즈 ID입니다.');
        window.location.href = 'quiz.html';
        return;
    }

    // 퀴즈 데이터 로드
    quizzesData = await loadJSON('../data/quizzes.json');
    
    if (!quizzesData || !quizzesData.quizzes) {
        alert('퀴즈를 불러올 수 없습니다.');
        window.location.href = 'quiz.html';
        return;
    }

    // 해당 퀴즈 찾기
    currentQuiz = quizzesData.quizzes.find(q => q.id === quizId);
    
    if (!currentQuiz) {
        alert('퀴즈를 찾을 수 없습니다.');
        window.location.href = 'quiz.html';
        return;
    }

    // 퀴즈 표시
    displayQuiz(currentQuiz);
    
    // 엔터키로 정답 제출
    const answerInput = document.getElementById('answer-input');
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
}

// 퀴즈 표시
function displayQuiz(quiz) {
    document.getElementById('quiz-title').textContent = `퀴즈 ${quiz.id}. ${quiz.question}`;
    
    const quizImage = document.getElementById('quiz-image');
    quizImage.src = `../${quiz.image}`;
    quizImage.alt = `퀴즈 ${quiz.id}`;
}

// 힌트 표시
function showHint(hintNumber) {
    const hintText = hintNumber === 1 ? currentQuiz.hint1 : currentQuiz.hint2;
    document.getElementById('hint-text').textContent = hintText;
    openModal('hintModal');
}

function closeHintModal() {
    closeModal('hintModal');
}

// 정답 확인 모달 표시
function showAnswerConfirm() {
    openModal('answerConfirmModal');
}

function closeAnswerConfirmModal() {
    closeModal('answerConfirmModal');
}

// 정답 표시
function showAnswer() {
    closeAnswerConfirmModal();
    showCorrectAnswerScreen();
}

function closeAnswerModal() {
    closeModal('answerModal');
}

// 정답 화면 표시
function showCorrectAnswerScreen() {
    // 입력 영역 숨기기
    document.getElementById('answer-section').classList.add('hidden');
    
    // 정답 영역 표시
    document.getElementById('result-section').classList.remove('hidden');
    
    // 정답과 해설 내용 설정
    document.getElementById('correct-answer-text').textContent = `정답 : ${currentQuiz.answer}`;
    document.getElementById('explanation-text').textContent = currentQuiz.explanation;
    
    // 13번 퀴즈인 경우 시뮬레이션 버튼 표시
    const simulationButton = document.getElementById('simulation-button');
    if (currentQuiz.id === 13) {
        simulationButton.classList.remove('hidden');
    } else {
        simulationButton.classList.add('hidden');
    }
}

// 시뮬레이션 페이지로 이동
function goToSimulation() {
    window.location.href = '../pages/simulation.html';
}

// 오답 모달 표시
function showWrongModal() {
    openModal('wrongModal');
}

function closeWrongModal() {
    closeModal('wrongModal');
}

// 모달 열기/닫기 유틸리티
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// 답안 체크
function checkAnswer() {
    const answerInput = document.getElementById('answer-input');
    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = currentQuiz.answer.toLowerCase();
    
    if (!userAnswer) {
        alert('답을 입력해주세요.');
        return;
    }
    
    if (userAnswer === correctAnswer) {
        // 정답일 때 바로 화면 전환
        answerInput.value = '';
        showCorrectAnswerScreen();
    } else {
        // 오답 모달 표시
        showWrongModal();
        answerInput.value = '';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('quiz.html')) {
        initQuizList();
    } else if (path.includes('quiz-play.html')) {
        initQuizPlay();
    }
});

console.log('퀴즈 스크립트 로드됨');
