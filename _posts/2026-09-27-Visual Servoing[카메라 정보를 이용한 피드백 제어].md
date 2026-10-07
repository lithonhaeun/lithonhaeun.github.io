---
title : 피지컬 AI 개론 [Visual Servoing]
categories: [major, Physical AI]
description: Visual Servoing 개요부터 IBVS, PBVS, Hybrid VS까지
math: true
---
# Visual Servoing 들어가기

피지컬 AI 개론 1주차 주제는 Visual Servoing(VS)이다.
카메라로 본 정보를 이용해 로봇을 원하는 위치로 움직이는 방법으로, 
"보면서 움직이는" 로봇 제어의 가장 기본이 되는 개념이다.
식이 많이 나오는데, 결과만 외우지 않고 왜 그런 식이 나오는지 한 줄씩 따라가며 정리한다.

---
> ### 목차 
> 1. Visual Servoing 개요
   VS가 무엇이고 왜 필요한지, PBVS와 IBVS는 어떻게 다른지 살펴본다.
> 2. VS 제어 법칙 유도 3단계
   모든 VS 제어 법칙의 공통 틀인 v = −λL⁺e가 어떻게 나오는지 유도한다.
> 3. 카메라 투영 모델
   3D 공간의 점이 영상의 픽셀이 되기까지의 과정을 행렬식으로 정리한다.
> 4. 상호작용 행렬 유도
   IBVS의 핵심인 상호작용 행렬 L을 투영식 미분으로 직접 구한다.
> 5. 상호작용 행렬 근사와 안정성
   깊이 Z를 모를 때 L을 어떻게 근사하는지, 그리고 정말 수렴하는지 Lyapunov로 확인한다.
> 6. IBVS의 변형
   스테레오 카메라, 원통좌표, 직접 추정(Broyden) 방식을 알아본다.
> 7. PBVS와 고급 방식
   PBVS, Hybrid(2½D) VS, Partitioned VS를 비교한다.
> 8. 실전 고려사항과 응용 예시
   점이 몇 개 필요한지, 실제로 어디에 쓰이는지 정리한다.

---
## 1. Visual Servoing 개요

### ①Visual Servoing의 정의

> 핵심
> 
> VS는 카메라에서 얻은 정보를 제어 루프 안에 직접 넣어 로봇을 움직이는 폐루프 제어이다.

강의는 네 가지 질문으로 시작한다. 
Visual servoing이란 무엇인가, 왜 필요한가, 어떻게 만드는가, 무엇을 할 수 있는가.

슬라이드는 같은 개념을 세 문장으로 정의한다.

- "VS is the use of computer vision data in the servo loop that controls the motion of a robot."
  - VS는 로봇의 움직임을 제어하는 서보 루프 안에서 컴퓨터 비전 데이터를 사용하는 것이다.
- "VS is the action taken by a vision-based control."
  - VS는 비전 기반 제어가 취하는 행동이다.
- "VS is the way to provide a control algorithm with visual feedback to reach a desired target."
  - VS는 원하는 목표에 도달하도록 제어 알고리즘에 시각적 피드백을 제공하는 방법이다.

세 정의의 공통점은 "카메라 정보가 제어 루프 안에 들어간다"는 점이다.
여기서 servo는 측정값을 계속 되먹임해서 목표와의 차이를 줄이는 폐루프 제어를 뜻한다.

그래서 VS는 "사진을 한 번 찍고 → 물체 위치를 계산하고 → 그 위치로 팔을 보내는" 개루프(look-then-move) 방식과 다르다.<br>
매 순간 새 영상을 보고, 오차를 다시 계산하고, 속도 명령을 다시 낸다.

**왜 필요할까?**

개루프 방식은 카메라 캘리브레이션, 로봇 기구학, 물체 위치 추정 중 하나만 틀려도 최종 위치가 틀어진다.<br>
반면 피드백 루프는 "지금 보이는 영상"과 "보여야 하는 영상"의 차이를 직접 줄이기 때문에, 모델에 오차가 있어도 결국 목표에 수렴할 수 있다.<br>
이 <mark class="pink">강건성(robustness)</mark>이 VS를 쓰는 가장 큰 이유이다.

### ②블록선도 (VS control architecture)

<!-- ![](/assets/img/블록선도-캡처.png) -->

VS의 구조는 일반적인 폐루프 제어와 같다. 
다른 점은 센서가 카메라이고, 피드백 경로에 영상 처리 블록이 들어간다는 것뿐이다.

1. reference(목표)와 measurement(측정)를 비교기에서 빼서 error(오차)를 만든다.
2. VS Control 블록이 오차를 받아 commands(명령)를 만든다.
3. 명령을 받은 Robot & Camera가 움직이고, 그 결과로 새 image(영상)가 찍힌다.
4. Image Processing 블록이 영상에서 필요한 숫자(특징)를 뽑아 다시 measurement로 되먹인다.

즉 "영상 → 숫자 → 오차 → 속도 명령 → 움직임 → 새 영상"이 계속 도는 루프이다.

### ③PBVS vs IBVS

> 핵심
> 
> PBVS는 3D 자세를 비교하고, IBVS는 영상 위 2D 특징을 비교한다. 이 강의는 IBVS에 집중한다.

무엇을 오차로 비교하느냐에 따라 두 방식으로 나뉜다.

| 구분 | PBVS (Position-Based VS) | IBVS (Image-Based VS) |
|---|---|---|
| 비교하는 값 | 카메라의 3D 자세(pose) | 영상 위의 2D 특징 |
| 영상 처리 | 어렵다 (영상에서 자세를 복원해야 함) | 쉽다 (특징만 추출하면 됨) |
| 제어 법칙 | 비교적 쉽다 | 더 복잡하다 |
| 필요한 것 | 카메라 내부 파라미터 + 물체의 3D 모델 | 특징의 깊이 Z (근사값이라도) |

PBVS는 영상으로 3D를 추정(perception & estimation)하는 단계가 무겁고, 
IBVS는 영상 특징의 움직임을 로봇 속도와 연결하는 제어 단계가 무겁다.<br>
둘을 섞은 2.5D VS(Hybrid VS)도 있으며, 7장에서 다룬다.

블록선도의 각 신호는 다음 기호로 쓴다.

| 블록선도 신호 | 의미 | 기호 |
|---|---|---|
| reference | 원하는(목표) 시각 특징 | s\* |
| measurement | 현재 시각 특징 | s |
| error | 시각 오차 | e = s − s\* |
| commands | 속도 명령 | v = (vx, vy, vz, ωx, ωy, ωz) ∈ ℝ⁶ |

여기서 명령이 위치가 아니라 <mark class="mint">속도</mark>라는 점이 중요하다.<br>
$$v$$는 병진속도 3개 $$(v_x, v_y, v_z)$$와 회전속도 3개 $$(\omega_x, \omega_y, \omega_z)$$를 묶은 6차원 벡터로, 카메라의 twist라고 부른다.<br>
로봇 컨트롤러는 이 속도를 관절 속도로 바꿔 실행한다.

> 주의
> 
> 오차를 e = s − s\*로 "현재 − 목표" 순서로 정의한다. 
> 보통 제어 교과서의 "목표 − 현재"와 부호가 반대라서, 뒤에 나올 제어 법칙에 마이너스(−λ)가 붙는다.

### ④Visual feature란 무엇인가

> 핵심
> 
> 시각 특징은 영상이라는 거대한 숫자 덩어리를 제어에 필요한 몇 개의 숫자로 요약한 것이다.

슬라이드는 시각 특징을 네 가지 관점에서 설명한다.

- 컴퓨터 비전 관점: 광도 측정값(픽셀 밝기)과 기하학적 원시요소(점·선·원 등) 사이의 연결(link)을 세울 수 있는 픽셀 집합이다.
  - 즉 밝기 값을 기하학적 의미로 바꿔 주는 측정 모델이 필요하다.
- 데이터 압축 관점: 카메라 영상 스트림의 풍부한 정보를 요약(summarize)하려는 시도이다.
  - 요약에는 반드시 정보 손실(information loss)이 따른다.
- 로봇 제어 관점: 로봇을 제어하는 데 필요한 장면의 핵심 요지(gist)이다.
- VS 루프 관점: 찍힌 영상에서 얻은 요약 정보로, VS 루프를 닫고 원하는 로봇 거동을 얻는 데 필요한 것이다.

**예시: 빨간 물체 바라보기**

<!-- ![](/assets/img/빨간물체-캡처.png) -->

1. 카메라로 찍은 영상은 240 × 320 픽셀이다.
2. 컴퓨터 안에서는 각 픽셀이 RGB 3개 값을 가지므로 240 × 320 × 3 = 230,400개의 숫자 행렬이다.
3. 그런데 "빨간 물체를 화면 가운데 두기"에는 그 숫자가 다 필요 없다. 물체 중심의 영상 좌표 2개, 예를 들어 (134, 122)면 충분하다.

230,400개를 2개로 줄인 이 결과가 바로 시각 특징 s이다.<br>
동시에 물체의 크기·모양·색 같은 정보는 버렸으므로, 이것이 정보 손실의 구체적인 예이다.

물체 중심을 찾는 과정은 OpenCV 같은 라이브러리의 기본 연산으로 구성된다.

