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
-- Table structure for table `approval_line_tb`
--

DROP TABLE IF EXISTS `approval_line_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_line_tb` (
  `approval_line_id` bigint NOT NULL AUTO_INCREMENT COMMENT '결재 라인 ID',
  `expense_report_id` bigint NOT NULL COMMENT '어떤 문서인지 (expense_report_tb FK)',
  `approver_id` bigint NOT NULL COMMENT '누가 결재하는지 (user_tb FK)',
  `step_order` int NOT NULL COMMENT '결재 순서 (1, 2, 3)',
  `status` varchar(20) DEFAULT 'WAIT' COMMENT '결재 상태',
  `approval_date` datetime DEFAULT NULL COMMENT '결재한 시간',
  `signature_data` mediumtext COMMENT '서명 데이터 (Base64)',
  `rejection_reason` varchar(255) DEFAULT NULL COMMENT '반려 사유',
  `company_id` bigint NOT NULL,
  PRIMARY KEY (`approval_line_id`),
  KEY `expense_report_id` (`expense_report_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `approval_line_tb_ibfk_1` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE,
  CONSTRAINT `approval_line_tb_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `user_tb` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='결재 진행 및 서명 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
