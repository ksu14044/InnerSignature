import styled from '@emotion/styled';

export const AppBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  @media (min-width: 481px) {
    display: none;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #f0f0f0;
  }
`;

export const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:active {
    background-color: #f0f0f0;
  }
`;