1. Original image: 원본 영상
2. Color filtering: 빨간색 범위의 픽셀만 남겨 이진 영상으로 만든다.
3. Smoothing: 노이즈를 줄이기 위해 블러링한다.
4. Erode & dilate: 침식으로 작은 점 노이즈를 지우고, 팽창으로 구멍을 메운다.
5. Inversion: 흑백을 반전한다.
6. Blob detection: 덩어리(blob)를 찾고 무게중심 좌표 (134, 122)를 출력한다.

특징의 종류는 점만 있는 것이 아니다. VS의 상태 변수(state variable)가 곧 시각 특징이다.

| 특징 종류 | 설명 |
|---|---|
| Points | 영상 위 점의 좌표 (가장 기본) |
| Lines | 물체의 모서리 직선 |
| Reconstructed points | 영상에서 복원한 점 |
| Contours | 물체의 외곽선 |
| Image moments | 영역의 넓이·무게중심·방향 같은 모멘트 값 |
| Pixel luminance | 픽셀 밝기 자체 (photometric VS) |

이 강의에서는 일단 가장 단순한 <mark class="mint">점(point) 특징</mark>으로 모든 것을 유도한다.<br>
다른 특징도 유도의 틀은 같고, 상호작용 행렬의 모양만 달라진다.

### ⑤Eye-to-hand vs Eye-in-hand

> 핵심
> 
> 카메라를 고정하면 eye-to-hand, 로봇 끝에 달면 eye-in-hand이다. 둘은 상호작용 행렬의 부호가 반대이다.

<!-- ![](/assets/img/eye-in-hand-캡처.png) -->

| 구성 | 카메라 | 움직이는 것 | 영상 속 점의 움직임 |
|---|---|---|---|
| Eye-to-hand (왼쪽 그림) | 고정 (fixed camera) | 로봇이 잡은 물체 (actuated target) | 물체가 왼쪽으로 가면 점도 왼쪽으로 |
| Eye-in-hand (오른쪽 그림) | 로봇 끝에 부착 (moving camera) | 카메라 자체 (actuated camera) | 카메라가 왼쪽으로 가면 점은 오른쪽으로 |

**왜 점의 움직임 방향이 반대일까?**

영상에 찍히는 것은 카메라와 물체의 상대 운동뿐이다.<br>
카메라가 왼쪽으로 움직이는 것과 물체가 오른쪽으로 움직이는 것은 영상에서 구분할 수 없다.

상대속도로 쓰면 $$v_{rel} = v_{camera} - v_{object}$$이다.<br>
그래서 같은 방향의 움직임이라도 누가 움직였느냐에 따라 부호가 뒤집힌다.

- Eye-in-hand: $$\dot{s} = L\, v_c$$ (카메라 속도가 그대로 들어감)
- Eye-to-hand: $$\dot{s} = -L\, v_o$$ (물체 속도를 카메라 좌표계로 바꾼 뒤 부호가 반대)

로봇 관절속도 $$\dot{q}$$까지 연결하면 eye-in-hand에서 다음과 같다.

$$
\dot{s} = L \; {}^{c}V_n \; J \; \dot{q} + \frac{\partial s}{\partial t}
$$

- $$J$$: 로봇 자코비안
- $${}^{c}V_n$$: 로봇 끝단 좌표계의 속도를 카메라 좌표계 속도로 바꾸는 변환
- $$\partial s / \partial t$$: 물체가 스스로 움직여서 생기는 특징 변화

이 강의는 대부분 eye-in-hand를 기준으로 유도한다.

**작동 원리 (hand-held camera)**

<!-- ![](/assets/img/working-principle-캡처.png) -->

상자를 바라보는 카메라 그림이 VS의 작동 원리를 요약한다.

- Features of interest: 상자의 꼭짓점 4개처럼, 관심 있는 물체 위의 점들
- Measured visual features s (파란 점): 현재 카메라 위치에서 그 점들이 영상에 찍힌 위치
- Desired visual features s\* (빨간 원): 카메라가 원하는 위치에 있을 때 그 점들이 찍혀야 하는 위치

카메라의 현재 자세는 물체 기준으로 $$\{{}^{c}R_o,\ {}^{c}t_o\}$$, 원하는 자세는 $$\{{}^{c^*}R_o,\ {}^{c^*}t_o\}$$이다.<br>
현재 카메라에서 본 원하는 카메라의 상대 자세를 $${}^{c}\xi_{c^*} = \{R, t\}$$라고 쓴다. R은 회전(방향), t는 병진(위치)이다.<br>
VS는 카메라를 움직여 이 상대 자세를 없애는 것이 목표이다.

### ⑥Positioning task: Cartesian task를 visual task로

> 핵심
> 
> "The cartesian task is actually translated in a visual task."
> 3D 공간에서 카메라를 옮기는 문제를 2D 영상 위의 점을 맞추는 문제로 바꿔서 푼다.

<!-- ![](/assets/img/positioning-task-캡처.png) -->

1. 처음에는 영상 위 현재 점 s(파란 점)와 목표 점 s\*(빨간 원)가 어긋나 있다. 오차 e ≠ 0이다.
2. 제어기가 카메라 속도 v를 계산해 카메라를 움직인다.
3. 카메라가 움직이면 영상이 바뀌고, 새 s로 다시 오차를 계산한다.
4. 파란 점이 빨간 원에 정확히 겹치면 e = 0이 된다. 이때 카메라는 원하는 3D 자세에 도달해 있다.

3D 관점에서 원하는 것은 현재 카메라와 목표 카메라의 상대 자세가 "차이 없음"이 되는 것이다.

$$
{}^{c}\xi_{c^*} = \{R,\ t\} \;\longrightarrow\; \{I,\ 0\} \quad (t \to \infty)
$$

2D 관점에서 원하는 것은 영상 오차가 0이 되는 것이다.

$$
e = s - s^* \;\longrightarrow\; 0 \quad (t \to \infty)
$$

점이 충분히 많고(보통 4개 이상) 일반적인 배치라면, "영상 위 점이 모두 같은 곳에 찍힌다"는 것은 "카메라가 같은 자세에 있다"는 것과 같다.<br>
그래서 e → 0을 달성하면 간접적으로 {R, t} → {I, 0}도 달성된다.<br>
이것이 IBVS가 3D 자세를 직접 추정하지 않고도 위치결정을 할 수 있는 이유이다.

---

## 2. VS 제어 법칙 유도 3단계

> 핵심
> 
> 모델 세우기 → 원하는 오차 거동 정하기 → 둘을 연립해 명령 계산. 
> 뒤에 나오는 PBVS, Hybrid VS도 L과 e의 정의만 바뀐 같은 틀이다.

### ①1단계: 모델 설계 (Model design)

특징의 움직임과 카메라의 움직임 사이의 관계를 세운다.

$$
\dot{s} = L\, v \qquad (1)
$$

- $$\dot{s}$$: 특징이 영상 위에서 움직이는 속도
- $$v \in \mathbb{R}^6$$: 카메라 속도 (병진 3 + 회전 3)
- $$L$$: <mark class="mint">상호작용 행렬(interaction matrix)</mark>. 점 하나라면 $$s \in \mathbb{R}^2$$이므로 $$L \in \mathbb{R}^{2\times 6}$$

"카메라를 이 속도로 움직이면 영상 속 특징은 저 속도로 움직인다"는 순방향 관계이다.
이 L을 실제로 구하는 것이 4장이다.

### ②2단계: 안정한 오차 동역학 (Stable error dynamics)

원하는 것은 s → s\*, 즉 e = s − s\* → 0이다. 그래서 오차가 따라야 할 동역학을 직접 정해 버린다.

$$
\dot{e} = \dot{s} - \dot{s}^* = -\lambda e, \qquad \lambda > 0 \qquad (2)
$$

왜 하필 −λe일까? 이 미분방정식의 해를 보면 알 수 있다.

$$
\frac{de}{dt} = -\lambda e \;\Rightarrow\; \frac{de}{e} = -\lambda\, dt \;\Rightarrow\; e(t) = e(0)\, e^{-\lambda t}
$$

- λ > 0이면 $$e^{-\lambda t}$$가 0으로 줄어들므로 오차가 지수적으로(exponentially) 0에 수렴한다.
- 오차의 각 성분이 서로 독립적으로, 같은 속도로 줄어든다. 그래서 영상 위 점들이 목표를 향해 직선으로 움직인다.
- λ를 제어 이득(control gain)이라 한다. 클수록 빨리 수렴하지만, 너무 크면 실제 시스템(이산 샘플링, 지연)에서 진동하거나 불안정해진다.

### ③3단계: 제어기 계산 (Controller computation)

목표가 고정되어 있다고 가정하면($$\dot{s}^* = 0$$) $$\dot{e} = \dot{s}$$이다. 여기에 (1)을 대입하면

$$
\dot{e} = -\lambda e = \dot{s} = L v
$$

즉 Lv = −λe를 만족하는 v를 찾으면 된다.<br>
L이 정사각 가역행렬이면 $$v = -\lambda L^{-1} e$$로 끝나지만, 보통 L은 정사각이 아니다.<br>
그래서 역행렬 대신 <mark class="mint">유사역행렬(Moore–Penrose pseudo-inverse)</mark> $$L^{+}$$를 쓴다.

$$
\boxed{\,v = -\lambda\, L^{+} e\,}
$$

### ④유사역행렬은 왜, 어떻게 나올까?

점 4개를 쓰면 특징 벡터는 $$s = (s_1, s_2, s_3, s_4) \in \mathbb{R}^8$$이고, 각 점마다 2×6 행렬을 쌓아서 $$L \in \mathbb{R}^{8\times 6}$$이 된다.<br>
식 8개, 미지수 6개이므로 Lv = −λe를 정확히 만족하는 v가 없을 수 있다.

