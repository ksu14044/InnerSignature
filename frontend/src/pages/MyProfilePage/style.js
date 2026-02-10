import styled from '@emotion/styled';

// 지출결의서 목록 페이지와 동일한 페이지 레이아웃 사용
export const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 40px;
  min-height: 100vh;
  background: #f8f9fa;

  @media (max-width: 768px) {
    padding: 16px 16px 16px 40px;
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
    min-height: auto;
    background: #f5f5f5;
    padding-top: 56px; /* 상단 바 높이 */
    padding-bottom: 80px; /* 하단 네비게이션 + 여백 */
    padding-left: 40px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);

  @media (max-width: 480px) {
    display: none;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0;
`;

export const WelcomeText = styled.span`
  font-size: 16px;
  color: var(--secondary-color);
`;

export const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
`;

export const ProfileCard = styled.div`
  background: #ffffff;
  border-radius: 4px; /* Figma: cornerRadius 4 */
  padding: 24px;
  border: 1px solid #e4e4e4;
  margin: 0 auto 24px auto;
  max-width: 744px; /* Figma: 카드 폭 744 */
  transition: all var(--transition-base);

  @media (max-width: 1024px) {
    max-width: 100%;
  }

  @media (max-width: 480px) {
    border-radius: 0;
    padding: 16px;
    margin-bottom: 16px;
    border-left: none;
    border-right: none;
  }
`;

export const CardTitle = styled.h2`
  font-size: 18px; /* Figma: 18px Bold */
  font-weight: 700;
  color: #333333;
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 12px;
    white-space: normal;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333333;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;

    label {
      font-size: 13px;
      margin-bottom: 6px;
      color: #666;
    }
  }
`;

export const Input = styled.input`
  width: 100%;
  height: 36px;
  padding: 8px 10px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  box-sizing: border-box;
  color: #333333;

  &::placeholder {
    color: #777777;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    border-color: #489bff;
    box-shadow: 0 0 0 1px rgba(72, 155, 255, 0.15);
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 14px;
    border-radius: 6px;
    min-height: 40px;
    background: #fafafa;
    
    &:focus {
      background: white;
      border-color: #489bff;
    }
  }
`;

export const HelpText = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666666;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;

  @media (max-width: 480px) {
    margin-top: 20px;
    gap: 8px;
    width: 100%;
  }
`;

export const Button = styled.button`
  min-width: 58px;
  height: 36px;
  padding: 0 16px;
  border: ${props => (props.primary ? 'none' : '1px solid #e4e4e4')};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s, border-color 0.2s, opacity 0.2s;
  background-color: ${props => (props.primary ? '#489bff' : '#ffffff')};
  color: ${props => (props.primary ? '#ffffff' : '#333333')};
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${props => (props.primary ? '#3a8aef' : '#f8f9fa')};
    border-color: ${props => (props.primary ? '#3a8aef' : '#d0d0d0')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    flex: 1;
    justify-content: center;
    height: 40px;
    font-size: 14px;
    border-radius: 6px;
    
    span {
      display: inline;
    }
    
    svg {
      display: inline;
    }
    
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
`;

export const Loading = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--secondary-color);
`;

export const CompanySection = styled.div`
  margin-bottom: 20px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

export const CompanySectionTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333333;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 12px;
    padding: 0 4px;
  }
`;

export const CompanyCard = styled.div`
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 12px;
    border: ${props => props.isCurrent ? '2px solid #28a745' : '1px solid #e0e0e0'};
    gap: 12px;
  }
`;

export const CompanyInfo = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const CompanyNameRow = styled.div`
  font-weight: 500;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 6px;
    white-space: normal;
  }
`;

export const CompanyDetails = styled.div`
  font-size: 14px;
  color: #666;

  @media (max-width: 480px) {
    font-size: 13px;
    line-height: 1.4;
  }
`;

export const CompanyActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
    gap: 6px;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

export const CurrentBadge = styled.span`
  background-color: #68adff;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 10px;
  }
`;

export const PendingCompanyCard = styled.div`
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #ff9800;
  border-radius: 5px;
  background-color: #fff3cd;

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 12px;
  }
`;

// PageSubHeader 우측에 배치될 회사 검색/등록 버튼
export const SubHeaderButton = styled.button`
  height: 36px;
  padding: 0 16px;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background-color 0.2s, border-color 0.2s, opacity 0.2s;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d0d0d0;
  }
`;

export const SubHeaderPrimaryButton = styled(SubHeaderButton)`
  border-color: #489bff;
  background-color: #489bff;
  color: #ffffff;

  &:hover {
    background-color: #3a8aef;
    border-color: #3a8aef;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 14px 12px;
    font-size: 16px;
    border-radius: 8px;
    min-height: 48px;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const TypeSelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: var(--primary-color);
    background-color: #f0f7ff;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 18px;
      margin-bottom: 4px;
      color: var(--dark-color);
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
`;

