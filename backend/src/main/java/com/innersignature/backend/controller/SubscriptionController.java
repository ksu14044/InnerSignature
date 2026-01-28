package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.PaymentDto;
import com.innersignature.backend.dto.SubscriptionDto;
import com.innersignature.backend.dto.SubscriptionPlanDto;
import com.innersignature.backend.dto.SubscriptionCreateRequest;
import com.innersignature.backend.dto.SubscriptionUpdateRequest;
import com.innersignature.backend.service.PaymentService;
import com.innersignature.backend.service.SubscriptionPlanService;
import com.innersignature.backend.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Tag(name = "구독 관리", description = "구독 플랜 및 구독 관리 API")
public class SubscriptionController {
    
    private static final Logger logger = LoggerFactory.getLogger(SubscriptionController.class);
    private final SubscriptionPlanService subscriptionPlanService;
    private final SubscriptionService subscriptionService;
    private final PaymentService paymentService;
    
    @Operation(summary = "플랜 목록 조회", description = "모든 활성 구독 플랜을 조회합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDto>>> getPlans() {
        try {
            List<SubscriptionPlanDto> plans = subscriptionPlanService.findAllActive();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", plans));
        } catch (Exception e) {
            logger.error("플랜 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "현재 구독 정보 조회", description = "현재 회사의 활성 구독 정보를 조회합니다.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (CEO/ADMIN만 가능)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "구독 정보 없음")
    })
    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getCurrentSubscription() {
        try {
            SubscriptionDto subscription = subscriptionService.findCurrentSubscription();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", subscription));
        } catch (Exception e) {
            logger.error("현재 구독 정보 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "구독 생성", description = "새로운 구독을 생성합니다. (CEO/ADMIN만)")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "구독 생성 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (CEO/ADMIN만 가능)")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> createSubscription(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "구독 생성 정보", required = true)
            @Valid @RequestBody SubscriptionCreateRequest request) {
        try {
            Long companyId = com.innersignature.backend.util.SecurityUtil.getCurrentCompanyId();
            if (companyId == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "회사 정보를 찾을 수 없습니다.", null));
            }
            
            SubscriptionDto subscription = subscriptionService.createSubscription(
                companyId, request.getPlanId(), request.getAutoRenew());
            
            logger.info("구독 생성 완료 - subscriptionId: {}, companyId: {}, planId: {}", 
                subscription.getSubscriptionId(), companyId, request.getPlanId());
            return ResponseEntity.ok(new ApiResponse<>(true, "구독이 생성되었습니다.", subscription));
        } catch (Exception e) {
            logger.error("구독 생성 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "구독 변경", description = "현재 구독의 플랜을 변경합니다. (CEO/ADMIN만)")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "구독 변경 성공"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력값 검증 실패"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 필요"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (CEO/ADMIN만 가능)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "구독을 찾을 수 없음")
    })
    @PutMapping("/{subscriptionId}")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> updateSubscription(
            @Parameter(description = "구독 ID", required = true, example = "1")
            @PathVariable Long subscriptionId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "구독 변경 정보", required = true)
            @Valid @RequestBody SubscriptionUpdateRequest request) {
        try {
            SubscriptionDto subscription = subscriptionService.updateSubscription(
                subscriptionId, request.getPlanId(), request.getAutoRenew());
            
            logger.info("구독 변경 완료 - subscriptionId: {}, planId: {}", 
                subscriptionId, request.getPlanId());
            return ResponseEntity.ok(new ApiResponse<>(true, "구독이 변경되었습니다.", subscription));
        } catch (Exception e) {
            logger.error("구독 변경 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "구독 취소", description = "현재 구독을 취소합니다. (CEO/ADMIN만)")
    @DeleteMapping("/{subscriptionId}")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelSubscription(@PathVariable Long subscriptionId) {
        try {
            subscriptionService.cancelSubscription(subscriptionId);
            
            logger.info("구독 취소 완료 - subscriptionId: {}", subscriptionId);
            return ResponseEntity.ok(new ApiResponse<>(true, "구독이 취소되었습니다.", null));
        } catch (Exception e) {
            logger.error("구독 취소 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    @Operation(summary = "결제 내역 조회", description = "현재 회사의 모든 결제 내역을 조회합니다.")
    @GetMapping("/payments")
    @PreAuthorize("hasAnyRole('CEO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getPayments() {
        try {
            List<PaymentDto> payments = paymentService.findCurrentCompanyPayments();
            return ResponseEntity.ok(new ApiResponse<>(true, "조회 성공", payments));
        } catch (Exception e) {
            logger.error("결제 내역 조회 실패", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}

