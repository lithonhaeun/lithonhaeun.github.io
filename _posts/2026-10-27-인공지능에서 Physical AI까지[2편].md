---
title :  인공지능에서 Physical AI까지 [2편]
categories: [major, Physical AI]
description: 컴퓨터 네트워크 실습
---

> 2편 · AI가 로봇의 몸을 갖는다면?
---
### 사전 지식 정리
![img.png](/assets/img/physical-ai2-1.png)

|구분	| Digital AI	               | Physical AI       |
|---|---------------------------|-------------------|
|예시	| ChatGPT	                  | 로봇, 자율주행          |
|입력	| Text	                     | Vision + Language |
|출력| 	Text                     | 	Action           |
|결과가 나타나는 곳	| 화면 속                      | 	현실 세계            |
|비유	| 말로 다 해주는 훈수 장인	| 직접 해주는 일잘러        |

🔑 핵심 짚기<br>
1. Digital AI와 Physical AI의 결정적 차이는 출력이 Text냐 Action이냐
2. Physical AI는 입력도 Vision(보는 것) + Language(명령) 두 가지를 같이 받음 
3. <mark class="pink"> Physical AI = AI가 물리 세계를 인식하고 행동하는 것 📢</mark>

---

## 1. 로봇의 기초 — 왜 로봇은 어려운가

### 1-1. 로봇의 기본 구조 (Sense → Think → Act) 

![img_1.png](/assets/img/physical-ai2-2.png)
① Sense (감지) = 눈 👀<br>
센서로 세상 상태를 숫자로 측정하는 단계.
- Camera: 사진(이미지) 찍기. 1편에서 배웠듯이 컴퓨터한텐 결국 픽셀 숫자 덩어리. 색·모양 파악에 강함
- LiDAR: 레이저 쏴서 반사돼 돌아오는 시간으로 거리 측정 → 주변을 3D 점 구름(Point Cloud)으로 앎. 자율주행차 지붕에 빙글빙글 도는 그거
- Force Sensor (힘 센서): 물체 잡을 때 얼마나 세게 누르고 있는지 측정. 카메라로는 못 아는 정보. 이게 없으면 달걀 잡다가 퍽 🥚💥

포인트는 Sense 단계는 그냥 원재료 데이터 수집까지라는 거. "이게 사과다" 같은 해석은 아직 안 함.

② Think (판단) = 뇌 🧠<br>
센서 데이터를 받아서 "뭐가 있고, 어떻게 움직일지" 정하는 단계.
- Perception (인식): 센서 데이터 해석. "카메라 영상 속 저 빨간 덩어리 = 사과, 위치는 여기" → 1편의 CNN·VLM이 여기서 일함
- Planning (계획): 목표까지 어떻게 갈지 경로·동작 짜기. "팔을 이쪽으로 뻗어서, 장애물 피해서, 이 각도로 잡자"
- AI: 위 두 개를 해내는 두뇌 역할. 요즘 Physical AI 흐름이 바로 이 Think 칸을 AI가 통째로 맡는 방향 

- ③ Act (행동) = 손·발 🦾// 
판단한 걸 실제 물리적 움직임으로 실행하는 단계.
- Motor: 모든 움직임의 근본. 관절 돌리고 바퀴 굴리는 동력원
- Robot Arm: 물체 집고 옮기는 팔 (= 손 역할)
- Mobile Robot: 바퀴나 다리로 이동하는 로봇 (= 발 역할)

④ ↻ 계속 반복 (Loop) ⭐<br>
Sense → Think → Act가 한 번 하고 끝이 아님. 행동하면 세상이 바뀌니까(팔이 움직였고, 사과 위치가 바뀌었고) 다시 감지해서 다시 판단함.

### 1-2. Moravec의 역설 
>왜 로봇은 어려울까? Moravec 역설
![img_2.png](/assets/img/physical-ai2-3.png)

①  <mark class="pink">Moravec의 역설이 뭐임?</mark><br>
로봇공학자 한스 모라벡(Hans Moravec) 이 1980년대에 정리한 관찰. 요약하면 “AI는 천재인데 몸은 갓난아기” 라는 거
- 바둑으로 세계 챔피언 이긴 AI(알파고) 있음
- 근데 그 AI한테 로봇 팔 달아주고 "바둑돌 하나 집어서 놓아봐" 하면? → 은근 버벅임
- 수능 수학 킬러 문항은 풀어도, 세 살짜리가 하는 컵 집기는 어려움

왜 사람한텐 쉬울까? 이런 감각·운동 능력은 수억 년 
진화하면서 몸에 깔린 거라 무의식적으로 됨. 반면 수학·체스 같은 추상적 
사고는 진화적으로 최근에 생긴 거라 오히려 "어렵다"고 느끼는 것. 
우리가 컵 집을 때 "손가락 각도 30도, 힘 2N" 계산 안 하는거랑 같음.
그래서 너무 쉬워서 오히려 어떻게 하는지 설명을 못 함 → 로봇한테 가르치기도 어려움.

② 로봇이 어려운 이유 3가지 ⭐ 
1. 현실은 불확실하다 (조명, 마찰, 무게)
   - 조명: 같은 사과도 형광등 밑이랑 햇빛 밑이랑 카메라에 다르게 찍힘
   - 마찰: 젖은 컵이랑 마른 컵은 잡는 힘이 달라야 함
   - 무게: 물 가득 찬 컵이랑 빈 컵은 들 때 필요한 힘이 다름
   - 체스판은 언제나 8×8인데, 현실은 매번 조건이 바뀜
2. 실시간으로 반응해야 한다
   - ChatGPT는 답 생각하느라 3초 걸려도 괜찮음. 근데 로봇이 넘어지는 중에 3초 고민하면 이미 바닥에 누워 있음 ㅋㅋ
   - Sense → Think → Act 루프를 초당 수~수십 번 돌려야 함
3. 학습할 데이터가 부족하다
   - LLM은 인터넷 전체 텍스트로 학습함. 근데 "로봇이 컵 집는 데이터"는 인터넷에 거의 없음
   - 로봇 데이터는 실제로 로봇 움직여서 하나하나 모아야 해서 느리고 비쌈