그래서 가장 가깝게 만족하는 v, 즉 오차 제곱합을 최소화하는 v를 찾는다.

$$
\min_{v} \; \| L v + \lambda e \|^2
$$

이 식을 v로 미분해서 0으로 놓으면 정규방정식이 나온다.

$$
2L^{T}(Lv + \lambda e) = 0 \;\Rightarrow\; L^{T}L\, v = -\lambda L^{T} e \;\Rightarrow\; v = -\lambda (L^{T}L)^{-1}L^{T} e
$$

따라서 L이 열 풀랭크(rank 6)일 때 유사역행렬은 다음과 같다.

$$
L^{+} = (L^{T}L)^{-1}L^{T} \in \mathbb{R}^{6\times 8}
$$

크기를 확인하면 $$L^T$$는 6×8, $$L^TL$$은 6×6, 그래서 $$L^{+}$$는 6×8이다.<br>
$$v = -\lambda L^{+} e$$는 (6×8)(8×1) = 6×1로 카메라 속도와 크기가 맞는다.<br>
이 v가 매 순간 로봇에게 보내는 실제 명령이다.

---

## 3. 카메라 투영 모델 (Camera projection model)

> 핵심
> 
> 3D 월드 점 → 카메라 좌표 → 영상 평면 → 픽셀 순서로 변환하며, 최종 결과는 p̃ = K P (⁰T_c)⁻¹ P̃ 한 줄이다.

상호작용 행렬을 유도하려면 먼저 3D 점이 어떻게 영상 위 픽셀이 되는지를 식으로 알아야 한다.

### ①(1/5) 핀홀 카메라와 원근 투영

<!-- ![](/assets/img/pinhole-캡처.png) -->

Frontal pin-hole camera model을 쓴다.<br>
카메라 중심에 좌표계 $$\{F_c\}$$를 두고, $$Z_c$$ 축이 카메라가 바라보는 방향(광축)이다.<br>
영상 평면은 광축 방향으로 초점거리 f만큼 떨어진 곳에 있다.

카메라 좌표계에서 본 3D 점 (X, Y, Z)와 카메라 중심을 잇는 직선이 영상 평면과 만나는 점이 영상 점 (x, y)이다.

$$
x = f\,\frac{X}{Z}, \qquad y = f\,\frac{Y}{Z}
$$

**왜 이렇게 될까? (닮은 삼각형)**

옆에서 X–Z 평면을 보면, 카메라 중심에서 깊이 Z에 있는 점까지의 삼각형과 깊이 f에 있는 영상 점까지의 삼각형이 닮은꼴이다.<br>
그래서 x : f = X : Z, 즉 x = fX/Z이다. y도 같다.

Z로 나눈다는 것이 핵심이다.<br>
같은 X라도 멀리 있으면(Z가 크면) 영상에서 작게 보이고, x만 보고는 X와 Z를 따로 알 수 없다.<br>
이것이 <mark class="pink">깊이 정보의 손실</mark>이다.

- 카메라 자세 (R, t)는 관성 좌표계 {I}에 대한 카메라 좌표계 {F_c}의 회전과 위치이다.
  - R ∈ SO(3), t ∈ ℝ³이고, 둘을 합친 자세는 SE(3)의 원소이며 6자유도(6 DOF)이다.
- f = 1로 두면 정규화 좌표(normalized coordinates) x = X/Z, y = Y/Z가 된다. 상호작용 행렬 유도에 이 좌표를 쓴다.

### ②(2/5) 동차좌표로 쓰기

나눗셈이 들어간 비선형 식을 행렬 곱 하나로 쓰기 위해 <mark class="mint">동차좌표(homogeneous coordinates)</mark>를 쓴다.<br>
벡터 끝에 1을 붙이는 트릭이다.

$$
Z\begin{pmatrix} x \\ y \\ 1 \end{pmatrix} = \begin{pmatrix} f & 0 & 0 & 0 \\ 0 & f & 0 & 0 \\ 0 & 0 & 1 & 0 \end{pmatrix} \begin{pmatrix} X \\ Y \\ Z \\ 1 \end{pmatrix}
$$

**확인**

오른쪽을 계산하면 (fX, fY, Z)이고, 왼쪽은 (Zx, Zy, Z)이다.<br>
각 줄을 비교하면 Zx = fX, Zy = fY이므로 x = fX/Z, y = fY/Z로 원래 식과 같다.<br>
셋째 줄 Z = Z는 항상 성립하는 자리 맞춤이다.

- 깊이 Z는 모른다(잃어버린 정보). 그래서 왼쪽의 Z를 미지의 스케일 파라미터 ζ로 쓴다.
- 편의상 3×4 행렬을 두 개로 쪼갠다. 앞은 카메라 고유의 값(f), 뒤는 4차원 → 3차원으로 마지막 성분을 버리는 순수 투영이다.

$$
\begin{pmatrix} f & 0 & 0 & 0 \\ 0 & f & 0 & 0 \\ 0 & 0 & 1 & 0 \end{pmatrix} = \begin{pmatrix} f & 0 & 0 \\ 0 & f & 0 \\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{pmatrix}
$$

실제로는 점의 좌표가 카메라가 아니라 관성(월드) 좌표계 {0}에서 (X₀, Y₀, Z₀)로 주어지는 경우가 많다.<br>
두 좌표는 동차 변환 행렬(homogeneous transformation matrix)로 연결된다.

$$
\begin{pmatrix} X \\ Y \\ Z \\ 1 \end{pmatrix} = \begin{pmatrix} R & t \\ 0\;0\;0 & 1 \end{pmatrix}^{-1} \begin{pmatrix} X_0 \\ Y_0 \\ Z_0 \\ 1 \end{pmatrix}
$$

**왜 역행렬일까?**

(R, t)는 월드에서 본 카메라의 자세, 즉 ⁰T_c이다. 이 행렬은 카메라 좌표의 점을 월드 좌표로 보낸다($$P_0 = R P + t$$).<br>
우리는 반대로 월드 좌표의 점을 카메라 좌표로 가져와야 하므로 역변환을 쓴다. 풀어 쓰면 $$P = R^T(P_0 - t)$$이다.<br>
4×4 동차 행렬을 쓰면 회전과 병진을 행렬 곱 한 번으로 처리할 수 있다.

### ③(3/5) 이상적인 카메라 모델

세 조각을 이어 붙이면 camera ideal model이 된다.

$$
\zeta\begin{pmatrix} x \\ y \\ 1 \end{pmatrix} = \underbrace{\begin{pmatrix} f & 0 & 0 \\ 0 & f & 0 \\ 0 & 0 & 1 \end{pmatrix}}_{\text{intrinsic}} \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{pmatrix} \underbrace{\begin{pmatrix} R & t \\ 0\;0\;0 & 1 \end{pmatrix}^{-1}}_{\text{extrinsic}} \begin{pmatrix} X_0 \\ Y_0 \\ Z_0 \\ 1 \end{pmatrix}
$$

오른쪽에서 왼쪽으로 읽으면 된다.<br>
월드 좌표 점 → (extrinsic) 카메라 좌표로 변환 → (투영) 깊이 방향으로 납작하게 → (intrinsic) 초점거리 f만큼 확대.

- <mark class="mint">외부 파라미터(extrinsic)</mark>: 카메라가 세상 어디에 어느 방향으로 있는가 (R, t)
- <mark class="mint">내부 파라미터(intrinsic)</mark>: 카메라 자체의 광학 특성 (지금은 f 하나)

### ④(4/5) 미터 좌표에서 픽셀 좌표로

지금까지의 (x, y)는 영상 평면 위의 길이(미터) 단위이다. 하지만 실제 센서가 주는 값은 픽셀 좌표 (u, v)이다.

$$
u = u_0 + \frac{x}{\rho_w}, \qquad v = v_0 + \frac{y}{\rho_h}
$$

- (ρ_w, ρ_h): 픽셀 하나의 실제 가로·세로 크기(size of the pixel)
- (u₀, v₀): 주점(principal point, central point). 광축이 센서와 만나는 점의 픽셀 좌표로, 보통 영상 중앙 근처이다.

**왜 이렇게 될까?**

x를 픽셀 크기 ρ_w로 나누면 "중심에서 몇 픽셀 떨어졌는가"가 된다.<br>
그런데 픽셀 좌표의 원점은 영상 중심이 아니라 왼쪽 위 모서리이다. 그래서 중심의 픽셀 좌표 u₀를 더해 원점을 옮긴다.

동차좌표로 압축하면 다음과 같다.

$$
\begin{pmatrix} u \\ v \\ 1 \end{pmatrix} = \begin{pmatrix} 1/\rho_w & 0 & u_0 \\ 0 & 1/\rho_h & v_0 \\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} x \\ y \\ 1 \end{pmatrix}
$$

첫째 줄을 곱하면 u = x/ρ_w + u₀로 위 식과 같다.<br>
이 값들 (f, u₀, v₀, ρ_w, ρ_h)을 실제로 구하는 과정이 <mark class="pink">카메라 캘리브레이션(camera calibration)</mark>이다.

### ⑤(5/5) 모두 합치기: 카메라 행렬

(4/5)의 픽셀 변환 행렬과 (3/5)의 f 행렬을 곱하면 하나로 합쳐진다.

