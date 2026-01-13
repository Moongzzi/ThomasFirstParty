/**
 * 점자 블럭 시뮬레이션 스크립트
 * Three.js + OrbitControls + TWEEN.js 기반
 */

// === 전역 변수 ===
let scene, camera, renderer, controls;
let layers = []; // 생성된 층들의 배열
let isAnimating = false; // 애니메이션 진행 중 플래그

// 블록 크기 상수
const BLOCK_SIZE = 1.0;
const BLOCK_SPACING = 1.2;
const LAYER_SPACING_X = 2.5;

// 블록 색상
const COLOR_HIGH = 0xFFCBA4; // 살구색 (1x1x1 높은 블록)
const COLOR_LOW = 0x333333;  // 검은색 (1x1x0.5 낮은 블록)

// === Three.js 초기화 ===
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('캔버스 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // 씬 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xE8F4F8); // 밝은 하늘색 배경

    // 카메라 생성
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 3, 0);

    // 렌더러 생성
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // OrbitControls 설정
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // 조명 추가
    addLights();

    // 바닥 추가
    addFloor();

    // 윈도우 리사이즈 핸들러
    window.addEventListener('resize', onWindowResize);

    // 애니메이션 루프 시작
    animate();

    console.log('Three.js 초기화 완료');
}

// === 조명 설정 ===
function addLights() {
    // 환경광
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 주 조명 (태양광)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 보조 조명 (채우기 광)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
}

// === 바닥 생성 ===
function addFloor() {
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // 그리드 헬퍼 (선택사항)
    const gridHelper = new THREE.GridHelper(100, 50, 0x999999, 0xCCCCCC);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
}

// === 애니메이션 루프 ===
function animate() {
    requestAnimationFrame(animate);
    
    // TWEEN 업데이트
    if (typeof TWEEN !== 'undefined') {
        TWEEN.update();
    }
    
    // OrbitControls 업데이트
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// === 윈도우 리사이즈 핸들러 ===
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// === 점자 층(Layer) 생성 ===
// === 점자 층(Layer) 생성 ===
/**
 * 점자 셀 구조:
 * [1] [4]   인덱스: [0] [3]
 * [2] [5]           [1] [4]
 * [3] [6]           [2] [5]
 */
function createBrailleLayer(jamo, layerIndex) {
    const pattern = getBraillePattern(jamo);
    
    if (!pattern) {
        console.warn(`점자 패턴을 찾을 수 없습니다: ${jamo}`);
        return null;
    }

    const layer = {
        jamo: jamo,
        pattern: pattern,
        blocks: [],
        index: layerIndex,
        xPosition: 0  // 모든 층을 같은 X 위치에 배치
    };

    // 2x3 점자 셀 생성 (col: 0-1, row: 0-2)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
            const patternIndex = row * 2 + col; // 0,1,2,3,4,5
            const isDot = pattern[patternIndex] === 1;
            
            // 높이와 색상 결정
            const blockHeight = isDot ? BLOCK_SIZE : BLOCK_SIZE * 0.5;
            const blockColor = isDot ? COLOR_HIGH : COLOR_LOW;

            // 블록 생성
            const geometry = new THREE.BoxGeometry(
                BLOCK_SIZE,
                blockHeight,
                BLOCK_SIZE
            );
            const material = new THREE.MeshStandardMaterial({
                color: blockColor,
                roughness: 0.7,
                metalness: 0.2
            });
            const block = new THREE.Mesh(geometry, material);

            // 위치 설정 (시작은 Y=20에서, 중앙에 배치)
            block.position.x = layer.xPosition + (col * BLOCK_SPACING) - (BLOCK_SPACING / 2);
            block.position.y = 20 + (blockHeight / 2); // 시작 높이
            block.position.z = (row * BLOCK_SPACING) - BLOCK_SPACING;

            // 그림자 설정
            block.castShadow = true;
            block.receiveShadow = true;

            // 메타데이터 저장
            block.userData = {
                jamo: jamo,
                layerIndex: layerIndex,
                isDot: isDot,
                originalHeight: blockHeight
            };

            scene.add(block);
            layer.blocks.push(block);
        }
    }

    return layer;
    return layer;
}