### 1-3. 로봇 지능의 시대 변천
![img_3.png](/assets/img/physical-ai2-4.png)

흐름 정리 : 사람의 역할이 점점 줄어듦<br>

|시대	|사람이 하는 일|	로봇이 하는 일|
|---|---|---|
|규칙	|동작 전부 코딩	|그대로 반복|
|모듈	|모듈별로 설계|	모듈 조합해서 실행|
|딥러닝|	데이터 모아주기	|데이터로 스스로 학습|
|Foundation Model|	말로 명령하기|	보고·이해하고·행동 다 함|

### 1-4. 기존 Robot Programming (Module Pipeline)
![img_4.png](/assets/img/physical-ai2-5.png)
① 파이프라인 6단계 (사과 집기로 따라가 보기 🍎)

|단계|	하는 일	|사과 예시|	구조|
|---|---|---|---|
|Camera|	영상 입력	|식탁 사진 한 장 찰칵|	Sense|
|Object Detection|	물체 찾기	|"사진 이 부분에 사과 있음" (네모 박스)	|Think|
|Pose Estimation	|위치·자세 추정|	"사과는 로봇 기준 앞 30cm, 왼쪽 5cm, 꼭지는 위쪽"	|Think|
|Motion Planning|	경로 계획|	"컵 안 치고 사과까지 팔을 이 경로로 뻗자"	|Think|
|Controller	|모터 제어	|“1번 관절 30도, 2번 관절 45도 돌려”	|Act|
|Robot	|실행	|실제로 팔 움직여서 사과 잡음|	Act|

 <mark class="pink">모듈을 각각 따로 만들고, 연결은 사람이 설계한다는 것.</mark>

② <mark class="pink"> 모든 Module을 사람이 직접 설계 (규칙, 파라미터, 예외 처리)</mark>
- 규칙: "빨간색 + 동그라미 = 사과" 같은 판단 기준
- 파라미터: 그리퍼 쥐는 힘 몇 N, 팔 속도 몇 cm/s 같은 숫자 세팅
- 예외 처리: "사과가 안 보이면?", "사과가 두 개면?", "가려져 있으면?" 같은 상황별 대처 → if…else… 지옥의 시작 

③ **장점** : 각 단계를 이해하고 디버깅하기 쉽다<br>
모듈이 나뉘어 있으니까 문제 생기면 어디서 터졌는지 바로 찾을 수 있음.
- 로봇이 사과를 못 잡음 → 모듈별 출력 확인 → "아 Pose Estimation이 위치를 3cm 틀리게 냈네" → 그 모듈만 고치면 됨
- 왜 그렇게 움직였는지 설명이 가능함. 공장·자동차처럼 안전이 중요한 곳에서 아직도 많이 쓰는 이유

④ **한계 1** :  <mark class="mint">앞 단계 오류가 뒤로 전파 ⭐</mark>
<br>파이프라인은 한 줄로 이어져 있어서 앞에서 실수하면 뒤 모듈은 그걸 믿고 그대로 진행함.
- Detection이 사과 위치를 살짝 잘못 찾음 → Pose가 틀린 위치를 계산 → Planning이 틀린 곳으로 경로 짬 → 로봇은 자신 있게 허공을 잡음 🫳
- 뒤 모듈은 앞 모듈 실수를 고칠 방법이 없음. 완전 오류 릴레이 계주 ㅋㅋ
- 작은 오차가 단계 지날수록 커질 수 있음

⑤ **한계 2** : 새 환경/물체마다 다시 설계<br>
사과용으로 열심히 만들어놨는데…
- 물체가 손잡이 달린 머그컵으로 바뀌면? → 잡는 위치·방법 다시 설계
- 조명이 바뀌면? → 색깔 규칙 다시 튜닝
- 주방에서 창고로 옮기면? → 사실상 처음부터

>이 한계 때문에 “사람이 다 설계하지 말고, 카메라에서 행동까지 데이터로 통째로 배우게 하자”는 아이디어가 나옴

## 2. Robot Learning — 로봇은 어떻게 배우는가

### 2-1. 모든 행동을 직접 Programming해야 할까? 
![img_5.png](/assets/img/physical-ai2-6.png)
Robot에게 행동 100개를 하나하나 Programming한다면 시간 비용 폭발하고, 예외 상황은 무한이고,
유지 보수 지옥에 새 환경이면 다시 처음부터 코딩해야겠죠?

### 2-2. Robot Learning과 Policy 
>해결 방향 = 프로그래밍 대신 데이터로 배우게 하자 → Robot Learning
![img_6.png](/assets/img/physical-ai2-7.png)

① "로봇도 데이터로 배우게 하자"<br>
- 기존: 사람이 pick_cup.py 에 if…else 수백 줄 작성
- Robot Learning: 사람이 컵 집는 걸 몇십~몇백 번 보여줌 → 로봇이 데이터에서 패턴 찾아서 스스로 익힘

1편에서 배운 머신러닝 = 규칙 대신 데이터로 학습 을 로봇에 그대로 적용한 것.

② Demonstration → Learning → Robot Policy (윗줄)<br>
Robot Learning이 굴러가는 3단계.
- **Demonstration (사람의 시범)**: 사람이 직접 로봇을 조종하거나 시범을 보여서 "이럴 땐 이렇게 해" 데이터를 만듦. 어떻게 모으는지는 10~11페이지에서 자세히
- **Learning (학습)**: 그 데이터로 신경망을 학습. 1편의 Training Loop(예측 → Loss 계산 → Weight 수정) 그대로임
- **Robot Policy (로봇 정책)**: 학습이 끝나서 나온 **결과물(모델)**. 이제 이게 로봇의 두뇌 역할

1편식으로 말하면 Data → Learning → Model 에서 Model 
자리에 Robot Policy가 들어간 거. 

