# 토마스와 친구들 연초파티 기념 사이트

퀴즈, 점자 블럭 시뮬레이션, 추억 갤러리 기능을 제공하는 웹사이트입니다.

## 기능

- **메인 페이지**: 각 기능으로 이동하는 메뉴 제공
- **퀴즈 페이지**: 13개 퀴즈 목록 및 퀴즈 플레이 기능 (힌트, 정답 확인)
- **점자 블럭 시뮬레이션**: 한글을 점자 블럭으로 시각화하는 3D 시뮬레이션 (Three.js)
- **추억 갤러리**: 사진 갤러리 및 확대 보기

## 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (Vanilla)
- **3D 렌더링**: Three.js r128
- **애니메이션**: TWEEN.js
- **폰트**: Pretendard (웹폰트)
- **데이터 관리**: JSON 파일 기반
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 사용 방법

### 1. 로컬에서 실행

브라우저에서 직접 `index.html` 파일을 열거나, 로컬 서버를 실행합니다:

```bash
# Python 3
python -m http.server 8000

# 또는 Node.js를 사용하는 경우
npx serve
```

브라우저에서 `http://localhost:8000`로 접속합니다.

### 2. 이미지 파일 준비

웹사이트가 정상 작동하려면 다음 이미지들이 필요합니다:

#### 필수 리소스 이미지
- `assets/images/resources/Logo.png` (150x150px)
- `assets/images/resources/QuizIcon.png` (150x150px)
- `assets/images/resources/MemoryIcon.png` (150x150px)
- `assets/images/resources/HintIcon.png` (40x40px)
- `assets/images/resources/MainFrame_Top.png` (1920x높이 자유)
- `assets/images/resources/MainFrame_Bottom.png` (1920x높이 자유)
- `assets/images/resources/MainFrame_Left.png` (너비 자유x1080)
- `assets/images/resources/MainFrame_Right.png` (너비 자유x1080)

#### 퀴즈 이미지
- `assets/images/quiz/quiz1.png` ~ `quiz13.png` (권장: 400x400px)

#### 갤러리 사진
- `assets/images/gallery/` 폴더에 사진 추가

## 퀴즈 데이터 수정

`data/quizzes.json` 파일에서 퀴즈 내용을 수정할 수 있습니다:

```json
{
  "id": 1,
  "question": "이것은 무엇일까요?",
  "image": "images/quiz/quiz1.png",
  "answer": "정답",
  "hint1": "첫 번째 힌트",
  "hint2": "두 번째 힌트",
  "explanation": "정답 설명입니다."
}
```

## 점자 시뮬레이션 사용법

1. 시뮬레이션 페이지로 이동 (퀴즈 #13 정답 후 또는 직접 접속)
2. 입력 필드에 **한글**을 입력 (예: "라면")
3. "블럭 생성" 버튼 클릭
4. 한글이 자음/모음으로 분해되어 점자 블럭으로 쌓입니다
5. 각 층은 3초 간격으로 생성되며, 중력에 따라 쌓입니다
6. 마우스로 회전/확대/이동 가능:
   - **마우스 드래그**: 회전
   - **마우스 휠**: 확대/축소
   - **우클릭 드래그**: 이동

### 점자 블럭 규칙
- **살구색 블럭 (1x1x1)**: 점자의 돌출 부분 (점)
- **검은색 블럭 (1x1x0.5)**: 점자의 평평한 부분

## 갤러리 데이터 수정

`data/gallery.json` 파일에서 갤러리 사진을 추가/수정할 수 있습니다:

```json
{
  "id": 1,
  "title": "추억의 순간",
  "image": "assets/images/gallery/photo1.jpg",
  "date": "2026-01-12",
  "description": "사진 설명"
}
```

## 폴더 구조

```
ThomasFirst/
├── index.html                    # 메인 페이지
├── pages/                        # 서브 페이지들
│   ├── quiz.html                 # 퀴즈 목록
│   ├── quiz-play.html            # 퀴즈 플레이
│   ├── simulation.html           # 점자 시뮬레이션
│   └── gallery.html              # 갤러리
├── css/                          # 스타일시트
│   ├── common.css                # 공통 스타일
│   ├── main.css                  # 메인 페이지
│   ├── quiz.css                  # 퀴즈 페이지
│   ├── simulation.css            # 시뮬레이션 페이지
│   └── gallery.css               # 갤러리 페이지
├── js/                           # JavaScript 파일
│   ├── common.js                 # 공통 함수
│   ├── quiz.js                   # 퀴즈 로직
│   ├── simulation.js             # 시뮬레이션 로직
│   ├── hangul-parser.js          # 한글 분해 유틸리티
│   ├── hangul-braille.js         # 점자 매핑 데이터
│   └── gallery.js                # 갤러리 로직
├── data/                         # JSON 데이터
│   ├── quizzes.json              # 퀴즈 데이터
│   └── gallery.json              # 갤러리 데이터
├── assets/                       # 이미지 리소스
│   └── images/
│       ├── resources/            # UI 리소스 (로고, 아이콘, 프레임)
│       ├── quiz/                 # 퀴즈 이미지
│       └── gallery/              # 갤러리 사진
└── README.md
```

## 컬러 팔레트

- **Sky Blue**: #BCD5EB (배경)
- **Alaskan Blue**: #6FAAD2 (정답 버튼)
- **Deep Blue**: #557DBA (강조)
- **Purple**: #A4A8C3 (시뮬레이션 버튼)
- **Mint**: #5DCBC8 (힌트1, 생성 버튼)
- **Yellow**: #E3CD81 (힌트2)
- **Gray**: #A3AEA8 (보조 텍스트)
- **Ivory**: #F1F0EC (박스 배경)

## 반응형 브레이크포인트

- **1920px**: 기본 데스크톱
- **1024px**: 태블릿 가로
- **768px**: 태블릿 세로
- **480px**: 모바일

## 참고사항

- 이미지 파일은 **JPG, PNG** 형식을 권장합니다.
- 퀴즈 이미지 권장 크기: **400x400px**
- 갤러리 사진 권장 크기: **1200x900px** 이상
- JSON 파일 수정 시 형식에 주의하세요 (쉼표, 따옴표 등)
- 시뮬레이션은 **한글만** 입력 가능합니다 (자동 검증)
- 모바일에서는 터치로 3D 시뮬레이션 조작 가능

## 브라우저 호환성

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 라이선스

이 프로젝트는 개인 용도로 제작되었습니다.

## 문의

문제가 발생하거나 질문이 있으시면 프로젝트 관리자에게 연락해주세요.
