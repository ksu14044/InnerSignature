import styled from '@emotion/styled';

export const Footer = styled.footer`
  width: 100%;
  margin-top: 0;
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
  padding: 56px 20px 64px;
  background-color: #F8F9FA;
  font-family: 'Noto Sans KR', sans-serif;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 20px 16px;
  }
`;

export const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  span {
    display: block;
    margin-bottom: 12px;
  }
`;

export const FooterLink = styled.span`
  font-weight: 600;
  margin-top: 28px;
`;
