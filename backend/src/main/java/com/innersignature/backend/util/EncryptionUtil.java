package com.innersignature.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * 카드번호 등 민감 정보 암호화/복호화 유틸리티
 * AES 암호화 사용
 */
@Component
public class EncryptionUtil {
    
    private static final String ALGORITHM = "AES";
    
    @Value("${app.encryption.secret-key:InnerSignatureSecretKey2024!@#$%^&*()}")
    private String secretKey;
    
    /**
     * 키를 AES에 맞는 길이(32바이트)로 변환
     * SHA-256 해시를 사용하여 32바이트 키 생성
     */
    private SecretKeySpec getSecretKeySpec() {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] key = sha.digest(secretKey.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(key, ALGORITHM);
        } catch (Exception e) {
            throw new RuntimeException("키 생성 실패", e);
        }
    }
    
    /**
     * 문자열 암호화
     * @param plainText 평문
     * @return 암호화된 문자열 (Base64 인코딩)
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return null;
        }
        
        try {
            SecretKeySpec keySpec = getSecretKeySpec();
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("암호화 실패", e);
        }
    }
    
    /**
     * 암호화된 문자열 복호화
     * @param encryptedText 암호화된 문자열 (Base64 인코딩)
     * @return 복호화된 평문
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return null;
        }
        
        try {
            SecretKeySpec keySpec = getSecretKeySpec();
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("복호화 실패", e);
        }
    }
}

