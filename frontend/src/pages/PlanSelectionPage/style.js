import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

export const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

export const PlanCard = styled.div`
  position: relative;
  background: white;
  border: 2px solid ${props => props.featured ? '#007bff' : '#ddd'};
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const FeaturedBadge = styled.div`
  position: absolute;
  top: -12px;
  right: 24px;
  background-color: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

export const PlanHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
`;

export const PlanName = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 12px 0;
`;

export const PlanPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

export const FreePrice = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #28a745;
`;

export const PriceAmount = styled.span`
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
`;

export const PriceUnit = styled.span`
  font-size: 16px;
  color: #666;
`;

export const PlanFeatures = styled.div`
  margin-bottom: 24px;
  min-height: 200px;
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

export const FeatureIcon = styled.span`
  color: #28a745;
  font-weight: bold;
  margin-right: 8px;
  font-size: 18px;
`;

export const FeatureText = styled.span`
  color: #333;
  font-size: 14px;
`;

export const PlanAction = styled.div`
  margin-top: auto;
`;

export const SelectButton = styled.button`
  width: 100%;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const CurrentButton = styled.button`
  width: 100%;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: default;
`;

