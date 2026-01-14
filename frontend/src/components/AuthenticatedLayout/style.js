import styled from '@emotion/styled';

// 대부분 페이지의 S.Container와 동일한 폭/패딩 규칙으로 헤더를 감쌉니다.
// (페이지별 Container를 제거하지 않고도 헤더와 바디 정렬을 맞추는 목적)
export const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    /* 모바일에서 AppHeader 자체가 display:none 이라 추가 여백을 만들지 않음 */
  }
`;


