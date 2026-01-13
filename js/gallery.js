/**
 * 추억 갤러리 - 캐러셀 스크립트
 */

// === 전역 변수 ===
let photos = [];              // 전체 사진 배열
let currentIndex = 0;         // 현재 중앙에 표시되는 사진 인덱스
let autoPlayInterval = null;  // 자동 재생 타이머
let isAutoPlaying = true;     // 자동 재생 상태
const AUTO_PLAY_DELAY = 5000; // 5초
let convertedImageCache = {}; // HEIC 변환 이미지 캐시

// === HEIC 파일 여부 확인 ===
function isHEIC(filename) {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.heic') || filename.toLowerCase().endsWith('.heif');
}

// === HEIC를 JPEG로 변환 ===
async function convertHEICtoJPEG(imagePath) {
    // 캐시 확인
    if (convertedImageCache[imagePath]) {
        console.log('캐시에서 로드:', imagePath);
        return convertedImageCache[imagePath];
    }

    try {
        console.log('HEIC 변환 시작:', imagePath);
        
        // HEIC 파일을 fetch로 가져오기
        const response = await fetch(`../${imagePath}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        console.log('HEIC 파일 로드 완료, 크기:', blob.size, 'bytes');

        // heic2any로 변환 (JPEG로)
        let convertedBlob = await heic2any({
            blob: blob,
            toType: 'image/jpeg',
            quality: 0.9
        });

        // heic2any가 배열을 반환할 수 있으므로 첫 번째 요소 사용
        if (Array.isArray(convertedBlob)) {
            convertedBlob = convertedBlob[0];
        }

        // Blob URL 생성
        const blobUrl = URL.createObjectURL(convertedBlob);
        console.log('HEIC 변환 완료:', imagePath, '→', blobUrl);
        
        // 캐시에 저장
        convertedImageCache[imagePath] = blobUrl;
        
        return blobUrl;
    } catch (error) {
        console.error('HEIC 변환 실패:', imagePath, error);
        // 변환 실패 시 원본 경로 반환 (브라우저가 지원하면 표시됨)
        return `../${imagePath}`;
    }
}

// === 이미지 경로 처리 (HEIC 변환 포함) ===
async function getImageSrc(imagePath) {
    if (isHEIC(imagePath)) {
        return await convertHEICtoJPEG(imagePath);
    }
    return `../${imagePath}`;
}

// === 순환 인덱스 계산 ===
function getCircularIndex(index, arrayLength) {
    if (arrayLength === 0) return 0;
    if (index < 0) return arrayLength + (index % arrayLength);
    return index % arrayLength;
}

// === 갤러리 데이터 로드 ===
async function loadGalleryData() {
    try {
        const data = await loadJSON('../data/gallery.json');
        if (data && data.photos && data.photos.length > 0) {
            photos = data.photos;
            return true;
        }
        console.error('갤러리 데이터가 비어있습니다.');
        return false;
    } catch (error) {
        console.error('갤러리 데이터 로드 실패:', error);
        return false;
    }
}

// === 이미지 업데이트 ===
async function updateCarouselImages(direction = 'next') {
    if (photos.length === 0) return;

    const leftIndex = getCircularIndex(currentIndex - 1, photos.length);
    const centerIndex = currentIndex;
    const rightIndex = getCircularIndex(currentIndex + 1, photos.length);

    const leftImage = document.getElementById('left-image');
    const centerImage = document.getElementById('center-image');
    const rightImage = document.getElementById('right-image');

    // 중앙 이미지 전환 애니메이션
    if (centerImage) {
        // 이전 애니메이션 클래스 제거
        centerImage.classList.remove('slide-in-right', 'slide-in-left', 'fade-out');
        
        // 페이드 아웃
        centerImage.classList.add('fade-out');
        
        // 이미지 소스 미리 로드
        const centerSrc = await getImageSrc(photos[centerIndex].image);
        
        // 페이드 아웃 후 이미지 변경 및 페이드 인
        setTimeout(() => {
            centerImage.src = centerSrc;
            centerImage.classList.remove('fade-out');
            
            // 방향에 따라 슬라이드 인 애니메이션
            if (direction === 'next') {
                centerImage.classList.add('slide-in-left');
            } else if (direction === 'prev') {
                centerImage.classList.add('slide-in-right');
            }
            
            // 애니메이션 종료 후 클래스 제거
            setTimeout(() => {
                centerImage.classList.remove('slide-in-left', 'slide-in-right');
            }, 500);
        }, 300);
    }

    // 좌우 이미지는 부드럽게 전환 (HEIC 변환 포함)
    if (leftImage) {
        const leftSrc = await getImageSrc(photos[leftIndex].image);
        leftImage.style.opacity = '0';
        setTimeout(() => {
            leftImage.src = leftSrc;
            leftImage.style.opacity = '1';
        }, 100);
    }
    if (rightImage) {
        const rightSrc = await getImageSrc(photos[rightIndex].image);
        rightImage.style.opacity = '0';
        setTimeout(() => {
            rightImage.src = rightSrc;
            rightImage.style.opacity = '1';
        }, 100);
    }

    // 페이지네이션 업데이트
    updatePaginationDots();
}

// === Dot 페이지네이션 생성 ===
function createPaginationDots() {
    const container = document.getElementById('pagination-dots');
    if (!container) return;

    container.innerHTML = '';

    photos.forEach((photo, index) => {
        const dot = document.createElement('span');
        dot.className = 'pagination-dot';
        if (index === currentIndex) {
            dot.classList.add('active');
        }
        dot.onclick = () => goToSlide(index);
        container.appendChild(dot);
    });
}

// === Dot 페이지네이션 업데이트 ===
function updatePaginationDots() {
    const dots = document.querySelectorAll('.pagination-dot');
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// === 특정 슬라이드로 이동 ===
function goToSlide(index) {
    const previousIndex = currentIndex;
    currentIndex = getCircularIndex(index, photos.length);
    
    // 이동 방향 결정
    const direction = index > previousIndex ? 'next' : 'prev';
    updateCarouselImages(direction);
    resetAutoPlay();
}

// === 다음 슬라이드로 이동 ===
function moveToNext() {
    currentIndex = getCircularIndex(currentIndex + 1, photos.length);
    updateCarouselImages('next');
    resetAutoPlay();
}

// === 이전 슬라이드로 이동 ===
function moveToPrev() {
    currentIndex = getCircularIndex(currentIndex - 1, photos.length);
    updateCarouselImages('prev');
    resetAutoPlay();
}

// === 자동 재생 시작 ===
function startAutoPlay() {
    if (!isAutoPlaying) return;
    
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
        moveToNext();
    }, AUTO_PLAY_DELAY);
}

// === 자동 재생 정지 ===
function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// === 자동 재생 재시작 (클릭 시 타이머 리셋) ===
function resetAutoPlay() {
    if (isAutoPlaying) {
        startAutoPlay();
    }
}

// === 자동 재생 토글 ===
function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    
    if (isAutoPlaying) {
        // 재생 중 → 일시정지 아이콘 표시
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (playIcon) playIcon.classList.add('hidden');
        startAutoPlay();
    } else {
        // 일시정지 중 → 재생 아이콘 표시
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
        stopAutoPlay();
    }
}

// === 홈으로 이동 ===
function goHome() {
    window.location.href = '../index.html';
}

// === 이미지 전체보기 모달 열기 ===
function openImageModal() {
    const centerImage = document.getElementById('center-image');
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    
    if (centerImage && modal && modalImage) {
        modalImage.src = centerImage.src;
        modal.classList.remove('hidden');
        
        // 자동 재생 일시 정지
        if (isAutoPlaying) {
            stopAutoPlay();
        }
    }
}

// === 이미지 전체보기 모달 닫기 ===
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    
    if (modal) {
        modal.classList.add('hidden');
        
        // 자동 재생 재개
        if (isAutoPlaying) {
            startAutoPlay();
        }
    }
}

// === 갤러리 초기화 ===
async function initGallery() {
    console.log('갤러리 초기화 시작');

    // 데이터 로드
    const success = await loadGalleryData();
    if (!success) {
        console.error('갤러리 데이터 로드 실패');
        return;
    }

    // 초기 이미지 설정 (애니메이션 없이, HEIC 변환 포함)
    if (photos.length > 0) {
        const leftIndex = getCircularIndex(currentIndex - 1, photos.length);
        const centerIndex = currentIndex;
        const rightIndex = getCircularIndex(currentIndex + 1, photos.length);

        const leftImage = document.getElementById('left-image');
        const centerImage = document.getElementById('center-image');
        const rightImage = document.getElementById('right-image');

        if (leftImage) leftImage.src = await getImageSrc(photos[leftIndex].image);
        if (centerImage) centerImage.src = await getImageSrc(photos[centerIndex].image);
        if (rightImage) rightImage.src = await getImageSrc(photos[rightIndex].image);
    }

    // Dot 페이지네이션 생성
    createPaginationDots();

    // 중앙 이미지 클릭 이벤트 추가
    const centerImage = document.getElementById('center-image');
    if (centerImage) {
        centerImage.style.cursor = 'pointer';
        centerImage.addEventListener('click', openImageModal);
    }

    // 자동 재생 시작
    startAutoPlay();

    console.log('갤러리 초기화 완료');
}

// === 페이지 로드 시 실행 ===
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('gallery.html')) {
        return;
    }

    initGallery();
});