③  <mark class="pink">Policy (정책)란? ⭐</mark><br>
**Observation(관찰)**을 보고 어떤 **Action(행동)**을 할지 결정하는 모델.
- 그냥 "이 상황엔 이렇게 행동한다" 는 행동 규칙 이라고 생각하면 됨
- 차이는 그 규칙을 사람이 if…else로 쓰는 게 아니라 신경망이 데이터로 배운다는 것
- 함수로 쓰면 그냥 Action = Policy(Observation). 입력 넣으면 행동 나오는 기계

④ Observation → Policy → Action <br>
- Observation (카메라 영상): 지금 로봇이 보는 장면. "식탁 위에 컵 있음"
- Policy: 그 장면 보고 판단
- Action (팔의 움직임): "팔을 앞으로 2cm, 아래로 1cm, 그리퍼 닫기" 같은 실제 움직임 명령

그리고 이게 한 번 하고 끝이 아니라 루프처럼 매 순간 반복됨.

### 2-3. Imitation Learning (모방 학습) 
![img_7.png](/assets/img/physical-ai2-8.png)
①  <mark class="pink">Imitation Learning (모방 학습) </mark>이 뭐냐면요~<br>
이름 그대로 사람이 하는 걸 보고 따라 배우는 방법이에요. "로봇도 데이터로 배우게 하자" 했잖아요? 그럼 그 데이터를 어디서 얻겠어요… 짠! 사람의 시범에서 얻는 거죠 우히히

- 우리도 어릴 때 엄마가 젓가락질하는 거 보고 따라 했잖아요? 그거랑 똑같아요 🥢
- 그래서 핵심 문장이 Learning by Demonstration : 보여주면 따라 배운다 랍니다

②  <mark class="pink">Teleoperation (원격 조종) </mark>으로 시범 보여주기
<br>근데 사람 손이랑 로봇 팔은 생긴 게 다르잖아요? 그래서 그냥 사람이 하는 걸 찍기만 하면 로봇이 "제 팔은… 어떻게 움직이라는 거죠…?" 하고 멍때려요 
그래서 사람이 로봇을 직접 조종해서 시범을 보여줘요.

- 사람이 조종 장치를 움직이면 → 로봇 팔이 똑같이 따라 움직임
- 그러면 로봇 몸 기준으로 "이럴 땐 이렇게 움직였다" 는 정확한 기록이 남겠죠?
- 마치 인형극 하듯 로봇을 조종하는 느낌이에요 🎎

③ Mobile ALOHA (Stanford)**** 소개합니다~ 어머!<br>
 스탠퍼드에서 만든 바퀴 달린 양팔 로봇인데요,
<br>사람이 뒤에서 조종하면서 집안일 시범을 보여주면
<br>학습 후엔 혼자서 요리하고, 정리하고, 청소까지 해요 77ㅑ 🍳🧽
<br>14페이지에서 다시 나오는데, 50번 정도 시범만으로 이런 작업을 배웠다고 해요. 

④ 학습 과정 5단계 따라가 볼게요~
1. Human Demonstration: 사람이 로봇을 조종해서 컵 집기 시범! 🙋
2. Camera Image + Robot Action 쌍 기록 ⭐: 매 순간마다 
   - 그때 로봇이 본 것 (카메라 이미지)
   - 그때 로봇이 한 것 (팔 움직임)
   - 이 두 개를 한 쌍으로 저장해요. "이 장면에선 → 이렇게 움직였다" 짝꿍 세트 💑
3. Dataset: 이걸 수백~수만 번 반복해서 모아요. 시범 보여주는 사람… 팔 빠지겠죠? 
4. Neural Network 학습: 모은 쌍으로 신경망을 학습시켜요. "이런 장면이 오면 → 이런 행동"을 패턴으로 익히는 거죠
5. Robot Policy: 짠! 학습 끝! 이제 사람 없이 스스로 행동해요. 9페이지에서 배운 Policy가 바로 이거랍니다~

 <mark class="mint">모방 학습은 사람의 행동을 정답지로 쓰는 지도학습이라고 보면 돼요.
 </mark>

### 2-4. 로봇 데이터 수집 방법 4가지
>Moravec 기억나시죠? 로봇이 어려운 이유 3번이 "학습할 데이터가 부족하다" 였어요. LLM은 인터넷 글 긁어오면 끝인데, 로봇 데이터는 인터넷에 없으니까… 직접 모아야 하겠죠?

![img_8.png](/assets/img/physical-ai2-9.png)

- Teleoperation: 정확 ↔ 느리고 비쌈
- VR·모션 캡처: 직관적 ↔ 장비 필요
- Human Video: 엄청 많음 ↔ 로봇 행동 정보 없음
- Simulation: 무한·안전·빠름 ↔ 현실과 차이
- 정확한 데이터는 적고, 많은 데이터는 부정확한 트레이드오프가 있어서 섞어 쓴답니다 우히히
- 데이터 부족 문제를 풀려고 Open X-Embodiment, LeRobot 같은 공개 데이터셋으로 다 같이 모으는 중이에요~

### 2-5. Behavior Cloning (행동 복제)
Behavior Cloning 구조
![img_9.png](/assets/img/physical-ai2-10.png)
![img_10.png](/assets/img/physical-ai2-11.png)

Classification (분류) = 객관식 📝<br>
- 고양이 사진 넣으면 “Cat 95%, Dog 4%, Fox 1%” 처럼 미리 정해진 보기 중에서 고름
- 정답이 "고양이 / 개 / 여우" 처럼 딱딱 나눠진 카테고리
- 1편에서 본 CNN 이미지 분류가 이거

 <mark class="mint">Behavior Cloning</mark> = 회귀 (주관식, 숫자 쓰기) 🔢<br>
- 사진 넣으면 [0.42, −0.10, 0.05, 1] 처럼 숫자를 직접 예측
- 왜 객관식이 안 되냐면, 팔 움직임은 0.42도 되고 0.421도 되고 0.4213도 됨. 보기를 미리 다 만들어 둘 수가 없음 → 연속적인 숫자라서 회귀로 풀어야 함
- 이렇게 숫자를 직접 맞히는 문제를 Regression (회귀) 라고 함

