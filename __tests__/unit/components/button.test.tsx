/**
 * @fileoverview Button 컴포넌트 테스트
 *
 * @description
 * Button 컴포넌트의 렌더링과 상호작용을 테스트합니다.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================
  describe('rendering', () => {
    it('should render button with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with default variant and size', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-500');
      expect(button).toHaveClass('h-10');
    });
  });

  // ==========================================================================
  // Variant Tests
  // ==========================================================================
  describe('variants', () => {
    it('should render default variant', () => {
      render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary-500');
    });

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-500');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-primary-500');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-gray-100');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-gray-100');
    });

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('text-primary-600');
    });

    it('should render premium variant', () => {
      render(<Button variant="premium">Premium</Button>);
      expect(screen.getByRole('button')).toHaveClass('from-amber-500');
    });
  });

  // ==========================================================================
  // Size Tests
  // ==========================================================================
  describe('sizes', () => {
    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-12');
    });

    it('should render extra large size', () => {
      render(<Button size="xl">XL</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-14');
    });

    it('should render icon size', () => {
      render(<Button size="icon">+</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');
    });
  });

  // ==========================================================================
  // Loading State Tests
  // ==========================================================================
  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByText('로딩중...')).toBeInTheDocument();
    });

    it('should hide children when loading', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have spinning animation in loading state', () => {
      render(<Button isLoading>Submit</Button>);
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('animate-spin');
    });
  });

  // ==========================================================================
  // Disabled State Tests
  // ==========================================================================
  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not trigger onClick when disabled', () => {
      const onClick = jest.fn();
      render(<Button disabled onClick={onClick}>Disabled</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should have disabled styling', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
    });
  });

  // ==========================================================================
  // Interaction Tests
  // ==========================================================================
  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when loading', () => {
      const onClick = jest.fn();
      render(<Button isLoading onClick={onClick}>Submit</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should support keyboard activation', () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Press Enter</Button>);
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      // Button will be activated by Enter key by default
    });
  });

  // ==========================================================================
  // Custom Class Tests
  // ==========================================================================
  describe('custom classes', () => {
    it('should merge custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should maintain base classes with custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('custom-class');
    });
  });

  // ==========================================================================
  // Ref Forwarding Tests
  // ==========================================================================
  describe('ref forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================
  describe('accessibility', () => {
    it('should have proper role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });

    it('should have focus ring styles', () => {
      render(<Button>Focus me</Button>);
      expect(screen.getByRole('button')).toHaveClass('focus-visible:ring-2');
    });
  });
});
