-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: signature
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `user_company_tb`
--

DROP TABLE IF EXISTS `user_company_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_company_tb` (
  `user_company_id` bigint NOT NULL AUTO_INCREMENT COMMENT '사용자-회사 관계 ID',
  `user_id` bigint NOT NULL COMMENT '사용자 ID (user_tb FK)',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  `role` varchar(20) NOT NULL COMMENT '해당 회사에서의 권한 (USER, ADMIN, CEO, TAX_ACCOUNTANT, ACCOUNTANT)',
  `position` varchar(50) DEFAULT NULL COMMENT '해당 회사에서의 직급',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성화 상태',
  `is_primary` tinyint(1) DEFAULT '0' COMMENT '기본 회사 여부 (한 사용자당 하나만 true)',
  `approval_status` varchar(20) DEFAULT 'PENDING' COMMENT '승인 상태 (PENDING, APPROVED, REJECTED)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
  PRIMARY KEY (`user_company_id`),
  UNIQUE KEY `idx_user_company` (`user_id`, `company_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_approval_status` (`approval_status`),
  KEY `idx_is_primary` (`is_primary`),
  CONSTRAINT `fk_user_company_user` FOREIGN KEY (`user_id`) REFERENCES `user_tb` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_company_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자-회사 관계 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