### 2-6. Behavior Cloning의 한계 (Compounding Error) 
![img_11.png](/assets/img/physical-ai2-12.png)
- 점선 = 사람이 시범 보여준 길 (출발 → 사과까지 깔끔하게 직진)
- 초록 띠 = 시범 데이터가 있는 영역 = 로봇이 "이런 장면은 본 적 있음" 하는 구간
- 실선 = 학습된 로봇이 실제로 간 길. 처음엔 살짝 어긋나다가 점점 미친 듯이 벌어짐 

1. 작은 오차: BC는 사람을 100% 완벽하게 못 베낌. 1cm 정도 살짝 삐끗함. 여기까진 ㄱㅊ
2. 처음 보는 상황 ⭐: 근데 그 1cm 때문에 로봇은 시범 때 한 번도 안 본 장면에 들어가게 됨. 사람은 항상 정석 경로로만 다녔으니까 "살짝 벗어난 장면" 데이터가 없음
3. 더 큰 오차: 처음 보는 장면이니 어떻게 해야 할지 모름 → 엉뚱하게 움직임 → 더 이상한 장면 → 더 엉뚱하게… 무한 악순환 🌀 결국 사과는 저 밑에 있는데 로봇은 허공 잡으러 감

① 핵심 원인: 내 행동이 다음 장면을 바꾼다<br>
1편 이미지 분류는 사진 한 장 맞히고 끝. 내가 틀려도 다음 사진엔 영향 없음.
근데 로봇은  루프(Sense → Think → Act)대로 내가 움직인 결과가 
다음에 볼 장면이 됨. 그래서 실수가 실수를 부르는 구조 → 
이게  <mark class="pink">Compounding(복리처럼 쌓이는) Error</mark> 라는 이름의 이유. 이자 붙듯이 오차가 불어남 💸

② Distribution Shift는 또 뭐임?
- 학습할 때 본 장면들 = 사람이 다닌 장면들 (초록 띠)
- 실행할 때 보는 장면들 = 로봇이 다니는 장면들 (띠 밖으로 나감)
- 두 장면 모음(분포, Distribution)이 점점 달라진다(Shift) 는 뜻. 같은 현상을 "원인" 쪽에서 부른 이름이 Distribution Shift, "결과" 쪽에서 부른 이름이 Compounding Error라고 보면 됨

>그럼 어떻게 해결함?

③ <mark class="mint"> 다양한 데이터</mark> : 실수에서 회복하는 시범도 포함<br>
문제가 "벗어난 장면을 본 적 없음" 이었으니까, 일부러 보여주자는 거.
- 시범 보여줄 때 일부러 살짝 삐끗한 다음 → 다시 제자리로 돌아오는 장면도 녹화

④  <mark class="mint">DAgger</mark> : 로봇이 틀릴 때 사람이 교정<br>
뒤의 계보에도 나오는 방법 (2011, CMU). 이름은 Dataset Aggregation (데이터 모으기)의 줄임말.
1. 일단 학습한 로봇을 직접 돌려봄 → 당연히 이상한 데로 감
2. 로봇이 간 그 이상한 장면에서 사람이 "여기선 이렇게 했어야지" 하고 정답 행동을 알려줌
3. 그 데이터를 기존 데이터에 추가(Aggregation) 해서 다시 학습
4. 반복
→ 로봇이 실제로 가는 장면 데이터를 채워 넣으니까 Distribution Shift를 정면으로 해결. 단점은 사람이 계속 옆에 붙어서 첨삭해줘야 함 (과외쌤 st.)

⑧  <mark class="mint">Action Chunk</mark> : 여러 step을 한 번에 예측<br>
매 순간 한 동작씩 결정하지 말고, 앞으로 몇 동작을 묶음(Chunk)으로 한 번에 예측하는 것.
- 예: 한 번에 "다음 1초 동안 할 움직임 전체" 를 예측
- 결정 횟수가 줄어드니까 오차가 쌓일 기회 자체가 줄어듦

⑤  <mark class="mint">더 큰 사전학습 모델 활용</mark> (→ VLA)
<br>처음 보는 상황에 약한 근본 이유 = 모델이 시범 데이터만 알아서임. 그럼 애초에 세상을 많이 아는 모델을 쓰면?
- 인터넷 이미지·글로 미리 학습된 큰 모델(1편의 VLM)은 "처음 보는 장면" 도 대충 뭔지 앎
- 이걸 로봇 뇌로 쓰면 일반화가 훨씬 잘 됨 → 이게 바로 곧 나오는 VLA. 

결론 : 따라 하기만으로는 부족하다
<br>BC는 단순하고 잘 작동하지만, 베끼기만 해서는 현실의 끝없는 변수를 못 따라감.

### 2-7. Imitation Learning의 계보
>Imitation Learning의 계보 (대표 연구만)

|연도|	연구	|기관	| 한 일                         | 	의미                        |흐름|
|---|---|---|-----------------------------|----------------------------|---|
|1989	|ALVINN	|CMU	| 카메라 → 신경망 → 핸들 각도           | 	최초의 Behavior Cloning 자율주행 |초기 ,개념 확립|
|2011	|DAgger|	CMU	| 로봇이 틀린 곳에서 사람이 교정           | 	누적 오차 문제 해결               |초기, 개념 확립|
|2016|	PilotNet	|NVIDIA| 	CNN으로 End-to-End 운전        | 	Deep Learning + BC        |딥러닝|
|2023|	ACT · ALOHA	|Stanford	| 저가 양팔 로봇 + Action Chunk	    | 정교한 양손 작업                  |저가 하드웨어 + 생성모델 ->  실용화|
|2023|	Diffusion Policy|	Columbia · TRI	| Diffusion으로 행동 생성           | 	다양한 해법을 표현                | 저가 하드웨어 + 생성모델 ->  실용화     |
|2024|	Mobile ALOHA	|Stanford| 	움직이며 집안일| 	50회 시범으로 요리·청소            | 저가 하드웨어 + 생성모델 ->  실용화     |



### 2-8. Robot Action이란? (End-effector vs Joint) 
![img_12.png](/assets/img/physical-ai2-13.png)