$$
\begin{pmatrix} 1/\rho_w & 0 & u_0 \\ 0 & 1/\rho_h & v_0 \\ 0 & 0 & 1 \end{pmatrix}\begin{pmatrix} f & 0 & 0 \\ 0 & f & 0 \\ 0 & 0 & 1 \end{pmatrix} = \begin{pmatrix} f/\rho_w & 0 & u_0 \\ 0 & f/\rho_h & v_0 \\ 0 & 0 & 1 \end{pmatrix} = K
$$

그래서 최종 모델은 다음과 같다.

$$
\underbrace{\zeta\begin{pmatrix} u \\ v \\ 1 \end{pmatrix}}_{\tilde{p}} = \underbrace{\begin{pmatrix} f/\rho_w & 0 & u_0 \\ 0 & f/\rho_h & v_0 \\ 0 & 0 & 1 \end{pmatrix}}_{K} \underbrace{\begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \end{pmatrix}}_{P} \underbrace{\begin{pmatrix} R & t \\ 0\;0\;0 & 1 \end{pmatrix}^{-1}}_{({}^{0}T_c)^{-1}} \underbrace{\begin{pmatrix} X_0 \\ Y_0 \\ Z_0 \\ 1 \end{pmatrix}}_{\tilde{P}}
$$

$$
\tilde{p} = \underbrace{K\,P\,({}^{0}T_c)^{-1}}_{C}\,\tilde{P}
$$

| 기호 | 이름 | 크기 | 의미 |
|---|---|---|---|
| K | 내부 파라미터 행렬 (calibration matrix) | 3×3 | 픽셀 크기, 초점거리, 주점 |
| P | 표준 투영 행렬 (standard projection matrix) | 3×4 | 동차 3D 점을 깊이를 버리며 투영 |
| ⁰T_c | 카메라 외부 파라미터 | 4×4 | 월드에 대한 카메라의 자세, extrinsic calibration으로 구함 |
| C | 카메라 행렬 (camera matrix) | 3×4 | 3D 월드 점 → 2D 픽셀을 한 번에 |
| ζ | 스케일 파라미터 | 스칼라 | 실제로는 깊이 Z, 미지수 |

- f/ρ_w, f/ρ_h는 픽셀 단위로 표현한 초점거리이다. OpenCV에서 f_x, f_y로 부르는 값이 이것이다.
- ⁰ξ_c = ⁰T_c (월드에서 본 카메라 자세) 또는 그 역인 ᶜξ₀ = ᶜT₀ (카메라에서 본 월드 자세)로 표기하기도 한다.
- 이 모델로 픽셀 단위의 시각 특징 s = (u, v)를 얻는다. VS의 측정값이 바로 이것이다.

---

## 4. 상호작용 행렬 유도 (Computation of the interaction matrix)

> 핵심
> 
> 투영식을 시간으로 미분하고, 점의 속도를 카메라 속도로 바꿔 넣으면 L이 나온다. 
> 점 하나에 대해 L은 2×6이고, 영상 좌표 (x, y)와 깊이 Z만 알면 계산된다.

### ①VS의 기본 구성요소 (Basic components)

강의 후반부 슬라이드(Handbook of Robotics 34장)는 VS 오차를 좀 더 일반적으로 정의한다.

$$
e(t) = s\big(m(t),\, a\big) - s^*
$$

- m(t): 영상 측정값 (예: 관심 점들의 픽셀 좌표)
- a: 추가로 필요한 지식 (카메라 내부 파라미터, 물체의 3D 모델 등)
- s(m, a): 측정값과 지식으로 계산한 시각 특징

그리고 VS는 다음 세 단계로 구성된다.

1. 특징점의 기구학 (Kinematics for a feature point): $$\dot{s} = L_s v_c$$
2. 오차 동역학 (Error dynamics): $$\dot{e} = L_e v_c$$ (목표가 고정이면 $$L_e = L_s$$)
3. 피드백 제어 명령 (Feedback control command): $$v_c = -\lambda L_e^{+} e$$

이제 1번의 L을 구한다.

### ②(1/3) 투영식을 시간으로 미분하기

<!-- ![](/assets/img/interaction-matrix-1-캡처.png) -->

L은 특징의 속도와 카메라의 속도를 잇는 행렬이다. eye-in-hand 구성에서 물체는 고정, 카메라가 움직인다.

$$
\dot{s} = \begin{pmatrix} \dot{u} \\ \dot{v} \end{pmatrix} = L\,v = L\begin{pmatrix} \nu \\ \omega \end{pmatrix}
$$

ν = (vx, vy, vz)는 병진속도, ω = (ωx, ωy, ωz)는 각속도이다.

출발점은 원근 투영식 x = fX/Z, y = fY/Z이다.<br>
카메라가 움직이면 카메라 좌표계에서 본 X, Y, Z가 시간에 따라 변하고, 그에 따라 x, y도 변한다.<br>
그러니 양변을 시간으로 미분한다. 몫의 미분법 $$(a/b)' = (a'b - ab')/b^2$$을 쓰면

$$
\dot{x} = f\,\frac{\dot{X}Z - X\dot{Z}}{Z^2} = \frac{f}{Z}\dot{X} - \frac{x}{Z}\dot{Z}, \qquad \dot{y} = f\,\frac{\dot{Y}Z - Y\dot{Z}}{Z^2} = \frac{f}{Z}\dot{Y} - \frac{y}{Z}\dot{Z}
$$

두 번째 등호는 $$fX/Z^2 = (fX/Z)\cdot(1/Z) = x/Z$$를 써서 정리한 것이다. 행렬로 묶으면

$$
\begin{pmatrix} \dot{x} \\ \dot{y} \end{pmatrix} = \begin{pmatrix} \dfrac{f}{Z} & 0 & -\dfrac{x}{Z} \\ 0 & \dfrac{f}{Z} & -\dfrac{y}{Z} \end{pmatrix} \begin{pmatrix} \dot{X} \\ \dot{Y} \\ \dot{Z} \end{pmatrix}
$$

남은 문제는 카메라 좌표계에서 본 점의 속도 $$(\dot{X}, \dot{Y}, \dot{Z})$$를 카메라 속도 (ν, ω)로 표현하는 것이다.

### ③(2/3) 점의 속도와 카메라 속도의 관계

$$
\begin{pmatrix} \dot{X} \\ \dot{Y} \\ \dot{Z} \end{pmatrix} = -\nu - \omega \times \begin{pmatrix} X \\ Y \\ Z \end{pmatrix}
$$

**왜 마이너스일까?**

점은 세상에 고정되어 있고 카메라가 움직인다.<br>
카메라에 탄 관찰자 입장에서는, 카메라가 앞으로 가면 점이 뒤로 다가오고(−ν), 카메라가 반시계로 돌면 점은 시계로 도는 것처럼 보인다(−ω×P).<br>
강체 위 점의 속도는 ν + ω×P인데, 기준이 움직이는 카메라라서 부호가 전부 뒤집힌 것이다.

외적 ω × P를 성분으로 풀면

$$
\omega \times P = \begin{pmatrix} \omega_y Z - \omega_z Y \\ \omega_z X - \omega_x Z \\ \omega_x Y - \omega_y X \end{pmatrix} = -\underbrace{\begin{pmatrix} 0 & -Z & Y \\ Z & 0 & -X \\ -Y & X & 0 \end{pmatrix}}_{[P]_\times}\begin{pmatrix} \omega_x \\ \omega_y \\ \omega_z \end{pmatrix}
$$

$$[P]_\times$$는 "P와 외적하기"를 행렬로 쓴 반대칭(skew-symmetric) 행렬이고, $$\omega \times P = -P \times \omega = -[P]_\times \omega$$이다. 따라서

$$
\begin{pmatrix} \dot{X} \\ \dot{Y} \\ \dot{Z} \end{pmatrix} = \begin{pmatrix} -1 & 0 & 0 & 0 & -Z & Y \\ 0 & -1 & 0 & Z & 0 & -X \\ 0 & 0 & -1 & -Y & X & 0 \end{pmatrix}\begin{pmatrix} \nu \\ \omega \end{pmatrix} = \big(-I_3 \;\; [P]_\times\big)\begin{pmatrix} \nu \\ \omega \end{pmatrix}
$$

성분으로 쓰면 다음 세 줄이다.

$$
\dot{X} = -v_x - \omega_y Z + \omega_z Y, \quad \dot{Y} = -v_y - \omega_z X + \omega_x Z, \quad \dot{Z} = -v_z - \omega_x Y + \omega_y X
$$

### ④대입하기

(1/3)의 $$\dot{x} = (f/Z)\dot{X} - (x/Z)\dot{Z}$$에 위 식을 넣고 속도 성분별로 묶는다.

$$
\dot{x} = \frac{f}{Z}(-v_x - \omega_y Z + \omega_z Y) - \frac{x}{Z}(-v_z - \omega_x Y + \omega_y X)
$$

$$
= -\frac{f}{Z}v_x + 0\cdot v_y + \frac{x}{Z}v_z + \frac{xY}{Z}\omega_x + \Big(-f - \frac{xX}{Z}\Big)\omega_y + \frac{fY}{Z}\omega_z
$$

$$\dot{y}$$도 같은 방법으로 묶으면

$$
\dot{y} = 0\cdot v_x - \frac{f}{Z}v_y + \frac{y}{Z}v_z + \Big(f + \frac{yY}{Z}\Big)\omega_x - \frac{yX}{Z}\omega_y - \frac{fX}{Z}\omega_z
$$

따라서

