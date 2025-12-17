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
-- Table structure for table `receipt_tb`
--

DROP TABLE IF EXISTS `receipt_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipt_tb` (
  `receipt_id` bigint NOT NULL AUTO_INCREMENT COMMENT '영수증 ID',
  `expense_report_id` bigint NOT NULL COMMENT '지출결의서 ID (expense_report_tb FK)',
  `file_path` varchar(500) NOT NULL COMMENT '파일 경로',
  `original_filename` varchar(255) NOT NULL COMMENT '원본 파일명',
  `file_size` bigint DEFAULT NULL COMMENT '파일 크기 (bytes)',
  `uploaded_by` bigint NOT NULL COMMENT '업로드한 사용자 ID (user_tb FK)',
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 시간',
  `company_id` bigint NOT NULL COMMENT '회사 ID (company_tb FK)',
  PRIMARY KEY (`receipt_id`),
  KEY `expense_report_id` (`expense_report_id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_company_expense_report` (`company_id`, `expense_report_id`),
  CONSTRAINT `receipt_tb_ibfk_1` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE,
  CONSTRAINT `receipt_tb_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `user_tb` (`user_id`),
  CONSTRAINT `receipt_tb_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `company_tb` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='영수증 파일 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipt_tb`
--

LOCK TABLES `receipt_tb` WRITE;
/*!40000 ALTER TABLE `receipt_tb` DISABLE KEYS */;
INSERT INTO `receipt_tb` VALUES (8,34,'uploads/receipts/34/receipt_20251210161908_테스트이미지 (1).jpg','테스트이미지 (1).jpg',2191873,17,'2025-12-10 16:19:09'),(9,35,'uploads/receipts/35/receipt_20251210163424_테스트이미지 (1).jpg','테스트이미지 (1).jpg',2191873,17,'2025-12-10 16:34:24'),(10,38,'uploads/receipts/38/bb704376-f997-403a-bd5c-c139fe58b6da/receipt_20251210172229_테스트이미지 (1).jpg','테스트이미지 (1).jpg',2191873,17,'2025-12-10 17:22:30'),(11,39,'uploads/receipts/39/1cdf0d98-ba94-4337-828d-6648106a54bd/receipt_20251211085821_테스트이미지 (1).jpg','테스트이미지 (1).jpg',2191873,17,'2025-12-11 08:58:21'),(13,51,'uploads/receipts/51/f9711b40-dc38-4f94-8955-9127e3d57331/receipt_20251211172527_테스트이미지 (1).jpg','테스트이미지 (1).jpg',2191873,15,'2025-12-11 17:25:28');
/*!40000 ALTER TABLE `receipt_tb` ENABLE KEYS */;
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