① Robot Action = 로봇한테 보내는 "움직임 숫자"<br>
Policy가 Action을 출력한다고 했잖음. 근데 "팔을 움직여" 라고 말로 할 순 없으니까 결국 숫자 묶음으로 줘야 함. 그 숫자를 어떤 기준으로 쓰느냐에 따라 방법이 2개로 나뉨.
- 비유: 친구한테 길 알려줄 때
  - 방법 1 = "목적지까지 앞으로 10m, 오른쪽 5m" (어디로 갈지)
  - 방법 2 = "왼발 30cm, 오른발 30cm, 무릎 몇 도…" (몸을 어떻게 움직일지)

② 방법 1. 손끝 움직임 — End-effector Action (왼쪽 그림)<br>
- End-effector = 로봇 팔 맨 끝, 물건을 직접 잡는 손 부분 (그리퍼). 그림의 주황 동그라미
- 이 손끝을 어디로 얼마나 옮길지를 숫자로 줌
  - Δx, Δy, Δz (위치 변화): 앞뒤·좌우·위아래로 얼마나 이동할지. Δ(델타) = 변화량이라는 뜻. "지금 위치에서 이만큼 더" 라는 상대값
  - Δrotation (회전 변화): 손목을 얼마나 돌릴지. 컵 손잡이 방향 맞추거나 뚜껑 돌릴 때 필요
  - gripper (열기/닫기): 집게 상태
- [x, y, z, gripper] 가 바로 이 방식 (회전만 빼고 단순화한 버전). 
- 장점: 사람이 이해하기 쉬움. "사과 쪽으로 손 뻗어" 랑 바로 연결됨 
- 대신 손끝 목표를 주면 각 관절을 몇 도 돌려야 그 위치가 되는지는 따로 계산해야 함

③ 방법 2. 관절 각도 — Joint Action (오른쪽 그림)<br>
- 로봇 팔은 관절(보라 동그라미) 여러 개로 이루어짐. 산업용 로봇 팔은 보통 6~7개
- 각 관절에 달린 모터를 몇 도 돌릴지를 Joint 1부터 Joint N까지 숫자로 직접 줌
  - 예: [Joint1 +5°, Joint2 −3°, Joint3 +10°, …]
- 장점: 모터한테 바로 꽂히는 명령이라 중간 계산 없음. 정밀하게 제어 가능
- 단점: 사람이 보고 "그래서 손이 어디로 가는데?" 바로 감이 안 옴. 그리고 로봇마다 관절 개수·길이가 달라서 A 로봇 관절 명령을 B 로봇에 그대로 못 씀

⑤  <mark class="mint">LLM은 Token을 출력 </mark>/ 
 <mark class="pink">Robot Policy는 Action</mark>을 출력 ⭐
<br>
- LLM: 문장 넣으면 다음 Token(단어 조각) 을 하나씩 출력 → 글이 됨
- Robot Policy: 이미지 넣으면 다음 Action(움직임 숫자) 을 하나씩 출력 → 움직임이 됨

---

## 3. Language를 로봇에게 — VLA로 가는 길

### 3-1. Camera만 보는 Policy의 문제 (Task information)
그런데 문제가 있다!
![img_13.png](/assets/img/physical-ai2-14.png)

① 상황 설명<br>
식탁 위에 빨간 블록, 파란 블록, 컵, 상자가 다 있는 장면. 지금까지 배운 Policy(9~15페이지)한테 이 카메라 이미지를 넣으면?
→ Policy: “...그래서 뭐 하라고요?” 🤔

빨간 블록 집을 수도 있고, 파란 블록 집을 수도 있고, 컵을 상자에 넣을 수도 있음. 장면은 하나인데 할 수 있는 일이 여러 개라 뭘 해야 할지 모름.

② Camera만 보는 Policy는 한 가지 작업만 할 수 있다 ⭐<br>
그래서 지금까지 방식으론 작업 하나당 Policy 하나를 따로 학습해야 함.
- "빨간 블록 집기 전용 Policy", "파란 블록 집기 전용 Policy", "컵 넣기 전용 Policy"…
- 근데 이거 어디서 많이 봄 👀 코드 파일이 Policy 파일로 바뀌었을 뿐 작업마다 따로 만드는 구조는 그대로
- 데이터로 배우게 만들었더니 이번엔 "작업 수만큼 모델이 필요" 하다는 벽에 다시 부딪힌 거

③ 해결 방향 : <mark class="pink"> Task information (작업 정보) 가 필요하다</mark><br>
로봇한테 "지금 뭘 해야 하는지" 를 입력으로 같이 알려주자는 것.
- 기존: Action = Policy(이미지)
- 개선: Action = Policy(이미지 + 작업 정보)

그러면 같은 장면이라도 작업 정보만 바꾸면 다른 행동이 나옴 → Policy 하나로 여러 작업 가능

비유하면 식당 주방장한테 재료만 쫙 보여주고 "요리해" 하면 뭘 만들지 모름. 주문서(작업 정보) 를 같이 줘야 김치찌개든 된장찌개든 만들 수 있음 🍲

### 3-2. Language Instruction 추가
>Language를 Robot에게 주자

![img_14.png](/assets/img/physical-ai2-15.png)
- 입력에 Language Instruction (언어 명령) 을 추가
- 예: 카메라 이미지 + “Pick up the red block.” → 로봇이 빨간 블록을 집음 (Robot picks the red block)
- Action = Policy(이미지) → Action = Policy(이미지 + 언어)

 <mark class="pink">같은 Policy가 명령만 바꾸면 다른 일을 한다</mark>

### 3-3. VLA 직전: LLM이 계획을 세우다 (SayCan · PaLM-E) 

![img_15.png](/assets/img/physical-ai2-16.png)

① **"음료를 쏟았어. 도와줄래?" 가 왜 어려움?**<br>
Policy는 "빨간 블록 집어" 처럼 할 일을 대놓고 말해줘야 알아들음. 근데 이 문장엔 "스펀지" 도, "집어" 도 없음 ㅋㅋ
- 사람은 바로 앎: 음료 쏟음 → 닦아야 함 → 스펀지 필요 → 가져다줘야 함
- 이건 상식 + 단계별 추론이 필요한 말. 단순 Policy는 이런 생각을 못 함
<br>→ 근데 1편에서 배운 LLM은 이런 거 개잘함 (인터넷 텍스트로 세상 상식을 다 배웠으니까). 그래서 LLM한테 "계획"을 맡기자!

