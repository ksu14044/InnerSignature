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
-- Table structure for table `expense_detail_tb`
--

DROP TABLE IF EXISTS `expense_detail_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_detail_tb` (
  `expense_detail_id` bigint NOT NULL AUTO_INCREMENT COMMENT '상세 내역 ID',
  `expense_report_id` bigint NOT NULL COMMENT '어떤 문서의 항목인지 (expense_report_tb FK)',
  `category` varchar(50) DEFAULT NULL COMMENT '지출 항목',
  `description` varchar(200) DEFAULT NULL COMMENT '적요',
  `amount` decimal(15,0) NOT NULL COMMENT '개별 금액',
  `note` varchar(200) DEFAULT NULL COMMENT '비고',
  PRIMARY KEY (`expense_detail_id`),
  KEY `expense_report_id` (`expense_report_id`),
  CONSTRAINT `expense_detail_tb_ibfk_1` FOREIGN KEY (`expense_report_id`) REFERENCES `expense_report_tb` (`expense_report_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='지출결의서 상세 항목들';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense_detail_tb`
--

LOCK TABLES `expense_detail_tb` WRITE;
/*!40000 ALTER TABLE `expense_detail_tb` DISABLE KEYS */;
INSERT INTO `expense_detail_tb` VALUES (17,16,'식대','test',0,'test'),(18,17,'식대','test',10000,'test'),(19,17,'교통비','test',20000,'test'),(20,18,'식대','11',11,'11'),(21,19,'식대','11',11,'11'),(22,20,'식대','11',1111,'11'),(25,22,'식대','1111',1111,'1111'),(26,23,'식대','1234',1234,'1234'),(28,25,'식대','test',10000,'test'),(29,25,'교통비','test',10000,'test'),(30,26,'식대','1111',1234,''),(31,27,'식대','1234',1234,'1234'),(32,28,'식대','',0,''),(33,29,'식대','',0,''),(34,30,'식대','회식비',20000,'고깃집'),(35,30,'교통비','버스비',1500,''),(36,31,'기타','도메인',12000,'영수증'),(37,31,'기타','SSL',25000,'영수증'),(38,32,'식대','111',1234,'1234'),(39,33,'식대','1234',1234,'1234'),(40,34,'식대','1234',1234,'1234'),(41,35,'식대','1234',1234,'1234'),(42,35,'식대','1234',1234,'1234'),(43,36,'식대','1234',1234,'1234'),(44,37,'식대','1234',1234,'1234'),(45,38,'식대','1234',12334,'1234'),(46,39,'식대','1234',1234,'1234'),(47,39,'교통비','1234',1234,'1234'),(55,47,'급여','1234',1234,'1234'),(56,48,'급여','1234',1234,'1234'),(57,49,'식대','1234',1234,'1234'),(58,50,'식대','1234',1234,'1234'),(59,51,'급여','김시욱',2000000,''),(60,52,'기타','주영 의뢰비',1000000,''),(61,53,'식대','test',1111,'test'),(62,54,'급여','1234',1234,'1234'),(63,55,'비품비','주영대금',100000,''),(64,56,'급여','1234',1234,'1234'),(65,57,'식대','1234',1234,'1234'),(67,59,'식대','test',1234,'stet');
/*!40000 ALTER TABLE `expense_detail_tb` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 11:50:05