$$
\begin{pmatrix} \dot{x} \\ \dot{y} \end{pmatrix} = \begin{pmatrix} -\dfrac{f}{Z} & 0 & \dfrac{x}{Z} & \dfrac{xY}{Z} & -f - \dfrac{xX}{Z} & \dfrac{fY}{Z} \\ 0 & -\dfrac{f}{Z} & \dfrac{y}{Z} & f + \dfrac{yY}{Z} & -\dfrac{yX}{Z} & -\dfrac{fX}{Z} \end{pmatrix}\begin{pmatrix} \nu \\ \omega \end{pmatrix}
$$

### ⑤(3/3) X, Y를 영상 좌표로 바꾸기

위 행렬에는 아직 3D 좌표 X, Y가 들어 있다.<br>
투영식을 거꾸로 쓰면 X = xZ/f, Y = yZ/f이므로 영상에서 측정한 x, y로 바꿀 수 있다.

- xY/Z = x·(yZ/f)/Z = xy/f
- xX/Z = x²/f, yY/Z = y²/f, yX/Z = xy/f
- fY/Z = f·(yZ/f)/Z = y, fX/Z = x

이렇게 정리하면

$$
\begin{pmatrix} \dot{x} \\ \dot{y} \end{pmatrix} = \begin{pmatrix} -\dfrac{f}{Z} & 0 & \dfrac{x}{Z} & \dfrac{xy}{f} & -f - \dfrac{x^2}{f} & y \\ 0 & -\dfrac{f}{Z} & \dfrac{y}{Z} & f + \dfrac{y^2}{f} & -\dfrac{xy}{f} & -x \end{pmatrix}\begin{pmatrix} \nu \\ \omega \end{pmatrix}
$$

정규화 좌표(f = 1)로 쓰면 교과서에서 가장 많이 보는 형태가 된다.

$$
L_x = \begin{pmatrix} -\dfrac{1}{Z} & 0 & \dfrac{x}{Z} & xy & -(1+x^2) & y \\ 0 & -\dfrac{1}{Z} & \dfrac{y}{Z} & 1+y^2 & -xy & -x \end{pmatrix}
$$

> 이 행렬에서 읽어야 할 것
> - 앞의 3열(병진 부분)에는 모두 1/Z가 들어 있다. 같은 속도로 움직여도 멀리 있는 점은 영상에서 조금만 움직인다.
> - 뒤의 3열(회전 부분)에는 Z가 없다. 제자리 회전 시 영상 움직임은 깊이와 무관하기 때문이다.
> - 따라서 L을 계산하려면 (x, y) 외에 깊이 Z가 꼭 필요하다. Z는 영상 한 장으로 알 수 없으므로 추정하거나 근사해야 한다.

### ⑥미터에서 픽셀로

실제 측정값은 픽셀 (u, v)이므로 3장의 변환을 다시 쓴다.

$$
\dot{u} = \dot{x}/\rho_w, \quad \dot{v} = \dot{y}/\rho_h, \qquad x = (u - u_0)\rho_w = \bar{u}\rho_w, \quad y = (v - v_0)\rho_h = \bar{v}\rho_h
$$

u₀는 상수라서 미분하면 사라지므로 $$\dot{u} = \dot{x}/\rho_w$$이다. ū, v̄는 주점 기준 픽셀 좌표이다.<br>
위 행렬의 첫 줄을 ρ_w로, 둘째 줄을 ρ_h로 나누고 x, y에 ūρ_w, v̄ρ_h를 대입하면 픽셀 단위 상호작용 행렬이 나온다.<br>
예를 들어 첫 줄 넷째 칸은 $$xy/(f\rho_w) = (\bar{u}\rho_w)(\bar{v}\rho_h)/(f\rho_w) = \bar{u}\bar{v}\rho_h/f$$이다.

$$
\begin{pmatrix} \dot{u} \\ \dot{v} \end{pmatrix} = \underbrace{\begin{pmatrix} -\dfrac{f}{\rho_w Z} & 0 & \dfrac{\bar{u}}{Z} & \dfrac{\bar{u}\bar{v}\rho_h}{f} & -\dfrac{f}{\rho_w} - \dfrac{\bar{u}^2\rho_w}{f} & \dfrac{\bar{v}\rho_h}{\rho_w} \\ 0 & -\dfrac{f}{\rho_h Z} & \dfrac{\bar{v}}{Z} & \dfrac{f}{\rho_h} + \dfrac{\bar{v}^2\rho_h}{f} & -\dfrac{\bar{u}\bar{v}\rho_w}{f} & -\dfrac{\bar{u}\rho_w}{\rho_h} \end{pmatrix}}_{L(\alpha,\, Z,\, (u,v))}\begin{pmatrix} \nu \\ \omega \end{pmatrix}
$$

> 참고
> 
> 슬라이드의 픽셀 행렬은 회전 열에서 일부 ρ 인자를 생략한 간략 표기이다(예: −f − ū²ρ_w/f, v̄).
> 위 식은 대입을 끝까지 정확히 계산한 결과이고, 정사각 픽셀(ρ_w = ρ_h)이면 마지막 열은 슬라이드처럼 v̄, −ū가 된다.

이 L은 세 가지에 의존한다.

- α = (f, ρ_w, ρ_h, u₀, v₀): 카메라 내부 파라미터. 카메라 캘리브레이션 단계에서 미리 구하거나 추정한다.
- (u, v): 매 순간 영상에서 측정하는 픽셀 좌표
- Z: 점의 깊이. 알 수 없으므로 근사가 필요하다.

---

## 5. 상호작용 행렬 근사와 안정성

### ①상호작용 행렬 근사 3가지 (Approximating the Interaction Matrix)

> 핵심
> 
> 정확한 L은 모르므로 L_e(현재), L_e\*(목표), 둘의 평균 중 하나로 근사한다. 평균이 보통 가장 좋다.

실제로는 깊이 Z를 모르고, 캘리브레이션 값에도 오차가 있다. 그래서 제어 법칙에는 근사 행렬을 넣는다.

$$
v_c = -\lambda\, \widehat{L_e^{+}}\, e
$$

슬라이드는 세 가지 선택지를 같은 위치결정 예제로 비교한다.<br>
예제는 (a) 목표 카메라 자세, (b) 초기 카메라 자세, (c) 초기 영상과 목표 영상 위의 점 4개로 구성된다.

<!-- ![](/assets/img/approx-캡처.png) -->

**(1) 현재 값으로 계산**

$$
\widehat{L_e^{+}} = L_e^{+}
$$

매 순간 현재 측정 (x, y)와 현재 깊이 Z로 L을 다시 계산한다. Z는 매 순간 추정해야 한다.

- $$\dot{e} = -\lambda L_e L_e^{+} e \approx -\lambda e$$가 거의 정확히 성립하므로 영상 위 점들이 목표를 향해 직선으로 움직인다.
- 대신 카메라의 3D 궤적은 이상할 수 있다. 특히 광축 둘레의 큰 회전이 섞이면 카메라가 불필요하게 뒤로 물러난다.

**(2) 목표 값으로 고정**

$$
\widehat{L_e^{+}} = L_{e^*}^{+}
$$

목표 위치에서의 (x\*, y\*)와 목표 깊이 Z\*로 L을 한 번만 계산해 상수로 쓴다. 깊이 추정이 필요 없고 계산도 가볍다.

- 목표 근처에서는 L_e ≈ L_e\*이므로 잘 동작한다.
- 하지만 초기 위치가 멀면 두 행렬이 크게 달라서 영상 궤적이 직선이 아니고, 점이 영상 밖으로 나갈 위험이 있다.

**(3) 둘의 평균**

$$
\widehat{L_e^{+}} = \Big(\tfrac{1}{2}\big(L_e + L_{e^*}\big)\Big)^{+}
$$

- 실험적으로 영상 궤적과 카메라 궤적 모두 (1), (2)보다 만족스럽다.
- 두 끝점에서 본 평균 기울기로 선형화하는 셈이라, 한쪽 끝에서만 선형화하는 (1), (2)보다 2차 근사에 가깝다.

| 선택 | 필요한 깊이 | 영상 궤적 | 카메라 궤적 | 계산량 |
|---|---|---|---|---|
| (1) L_e | 매 순간 Z 추정 | 직선 | 휘거나 뒤로 물러날 수 있음 | 매 순간 재계산 |
| (2) L_e\* | Z\*만 (상수) | 직선 아님, 이탈 위험 | 휘어짐 | 한 번만 |
| (3) ½(L_e + L_e\*) | 매 순간 Z 추정 | 거의 직선 | 양호 | 매 순간 재계산 |

### ②안정성 해석 (Stability Analysis: Lyapunov)

> 핵심
> 
> L_e L̂_e⁺ > 0이면 수렴한다. 단, 특징이 6개보다 많으면 전역 안정성은 보장되지 않고 국소 안정성만 보장된다.

**Lyapunov 함수란?**

에너지처럼 항상 0 이상이고, 오차가 0일 때만 0이 되는 함수를 잡는다.<br>
시간에 따라 이 값이 계속 줄어든다면 결국 0, 즉 e = 0에 도달한다. 오차의 크기 제곱을 쓰는 것이 가장 자연스럽다.

$$
\mathcal{L} = \tfrac{1}{2}\,\| e(t) \|^2 = \tfrac{1}{2}\, e^{T} e \;\ge 0
$$

**미분해서 부호 확인하기**

$$
\dot{\mathcal{L}} = e^{T}\dot{e}
$$