② **구조 : LLM = 머리, 스킬 라이브러리 = 몸**
1. 사람이 말로 요청 
2. LLM (계획): 무엇을 할지 단계별로 쪼갬 → 1. 스펀지 찾기 / 2. 스펀지 집기 / 3. 사람에게 가져가기 
3. 스킬 라이브러리 (사람이 준비): 각 단계를 실제로 실행할 동작 모음. find(찾기), pick(집기), place(놓기) 같은 기본 동작을 미리 만들어 둔 것 
4. Robot: 스킬대로 실제로 움직임<br>
비유하면 LLM은 팀장 🧑‍💼 (뭘 할지 지시), 스킬 라이브러리는 현장 직원들 👷 (각자 맡은 동작만 함).

<관련 연구>

|연구	|연도	| LLM이 하는 일                          |	핵심 포인트|
|---|---|------------------------------------|---|
|SayCan	|2022	| LLM이 할 수 있는 스킬 중 다음 단계 선택	         |Say(유용함) × Can(실행 가능)|
|Code as Policies	|2022| LLM이 	로봇 제어 코드 작성                  |	계획을 코드로 표현|
|PaLM-E	|2023	| 이미지와 로봇 상태를 LLM에 직접 넣은 Embodied 모델 |LLM에 시각 입력 (Embodied)|


④  <mark class="pink">한계 : 계획은 LLM, 움직임은 따로</mark> ⭐
<br>세 연구 다 공통 약점이 있음.
- LLM이 아무리 계획을 잘 세워도 실제 움직임(스킬)은 사람이 따로 만들어야 함
- 스킬 라이브러리에 없는 동작은 못 함 → 결국 스킬 만드는 노가다는 그대로
- 머리랑 몸이 분리돼 있어서, 계획이 좋아도 스킬이 실패하면 끝

>그래서 → VLA
"그럼 보고 · 이해하고 · 움직이는 것을 아예 하나의 모델로 합치면 되잖아?"
---

## 4. VLA — 보고, 이해하고, 움직이는 모델


### 4-1. VLA : Vision-Language-Action
![img_16.png](/assets/img/physical-ai2-17.png)

①  <mark class="pink">**VLA = Vision + Language + Action**</mark><br>
이름 자체가 정의임. 세 글자가 각각 질문 하나씩 담당 👇
- **V (Vision)** — "무엇이 보이는가?": 카메라로 현재 장면 보기. "식탁 위에 빨간 사과, 그 옆에 컵" → 1편 CNN·VLM의 눈
- **L (Language)** — "무엇을 해야 하는가?": 사람 명령 이해하기. “Pick up the red apple.” → 1편 LLM의 언어 이해
- **A (Action)** — "어떻게 움직일 것인가?": 실제 로봇 움직임 출력. Δx, Δy, Δz, gripper → 2편 Policy·Robot Action

그리고 이 셋을 하나의 모델에서 다 처리하는 게 VLA.

② Vision + Language → VLA → Action
- 입력 2개: 카메라 이미지 + 언어 명령
- 출력 1개: 로봇 행동 (Action)
- “Vision + Language → AI → Action”. 즉 VLA = Physical AI를 실제로 구현한 모델

>VLM vs VLA 가장 큰 차이 = 출력: VLM은 언어, VLA는 행동

### 4-2. VLM vs VLA 
![img_17.png](/assets/img/physical-ai2-18.png)

①Input (입력) : 똑같음 =<br>
둘 다 Vision + Language. 카메라 이미지 보고, 사람 말 듣는 건 완전 동일함.
→ 그래서 VLA는 VLM의 눈과 귀를 그대로 재활용할 수 있음 (21페이지 핵심 구조 떡밥)

Output (출력) : 여기서 갈림 ≠ ⭐<br>

- VLM → Language (문장): 보고 이해한 걸 말로 내뱉음
- VLA → Action (로봇 움직임): 보고 이해한 걸 몸으로 실행함


### 4-3. VLA의 핵심 구조
![img_18.png](/assets/img/physical-ai2-19.png)

1. VLA 구조: Camera → Vision Encoder / Instruction → Language Model → Multimodal Representation → Action Head → Robot Action 📢 흐름 그대로 외우기
2. 사전학습된 VLM의 "눈과 뇌"를 재사용 (Vision Encoder, Language Model, Multimodal Representation)
3. 새로 붙인 "행동 출력부" = <mark class="pink"> Action Head</mark> → 로봇 데이터로 학습
4. 핵심: 인터넷에서 배운 시각·언어 지식을 로봇 행동으로 연결한다 → 로봇 데이터 부족 문제를 우회하고 처음 보는 상황에도 일반화

Action Head → Robot Action 🦾
- 합쳐진 표현을 받아서 로봇 움직임 숫자로 변환하는 새 부품
- 출력 = Δx, Δy, Δz, Δrotation, gripper 같은 것

### 4-4. Action 표현 방법 4가지 
>Action을 어떻게 표현할까?

![img_19.png](/assets/img/physical-ai2-20.png)

①  <mark class="pink">Continuous Action — 숫자를 직접 예측 (왼쪽 위)</mark><br>
제일 기본. Behavior Cloning에서 본 그 방식 그대로임.
- 출력: [0.12, −0.05, 0.31] 처럼 위치 변화를 숫자 그대로 내뱉음 (= 회귀)
- 장점: 단순하고 직관적. 숫자 그대로라 정밀함
- 단점: Diffusion Policy 때 말한 평균 내기 문제. 
왼쪽으로 피해도 되고 오른쪽으로 피해도 되면 → 평균 내서 정면 돌파
그리고 한 step씩이라 누적 오차에도 약함

