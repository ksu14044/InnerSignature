import { useState } from 'react';
import { searchCompanies } from '../../api/companyApi';
import { FaTimes, FaSearch, FaBuilding } from 'react-icons/fa';
import * as S from './style';

const CompanySearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await searchCompanies(searchQuery);
      if (response.success) {
        setSearchResults(response.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('회사 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (company) => {
    onSelect(company);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={handleClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitle>회사 검색</S.ModalTitle>
          <S.CloseButton onClick={handleClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalBody>
          <S.SearchSection>
            <S.SearchInputGroup>
              <S.SearchInput
                type="text"
                placeholder="회사명을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                autoFocus
              />
              <S.SearchButton type="button" onClick={handleSearch} disabled={isSearching}>
                <FaSearch />
                {isSearching ? '검색 중...' : '검색'}
              </S.SearchButton>
            </S.SearchInputGroup>
          </S.SearchSection>

          <S.ResultsSection>
            {searchResults.length > 0 ? (
              <S.CompanyList>
                {searchResults.map((company) => (
                  <S.CompanyItem
                    key={company.companyId}
                    onClick={() => handleSelect(company)}
                  >
                    <FaBuilding style={{ marginRight: '12px', color: '#007bff' }} />
                    <S.CompanyInfo>
                      <S.CompanyName>{company.companyName}</S.CompanyName>
                      {company.adminName && (
                        <S.AdminName>대표: {company.adminName}</S.AdminName>
                      )}
                    </S.CompanyInfo>
                  </S.CompanyItem>
                ))}
              </S.CompanyList>
            ) : searchQuery && !isSearching ? (
              <S.EmptyMessage>
                검색 결과가 없습니다. 회사명을 다시 확인해주세요.
              </S.EmptyMessage>
            ) : null}
          </S.ResultsSection>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default CompanySearchModal;

