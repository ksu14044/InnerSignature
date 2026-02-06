import styled from '@emotion/styled';

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
    padding-top: 56px;
    padding-bottom: 80px;
    padding-left: 40px;
  }
`;


export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #489bff;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 19.2px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3a8ae6;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

export const SignaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 264px);
  gap: 24px;
  justify-content: start;
  padding: 0;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 264px);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 264px);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    padding: 0 16px;
    gap: 16px;
  }
`;

export const SignatureCard = styled.div`
  position: relative;
  width: 264px;
  height: 233px;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 600px) {
    width: 100%;
    max-width: 264px;
    margin: 0 auto;
  }
`;

export const SignatureHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e4e4e4;
`;

export const SignatureHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const SignatureHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DefaultBadge = styled.div`
  background: #ebf4ff;
  color: #489bff;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 6px;
  height: 20px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;

export const SignaturePreview = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  overflow: hidden;
  border-bottom: 1px solid #e4e4e4;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export const SignatureInfo = styled.div`
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SignatureNameRow = styled.div`
  display: flex;
  align-items: center;
`;

export const SignatureName = styled.div`
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 21.6px;
  color: #333333;
`;

export const SignatureDateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: space-between;
`;

export const SignatureTypeLabel = styled.div`
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 16.8px;
  color: #666666;
  margin-left: auto;
`;

export const DateLabel = styled.span`
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 16.8px;
  color: #666666;
`;

export const DateValue = styled.span`
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 350;
  line-height: 16.8px;
  color: #666666;
`;

export const SetDefaultButton = styled.button`
  background: #ebf4ff;
  color: #489bff;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 20px;
  min-height: 20px !important;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  margin: 0;
  outline: none;

  &:hover {
    background: #d4e7ff;
  }

  &:focus {
    outline: none;
  }
`;

export const EditButton = styled.button`
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333333;
  transition: background-color 0.2s;
  padding: 0;

  &:hover {
    background: #f5f5f5;
  }

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

export const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #333333;
  transition: background-color 0.2s;
  padding: 0;

  &:hover {
    background: #f5f5f5;
  }

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e4e4;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }

  @media (max-width: 480px) {
    padding: 40px 16px;
    margin: 0 16px 24px;
  }
`;

export const EmptyText = styled.p`
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  color: #6c757d;
  margin: 0;
`;

// 모달 스타일
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 12px 12px 0 0;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

export const ModalTitle = styled.h3`
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
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
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: #007bff;
    background-color: #f8f9fa;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 18px;
      margin-bottom: 4px;
      color: #333;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
`;

// 레거시 스타일 (호환성을 위해 유지)
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 480px) {
    padding: 0 16px;
    margin-bottom: 20px;
  }
`;

export const HeaderLeft = styled.div`
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #5a6268;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    padding: 0 16px;
    margin-bottom: 16px;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const SignatureItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.isDefault ? '#007bff' : '#e0e0e0'};
  border-width: ${props => props.isDefault ? '2px' : '1px'};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const SignatureType = styled.div`
  font-size: 14px;
  color: #666;
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #007bff;
  border-radius: 4px;
  background-color: white;
  color: #007bff;
  cursor: pointer;
  padding: 6px 12px;
  font-size: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e7f3ff;
  }
`;