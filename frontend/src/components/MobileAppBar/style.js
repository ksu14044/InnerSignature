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

export const CompanySelector = styled.div`
  position: relative;
  margin-right: 4px;
`;

export const CompanyButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #28a745;
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
    background-color: rgba(40, 167, 69, 0.1);
  }
`;

export const CompanyDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  max-width: 250px;
  z-index: 1001;
  overflow: hidden;
`;

export const CompanyDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:active {
    background-color: #e0e0e0;
  }
  
  ${props => props.selected && `
    background-color: rgba(0, 123, 255, 0.1);
    font-weight: 600;
    color: #007bff;
  `}
  
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

