# 배포 가이드

## 🚀 서버 배포 방법

### 1단계: 서버에 접속하기

#### 방법 1: Windows PowerShell/CMD
```bash
ssh root@서버IP주소
# 또는
ssh 사용자명@서버IP주소
```

#### 방법 2: PuTTY 사용
- PuTTY 다운로드: https://www.putty.org/
- Host Name: 서버 IP 주소
- Port: 22
- Connection type: SSH
- Open 클릭 후 로그인

### 2단계: 프로젝트 클론하기

```bash
# Git 설치 확인
git --version

# Git이 없으면 설치 (Ubuntu 22.04)
sudo apt update
sudo apt install -y git

# 프로젝트 폴더로 이동
cd ~

# Git 저장소 클론
git clone https://github.com/ksu14044/InnerSignature.git

# 프로젝트 폴더로 이동
cd InnerSignature
```

### 3단계: Docker 설치하기

```bash
# Docker 설치 스크립트 다운로드 및 실행
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 그룹 변경사항 적용 (로그아웃 없이)
newgrp docker

# Docker 설치 확인
docker --version
docker-compose --version
```

### 4단계: 환경 변수 설정하기

```bash
# .env.production 파일을 .env로 복사
cp .env.production .env

# .env 파일 확인 (내용이 맞는지 확인)
cat .env
```

### 5단계: 배포 실행하기

```bash
# 배포 스크립트에 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

배포가 완료되면 아래 메시지가 표시됩니다:
```
=== 배포 완료 ===
서비스가 http://innersign.co.kr 에서 실행 중입니다.
```

### 6단계: 배포 확인하기

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 모든 컨테이너가 "Up" 상태인지 확인
# 4개 컨테이너가 있어야 함:
# - innersignature-mysql
# - innersignature-backend
# - innersignature-frontend
# - innersignature-nginx
```

## 🌐 도메인 DNS 설정하기

카페24 도메인 관리 페이지에서:

1. **도메인 관리** → **DNS 설정**
2. **A 레코드 추가**:
   - 호스트: `@` 또는 `innersign.co.kr`
   - 값: 서버 IP 주소
   - TTL: 3600 (기본값)
3. **www 서브도메인 추가** (선택):
   - 호스트: `www`
   - 값: 서버 IP 주소
   - TTL: 3600

> ⚠️ DNS 변경은 최대 24시간 소요될 수 있으나 보통 몇 분 내에 반영됩니다.

## 🔧 유용한 명령어

### 컨테이너 관리
```bash
# 컨테이너 중지
docker-compose -f docker-compose.prod.yml stop

# 컨테이너 시작
docker-compose -f docker-compose.prod.yml start

# 컨테이너 재시작
docker-compose -f docker-compose.prod.yml restart

# 컨테이너 중지 및 제거 (데이터는 유지)
docker-compose -f docker-compose.prod.yml down

# 최신 이미지로 업데이트
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 로그 확인
```bash
# 모든 컨테이너 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 특정 컨테이너 로그 확인
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs mysql
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🐛 문제 해결

### 문제 1: 컨테이너가 시작되지 않을 때
```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs

# 특정 컨테이너 로그 확인 #

docker-compose -f docker-compose.prod.yml logs backend
```

### 문제 2: 포트가 이미 사용 중일 때
```bash
# 80번 포트를 사용하는 프로세스 확인
sudo lsof -i :80

# 필요하면 기존 프로세스 중지
sudo systemctl stop nginx  # 예시
```

### 문제 3: 데이터베이스 연결 오류
```bash
# MySQL 컨테이너 로그 확인
docker-compose -f docker-compose.prod.yml logs mysql

# MySQL 컨테이너에 접속해서 확인
docker exec -it innersignature-mysql mysql -uroot -p
# 비밀번호: fuckin1042!
```

### 문제 4: 파일 권한 문제
```bash
# 업로드 폴더 권한 설정
sudo chmod -R 755 backend/uploads
sudo chown -R $USER:$USER backend/uploads
```

## ✅ 배포 체크리스트

### 배포 전 확인
- [ ] 서버에 SSH 접속 가능
- [ ] Git 저장소 클론 완료
- [ ] Docker 설치 완료
- [ ] `.env.production` 파일 생성 및 설정 완료
- [ ] `nginx` 폴더 및 `nginx.conf` 파일 생성 완료
- [ ] 도메인 DNS 설정 완료
- [ ] 방화벽에서 80번 포트 허용 확인

### 배포 후 확인
- [ ] 모든 컨테이너가 "Up" 상태
- [ ] 웹사이트 접속 가능 (`http://innersign.co.kr`)
- [ ] 로그인 기능 동작 확인
- [ ] API 요청 정상 동작 확인

## 📞 문의

문제가 발생하면 로그를 확인하고, 필요시 개발팀에 문의하세요.

