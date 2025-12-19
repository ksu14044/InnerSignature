package com.innersignature.backend.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SubscriptionPlanDto {
    private Long planId;
    private String planCode;
    private String planName;
    private Integer price;
    private Integer maxUsers;  // NULL이면 무제한
    private String featuresJson;  // JSON 문자열 (MyBatis에서 직접 매핑)
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * features를 Map으로 변환하는 getter
     * @return features Map (null 가능)
     */
    public Map<String, Object> getFeatures() {
        if (featuresJson == null || featuresJson.trim().isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(featuresJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * features를 설정하는 setter
     * @param features Map 형태의 features
     */
    public void setFeatures(Map<String, Object> features) {
        if (features == null) {
            this.featuresJson = null;
        } else {
            try {
                this.featuresJson = objectMapper.writeValueAsString(features);
            } catch (Exception e) {
                this.featuresJson = null;
            }
        }
    }
}

