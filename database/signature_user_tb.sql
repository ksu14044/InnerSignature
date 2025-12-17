-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: signature
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user_tb`
--

DROP TABLE IF EXISTS `user_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_tb` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '사원 고유 ID',
  `username` varchar(50) NOT NULL COMMENT '로그인 아이디',
  `password` varchar(255) NOT NULL COMMENT '비밀번호 (암호화 필수)',
  `korean_name` varchar(50) NOT NULL COMMENT '이름',
  `email` varchar(100) DEFAULT NULL COMMENT '이메일 주소',
  `position` varchar(50) DEFAULT NULL COMMENT '직급 (사원, 대리, 전무, 대표)',
  `role` varchar(20) NOT NULL COMMENT '권한 (USER, ADMIN, ACCOUNTANT)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 상태',
  `company_id` bigint DEFAULT NULL COMMENT '회사 ID (company_tb FK)',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_company_username` (`company_id`, `username`),
  UNIQUE KEY `idx_company_email` (`company_id`, `email`),
  KEY `idx_company_id` (`company_id`),
  CONSTRAINT `user_tb_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='사원 정보 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_tb`
--

LOCK TABLES `user_tb` WRITE;
/*!40000 ALTER TABLE `user_tb` DISABLE KEYS */;
INSERT INTO `user_tb` VALUES (14,'ksu14044','$2a$10$rIp02jVG3iSd0CpBWdQUZepiRKLvdRkbMiL2ryYCeA7jH3xoISR7i','김시욱','mhm1404@naver.com','사원','USER',1),(15,'ha_exec','$2a$10$IpNyUZODPKUdLc9dk2OjSuBiES4w/csD/R8YYsptLwqwGUIi.xGZa','하상민',NULL,'전무','ADMIN',1),(16,'son_ceo','$2a$10$i3/Sm4QX7kUJpoEZPkMfteiUAMh8Lz3fqlUfGRgSv.IdPkIXKiMvC','손수영',NULL,'대표','ADMIN',1),(17,'ahn_accountant','$2a$10$aHVS5QPXytl/ynUXbpqROOFOwW4E9EimiXdRm9QNaQcMG9JbO/IKO','안정익',NULL,'결제담당자','ACCOUNTANT',1),(18,'park','$2a$10$aXv5W8JQqZBPwebquwDwFuEDc6C2yiZqsGD1ZpqySaRufsdHPTugC','박기현',NULL,'과장','USER',1),(19,'test','$2a$10$rr2uDOuDqiwyQ9oo63XZbOUrvXGq3ggwhg5S.RuHO4fMiJBwXAwD2','테스트',NULL,'테스트','USER',1),(20,'hsw_tax','$2a$10$6J6Bf8IE0sVvhx9YlstpIeRHg0o.MgP7MNNtvckIgoKqtzIL9fDLa','하승우',NULL,'세무사','TAX_ACCOUNTANT',1),(21,'admin','$2a$10$YeX7EdTojpUtQ5i1pqMd8.Lv4dk/eZxRNATaanCOFUJyAkY80uEye','관리자',NULL,'관리자','SUPERADMIN',1),(22,'test1','$2a$10$ko76lLs3zwZwNNuYNjksY..fOhQfzyeSE2JZ1Obs/J4hFvkJcLfOO','test1',NULL,'test','USER',1);
/*!40000 ALTER TABLE `user_tb` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 11:50:04
