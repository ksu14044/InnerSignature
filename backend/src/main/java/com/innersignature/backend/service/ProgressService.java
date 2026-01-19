package com.innersignature.backend.service;

import com.innersignature.backend.dto.ProgressDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 작업 진행률 관리 서비스
 * 메모리 기반으로 진행률을 저장하고 조회합니다.
 */
@Service
@RequiredArgsConstructor
public class ProgressService {

    // 작업 ID -> 진행률 정보
    private final Map<String, ProgressDto> progressMap = new ConcurrentHashMap<>();

    /**
     * 진행률 업데이트
     */
    public void updateProgress(String jobId, int percentage, String message) {
        ProgressDto progress = progressMap.getOrDefault(jobId, new ProgressDto());
        progress.setPercentage(percentage);
        progress.setMessage(message);
        progress.setCompleted(false);
        progress.setFailed(false);
        progressMap.put(jobId, progress);
    }

    /**
     * 진행률 조회
     */
    public ProgressDto getProgress(String jobId) {
        return progressMap.getOrDefault(jobId, new ProgressDto(0, "작업을 찾을 수 없습니다.", false, false, null, null));
    }

    /**
     * 작업 완료 처리
     */
    public void completeProgress(String jobId, Long expenseId) {
        ProgressDto progress = progressMap.getOrDefault(jobId, new ProgressDto());
        progress.setPercentage(100);
        progress.setMessage("완료!");
        progress.setCompleted(true);
        progress.setFailed(false);
        progress.setExpenseId(expenseId);
        progressMap.put(jobId, progress);
    }

    /**
     * 작업 실패 처리
     */
    public void failProgress(String jobId, String errorMessage) {
        ProgressDto progress = progressMap.getOrDefault(jobId, new ProgressDto());
        progress.setFailed(true);
        progress.setErrorMessage(errorMessage);
        progress.setMessage("작업 실패");
        progressMap.put(jobId, progress);
    }

    /**
     * 진행률 정보 삭제 (완료 후 정리용)
     */
    public void removeProgress(String jobId) {
        progressMap.remove(jobId);
    }
}

