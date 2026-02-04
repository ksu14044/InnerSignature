# 공통 컴포넌트

프로젝트 전반에서 사용할 수 있는 재사용 가능한 공통 컴포넌트입니다.

## Button 컴포넌트

### 사용법

```jsx
import Button from '@/components/common/Button';

// 버튼 1 (medium): height: 40px, font-size: 16px, font-weight: 500
<Button size="medium" variant="primary">버튼 1</Button>

// 버튼 2 (large): height: 48px, font-size: 16px, font-weight: 500
<Button size="large" variant="primary">버튼 2</Button>

// 버튼 3 (small): height: 36px, font-size: 15px, font-weight: 500
<Button size="small" variant="primary">버튼 3</Button>

// 전체 너비 버튼
<Button size="large" fullWidth>전체 너비 버튼</Button>

// 다양한 variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="outline">Outline</Button>

// Disabled 상태
<Button disabled>비활성화</Button>
```

### Props

- `size`: `'small' | 'medium' | 'large'` - 버튼 크기 (기본값: `'medium'`)
  - `small`: height 36px, font-size 15px
  - `medium`: height 40px, font-size 16px
  - `large`: height 48px, font-size 16px
- `variant`: `'primary' | 'secondary' | 'danger' | 'success' | 'outline'` - 버튼 스타일 (기본값: `'primary'`)
- `disabled`: `boolean` - 비활성화 여부 (기본값: `false`)
- `fullWidth`: `boolean` - 전체 너비 여부 (기본값: `false`)
- 기타 표준 button props 지원

## Input 컴포넌트

### 사용법

```jsx
import Input from '@/components/common/Input';
import { FaUser } from 'react-icons/fa';

// Input 1 (large): height: 48px, font-size: 16px, font-weight: 400
<Input 
  size="large" 
  type="text" 
  placeholder="입력하세요"
/>

// Input 2 (small): height: 36px, font-size: 15px, font-weight: 400
<Input 
  size="small" 
  type="text" 
  placeholder="입력하세요"
/>

// 아이콘이 있는 입력 필드
<Input 
  size="large"
  type="text"
  placeholder="아이디"
>
  <FaUser />
</Input>

// 에러 메시지가 있는 입력 필드
<Input 
  size="large"
  type="email"
  placeholder="이메일"
  error="올바른 이메일 형식을 입력해주세요"
/>

// 제어 컴포넌트로 사용
const [value, setValue] = useState('');
<Input 
  size="large"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Props

- `size`: `'small' | 'large'` - 입력 필드 크기 (기본값: `'large'`)
  - `small`: height 36px, font-size 15px
  - `large`: height 48px, font-size 16px
- `fullWidth`: `boolean` - 전체 너비 여부 (기본값: `true`)
- `error`: `string` - 에러 메시지 (표시 시 빨간색 테두리와 메시지 표시)
- `children`: `React.ReactNode` - 입력 필드 왼쪽에 표시할 아이콘
- 기타 표준 input props 지원
