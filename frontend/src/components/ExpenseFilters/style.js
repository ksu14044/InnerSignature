import styled from '@emotion/styled';

export const FilterContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  padding: 24px;
  margin-bottom: 24px;

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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FilterSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const FilterLabel = styled.label`
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
`;

export const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const StatusCheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--light-color);
`;

export const StatusCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--dark-color);
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background-color: rgba(0, 123, 255, 0.05);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary-color);
  }

  span {
    font-weight: 500;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const FilterButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background-color: var(--primary-color);
        color: white;

        &:hover {
          background-color: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background-color: var(--light-color);
        color: var(--dark-color);
        border: 1px solid var(--border-color);

        &:hover {
          background-color: var(--bg-hover);
          border-color: var(--border-hover);
        }
      `;
    }
  }}
`;
