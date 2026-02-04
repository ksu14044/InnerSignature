import styled from '@emotion/styled';

export const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
`;

export const Content = styled.main`
  flex: 1;
  min-width: 0;
`;

export const ContentInner = styled.div`
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);

  @media (max-width: 768px) {
    padding: var(--page-padding-tablet);
  }

  @media (max-width: 480px) {
    padding: 0;
    width: 100%;
    max-width: 100%;
  }
`;

export const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 480px) {
    display: none; /* 모바일은 MobileAppBar가 타이틀을 담당 */
  }
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
`;

export const Subtitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;


