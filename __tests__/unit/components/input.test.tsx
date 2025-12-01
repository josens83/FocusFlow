/**
 * @fileoverview Input 컴포넌트 테스트
 *
 * @description
 * Input 컴포넌트의 렌더링과 상호작용을 테스트합니다.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with label when provided', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should associate label with input', () => {
      render(<Input label="Email" id="email-input" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should generate unique id when not provided', () => {
      render(<Input label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('id');
    });
  });

  // ==========================================================================
  // Type Tests
  // ==========================================================================
  describe('input types', () => {
    it('should render text input by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('should render email input', () => {
      render(<Input type="email" placeholder="email" />);
      expect(screen.getByPlaceholderText('email')).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" placeholder="password" />);
      expect(screen.getByPlaceholderText('password')).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" placeholder="number" />);
      expect(screen.getByPlaceholderText('number')).toHaveAttribute('type', 'number');
    });
  });

  // ==========================================================================
  // Error State Tests
  // ==========================================================================
  describe('error state', () => {
    it('should display error message when provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should have error styling when error is provided', () => {
      render(<Input error="Invalid input" />);
      expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('should display error in red text', () => {
      render(<Input error="Error message" />);
      const errorElement = screen.getByText('Error message');
      expect(errorElement).toHaveClass('text-red-500');
    });

    it('should not show error element when no error', () => {
      render(<Input />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Disabled State Tests
  // ==========================================================================
  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should have disabled styling', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toHaveClass('disabled:opacity-50');
    });

    it('should not allow input when disabled', async () => {
      const onChange = jest.fn();
      render(<Input disabled onChange={onChange} />);
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Value Tests
  // ==========================================================================
  describe('value handling', () => {
    it('should display provided value', () => {
      render(<Input value="test value" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('test value');
    });

    it('should call onChange when value changes', async () => {
      const onChange = jest.fn();
      render(<Input onChange={onChange} />);
      await userEvent.type(screen.getByRole('textbox'), 'a');
      expect(onChange).toHaveBeenCalled();
    });

    it('should update value on user input', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
      };
      const React = require('react');
      render(<TestComponent />);
      await userEvent.type(screen.getByRole('textbox'), 'hello');
      expect(screen.getByRole('textbox')).toHaveValue('hello');
    });
  });

  // ==========================================================================
  // Placeholder Tests
  // ==========================================================================
  describe('placeholder', () => {
    it('should display placeholder text', () => {
      render(<Input placeholder="Enter your email" />);
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('should have placeholder styling', () => {
      render(<Input placeholder="Placeholder" />);
      expect(screen.getByPlaceholderText('Placeholder')).toHaveClass('placeholder:text-gray-400');
    });
  });

  // ==========================================================================
  // Custom Class Tests
  // ==========================================================================
  describe('custom classes', () => {
    it('should merge custom className', () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('should maintain base classes', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('rounded-lg');
      expect(input).toHaveClass('custom-class');
    });
  });

  // ==========================================================================
  // Ref Forwarding Tests
  // ==========================================================================
  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================
  describe('accessibility', () => {
    it('should have proper role', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Input aria-label="Search" />);
      expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
    });

    it('should support aria-describedby for error', () => {
      render(<Input aria-describedby="error-msg" error="Error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-msg');
    });

    it('should have focus ring for keyboard navigation', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveClass('focus:ring-2');
    });
  });

  // ==========================================================================
  // Event Handlers Tests
  // ==========================================================================
  describe('event handlers', () => {
    it('should call onFocus when focused', () => {
      const onFocus = jest.fn();
      render(<Input onFocus={onFocus} />);
      fireEvent.focus(screen.getByRole('textbox'));
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      const onBlur = jest.fn();
      render(<Input onBlur={onBlur} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('should call onKeyDown on key press', () => {
      const onKeyDown = jest.fn();
      render(<Input onKeyDown={onKeyDown} />);
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
  });
});
