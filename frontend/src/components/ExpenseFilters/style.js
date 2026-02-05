import styled from '@emotion/styled';

export const FilterContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 4px;
  border: none;
  box-shadow: none;
  padding: 24px;
  margin-bottom: 24px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 64px;
    background: white;
    z-index: 999;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 16px;
    margin: 0;
    border-radius: 0;
    border: none;
    box-shadow: none;
    max-width: 100%;
  }
`;

export const FilterTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0 16px;
  row-gap: 20px;
  margin-bottom: 0;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    row-gap: 16px;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  width: 100%;
  min-height: 61px;

  @media (max-width: 768px) {
    width: 100%;
    min-height: auto;
  }
`;

export const FilterSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const FilterSelectIcon = styled.img`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 1;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  padding-right: 40px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  line-height: 18px;
  background-color: white;
  color: #777777;
  transition: border-color 0.2s;
  height: 36px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #489bff;
    box-shadow: 0 0 0 3px rgba(72, 155, 255, 0.1);
  }
`;

export const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  line-height: 16.8px;
`;

export const FilterInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const FilterInputIcon = styled.img`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 2;
  pointer-events: auto;
`;

export const FilterInput = styled.input`
  padding: 8px 12px;
  padding-left: 12px;
  padding-right: ${props => props.hasIcon ? '40px' : '12px'};
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  font-size: 15px;
  line-height: 18px;
  background-color: white;
  color: #777777;
  transition: all 0.2s;
  height: 36px;
  width: 100%;
  box-sizing: border-box;

  &[type="date"] {
    /* 브라우저 기본 캘린더 아이콘 숨기기 */
    &::-webkit-calendar-picker-indicator {
      opacity: 0;
      position: absolute;
      right: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      z-index: 1;
    }
    
    /* Firefox용 */
    &::-moz-calendar-picker-indicator {
      opacity: 0;
      position: absolute;
      right: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      z-index: 1;
    }
  }

  &:focus {
    outline: none;
    border-color: #489bff;
    box-shadow: 0 0 0 3px rgba(72, 155, 255, 0.1);
  }

  &::placeholder {
    color: #777777;
  }
`;

export const StatusCheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 8px 12px;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  background-color: white;
  height: 36px;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const StatusCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  color: #333333;
  padding: 0;
  border-radius: 0;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  input[type="checkbox"] {
    width: 14.4px;
    height: 14.4px;
    cursor: pointer;
    accent-color: #489bff;
    border: 1px solid #e4e4e4;
    border-radius: 4px;
  }

  span {
    font-weight: 400;
    line-height: 15px;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 0;
  border-top: none;
  margin-top: 19px;
  grid-column: 1 / -1;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 16px;
  }
`;

export const ResetButton = styled.button`
  padding: 0;
  border: none;
  border-radius: 0;
  font-weight: 400;
  font-size: 15px;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 18px;
  background-color: transparent;
  color: #777777;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.8;
  }
`;

export const ApplyButton = styled.button`
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  background-color: #489bff;
  color: white;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  &:hover {
    background-color: #3a8aef;
    transform: translateY(-1px);
  }
`;

export const FilterButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background-color: #489bff;
        color: white;

        &:hover {
          background-color: #3a8aef;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background-color: transparent;
        color: #777777;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          opacity: 0.8;
        }
      `;
    }
  }}
`;
