#!/bin/bash

# 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 에러 발생 시 스크립트 중단

echo "=== InnerSignature 배포 시작 ==="

# 1. Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "Docker가 설치되어 있지 않습니다. 설치를 진행합니다..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker 설치 완료. 로그아웃 후 다시 로그인해주세요."
    exit 1
fi

# 2. Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose가 설치되어 있지 않습니다. 설치를 진행합니다..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 3. .env 파일 확인
if [ ! -f .env ]; then
    echo ".env 파일이 없습니다. .env.production을 복사합니다..."
    if [ ! -f .env.production ]; then
        echo "에러: .env.production 파일이 없습니다!"
        echo "프로젝트 루트에 .env.production 파일을 생성해주세요."
        exit 1
    fi
    cp .env.production .env
    echo ".env 파일을 확인하고 필요한 값들을 설정해주세요."
    exit 1
fi

# 4. 필요한 디렉토리 생성
echo "필요한 디렉토리를 생성하는 중..."
mkdir -p backend/uploads/receipts
mkdir -p nginx

# 5. Docker 이미지 Pull
echo "Docker 이미지를 가져오는 중..."
docker-compose -f docker-compose.prod.yml pull

# 6. 기존 컨테이너 중지 및 제거
echo "기존 컨테이너를 중지하는 중..."
docker-compose -f docker-compose.prod.yml down

# 7. 새 컨테이너 시작
echo "새 컨테이너를 시작하는 중..."
docker-compose -f docker-compose.prod.yml up -d

# 8. 컨테이너 상태 확인
echo "컨테이너 상태 확인 중..."
sleep 5
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=== 배포 완료 ==="
echo "서비스가 http://innersign.co.kr 에서 실행 중입니다."
echo ""
echo "컨테이너 로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "컨테이너 상태 확인: docker-compose -f docker-compose.prod.yml ps"

