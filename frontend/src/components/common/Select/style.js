import styled from '@emotion/styled';

export const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  font-size: 16px;
  border: 1px solid ${({ hasError }) => (hasError ? '#D72D30' : '#ddd')};
  border-radius: 8px;
  background-color: #ffffff;
  color: ${({ isEmpty }) => (isEmpty ? '#666666' : '#000000')};
  font-family: 'Noto Sans KR', sans-serif;
  cursor: pointer;
  transition: border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  min-height: 48px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ hasError }) => (hasError ? '#D72D30' : '#666666')};
  }

  &:hover {
    border-color: ${({ hasError }) => (hasError ? '#D72D30' : '#bbb')};
  }
`;

export const SelectValue = styled.span`
  flex: 1;
  color: ${({ isEmpty }) => (isEmpty ? '#666666' : '#000000')};
`;

export const SelectArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const Option = styled.div`
  padding: 12px 16px;
  font-size: 16px;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  cursor: pointer;
  background-color: ${({ isHovered }) => (isHovered ? '#F8F9FA' : '#ffffff')};
  transition: background-color 0.15s;
  font-weight: ${({ fontWeight }) => {
    // 폰트 웨이트가 600 이상인 경우 500으로 제한, 그 외는 350
    if (fontWeight && fontWeight >= 600) {
      return 500;
    }
    return 350;
  }} !important;

  &:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-of-type {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:hover {
    background-color: #F8F9FA;
  }
`;
