import styled from '@emotion/styled';

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #ffffff;
  box-sizing: border-box;
  padding: 160px 20px 20px 20px;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 384px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 24px 0;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const Description = styled.p`
  font-size: 18px;
  color: #666666;
  margin: 0 0 72px 0;
  text-align: center;
  font-weight: 400;
  font-family: 'Noto Sans KR', sans-serif;
  line-height: 1.6;
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const InputGroup = styled.div`
  width: 100%;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LinkContainer = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;
  font-family: 'Noto Sans KR', sans-serif;

  a {
    color: #489BFF;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: #3B8BEB;
      text-decoration: underline;
    }
  }
`;

export const LinkDivider = styled.span`
  color: #489BFF;
  margin: 0 4px;
`;

export const ResultContainer = styled.div`
  width: 100%;
  text-align: center;
  padding: 24px 0;
`;

export const ResultMessage = styled.div`
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  background-color: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
  font-size: 16px;
  line-height: 1.5;
  font-family: 'Noto Sans KR', sans-serif;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