// === 특정 X,Z 위치에서 아래 블록들의 최대 높이 찾기 ===
function getMaxHeightAtPosition(x, z, upToLayerIndex) {
    let maxTopY = 0;
    
    // 이전 층들을 순회
    for (let i = 0; i < upToLayerIndex; i++) {
        if (layers[i] && layers[i].blocks.length > 0) {
            // 같은 X, Z 위치의 블록 찾기
            layers[i].blocks.forEach(block => {
                const blockX = Math.round(block.position.x * 10) / 10;
                const blockZ = Math.round(block.position.z * 10) / 10;
                const targetX = Math.round(x * 10) / 10;
                const targetZ = Math.round(z * 10) / 10;
                
                // 같은 위치의 블록이면 상단 Y 좌표 계산
                if (Math.abs(blockX - targetX) < 0.1 && Math.abs(blockZ - targetZ) < 0.1) {
                    const blockTopY = block.position.y + (block.userData.originalHeight / 2);
                    if (blockTopY > maxTopY) {
                        maxTopY = blockTopY;
                    }
                }
            });
        }
    }
    
    return maxTopY;
}

// === 층 낙하 애니메이션 (각 블록이 개별 높이로 착지) ===
function animateLayerDrop(layer, duration = 3000) {
    return new Promise((resolve) => {
        if (layer.blocks.length === 0) {
            resolve();
            return;
        }

        // 각 블록의 시작 위치와 목표 위치 계산
        const blockTargets = layer.blocks.map(block => {
            const blockX = block.position.x;
            const blockZ = block.position.z;
            const blockHeight = block.userData.originalHeight;
            
            // 이 블록 아래에 있는 블록들의 최대 높이 찾기
            const baseHeight = getMaxHeightAtPosition(blockX, blockZ, layer.index);
            
            return {
                startY: block.position.y,
                targetY: baseHeight + (blockHeight / 2) // 블록 중심 위치
            };
        });

        const progress = { value: 0 };

        const tween = new TWEEN.Tween(progress)
            .to({ value: 1 }, duration)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                layer.blocks.forEach((block, index) => {
                    const target = blockTargets[index];
                    block.position.y = target.startY + (target.targetY - target.startY) * progress.value;
                });
            })
            .onComplete(() => {
                resolve();
            })
            .start();
    });
}

// === 전체 시뮬레이션 생성 ===
async function generateSimulation(jamoArray) {
    if (isAnimating) {
        console.log('애니메이션이 이미 진행 중입니다.');
        return;
    }

    isAnimating = true;
    clearAllLayers();

    console.log('시뮬레이션 시작:', jamoArray);

    // 각 자모에 대해 순차적으로 층 생성 및 낙하
    for (let i = 0; i < jamoArray.length; i++) {
        const jamo = jamoArray[i];
        
        // 층 생성
        const layer = createBrailleLayer(jamo, i);
        if (!layer) continue;
        
        layers.push(layer);

        // 낙하 애니메이션 (각 블록이 개별적으로 아래 블록 위에 착지)
        await animateLayerDrop(layer, 3000);

        console.log(`층 ${i + 1}/${jamoArray.length} 생성 완료: ${jamo}`);
    }

    isAnimating = false;
    console.log('시뮬레이션 완료');
}

// === 모든 층 제거 ===
function clearAllLayers() {
    layers.forEach(layer => {
        layer.blocks.forEach(block => {
            scene.remove(block);
            block.geometry.dispose();
            block.material.dispose();
        });
    });
    layers = [];
}

// === UI 이벤트 핸들러 ===

// 홈으로 이동
function goHome() {
    window.location.href = '../index.html';
}

// 모달 열기
function showModal(message) {
    const overlay = document.getElementById('modal-overlay');
    const messageElement = document.getElementById('modal-message');
    
    if (overlay && messageElement) {
        messageElement.textContent = message;
        overlay.classList.remove('hidden');
    }
}

// 모달 닫기
function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// 블럭 생성 버튼 클릭
function handleGenerateClick() {
    const textInput = document.getElementById('text-input');
    const text = textInput ? textInput.value : '';

    // 입력 검증 및 분해
    const result = validateAndDecompose(text);

    if (!result.valid) {
        showModal(result.error);
        return;
    }

    // 시뮬레이션 생성
    generateSimulation(result.jamoArray);
}

// === 페이지 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    // simulation.html에서만 실행
    if (!window.location.pathname.includes('simulation.html')) {
        return;
    }

    console.log('시뮬레이션 페이지 로드');

    // Three.js 초기화
    initThreeJS();

    // 이벤트 리스너 등록
    const generateBtn = document.getElementById('generate-btn');
    const textInput = document.getElementById('text-input');

    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateClick);
    }

    if (textInput) {
        // 엔터 키로 생성
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleGenerateClick();
            }
        });
    }

    console.log('이벤트 리스너 등록 완료');
});

console.log('시뮬레이션 스크립트 로드됨');