$$\dot{e} = L_e v$$이고 $$v = -\lambda \widehat{L_e^{+}} e$$를 넣으면

$$
\dot{\mathcal{L}} = e^{T} L_e \big(-\lambda \widehat{L_e^{+}} e\big) = -\lambda\, e^{T} L_e \widehat{L_e^{+}}\, e
$$

따라서 행렬 $$L_e \widehat{L_e^{+}}$$가 양의 정부호(positive definite)이면 $$\dot{\mathcal{L}} < 0$$이 된다.<br>
이 조건이 모든 곳에서 성립하면 <mark class="mint">전역 점근 안정(global asymptotic stability)</mark>이다.

$$
L_e \widehat{L_e^{+}} > 0 \;\Rightarrow\; \dot{\mathcal{L}} < 0 \;\; \forall e \neq 0
$$

**특징이 6개일 때 (점 3개)**

s ∈ ℝ⁶, L_e ∈ ℝ⁶ˣ⁶으로 정사각 행렬이다.<br>
근사가 정확하고 L이 가역이면 $$L_e L_e^{-1} = I > 0$$이므로 조건이 성립한다.<br>
근사가 조금 틀려도 양의 정부호로 남아 있는 한 수렴한다. 다만 L이 특이(singular)해지는 자세에서는 문제가 생긴다.

**특징이 6개보다 많을 때 (점 4개 이상)**

점 4개라면 s ∈ ℝ⁸이고 $$L_e \widehat{L_e^{+}} \in \mathbb{R}^{8\times 8}$$이다.<br>
그런데 이 행렬의 랭크는 최대 6이다. 8×8 행렬의 랭크가 6이면 영공간(null space)이 존재한다.

$$
e \in \mathrm{Ker}\big(\widehat{L_e^{+}}\big),\; e \neq 0 \;\Rightarrow\; v = -\lambda \widehat{L_e^{+}} e = 0
$$

즉 오차가 0이 아닌데도 속도가 0이 되어 카메라가 멈추는 <mark class="pink">국소 최소점(local minima)</mark>이 있을 수 있다. 그래서 전역 안정성은 보장되지 않는다.

**국소 안정성 증명**

대신 목표 근처에서는 수렴함을 보일 수 있다. 새 오차 $$e' = \widehat{L_e^{+}} e$$ (6차원)를 정의한다.

$$
\dot{e}' = \widehat{L_e^{+}}\dot{e} + \dot{\widehat{L_e^{+}}}\,e = (\widehat{L_e^{+}} L_e + O)\, v = -\lambda\, (\widehat{L_e^{+}} L_e + O)\, e'
$$

O는 e = 0에서 0이 되는 항이다. 목표 근처에서 O ≈ 0이므로 6×6 행렬 $$\widehat{L_e^{+}} L_e$$가 양의 정부호이면 e′ → 0이다.<br>
목표 근처에서 두 행렬이 풀랭크라면 e′ = 0은 e = 0을 뜻하므로 <mark class="mint">국소 점근 안정(local asymptotic stability)</mark>이다.

$$
\widehat{L_e^{+}} L_e > 0 \quad (\text{목표 근처}) \;\Rightarrow\; e \to 0 \;\; (\text{local})
$$

| 경우 | 보장되는 것 | 주의할 점 |
|---|---|---|
| k = 6 (점 3개) | L_e L̂_e⁻¹ > 0이면 전역 수렴 | 특이 자세, 같은 영상을 주는 서로 다른 자세 4개 |
| k > 6 (점 4개 이상) | 목표 근처에서 국소 수렴 | 국소 최소점 가능, 실제로는 잘 동작하는 경우가 많음 |

그래서 실무에서는 보통 점 4개 이상을 쓰고, 초기 위치가 목표에서 너무 멀지 않게 하거나 평균 근사처럼 좋은 근사를 쓴다.

---

## 6. IBVS의 변형

### ①IBVS with a Stereo Vision System

> 핵심
> 
> 카메라 두 대의 특징을 이어 붙이고, 각 카메라의 L에 속도 변환 행렬을 곱해 하나의 제어 좌표계로 맞춘다. 깊이 Z를 직접 구할 수 있다.

카메라 두 대(왼쪽 l, 오른쪽 r)로 같은 점을 본다. 특징 벡터는 두 영상의 좌표를 이어 붙인다.

$$
s = (x_l,\; x_r) = (x_l,\, y_l,\, x_r,\, y_r)
$$

문제는 각 카메라의 상호작용 행렬이 각자 자기 좌표계의 속도에 대해 정의된다는 것이다.<br>
하나의 제어 좌표계 속도 v_c로 명령을 내리려면, 속도 변환 행렬(velocity twist transformation)로 v_c를 각 카메라 좌표계로 옮겨야 한다.

$$
\dot{s} = \begin{pmatrix} L_{x_l}\; {}^{l}V_c \\ L_{x_r}\; {}^{r}V_c \end{pmatrix} v_c, \qquad {}^{a}V_b = \begin{pmatrix} {}^{a}R_b & [{}^{a}t_b]_\times\, {}^{a}R_b \\ 0_3 & {}^{a}R_b \end{pmatrix}
$$

**속도 변환 행렬이 이렇게 생긴 이유**

강체 위의 두 좌표계는 같은 각속도를 갖지만 좌표축 방향이 다르므로 $$\omega_a = R\,\omega_b$$이다.<br>
병진속도는 좌표 회전에 더해, 회전 중심이 떨어져 있어서 생기는 추가 속도 t × ω가 붙는다.<br>
그래서 $$\nu_a = R\,\nu_b + [t]_\times R\,\omega_b$$가 되고, 이것을 6×6 행렬로 쓴 것이 $${}^{a}V_b$$이다.

- 두 영상의 시차(disparity)로 삼각측량하면 깊이 Z를 직접 계산할 수 있어 L을 정확히 구할 수 있다.
- 점 하나당 특징이 4개가 되므로, 같은 수의 점으로 더 많은 제약을 얻는다.

### ②IBVS with Cylindrical Coordinates

> 핵심
> 
> 점을 (ρ, θ)로 표현하면 광축 회전 ωz가 θ에만 영향을 주어, 카메라가 뒤로 물러나는 문제를 줄일 수 있다.

점을 직교좌표 (x, y) 대신 원통(극)좌표 (ρ, θ)로 표현한다.

$$
\rho = \sqrt{x^2 + y^2}, \qquad \theta = \arctan\frac{y}{x}
$$

**상호작용 행렬 유도**

ρ, θ를 시간으로 미분하면

$$
\dot{\rho} = \frac{x\dot{x} + y\dot{y}}{\rho} = c\,\dot{x} + s\,\dot{y}, \qquad \dot{\theta} = \frac{x\dot{y} - y\dot{x}}{\rho^2} = \frac{c\,\dot{y} - s\,\dot{x}}{\rho}
$$

c = cos θ = x/ρ, s = sin θ = y/ρ이다.<br>
첫 식은 ρ² = x² + y²를 미분한 2ρρ̇ = 2xẋ + 2yẏ에서, 둘째 식은 arctan의 미분 공식에서 나온다.<br>
4장의 ẋ, ẏ를 대입하고 x = ρc, y = ρs, c² + s² = 1을 써서 정리하면

$$
L_\rho = \begin{pmatrix} -\dfrac{c}{Z} & -\dfrac{s}{Z} & \dfrac{\rho}{Z} & (1+\rho^2)\,s & -(1+\rho^2)\,c & 0 \end{pmatrix}
$$

$$
L_\theta = \begin{pmatrix} \dfrac{s}{\rho Z} & -\dfrac{c}{\rho Z} & 0 & \dfrac{c}{\rho} & \dfrac{s}{\rho} & -1 \end{pmatrix}
$$

예를 들어 L_ρ의 ωz 칸은 c·y − s·x = cρs − sρc = 0이고, L_θ의 ωz 칸은 (c·(−x) − s·y)/ρ = −(ρc² + ρs²)/ρ = −1이다.

**왜 이것이 좋을까?**

마지막 열을 보면 광축 회전 ωz는 ρ에는 영향이 없고(0), θ만 정확히 −1의 비율로 바꾼다.<br>
즉 광축 둘레 회전이 각도 θ의 변화 하나로 깔끔하게 분리된다.

- 직교좌표 IBVS: 큰 광축 회전이 필요하면 점들이 영상에서 직선으로 목표를 향해 간다. 원호 대신 직선으로 가려니 점들이 중심 쪽으로 모였다가 퍼지고, 이를 위해 카메라가 뒤로 물러났다가(retreat) 다시 다가온다.
- 원통좌표 IBVS: 점들이 영상에서 원호를 따라 움직이므로 카메라는 거의 순수하게 회전만 한다. 대신 순수 병진 운동에서는 궤적이 덜 좋을 수 있다.

### ③Direct Estimation (Broyden update)

> 핵심
> 
> 모델 없이, 움직여 보고 관측된 변화로부터 L(또는 로봇 관절까지 합친 자코비안)을 온라인으로 추정한다.

지금까지는 L을 투영식에서 해석적으로 유도했다. 이 방법은 정반대이다.<br>
캘리브레이션이나 깊이 Z가 필요 없다는 것이 장점이다.

상호작용 행렬을 온라인으로 추정하는 것은 최적화 문제로 볼 수 있다.<br>
관절이 Δq만큼 움직였을 때 특징이 Δs만큼 변했다면, 좋은 추정 Ĵ는 다음 시컨트 조건(secant condition)을 만족해야 한다.

