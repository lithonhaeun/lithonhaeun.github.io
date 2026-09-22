---
title: 파이썬 리스트 컴프리헨션
categories: [major, 프로그래밍 언어]
description: 파이썬 리스트 컴프리헨션 문법과 조건문, 중첩 사용법을 예제로 정리합니다.
---

## 기본 문법

리스트를 한 줄로 만드는 문법이에요.

```python
squares = [x * x for x in range(5)]   # [0, 1, 4, 9, 16]
```

## 조건 붙이기

```python
evens = [x for x in range(10) if x % 2 == 0]
labels = ["짝" if x % 2 == 0 else "홀" for x in range(4)]
```

## 2차원 리스트 만들기

```python
grid = [[0] * 3 for _ in range(3)]
```

> `[[0] * 3] * 3` 으로 만들면 세 줄이 **같은 리스트를 공유**해서, 한 칸을 바꾸면 다른 줄도 같이 바뀌어요.
