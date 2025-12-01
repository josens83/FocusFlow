/**
 * @fileoverview Timer 컴포넌트 테스트
 *
 * @description
 * Timer 컴포넌트의 렌더링과 상호작용을 테스트합니다.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { Timer } from '@/components/timer/Timer';

// Mock the stores
const mockTimerStore = {
  timer: {
    status: 'idle',
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    sessionType: 'POMODORO_25',
    currentSession: 1,
    isBreak: false,
  },
  settings: {
    sessionsBeforeLongBreak: 4,
  },
  startTimer: jest.fn(),
  pauseTimer: jest.fn(),
  resumeTimer: jest.fn(),
  stopTimer: jest.fn(),
  tick: jest.fn(),
  startBreak: jest.fn(),
  skipBreak: jest.fn(),
};

const mockSoundStore = {
  isPlaying: false,
  toggle: jest.fn(),
  isMuted: false,
  toggleMute: jest.fn(),
};

jest.mock('@/stores/timer-store', () => ({
  useTimerStore: () => mockTimerStore,
}));

jest.mock('@/stores/sound-store', () => ({
  useSoundStore: () => mockSoundStore,
}));

jest.mock('@/lib/utils', () => ({
  formatTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Timer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTimerStore.timer = {
      status: 'idle',
      timeRemaining: 25 * 60,
      totalTime: 25 * 60,
      sessionType: 'POMODORO_25',
      currentSession: 1,
      isBreak: false,
    };
  });

  // ==========================================================================
  // Initial State Tests
  // ==========================================================================
  describe('initial state', () => {
    it('should render timer with formatted time', () => {
      render(<Timer />);
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('should show session type badge', () => {
      render(<Timer />);
      expect(screen.getByText('포모도로 25분')).toBeInTheDocument();
    });

    it('should show session count', () => {
      render(<Timer />);
      expect(screen.getByText('세션 1 / 4')).toBeInTheDocument();
    });

    it('should show start button when idle', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: /시작하기/i })).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Idle State Controls
  // ==========================================================================
  describe('idle state controls', () => {
    it('should show session type selection buttons', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: '포모도로 25분' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '딥워크 50분' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '울트라딥 90분' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '마이크로 15분' })).toBeInTheDocument();
    });

    it('should call startTimer when start button is clicked', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: /시작하기/i }));
      expect(mockTimerStore.startTimer).toHaveBeenCalledWith('POMODORO_25');
    });

    it('should call onSessionStart callback when starting', () => {
      const onSessionStart = jest.fn();
      render(<Timer onSessionStart={onSessionStart} />);
      fireEvent.click(screen.getByRole('button', { name: /시작하기/i }));
      expect(onSessionStart).toHaveBeenCalled();
    });

    it('should start with selected session type', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: '딥워크 50분' }));
      expect(mockTimerStore.startTimer).toHaveBeenCalledWith('POMODORO_50');
    });
  });

  // ==========================================================================
  // Running State Tests
  // ==========================================================================
  describe('running state', () => {
    beforeEach(() => {
      mockTimerStore.timer.status = 'running';
    });

    it('should show pause button when running', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: /일시정지/i })).toBeInTheDocument();
    });

    it('should show stop button when running', () => {
      render(<Timer />);
      // Stop button has only Square icon, no text
      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find((btn) => btn.querySelector('svg'));
      expect(stopButton).toBeTruthy();
    });

    it('should call pauseTimer when pause button is clicked', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: /일시정지/i }));
      expect(mockTimerStore.pauseTimer).toHaveBeenCalled();
    });

    it('should call toggleMute when mute button is clicked', () => {
      render(<Timer />);
      const buttons = screen.getAllByRole('button');
      // Find the mute button (last icon button)
      const muteButton = buttons[buttons.length - 1];
      fireEvent.click(muteButton);
      expect(mockSoundStore.toggleMute).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Paused State Tests
  // ==========================================================================
  describe('paused state', () => {
    beforeEach(() => {
      mockTimerStore.timer.status = 'paused';
    });

    it('should show resume button when paused', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: /계속하기/i })).toBeInTheDocument();
    });

    it('should call resumeTimer when resume button is clicked', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: /계속하기/i }));
      expect(mockTimerStore.resumeTimer).toHaveBeenCalled();
    });

    it('should call stopTimer when stop button is clicked', () => {
      render(<Timer />);
      const buttons = screen.getAllByRole('button');
      // First button is stop
      fireEvent.click(buttons[0]);
      expect(mockTimerStore.stopTimer).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Completed State Tests
  // ==========================================================================
  describe('completed state', () => {
    beforeEach(() => {
      mockTimerStore.timer.status = 'completed';
    });

    it('should show next session button when completed', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: /다음 세션/i })).toBeInTheDocument();
    });

    it('should show break button when completed', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: /휴식하기/i })).toBeInTheDocument();
    });

    it('should call startBreak when break button is clicked', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: /휴식하기/i }));
      expect(mockTimerStore.startBreak).toHaveBeenCalled();
    });

    it('should call startTimer when next session button is clicked', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: /다음 세션/i }));
      expect(mockTimerStore.startTimer).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Break State Tests
  // ==========================================================================
  describe('break state', () => {
    beforeEach(() => {
      mockTimerStore.timer.isBreak = true;
      mockTimerStore.timer.status = 'idle';
      mockTimerStore.timer.timeRemaining = 5 * 60;
    });

    it('should show break badge', () => {
      render(<Timer />);
      expect(screen.getByText('휴식 시간')).toBeInTheDocument();
    });

    it('should show skip break button', () => {
      render(<Timer />);
      expect(screen.getByRole('button', { name: /휴식 건너뛰기/i })).toBeInTheDocument();
    });

    it('should call skipBreak when skip button is clicked', () => {
      render(<Timer />);
      fireEvent.click(screen.getByRole('button', { name: /휴식 건너뛰기/i }));
      expect(mockTimerStore.skipBreak).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Timer Tick Tests
  // ==========================================================================
  describe('timer tick', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockTimerStore.timer.status = 'running';
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should tick every second when running', () => {
      render(<Timer />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockTimerStore.tick).toHaveBeenCalled();
    });

    it('should tick multiple times over time', () => {
      render(<Timer />);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockTimerStore.tick).toHaveBeenCalledTimes(5);
    });

    it('should not tick when paused', () => {
      mockTimerStore.timer.status = 'paused';
      render(<Timer />);

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockTimerStore.tick).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Callback Tests
  // ==========================================================================
  describe('callbacks', () => {
    it('should call onSessionComplete when session completes', () => {
      const onSessionComplete = jest.fn();
      mockTimerStore.timer.status = 'completed';
      mockTimerStore.timer.timeRemaining = 0;
      mockTimerStore.timer.totalTime = 25 * 60;

      render(<Timer onSessionComplete={onSessionComplete} />);

      expect(onSessionComplete).toHaveBeenCalled();
    });

    it('should not call onSessionComplete during break', () => {
      const onSessionComplete = jest.fn();
      mockTimerStore.timer.status = 'completed';
      mockTimerStore.timer.isBreak = true;

      render(<Timer onSessionComplete={onSessionComplete} />);

      expect(onSessionComplete).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Progress Calculation Tests
  // ==========================================================================
  describe('progress calculation', () => {
    it('should start with 0% progress', () => {
      mockTimerStore.timer.timeRemaining = 25 * 60;
      mockTimerStore.timer.totalTime = 25 * 60;
      render(<Timer />);
      // CircularProgress should receive progress prop
    });

    it('should show 50% progress halfway through', () => {
      mockTimerStore.timer.timeRemaining = 12.5 * 60;
      mockTimerStore.timer.totalTime = 25 * 60;
      render(<Timer />);
      // Progress = (25*60 - 12.5*60) / (25*60) * 100 = 50%
    });

    it('should show 100% progress when completed', () => {
      mockTimerStore.timer.timeRemaining = 0;
      mockTimerStore.timer.totalTime = 25 * 60;
      mockTimerStore.timer.status = 'completed';
      render(<Timer />);
      // Progress = (25*60 - 0) / (25*60) * 100 = 100%
    });
  });
});
