package com.innersignature.backend.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:${spring.mail.username:noreply@innersignature.com}}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * 아이디 찾기 이메일 발송
     * @param toEmail 수신자 이메일
     * @param koreanName 수신자 이름
     * @param username 찾은 아이디
     */
    public void sendIdFindEmail(String toEmail, String koreanName, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("[InnerSignature] 아이디 찾기 결과");
            message.setText(
                koreanName + "님 안녕하세요.\n\n" +
                "요청하신 아이디 찾기 결과입니다.\n\n" +
                "아이디: " + username + "\n\n" +
                "본인이 요청한 것이 아니라면 고객센터로 문의해주세요.\n\n" +
                "감사합니다.\n" +
                "InnerSignature 팀"
            );

            mailSender.send(message);
            logger.info("아이디 찾기 이메일 발송 완료 - to: {}", toEmail);
        } catch (Exception e) {
            logger.error("아이디 찾기 이메일 발송 실패 - to: {}, error: {}", toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }

    /**
     * 비밀번호 재설정 이메일 발송
     * @param toEmail 수신자 이메일
     * @param koreanName 수신자 이름
     * @param resetToken 재설정 토큰
     */
    public void sendPasswordResetEmail(String toEmail, String koreanName, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/reset-password/" + resetToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("[InnerSignature] 비밀번호 재설정 안내");
            message.setText(
                koreanName + "님 안녕하세요.\n\n" +
                "비밀번호 재설정을 요청하셨습니다.\n\n" +
                "아래 링크를 클릭하여 비밀번호를 재설정해주세요.\n" +
                "링크는 1시간 동안만 유효합니다.\n\n" +
                resetUrl + "\n\n" +
                "본인이 요청한 것이 아니라면 이 이메일을 무시하시면 됩니다.\n\n" +
                "감사합니다.\n" +
                "InnerSignature 팀"
            );

            mailSender.send(message);
            logger.info("비밀번호 재설정 이메일 발송 완료 - to: {}", toEmail);
        } catch (Exception e) {
            logger.error("비밀번호 재설정 이메일 발송 실패 - to: {}, error: {}", toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
}