$$
\Delta s \approx \hat{J}\, \Delta q
$$

Ĵ는 특징과 관절을 직접 잇는 행렬로, L, 속도 변환 V, 로봇 자코비안 J를 모두 합친 것이다($$\dot{s} = L V J \dot{q} = \hat{J}\dot{q}$$).

**Broyden 갱신 규칙**

$$
\hat{J}(k+1) = \hat{J}(k) + \alpha\, \frac{\big(\Delta s - \hat{J}(k)\,\Delta q\big)\,\Delta q^{T}}{\Delta q^{T}\Delta q}
$$

- α: 갱신 속도(update speed), 0 < α ≤ 1
- Δs − Ĵ(k)Δq: 실제로 본 변화 − 추정 행렬이 예측한 변화 = 예측 오차

**이 식은 왜 이렇게 생겼을까?**

Broyden 갱신은 새 관측(시컨트 조건)을 만족하면서 기존 추정에서 가장 적게 바꾸는 행렬이다.

$$
\min_{\hat{J}_{new}} \; \| \hat{J}_{new} - \hat{J}(k) \|_F^2 \quad \text{s.t.} \quad \hat{J}_{new}\,\Delta q = \Delta s
$$

1. 변화량을 ΔJ = Ĵ_new − Ĵ(k)라 하면 제약은 ΔJ Δq = Δs − Ĵ(k)Δq ≡ r (예측 오차)이다.
2. 프로베니우스 노름을 최소로 하면서 이를 만족하는 해는, Δq 방향에만 작용하고 수직 방향에는 영향을 주지 않는 랭크 1 행렬 ΔJ = r Δqᵀ / (ΔqᵀΔq)이다.
3. 확인: ΔJ Δq = r (ΔqᵀΔq)/(ΔqᵀΔq) = r. 조건을 정확히 만족한다.
4. α = 1이면 최소 변화 해 그대로, α < 1이면 노이즈에 덜 민감하도록 일부만 갱신한다.

추정한 Ĵ는 제어 법칙에 그대로 넣는다.

$$
\dot{q} = -\lambda\, \hat{J}^{+} e
$$

이 방법은 목표 물체가 움직이는 경우로도 일반화되었다. 그때는 물체 운동에 의한 항 ∂e/∂t도 함께 추정한다.

- 장점: 카메라·로봇 캘리브레이션, 깊이 Z가 필요 없다.
- 단점: 초기 추정이 나쁘면 처음에 엉뚱하게 움직일 수 있고, Δq가 한 방향으로만 반복되면 다른 방향 정보가 갱신되지 않는다.

---

## 7. PBVS와 고급 방식

### ①PBVS (Pose-Based Visual Servoing)

> 핵심
> 
> 특징으로 카메라의 3D 자세 (t, θu)를 쓴다. 제어 법칙은 단순하지만 카메라 내부 파라미터와 물체의 3D 모델이 필요하다.

한 장의 영상에서 자세를 계산하려면 카메라 내부 파라미터와 물체의 3D 모델을 알아야 한다.<br>
이 고전적인 컴퓨터 비전 문제를 3D localization(자세 추정, PnP 문제)이라고 한다.

세 좌표계를 쓴다.

- F_c: 현재 카메라 좌표계
- F_c\*: 목표 카메라 좌표계
- F_o: 물체에 붙은 좌표계

$${}^{c}t_o$$, $${}^{c^*}t_o$$는 각각 현재/목표 카메라에서 본 물체 원점의 위치, $$R = {}^{c^*}R_c$$는 목표 카메라에 대한 현재 카메라의 회전이다.

**회전을 표현하는 θu**

회전 행렬 R은 오차로 쓰기 불편하다. 그래서 축-각(axis-angle) 표현 θu를 쓴다.<br>
u는 회전축 단위벡터, θ는 그 축 둘레 회전각이다. 회전이 없으면 θu = 0이므로 오차로 쓰기 좋다.

$$
\frac{d(\theta u)}{dt} = L_{\theta u}\, \omega, \qquad L_{\theta u} = I_3 - \frac{\theta}{2}[u]_\times + \left(1 - \frac{\mathrm{sinc}\,\theta}{\mathrm{sinc}^2\frac{\theta}{2}}\right)[u]_\times^2
$$

중요한 성질은 $$L_{\theta u}^{-1}\,\theta u = \theta u$$라는 것이다([u]× u = 0이므로).<br>
그래서 회전 제어가 ω = −λθu로 아주 단순해진다.

**방법 1: s = (ᶜ\*t_c, θu)**

목표 카메라 좌표계에서 본 현재 카메라의 위치를 특징으로 쓴다. 목표에 도달하면 값이 모두 0이므로 s\* = 0, e = s이다.<br>
현재 카메라가 속도 ν로 움직이면, 목표 좌표계에서 본 위치 변화는 ν를 목표 좌표계로 회전시킨 것이다.

$$
L_e = \begin{pmatrix} R & 0 \\ 0 & L_{\theta u} \end{pmatrix}
$$

블록 대각이고 가역이므로 $$v = -\lambda L_e^{-1} e$$를 블록별로 풀 수 있다.

$$
\nu_c = -\lambda\, R^{T}\, {}^{c^*}t_c, \qquad \omega_c = -\lambda\, \theta u
$$

- 병진과 회전이 완전히 분리되고, 카메라 원점이 3D 공간에서 목표까지 직선으로 움직인다.
- 대신 영상 궤적은 신경 쓰지 않으므로 물체가 시야 밖으로 나갈 수 있다.

**방법 2: s = (ᶜt_o, θu)**

현재 카메라에서 본 물체 원점의 위치를 특징으로 쓴다. $$e = ({}^{c}t_o - {}^{c^*}t_o,\ \theta u)$$이다.<br>
물체 원점은 고정, 카메라가 움직이므로 4장의 점의 속도 식과 같다.

$$
\frac{d}{dt}{}^{c}t_o = -\nu - \omega \times {}^{c}t_o = -\nu + [{}^{c}t_o]_\times\, \omega \;\Rightarrow\; L_e = \begin{pmatrix} -I_3 & [{}^{c}t_o]_\times \\ 0 & L_{\theta u} \end{pmatrix}
$$

$$\dot{e} = -\lambda e$$가 되도록 풀면, 아래 블록에서 ω = −λθu를 먼저 구하고 이를 위 블록에 넣어 ν를 구한다.

$$
\nu_c = -\lambda\Big( ({}^{c^*}t_o - {}^{c}t_o) + [{}^{c}t_o]_\times\, \theta u \Big), \qquad \omega_c = -\lambda\, \theta u
$$

- 물체 원점이 영상에서도 거의 직선으로 움직이므로, 물체 중심을 원점으로 잡으면 시야 밖으로 나갈 위험이 줄어든다.
- 대신 카메라의 3D 궤적은 직선이 아니다.

**PBVS의 약점**

자세 추정이 캘리브레이션 오차와 영상 노이즈에 민감하다.<br>
오차가 0으로 수렴해도 그것은 추정한 자세의 오차이므로, 추정이 틀렸다면 실제 최종 위치도 틀린다.<br>
IBVS가 영상 오차를 직접 줄여 이런 오차에 강건한 것과 대비된다.

### ②Hybrid VS (2½D)

> 핵심
> 
> 회전은 3D(θu)로, 병진은 영상 특징 + 깊이 비율로 제어한다. IBVS와 PBVS의 장점을 섞은 방식이다.

$$
s = (x,\; y,\; \log Z,\; \theta u), \qquad e_t = \Big(x - x^*,\; y - y^*,\; \log\frac{Z}{Z^*}\Big), \qquad e_\omega = \theta u
$$

- (x, y): 영상 위 기준점의 좌표. 이 점을 영상 안에 붙잡아 둔다.
- log(Z/Z\*) = log ρ_Z: 현재 깊이와 목표 깊이의 비율. 현재 영상과 목표 영상 사이의 호모그래피(homography)를 분해하면 3D 모델 없이 구할 수 있다.
- θu: 목표 대비 회전. 역시 호모그래피 분해에서 얻는다.

**병진 부분의 상호작용 행렬 유도**

(x, y)의 변화는 4장의 L_x 두 줄 그대로이다. log Z의 변화는

$$
\frac{d}{dt}\log Z = \frac{\dot{Z}}{Z} = \frac{-v_z - \omega_x Y + \omega_y X}{Z} = -\frac{v_z}{Z} - y\,\omega_x + x\,\omega_y
$$

(Y/Z = y, X/Z = x 사용). 세 줄을 병진·회전 부분으로 나누면

$$
\dot{e}_t = L_v\, \nu + L_\omega\, \omega, \qquad L_v = \frac{1}{Z^*\rho_Z}\begin{pmatrix} -1 & 0 & x \\ 0 & -1 & y \\ 0 & 0 & -1 \end{pmatrix}, \qquad L_\omega = \begin{pmatrix} xy & -(1+x^2) & y \\ 1+y^2 & -xy & -x \\ -y & x & 0 \end{pmatrix}
$$

전체 행렬은 블록 삼각 형태이다.

$$
L_e = \begin{pmatrix} L_v & L_\omega \\ 0 & L_{\theta u} \end{pmatrix}
$$

**제어 법칙**

아래 블록부터 푼다. 회전은 PBVS와 같다.

$$
\omega_c = -\lambda\, \theta u
$$

위 블록은 $$L_v\nu + L_\omega\omega = -\lambda e_t$$를 ν에 대해 푼다.

