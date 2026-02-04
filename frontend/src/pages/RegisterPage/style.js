import styled from '@emotion/styled';
import { InputWrapper, Input as InputStyled } from '../../components/common/Input/style';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #ffffff;
  box-sizing: border-box;
  padding: 144px 20px 20px 20px;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 588px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 56px 0;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 1px solid #E4E4E4;
  border-radius: 4px;

  /* Input 포커스 시 테두리 색상 변경 */
  input:focus {
    border-color: #666666 !important;
    box-shadow: 0 0 0 3px rgba(102, 102, 102, 0.1) !important;
  }
  
  /* Button 활성화 시 색상 변경 */
  button[data-common-button="true"]:not(:disabled):active {
    background-color: #333333 !important;
  }
`;

export const InputGroup = styled.div`
  width: 100%;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  font-family: 'Noto Sans KR', sans-serif;
  
  /* 마지막에 빨간색 별표 추가 */
  &::after {
    content: '*';
    color: #D72D30;
    margin-left: 2px;
  }
`;

export const InputWithButton = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: flex-start;
  /* 중복확인 버튼 활성화 시 색상 변경 */
  button:not(:disabled) {
    background-color: #333333 !important;
    color: #FFFFFF !important;
  }
  /* Input 높이를 48px로 고정 (50px로 변경되지 않도록) */
  ${InputWrapper} {
    flex: 1;
    ${InputStyled} {
      height: 48px !important;
      min-height: 48px !important;
      max-height: 48px !important;
    }
  }
`;

export const StatusMessage = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => 
    props.available === true ? '#489BFF' : 
    props.available === false ? '#dc3545' : '#666'
  };
  font-family: 'Noto Sans KR', sans-serif;
  margin-top: 4px;
`;

export const CompanyInputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CompanySearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: #333333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s;
  font-size: 15px;
  border-radius: 4px;

  &:hover {
    background-color: #e9e9e9;
    color: #333;
  }

  &:active {
    background-color: #ddd;
  }
`;

export const SelectWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid ${({ hasError }) => (hasError ? '#D72D30' : '#ddd')};
  border-radius: 8px;
  background-color: #ffffff;
  color: #000000;
  font-family: 'Noto Sans KR', sans-serif;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ hasError }) => (hasError ? '#D72D30' : '#666666')};
  }

  &:hover {
    border-color: ${({ hasError }) => (hasError ? '#D72D30' : '#bbb')};
  }

  option {
    padding: 8px;
    color: #666666;
    font-weight: 350;
    background-color: #ffffff;
  }

  option:hover {
    background-color: #F8F9FA;
  }
`;

export const ErrorMessage = styled.div`
  font-size: 13px;
  color: #D72D30;
  margin-top: 4px;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 40px;

  /* 취소 버튼 호버 효과 */
  button:first-of-type:hover:not(:disabled) {
    background-color: #F6F6F6 !important;
  }
`;

export const LinkContainer = styled.div`
  text-align: center;
  margin-top: 56px;
  font-size: 14px;
  color: #666666;
  font-family: 'Noto Sans KR', sans-serif;
  margin-bottom: 152px;

  a {
    color: #489BFF;
    text-decoration: none;
    transition: all 0.2s;
    margin-left: 4px;

    &:hover {
      color: #3B8BEB;
      text-decoration: underline;
    }
  }
`;
