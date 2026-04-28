// app/actions-lib/task-actions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createTaskActionImpl, generateTaskActionImpl } from './task-actions';
import { requireAuthenticatedUser } from './auth';
import { TaskInput } from './schemas';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { generateText } from 'ai';

type GenerateTextResult = Awaited<ReturnType<typeof generateText>>;

// 1. Mock the module
vi.mock('./auth', () => ({
  getRequestIdentifier: vi.fn(() => 'test-ip-address'),
  requireAuthenticatedUser: vi.fn()
}));

vi.mock('./captcha', () => ({
  verifyCaptcha: vi.fn()
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

// 1. Mock the entire rate-limit module
vi.mock('./rate-limit', () => {
  // Define a mock limit function that always succeeds
  const mockLimit = vi.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  });

  return {
    // Return mock instances for all used ratelimits
    checkSolutionRatelimit: { limit: mockLimit },
    generateTaskRatelimit: { limit: mockLimit },
    signInRatelimit: { limit: mockLimit },
  };
});

// 2. Properly type the mocked function
const mockedAuth = vi.mocked(requireAuthenticatedUser);

describe('createTaskActionImpl', () => {
  const mockTask: TaskInput = {
    title: 'New React Task title',
    difficulty: 'medium',
    tags: ['react', 'typescript', 'hooks'],
    hint: 'Try using hooks',
    languageName: 'TypeScript',
    description: 'Build a counter component in React.',
    starterCode: 'const App = () => { const count = 0; }',
    referenceSolution: 'const App = () => { const [count, setCount] = useState(0); }'
  };

  it('should create a task and return a valid slug', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null })
    };

    // 3. Fix: Ensure the mock return matches the expected Promise structure
    mockedAuth.mockResolvedValue({
      user: { id: 'user_123' } as User,
      supabase: mockSupabase as unknown as SupabaseClient
    });

    const result = await createTaskActionImpl(mockTask, 'fake-token');
    
    expect(result.slug).toBe('new-react-task-title');
    expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['react', 'hooks'],
    }));
  });

  it('should increment slug index if a collision occurs in the database', async () => {
    const mockInsert = vi.fn()
      .mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key' } })
      .mockResolvedValueOnce({ error: null });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: mockInsert
    };

    mockedAuth.mockResolvedValue({
      user: { id: 'user_123' } as User,
      supabase: mockSupabase as unknown as SupabaseClient
    });

    const result = await createTaskActionImpl(mockTask, 'fake-token');
    
    expect(result.slug).toBe('new-react-task-title-2'); 
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('should remove c# language tags from manually created tasks', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null })
    };

    mockedAuth.mockResolvedValue({
      user: { id: 'user_123' } as User,
      supabase: mockSupabase as unknown as SupabaseClient
    });

    await createTaskActionImpl({
      ...mockTask,
      languageName: 'C#',
      tags: ['c#', 'string manipulation', 'algorithms', 'basic'],
    }, 'fake-token');

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['string manipulation', 'algorithms', 'basic'],
    }));
  });

  it('should remove equivalent language aliases from manually created tasks', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null })
    };

    mockedAuth.mockResolvedValue({
      user: { id: 'user_123' } as User,
      supabase: mockSupabase as unknown as SupabaseClient
    });

    await createTaskActionImpl({
      ...mockTask,
      languageName: 'CSharp',
      tags: ['c#', 'arrays', 'basic'],
    }, 'fake-token');

    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['arrays', 'basic'],
    }));
  });
});

vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: {
    object: vi.fn(),
  },
}));

const mockedGenerateText = vi.mocked(generateText);

describe('generateTaskActionImpl', () => {
  const mockConfig = {
    aiMentorRole: 'Senior Mentor',
    aiContentLanguage: 'English',
    languageName: 'TypeScript',
  };

  it('should generate a task using AI and validate the output', async () => {
    const mockAIResponse: TaskInput = {
      languageName: 'TypeScript',
      title: 'Valid AI Task',
      description: 'This is a long enough description to pass Zod validation.',
      hint: 'A useful hint for the user.',
      starterCode: 'const x: number = 10; // enough chars',
      referenceSolution: 'const x: number = 20; // enough chars',
      difficulty: 'medium',
      tags: ['typescript', 'logic']
    };

    // Mock AI SDK response
    mockedGenerateText.mockResolvedValueOnce({
      output: mockAIResponse,
    } as unknown as GenerateTextResult);

    const result = await generateTaskActionImpl(
      'React Hooks',
      'valid-captcha-token',
      mockConfig
    );

    expect(result.title).toBe('Valid AI Task');
    expect(result.difficulty).toBe('medium');
    expect(result.tags).toEqual(['logic']);
    expect(mockedGenerateText).toHaveBeenCalled();
  });

  it('should throw an error if the AI output fails Zod validation', async () => {
    // Mock AI returning invalid data (description too short)
    mockedGenerateText.mockResolvedValueOnce({
      output: {
        title: 'Short description task',
        description: 'Too short', 
      },
    } as unknown as GenerateTextResult);

    await expect(
      generateTaskActionImpl('Topic', 'token', mockConfig)
    ).rejects.toThrow(); // Zod will catch the short description
  });

  it('should remove c# tags from generated tasks even if the AI returns them', async () => {
    mockedGenerateText.mockResolvedValueOnce({
      output: {
        languageName: 'C#',
        title: 'C# task',
        description: 'This is a long enough description to pass Zod validation.',
        hint: 'A useful hint for the user.',
        starterCode: 'const x: number = 10; // enough chars',
        referenceSolution: 'const x: number = 20; // enough chars',
        difficulty: 'medium',
        tags: ['c#', 'string manipulation', 'algorithms', 'basic']
      },
    } as unknown as GenerateTextResult);

    const result = await generateTaskActionImpl('Topic', 'token', {
      ...mockConfig,
      languageName: 'C#',
    });

    expect(result.tags).toEqual(['string manipulation', 'algorithms', 'basic']);
  });

  it('should remove equivalent generated language aliases', async () => {
    mockedGenerateText.mockResolvedValueOnce({
      output: {
        languageName: 'CSharp',
        title: 'CSharp task',
        description: 'This is a long enough description to pass Zod validation.',
        hint: 'A useful hint for the user.',
        starterCode: 'const x: number = 10; // enough chars',
        referenceSolution: 'const x: number = 20; // enough chars',
        difficulty: 'medium',
        tags: ['c#', 'arrays', 'basic']
      },
    } as unknown as GenerateTextResult);

    const result = await generateTaskActionImpl('Topic', 'token', {
      ...mockConfig,
      languageName: 'CSharp',
    });

    expect(result.tags).toEqual(['arrays', 'basic']);
  });
});