$$
\nu_c = -L_v^{-1}\big(\lambda\, e_t + L_\omega\, \omega_c\big)
$$

- L_v는 상삼각 행렬이고 대각 성분이 −1/Z라서, Z > 0인 한 항상 가역이다. 특이점 걱정이 거의 없다.
- 회전과 병진이 분리되어 있어 큰 회전에서도 카메라가 뒤로 물러나지 않는다.
- 기준점이 영상에서 직선으로 움직이므로 시야 이탈 위험이 적다.
- 3D 모델이 필요 없고, Z\*만 대략 알면 된다.

슬라이드에는 s = (ᶜ\*t_c, x_g, θu_z)처럼 3D 병진, 영상 위 무게중심, 광축 회전 성분을 섞는 조합도 소개된다.<br>
무엇을 섞든 L과 e를 어떻게 정의하느냐만 다를 뿐 유도 틀은 2장과 같다.

### ③Partitioned VS

> 핵심
> 
> z축 관련 운동 (vz, ωz)만 따로 떼어 넓이와 각도로 제어하고, 나머지 4개는 IBVS로 제어한다. camera retreat 문제를 해결한다.

카메라 속도를 xy 관련 4개와 z 관련 2개로 나눈다.

$$
v_{xy} = (v_x,\, v_y,\, \omega_x,\, \omega_y), \qquad v_z = (v_z,\, \omega_z)
$$

상호작용 행렬의 열도 같은 방식으로 나누면

$$
\dot{s} = L\,v = L_{xy}\, v_{xy} + L_z\, v_z
$$

**1단계: z 관련 운동은 영상의 특별한 특징 2개로 직접 정한다.**

ωz는 영상 위 두 점을 잇는 선분의 각도 θ_ij를 쓴다. 광축 둘레로 돌면 이 각도가 그대로 돌기 때문이다.

$$
\omega_z = \lambda_{\omega_z}\,(\theta_{ij}^* - \theta_{ij})
$$

vz는 점들이 이루는 다각형 넓이의 제곱근 σ를 쓴다.<br>
원근 투영에서 길이는 1/Z에 비례하므로 넓이는 1/Z², 그 제곱근 σ는 1/Z에 비례한다.<br>
그래서 σ\*/σ ≈ Z/Z\*이고, 로그를 취하면 깊이 오차처럼 쓸 수 있다.

$$
v_z = \lambda_{v_z}\, \ln\frac{\sigma^*}{\sigma}
$$

**2단계: 나머지 4개는 IBVS로, z 운동의 영향을 미리 빼고 계산한다.**

$$L_{xy}v_{xy} + L_z v_z = -\lambda e$$를 v_xy에 대해 푼다. v_z는 이미 정해졌으므로 이항한다.

$$
v_{xy} = L_{xy}^{+}\big(-\lambda e - L_z v_z\big) = -L_{xy}^{+}\big(\lambda e + L_z v_z\big)
$$

기본 IBVS는 모든 점을 직선으로 보내려다 보니, 광축 회전이 필요할 때 점들이 중심으로 모이는 축소를 vz 후퇴로 만들어 낸다.<br>
Partitioned VS는 ωz를 선분의 각도로 직접 제어하므로 회전은 회전으로 처리되고, vz는 넓이(=깊이)로만 결정되어 불필요한 후퇴가 사라진다.

---

## 8. 실전 고려사항과 응용 예시

### ①(Some) practical aspects of VS

> 핵심
> 
> 점 하나로는 부족하고, 6자유도를 제어하려면 최소 3개, 실제로는 4개 이상의 점을 쓴다.

점 하나는 특징 2개 (x, y)뿐이라 L ∈ ℝ²ˣ⁶이다.<br>
식 2개로 미지수 6개를 정할 수 없으므로, 수렴했을 때 카메라 자세가 하나로 정해지지 않는다.

6자유도를 모두 제어하려면 최소 점 3개가 필요하다. 그러면 특징이 6개가 되어 L이 정사각 6×6이 된다.

$$
s = \begin{pmatrix} s_1 \\ s_2 \\ s_3 \end{pmatrix} \in \mathbb{R}^6, \qquad s^* = \begin{pmatrix} s_1^* \\ s_2^* \\ s_3^* \end{pmatrix} \in \mathbb{R}^6, \qquad L = \begin{pmatrix} L_1 \\ L_2 \\ L_3 \end{pmatrix} \in \mathbb{R}^{6\times 6}
$$

즉 제어 법칙에 들어가는 정보는 세 점의 값을 위아래로 쌓은(stack) 것이다. 각 L_i는 4장에서 구한 2×6 행렬이다.<br>
다만 점 3개는 특이 자세와 같은 영상을 주는 서로 다른 자세 4개 문제가 있어, 실제로는 점 4개 이상을 많이 쓴다.

어떤 특징을, 몇 개, 어떤 목표값으로 쓸지는 <mark class="pink">알고리즘 설계의 일부</mark>이다.<br>
같은 작업이라도 특징 선택에 따라 궤적, 안정성, 특이점이 크게 달라진다.

### ②응용 예시

<!-- ![](/assets/img/application-캡처.png) -->

| 예시 | 작업 | 구성 | 사용한 특징 |
|---|---|---|---|
| (1/5) Pick-and-place | 물체를 상자 안에 넣기 | Eye-in-hand | 상자 모서리의 점 4개 s₁~s₄ → 목표 s₁\*~s₄\* |
| (2/5) Robotic manipulation | 휴머노이드가 서랍 열고 닫기 | 휴머노이드 머리 카메라 | 서랍(프린터)의 직선 특징 |
| (3/5) Corridor navigation | 복도 가운데로 주행 | 휴머노이드 | 복도 경계 직선과 그로부터 얻은 점 |

- Pick-and-place: 영상 속 파란 점(현재 상자 모서리)이 목표 위치에 겹치도록 팔을 움직이면, 물체가 상자 바로 위에 놓인다.
- Robotic manipulation: 특징이 꼭 점일 필요는 없고 직선도 된다. 그래프는 VS 명령에 따라 서랍 열림 정도 q가 단계적으로 목표를 따라가는 모습을 보여 준다.
- Corridor navigation: 영상에서 복도 양쪽 경계선을 검출하고, 그 교점(소실점)이 영상 가운데 오도록 제어하면 로봇이 복도 중앙을 따라 걷는다. 모퉁이에 다가가면 경계선 모양이 바뀌는 것을 이용해 회전한다.

---

## 마무리 요약

1. VS는 카메라 영상을 피드백으로 쓰는 폐루프 로봇 제어이다. 오차는 e = s − s\*이다.
2. 카메라 모델 p̃ = K P (⁰T_c)⁻¹ P̃에서 3D 점이 픽셀이 되며 깊이 Z를 잃는다.
3. 투영식을 미분하고 점의 속도 −ν − ω×P를 대입하면 ṡ = L_x v이고, L_x는 (x, y, Z)의 함수인 2×6 행렬이다.
4. ė = −λe를 원하므로 Lv = −λe → v = −λL⁺e이고, L⁺ = (LᵀL)⁻¹Lᵀ이다.
5. Z를 모르므로 L_e, L_e\*, 또는 평균으로 근사한다. 평균이 보통 가장 좋다.
6. Lyapunov 함수 ½‖e‖²로 보면, 점 4개 이상에서는 국소 안정만 보장된다.
7. 스테레오는 깊이를, 원통좌표는 광축 회전을, Broyden은 모델 부재를 해결한다.
8. PBVS는 자세 (t, θu)를 특징으로 써서 제어가 단순하지만 모델과 캘리브레이션에 의존한다.
9. Hybrid 2½D는 회전은 θu, 병진은 (x, y, log Z/Z\*)로 제어해 특이점이 거의 없다.
10. Partitioned VS는 (vz, ωz)를 넓이·각도로 따로 제어해 camera retreat를 해결한다.

> 정리
> 
> 모든 방법이 "모델 ṡ = Lv → 원하는 오차 동역학 ė = −λe → v = −λL⁺e"의 3단계 틀을 따른다.
> 새로운 VS 기법을 만나도 s와 L을 어떻게 정의했는지만 보면 된다.

### 참고문헌

1. F. Chaumette, S. Hutchinson, "Visual servo control: Part I. Basic approaches," IEEE Robotics & Automation Magazine, 2006.
2. P. Corke, "Robotics, Vision and Control: Fundamental Algorithms in MATLAB," Springer, 2017.
3. B. Siciliano, L. Sciavicco, L. Villani, G. Oriolo, "Robotics: Modelling, Planning and Control," Springer, 2010.
4. Y. Ma, S. Soatto, J. Kosecka, S. Shankar Sastry, "An Invitation to 3-D Vision," Springer, 2012.
5. A. De Luca, "Visual servoing," Robotics 2 course slides, Sapienza University of Rome, 2020.
6. E. Marchand, F. Chaumette, "Feature tracking for visual servoing purposes," Robotics and Autonomous Systems, 2005.
7. E. Marchand, F. Spindler, F. Chaumette, "ViSP for visual servoing," IEEE Robotics & Automation Magazine, 2005.
8. F. Chaumette, "Image moments: a general and useful set of features for visual servoing," IEEE Transactions on Robotics, 2004.
9. C. Collewet, E. Marchand, "Photometric visual servoing," IEEE Transactions on Robotics, 2011.
10. A. Paolillo, A. Faragasso, G. Oriolo, M. Vendittelli, "Vision-based maze navigation for humanoid robots," Autonomous Robots, 2017.

---