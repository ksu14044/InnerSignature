import { useState, useRef, useEffect } from 'react';
import * as S from './style';

const Select = ({ 
  name, 
  value, 
  onChange, 
  onBlur, 
  hasError = false, 
  required = false,
  options = [],
  placeholder = '선택하세요',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current && 
        !selectRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHoveredIndex(-1);
        if (onBlur) {
          onBlur({ target: { name, value } });
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, name, value, onBlur]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHoveredIndex(-1);
  };

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: optionValue
        }
      });
    }
    setIsOpen(false);
    setHoveredIndex(-1);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <S.SelectContainer ref={selectRef}>
      <S.SelectButton
        type="button"
        onClick={handleToggle}
        hasError={hasError}
        isOpen={isOpen}
        {...props}
      >
        <S.SelectValue isEmpty={!value} style={{ fontWeight: 400, color: '#333333'}}>
          {displayValue}
        </S.SelectValue>
        <S.SelectArrow isOpen={isOpen}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
            <path fill="#333" d="M6 9L1 4h10z" />
          </svg>
        </S.SelectArrow>
      </S.SelectButton>
      
      {isOpen && (
        <S.Dropdown ref={dropdownRef}>
          {options.map((option, index) => {
            // 옵션의 font-weight 확인 (600 이상이면 500으로 제한)
            const optionFontWeight = option.fontWeight || 350;
            const fontWeight = optionFontWeight >= 600 ? 500 : optionFontWeight;
            
            return (
              <S.Option
                key={option.value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
                isHovered={hoveredIndex === index}
                isSelected={value === option.value}
                fontWeight={fontWeight}
              >
                {option.label}
              </S.Option>
            );
          })}
        </S.Dropdown>
      )}
      
      {/* 숨겨진 select 요소로 폼 제출 시 값 전달 */}
      <input
        type="hidden"
        name={name}
        value={value || ''}
        required={required}
      />
    </S.SelectContainer>
  );
};

export default Select;