②  <mark class="pink">Action Token — 움직임을 Token으로 표현 (오른쪽 위) ⭐</mark><br>
- 연속적인 숫자를 구간으로 잘라서 번호표를 붙임
  - 예: −1 ~ +1 범위를 256칸으로 쪼개면 0.12는 “132번 칸” → ⟨a_132⟩ 라는 Token
- 그러면 행동이 단어처럼 됨 → LLM이 다음 단어 예측하듯이 다음 행동 Token을 예측하면 끝
- 즉 Action Head를 따로 안 달고 VLM의 말하는 능력을 그대로 행동에 씀. 행동이 그냥 "로봇 언어" 가 된 것 🗣️🦾
- 대표: RT-2 (첫 VLA), OpenVLA (오픈소스)
- 단점: 칸으로 자르니까 칸 사이 값은 표현 못 함 (정밀도 한계), Token을 하나씩 뽑아서 느릴 수 있음

③  <mark class="pink">Action Chunk — 여러 Step을 한 번에 예측 (왼쪽 아래)</mark><br>
- 한 번에 t, t+1, t+2, t+3, t+4 처럼 앞으로 할 동작 여러 개를 묶어서 예측
  - 예: 1초 분량을 한 번에
- 장점: 결정 횟수가 줄어서 누적 오차 ↓, 동작이 덜 버벅이고 부드러움
- 단점 : 묶음 중간엔 반응 늦을 수 있음
- 비유: 운전할 때 1cm마다 핸들 각도 고민하는 게 아니라 "다음 코너는 이렇게 돌자" 하고 한 덩어리로 계획하는 느낌
- 참고로 이건 다른 방법들이랑 섞어 쓰는 경우가 많음 (예: 생성 방식으로 Chunk를 뽑기)

④ <mark class="pink"> Generative Action — Diffusion / Flow 기반 생성 (오른쪽 아래</mark>)<br>
1편 생성형 AI 기억나지? 이미지 생성 AI는 노이즈(지지직 화면)에서 시작해서 조금씩 다듬어 그림을 만들어냄. 그걸 행동에 그대로 씀.
- 그림 왼쪽 흩어진 점 = noise → 여러 번 다듬으면 → 오른쪽 깔끔한 행동 경로
- **Diffusion**: 노이즈를 단계별로 조금씩 제거해서 행동 생성 ( Diffusion Policy)
- **Flow**: 노이즈에서 정답까지 더 곧게 가는 길을 배워서 더 빠르게 생성 (π0가 이 방식)
- 장점: 정답이 여러 개여도 평균 안 내고 그중 하나를 골라 깔끔하게 생성 → 왼쪽이든 오른쪽이든 확실하게 피함 ✅ 그래서 빨래 개기처럼 섬세하고 다양한 동작에 강함
- 단점 : 생성 과정이 복잡
- 대표: Diffusion Policy, π0 

>핵심: 글과 그림처럼 로봇의 움직임도 AI가 생성할 수 있다

### 4-5. VLA가 사과를 집는 과정
![img_20.png](/assets/img/physical-ai2-21.png)

① 명령 하나 → 행동 여러 개<br>
사람은 “Pick up the red apple.” 딱 한 번 말함. 근데 로봇은 그걸 한 방에 처리하는 게 아니라 작은 동작 여러 개로 쪼개서 차근차근 실행함.

>한 번에 끝나지 않는다: 매 순간(초당 수~수십 번) 다시 보고, 다시 예측하고, 다시 움직인다 📢<br>
계속 다시 보기 때문에 변하는 현실과 작은 오차에 대응 가능 (누적 오차 대응)

### 4-6. VLA의 계보도

![img_21.png](/assets/img/physical-ai2-22.png)

1. VLA 계보는 데이터·기반 / Token 방식 / 생성 방식 / 휴머노이드·범용 4계열로 발전 중
2. RT-2 (2023) = 첫 VLA 하나는 기억해 두면 좋음 (VLM + 행동 Token)
3. 표현 방법이 실제 모델로: Action Token → RT-2·OpenVLA / Generative Action → Octo·π0
4. 방향: 더 많은 로봇 · 데이터 · 작업을 하나의 Foundation Model로 📢 (이름보다 이 문장이 중요!)
    ![img_22.png](/assets/img/physical-ai2-23.png)

---

## 5. 확장 — 더 크고 범용적인 로봇 지능

### 5-1. Robot Foundation Model 
![img_23.png](/assets/img/physical-ai2-24.png)

① Foundation Model이 뭐였더라? (1편 복습)<br>
Foundation(기반) = 건물 기초공사 같은 모델 🏗️

- 엄청 큰 데이터로 한 번 크게 학습해 두면
- 그 위에서 여러 가지 작업을 다 할 수 있는 범용 모델
- GPT 이전엔 번역 모델, 요약 모델, 감정분석 모델… 작업마다 모델을 따로 만들었음
- GPT 이후엔 모델 하나한테 "번역해줘", "요약해줘", "코드 짜줘" 말만 바꾸면 다 됨

② 윗줄 : LLM이 걸어온 길
- Internet-scale Text: 인터넷 규모 텍스트로 학습 (1편 LLM 만드는 3단계의 사전학습)
- → Foundation Model 하나 완성
- → Many Language Tasks: 번역, 요약, 코딩, 질의응답 등등 전부 가능

③ 아랫줄 : 로봇도 똑같이 해보자 ⭐<br>
- Many Robots (많은 로봇): 로봇 팔, 이동 로봇, 휴머노이드… 서로 다른 몸의 데이터를 다 섞기 
- Many Tasks (많은 작업): 집기, 정리, 서랍 열기, 빨래 개기… 
- Many Demonstrations (많은 시범): 시범 데이터를 최대한 많이
- → Robot Foundation Model 하나
-  → Many Robot Tasks: 말만 바꾸면 여러 로봇 작업을 다 하는 것이 목표

### 5-2. Cross-Embodiment (다른 몸 사이의 지식 공유)
![img_24.png](/assets/img/physical-ai2-25.png)

