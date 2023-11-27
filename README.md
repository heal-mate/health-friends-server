# Health Friends Server

운동 보조 파트너 매칭 서비스

## 실행방법


.env 파일 생성 (.env.sample 복사)
```bash
cp .env.sample .env
```
.env 파일에 환경변수 설정 후

개발 모드
```
yarn dev
```
빌드 및 배포
```
yarn start
```


## Commit Convention

Feat : 새로운 기능을 추가하는 경우

Fix : 버그를 고친경우

Docs : 문서를 수정한 경우

Style : 코드 포맷 변경, 세미콜론 누락, 코드 수정이 없는경우

Refactor : 코드 리펙토링

Test : 테스트 코드. 리펙토링 테스트 코드를 추가했을 때

Chore : 빌드 업무 수정, 패키지 매니저 수정

Design : CSS 등 사용자가 UI 디자인을 변경했을 때

Rename : 파일명(or 폴더명) 을 수정한 경우

Remove : 코드(파일) 의 삭제가 있을 때

Move : 파일(or 폴더)을 이동한 경우
