#!/bin/bash

echo "최신 Docker 이미지를 가져오는 중..."
docker-compose pull

echo "서비스 재시작 중..."
docker-compose up -d

echo "완료! http://localhost:5173 에서 확인하세요"