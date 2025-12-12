# 백엔드 Dockerfile
# Spring Boot 애플리케이션을 도커 이미지로 빌드

# 1단계: 빌드 단계 - Maven으로 Java 코드를 컴파일하고 JAR 파일 생성
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# pom.xml을 먼저 복사 (의존성 캐싱 최적화)
COPY pom.xml .
# 소스 코드 복사
COPY src ./src

# Maven으로 빌드 (테스트는 제외)
RUN mvn clean package -DskipTests

# 2단계: 실행 단계 - JAR 파일만 실행
FROM eclipse-temurin:17-jre
WORKDIR /app

# 빌드 단계에서 만든 JAR 파일 복사
COPY --from=build /app/target/*.jar app.jar

# 포트 8080 노출
EXPOSE 8080

# JAR 파일 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
