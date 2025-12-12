# 프론트엔드 Dockerfile
# React 애플리케이션을 도커 이미지로 빌드

# 1단계: 빌드 단계 - Node.js로 React 앱 빌드
FROM node:20-alpine AS build
WORKDIR /app

# package.json 복사 (의존성 캐싱 최적화)
COPY package*.json ./
# npm 패키지 설치
RUN npm ci

# 소스 코드 복사
COPY . .
# React 앱 빌드 (dist 폴더에 생성됨)
RUN npm run build

# 2단계: 실행 단계 - Nginx로 빌드된 파일 서빙
FROM nginx:alpine
# 빌드된 파일을 Nginx가 서빙할 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 80 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
