package com.innersignature.backend.controller;

import com.innersignature.backend.dto.ApiResponse;
import com.innersignature.backend.dto.CompanyCardDto;
import com.innersignature.backend.dto.UserCardDto;
import com.innersignature.backend.service.CompanyCardService;
import com.innersignature.backend.service.UserCardService;
import com.innersignature.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Card", description = "카드 관리 API")
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {
    
    private static final Logger logger = LoggerFactory.getLogger(CardController.class);
    private final CompanyCardService companyCardService;
    private final UserCardService userCardService;
    
    // ========== 회사 카드 API ==========
    
    /**
     * 회사 카드 생성
     * POST /api/cards/company
     */
    @Operation(summary = "회사 카드 생성", description = "회사 카드를 생성합니다. (ADMIN/CEO/ACCOUNTANT)")
    @PostMapping("/company")
    public ApiResponse<CompanyCardDto> createCompanyCard(@Valid @RequestBody CompanyCardDto cardDto) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("회사 카드 생성 요청 - userId: {}, cardName: {}", currentUserId, cardDto.getCardName());
        CompanyCardDto createdCard = companyCardService.createCard(cardDto, currentUserId);
        logger.info("회사 카드 생성 완료 - cardId: {}", createdCard.getCardId());
        return new ApiResponse<>(true, "회사 카드가 생성되었습니다.", createdCard);
    }
    
    /**
     * 회사 카드 목록 조회 (활성 카드만)
     * GET /api/cards/company
     */
    @Operation(summary = "회사 카드 목록 조회", description = "활성화된 회사 카드 목록을 조회합니다.")
    @GetMapping("/company")
    public ApiResponse<List<CompanyCardDto>> getCompanyCards() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<CompanyCardDto> cards = companyCardService.getActiveCards(currentUserId);
        return new ApiResponse<>(true, "회사 카드 목록 조회 성공", cards);
    }
    
    /**
     * 회사 카드 목록 조회 (전체)
     * GET /api/cards/company/all
     */
    @Operation(summary = "회사 카드 전체 목록 조회", description = "모든 회사 카드 목록을 조회합니다. (ADMIN/CEO/ACCOUNTANT)")
    @GetMapping("/company/all")
    public ApiResponse<List<CompanyCardDto>> getAllCompanyCards() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<CompanyCardDto> cards = companyCardService.getAllCards(currentUserId);
        return new ApiResponse<>(true, "회사 카드 전체 목록 조회 성공", cards);
    }
    
    /**
     * 회사 카드 조회
     * GET /api/cards/company/{cardId}
     */
    @Operation(summary = "회사 카드 조회", description = "회사 카드 상세 정보를 조회합니다.")
    @GetMapping("/company/{cardId}")
    public ApiResponse<CompanyCardDto> getCompanyCard(@PathVariable Long cardId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        CompanyCardDto card = companyCardService.getCard(cardId, currentUserId);
        return new ApiResponse<>(true, "회사 카드 조회 성공", card);
    }
    
    /**
     * 회사 카드 수정
     * PUT /api/cards/company/{cardId}
     */
    @Operation(summary = "회사 카드 수정", description = "회사 카드를 수정합니다. (ADMIN/CEO/ACCOUNTANT)")
    @PutMapping("/company/{cardId}")
    public ApiResponse<CompanyCardDto> updateCompanyCard(
            @PathVariable Long cardId,
            @Valid @RequestBody CompanyCardDto cardDto) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("회사 카드 수정 요청 - cardId: {}, userId: {}", cardId, currentUserId);
        CompanyCardDto updatedCard = companyCardService.updateCard(cardId, cardDto, currentUserId);
        logger.info("회사 카드 수정 완료 - cardId: {}", cardId);
        return new ApiResponse<>(true, "회사 카드가 수정되었습니다.", updatedCard);
    }
    
    /**
     * 회사 카드 삭제
     * DELETE /api/cards/company/{cardId}
     */
    @Operation(summary = "회사 카드 삭제", description = "회사 카드를 삭제합니다. (ADMIN/CEO/ACCOUNTANT)")
    @DeleteMapping("/company/{cardId}")
    public ApiResponse<Void> deleteCompanyCard(@PathVariable Long cardId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("회사 카드 삭제 요청 - cardId: {}, userId: {}", cardId, currentUserId);
        companyCardService.deleteCard(cardId, currentUserId);
        logger.info("회사 카드 삭제 완료 - cardId: {}", cardId);
        return new ApiResponse<>(true, "회사 카드가 삭제되었습니다.", null);
    }
    
    // ========== 개인 카드 API ==========
    
    /**
     * 개인 카드 생성
     * POST /api/cards/user
     */
    @Operation(summary = "개인 카드 생성", description = "개인 카드를 생성합니다.")
    @PostMapping("/user")
    public ApiResponse<UserCardDto> createUserCard(@Valid @RequestBody UserCardDto cardDto) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("개인 카드 생성 요청 - userId: {}, cardName: {}", currentUserId, cardDto.getCardName());
        UserCardDto createdCard = userCardService.createCard(cardDto, currentUserId);
        logger.info("개인 카드 생성 완료 - cardId: {}", createdCard.getCardId());
        return new ApiResponse<>(true, "개인 카드가 생성되었습니다.", createdCard);
    }
    
    /**
     * 개인 카드 목록 조회 (활성 카드만)
     * GET /api/cards/user
     */
    @Operation(summary = "개인 카드 목록 조회", description = "활성화된 개인 카드 목록을 조회합니다.")
    @GetMapping("/user")
    public ApiResponse<List<UserCardDto>> getUserCards() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<UserCardDto> cards = userCardService.getActiveCards(currentUserId);
        return new ApiResponse<>(true, "개인 카드 목록 조회 성공", cards);
    }
    
    /**
     * 개인 카드 목록 조회 (전체)
     * GET /api/cards/user/all
     */
    @Operation(summary = "개인 카드 전체 목록 조회", description = "모든 개인 카드 목록을 조회합니다.")
    @GetMapping("/user/all")
    public ApiResponse<List<UserCardDto>> getAllUserCards() {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        List<UserCardDto> cards = userCardService.getAllCards(currentUserId);
        return new ApiResponse<>(true, "개인 카드 전체 목록 조회 성공", cards);
    }
    
    /**
     * 개인 카드 조회
     * GET /api/cards/user/{cardId}
     */
    @Operation(summary = "개인 카드 조회", description = "개인 카드 상세 정보를 조회합니다.")
    @GetMapping("/user/{cardId}")
    public ApiResponse<UserCardDto> getUserCard(@PathVariable Long cardId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        UserCardDto card = userCardService.getCard(cardId, currentUserId);
        return new ApiResponse<>(true, "개인 카드 조회 성공", card);
    }
    
    /**
     * 개인 카드 수정
     * PUT /api/cards/user/{cardId}
     */
    @Operation(summary = "개인 카드 수정", description = "개인 카드를 수정합니다.")
    @PutMapping("/user/{cardId}")
    public ApiResponse<UserCardDto> updateUserCard(
            @PathVariable Long cardId,
            @Valid @RequestBody UserCardDto cardDto) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("개인 카드 수정 요청 - cardId: {}, userId: {}", cardId, currentUserId);
        UserCardDto updatedCard = userCardService.updateCard(cardId, cardDto, currentUserId);
        logger.info("개인 카드 수정 완료 - cardId: {}", cardId);
        return new ApiResponse<>(true, "개인 카드가 수정되었습니다.", updatedCard);
    }
    
    /**
     * 개인 카드 삭제
     * DELETE /api/cards/user/{cardId}
     */
    @Operation(summary = "개인 카드 삭제", description = "개인 카드를 삭제합니다.")
    @DeleteMapping("/user/{cardId}")
    public ApiResponse<Void> deleteUserCard(@PathVariable Long cardId) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        logger.info("개인 카드 삭제 요청 - cardId: {}, userId: {}", cardId, currentUserId);
        userCardService.deleteCard(cardId, currentUserId);
        logger.info("개인 카드 삭제 완료 - cardId: {}", cardId);
        return new ApiResponse<>(true, "개인 카드가 삭제되었습니다.", null);
    }
}








