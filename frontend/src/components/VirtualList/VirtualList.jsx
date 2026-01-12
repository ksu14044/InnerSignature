import React from 'react';
import { FixedSizeList } from 'react-window';
import * as S from './style';

/**
 * Virtual Scrolling을 지원하는 최적화된 리스트 컴포넌트
 * 대량의 데이터를 효율적으로 렌더링합니다.
 */
const VirtualList = React.memo(({ 
  items = [], 
  renderItem, 
  height = 600, 
  itemSize = 80,
  width = '100%',
  className = '',
  emptyMessage = '데이터가 없습니다.'
}) => {
  if (!items || items.length === 0) {
    return (
      <S.EmptyContainer style={{ height }}>
        {emptyMessage}
      </S.EmptyContainer>
    );
  }

  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemSize}
      width={width}
      className={className}
      overscanCount={5} // 보이는 영역 외 5개 항목을 미리 렌더링
    >
      {({ index, style }) => (
        <div style={style}>
          {renderItem(items[index], index)}
        </div>
      )}
    </FixedSizeList>
  );
});

VirtualList.displayName = 'VirtualList';

export default VirtualList;