① 아이디어 : 여러 몸의 데이터를 모아서 공유 모델 하나로<br>
그림처럼 4종 로봇 데이터를 <mark class="pink"> Shared Robot Model (공유 로봇 모델) 
</mark>하나에 다 넣어서 학습하자는 것.

비유하면 운전면허 🚗 승용차로 운전 배운 사람은 SUV나 트럭 처음 몰아도 금방 적응함. "도로 규칙, 차선 보기, 브레이크 타이밍" 은 공통이고, 차체 크기 감각만 새로 익히면 되니까

목표: 처음 보는 로봇(New Robot)도 적은 데이터로 빠르게 적응 → Robot Foundation Model의 핵심 조건

### 5-3. 강화학습 (Imitation vs Reinforcement) 
![img_25.png](/assets/img/physical-ai2-26.png)

① 강화학습 (Reinforcement Learning) 이 뭐임?<br>
1편 학습 방식 3가지(지도·비지도·강화) 기억나지? 그 강화학습을 로봇에 쓰는 것.
- 모방 학습: 선생님(사람)이 정답 행동을 보여줌 → 따라 함
- 강화학습: 정답 안 알려줌. 대신 해보고 → 점수 받고 → 점수 높은 쪽으로 스스로 고쳐감
- 비유: 게임 처음 할 때 튜토리얼 안 보고 그냥 이것저것 눌러보면서 "아 이거 하면 점수 오르네" 깨닫는 느낌 🎮

 <mark class="mint">Imitation Learning</mark>: 빠르지만 시범 수준을 넘기 어려움 
 <br><mark class="mint">Reinforcement Learning</mark>: 사람보다 잘할 수 있지만 시도가 매우 많이 필요

② 실제로는 둘을 함께 쓴다 (시범으로 시작 → 스스로 개선)
1. 모방 학습으로 시작: 사람 시범으로 기본기를 빠르게 익힘 (허우적대는 초반 단계 스킵)
2. 강화학습으로 개선: 그 상태에서 스스로 시도하며 점수 올려서 시범보다 더 잘하게 됨

### 5-4. Simulation과 Sim-to-Real
![img_26.png](/assets/img/physical-ai2-27.png)

① <mark class="mint"> Simulation</mark> = 가상 세계에서 로봇 학습 → 무한 · 안전 · 빠름 (수천 개 환경 병렬, 데이터 자동 생성, 넘어져도 안 망가짐)
- 장점
  1. 위험 없이 수백만 번 시도: 로봇이 사람한테 부딪히거나 컵 깨도 가상이라 노상관
  2. 데이터를 자동으로 생성: 사람이 시범 안 보여줘도 컴퓨터가 알아서 데이터 뽑아냄
  3. 넘어져도 로봇이 망가지지 않음: 휴머노이드 걷기 연습하다 백만 번 넘어져도 수리비 0원 💸
  4. 거기에 수천 개 환경 병렬: 그림 왼쪽처럼 가상 세계를 수천 개 동시에 돌림. 로봇 한 대가 1년 걸릴 경험을 몇 시간 만에 쌓음. 완전 분신술 🥷

②  <mark class="pink">Sim-to-Real Gap</mark> = 시뮬에서 잘해도 현실(실제 조명 · 마찰 · 질감)에서는 실패하는 차이 📢

③ 해결:  <mark class="pink">Domain Randomization </mark>= 조명, 색, 질감, 마찰, 무게를 무작위로 바꿔 학습 → 어떤 환경에도 강한 Policy 

④ 대표 도구: Isaac Sim, MuJoCo, Genesis

---

## 6. Physical AI의 미래와 과제

### 6-1. Physical AI의 활용 분야 

AI가 현실 세계에서 일하는 시대
- 1편: AI가 화면 속에서 글 쓰고 그림 그리는 시대 (Digital AI)
- 2편: AI가 현실 세계에서 몸으로 일하는 시대 (Physical AI)
- → “Physical AI = AI가 물리 세계를 인식하고 행동하는 것” 이 실제 산업으로 퍼지는 모습

🔑 **핵심 짚기**
1. Physical AI 활용 분야 6개: 가정용 / 농업 / 물류 / 제조 / 의료 / 자율주행 / 휴머노이드 📢
2. 각 분야 대표 작업
   - 가정용: 설거지·빨래·정리 / 물류: 집기·분류·포장 / 제조: 조립·검사·협업
   - 의료: 수술 보조·재활·간병 / 자율주행: 차량·배송 로봇·드론 / 휴머노이드: 범용 노동·사람 공간 작업
3. 정해진 환경(공장·창고) 부터 도입되고, **제각각인 환경(집)** 이 가장 어렵다
4. 결론: **AI가 현실 세계에서 일하는 시대** (Digital AI → Physical AI)

### 6-2. 아직 해결해야 할 문제 

![img_27.png](/assets/img/physical-ai2-28.png)


### 6-3. Physical AI 공부 로드맵
![img_28.png](/assets/img/physical-ai2-29.png)

---

## 7. 마무리

### 7-1. 전체 강의 정리 
![img_29.png](/assets/img/physical-ai2-30.png)

### 7-2. 꼭 기억해야 할 3가지 
![img_30.png](/assets/img/physical-ai2-31.png)

① AI는 데이터에서 패턴을 학습한다 — Data → Learning → Model → Prediction
- AI의 가장 기본 원리. 사람이 규칙을 짜는 게 아니라  <mark class="mint">데이터를 보고 스스로 패턴을 찾음</mark>
- Data(데이터 모으기) → Learning(학습: 예측 → Loss → Weight 수정) → Model(학습 결과물) → Prediction(새 입력에 대한 예측)

② 최근 AI는 여러 형태의 정보를 함께 이해한다 — Text + Image → Multimodal AI
- 예전 AI: 글만 보는 AI, 사진만 보는 AI가 따로
- 최근 AI: 글 + 이미지를 한꺼번에 이해 = **Multimodal AI** (대표: VLM)
- 1편 핵심. 이미지와 언어를 같은 공간에 놓는 아이디어(CLIP) 덕분

③ Physical AI는 AI의 이해를 현실 세계의 행동으로 연결한다 — Vision + Language → Action

