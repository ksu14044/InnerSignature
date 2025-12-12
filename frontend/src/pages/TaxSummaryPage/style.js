import styled from '@emotion/styled';

export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 12px;
`;

export const Title = styled.h1`
  font-size: 26px;
  margin: 0;
  color: var(--dark-color);
`;

export const SubTitle = styled.div`
  font-size: 14px;
  color: var(--secondary-color);
  margin-top: 6px;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ variant }) => (variant === 'danger' ? '#fff' : '#fff')};
  background: ${({ variant }) => {
    if (variant === 'secondary') return '#6c757d';
    if (variant === 'danger') return '#dc3545';
    if (variant === 'primary') return '#007bff';
    return 'var(--primary-color)';
  }};
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }
`;

export const FilterCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
`;

export const FilterStatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
`;

export const FilterStatusLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-color);
`;

export const FilterStatusText = styled.span`
  font-size: 13px;
  color: #495057;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: 6px;
  display: block;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
`;

export const Th = styled.th`
  padding: 12px;
  text-align: ${({ align }) => align || 'left'};
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 700;
  color: var(--dark-color);
  position: relative;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  user-select: none;
  transition: background-color 0.2s ease;

  ${({ sortable }) =>
    sortable &&
    `
    &:hover {
      background: #e9ecef;
    }
  `}

  ${({ active }) =>
    active &&
    `
    background: #e7f3ff;
    color: var(--primary-color);
  `}

  ${({ direction }) =>
    direction &&
    `
    &::after {
      content: '${direction === 'asc' ? '▲' : '▼'}';
      margin-left: 6px;
      font-size: 10px;
      opacity: 0.7;
    }
  `}
`;

export const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f1f1f1;
  color: #333;
  text-align: ${({ align }) => align || 'left'};
`;

export const Tr = styled.tr`
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  ${({ even }) =>
    even &&
    `
    background-color: #fafbfc;
  `}
`;

export const Empty = styled.div`
  padding: 24px;
  text-align: center;
  color: var(--secondary-color);
`;

export const Alert = styled.div`
  margin-top: 12px;
  background: #fff4e5;
  border: 1px solid #ffd8a8;
  border-radius: 8px;
  padding: 12px 14px;
  color: #d9480f;
  font-size: 14px;
`;

export const Card = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  margin-bottom: 16px;
`;

export const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Small = styled.div`
  font-size: 13px;
  color: var(--secondary-color);
`;

export const StatusChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const StatusChip = styled.button`
  border: 1px solid ${({ active }) => (active ? 'var(--primary-color)' : '#e0e0e0')};
  background: ${({ active }) => (active ? 'rgba(0, 123, 255, 0.08)' : '#fff')};
  color: ${({ active }) => (active ? 'var(--primary-color)' : '#333')};
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

export const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StatLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

export const StatValue = styled.div`
  font-size: 24px;
  color: #fff;
  font-weight: 700;
`;

export const LinkButton = styled.button`
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-size: inherit;
  transition: color 0.15s ease;

  &:hover {
    color: #0056b3;
  }
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

export const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: #fff;
    border-color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.span`
  font-size: 14px;
  color: var(--secondary-color);
  font-weight: 500;
`;

export const TaxProcessedBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
  ${({ completed }) =>
    completed
      ? `
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `
      : `
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  `}
`;

export const SecretBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  vertical-align: middle;
`;

