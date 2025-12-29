package com.innersignature.backend.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class AuditRuleDto {
    private Long ruleId;            // PK
    private Long companyId;         // 회사 ID
    private String ruleName;        // 규칙명
    private String ruleType;        // 규칙 유형
    private String ruleConfigJson;   // 규칙 설정 (JSON 문자열)
    private Boolean isActive;       // 활성화 여부
    private LocalDateTime createdAt; // 생성 시간
    private LocalDateTime updatedAt; // 수정 시간
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * ruleConfig를 Map으로 변환
     */
    public Map<String, Object> getRuleConfig() {
        if (ruleConfigJson == null || ruleConfigJson.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(ruleConfigJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * ruleConfig를 설정
     */
    public void setRuleConfig(Map<String, Object> ruleConfig) {
        if (ruleConfig == null) {
            this.ruleConfigJson = null;
        } else {
            try {
                this.ruleConfigJson = objectMapper.writeValueAsString(ruleConfig);
            } catch (Exception e) {
                this.ruleConfigJson = null;
            }
        }
    }
}

