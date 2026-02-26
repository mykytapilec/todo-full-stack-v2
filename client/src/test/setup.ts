import '@testing-library/jest-dom';
import { vi } from 'vitest';

export const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');

  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});
