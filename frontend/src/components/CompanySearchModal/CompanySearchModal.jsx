import { useState } from 'react';
import { searchCompanies } from '../../api/companyApi';
import { FaTimes, FaSearch, FaBuilding } from 'react-icons/fa';
import * as S from './style';

const CompanySearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const MIN_SEARCH_LENGTH = 2;

  const performSearch = async (query) => {
    const trimmedQuery = query.trim();
    
    // 최소 길이 체크
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchError('');
      return;
    }
    
    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchError(`검색어는 최소 ${MIN_SEARCH_LENGTH}자 이상 입력해주세요.`);
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchError('');
      const response = await searchCompanies(trimmedQuery);
      if (response.success) {
        setSearchResults(response.data || []);
        if (response.data && response.data.length === 0) {
          setSearchError('검색 결과가 없습니다.');
        }
      } else {
        setSearchResults([]);
        setSearchError(response.message || '검색에 실패했습니다.');
      }
    } catch (error) {
      console.error('회사 검색 실패:', error);
      setSearchResults([]);
      const errorMessage = error?.response?.data?.message || '검색 중 오류가 발생했습니다.';
      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    await performSearch(searchQuery);
  };

  const handleSelect = (company) => {
    onSelect(company);
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
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
                placeholder="회사명 또는 사업자등록번호를 입력하세요"
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
            {isSearching ? (
              <S.EmptyMessage>검색 중...</S.EmptyMessage>
            ) : searchError ? (
              <S.EmptyMessage style={{ color: '#dc3545' }}>{searchError}</S.EmptyMessage>
            ) : searchResults.length > 0 ? (
              <S.CompanyList>
                {searchResults.map((company) => (
                  <S.CompanyItem
                    key={company.companyId}
                    onClick={() => handleSelect(company)}
                  >
                    <FaBuilding style={{ marginRight: '12px', color: '#007bff' }} />
                    <S.CompanyInfo>
                      <S.CompanyName>{company.companyName}</S.CompanyName>
                      <S.CompanyDetails>
                        {company.businessRegNo && (
                          <S.DetailItem>사업자등록번호: {company.businessRegNo}</S.DetailItem>
                        )}
                        {company.representativeName && (
                          <S.DetailItem>대표자: {company.representativeName}</S.DetailItem>
                        )}
                        {company.adminName && (
                          <S.DetailItem>관리자: {company.adminName}</S.DetailItem>
                        )}
                      </S.CompanyDetails>
                    </S.CompanyInfo>
                  </S.CompanyItem>
                ))}
              </S.CompanyList>
            ) : searchQuery && searchQuery.trim().length >= MIN_SEARCH_LENGTH ? (
              <S.EmptyMessage>
                검색 결과가 없습니다. 회사명 또는 사업자등록번호를 다시 확인해주세요.
              </S.EmptyMessage>
            ) : null}
          </S.ResultsSection>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default CompanySearchModal;

