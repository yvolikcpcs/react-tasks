import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTaskAction, generateTaskAction } from './actions';
import { createTaskActionImpl, generateTaskActionImpl } from './actions-lib/task-actions';

vi.mock('./actions-lib/task-actions', () => ({
  checkSolutionImpl: vi.fn(),
  createTaskActionImpl: vi.fn(),
  generateTaskActionImpl: vi.fn(),
}));

vi.mock('@/lib/supabase-tasks', () => ({
  getTasksPaginated: vi.fn(),
}));

const mockedCreateTaskActionImpl = vi.mocked(createTaskActionImpl);
const mockedGenerateTaskActionImpl = vi.mocked(generateTaskActionImpl);

describe('createTaskAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes normalized string fields to createTaskActionImpl', async () => {
    mockedCreateTaskActionImpl.mockResolvedValueOnce({
      success: true,
      slug: 'new-react-task',
    });

    const formData = new FormData();
    formData.set('captchaToken', 'captcha-token');
    formData.set('languageName', 'TypeScript');
    formData.set('title', 'New React Task');
    formData.set('description', 'This is a long enough task description.');
    formData.set('hint', 'This is a long enough hint.');
    formData.set('starterCode', 'const count = 0; // enough characters');
    formData.set('referenceSolution', 'const [count, setCount] = useState(0);');
    formData.set('difficulty', 'medium');
    formData.set('tags', 'react, typescript, hooks');

    const result = await createTaskAction({ success: false, error: null }, formData);

    expect(result).toEqual({
      success: true,
      slug: 'new-react-task',
    });
    expect(mockedCreateTaskActionImpl).toHaveBeenCalledWith(
      {
        languageName: 'TypeScript',
        title: 'New React Task',
        description: 'This is a long enough task description.',
        hint: 'This is a long enough hint.',
        starterCode: 'const count = 0; // enough characters',
        referenceSolution: 'const [count, setCount] = useState(0);',
        difficulty: 'medium',
        tags: 'react, typescript, hooks',
      },
      'captcha-token'
    );
  });

  it('returns an error state when captchaToken is missing', async () => {
    const formData = new FormData();
    formData.set('title', 'Missing captcha');

    const result = await createTaskAction({ success: false, error: null }, formData);

    expect(result).toEqual({
      success: false,
      error: 'Missing captcha token',
    });
    expect(mockedCreateTaskActionImpl).not.toHaveBeenCalled();
  });

  it('does not throw when tags is a File entry', async () => {
    mockedCreateTaskActionImpl.mockResolvedValueOnce({
      success: false,
      error: 'validation failed',
    });

    const formData = new FormData();
    formData.set('captchaToken', 'captcha-token');
    formData.set('languageName', 'TypeScript');
    formData.set('title', 'File tags task');
    formData.set('description', 'This is a long enough task description.');
    formData.set('hint', 'This is a long enough hint.');
    formData.set('starterCode', 'const count = 0; // enough characters');
    formData.set('referenceSolution', 'const [count, setCount] = useState(0);');
    formData.set('difficulty', 'medium');
    formData.set('tags', new File(['react'], 'tags.txt', { type: 'text/plain' }));

    const result = await createTaskAction({ success: false, error: null }, formData);

    expect(result).toEqual({
      success: false,
      error: 'validation failed',
    });
    expect(mockedCreateTaskActionImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: '',
      }),
      'captcha-token'
    );
  });
});

describe('generateTaskAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes normalized form fields to generateTaskActionImpl', async () => {
    mockedGenerateTaskActionImpl.mockResolvedValueOnce({
      languageName: 'TypeScript',
      title: 'Generated task',
      description: 'This is a long enough generated description.',
      hint: 'This is a long enough generated hint.',
      starterCode: 'const count = 0; // enough characters',
      referenceSolution: 'const [count, setCount] = useState(0);',
      difficulty: 'medium',
      tags: ['logic'],
    });

    const formData = new FormData();
    formData.set('captchaToken', 'captcha-token');
    formData.set('topic', 'React hooks');
    formData.set('languageName', 'TypeScript');
    formData.set('aiMentorRole', 'Senior Mentor');
    formData.set('aiContentLanguage', 'English');

    const result = await generateTaskAction({ success: false, error: null }, formData);

    expect(result).toEqual({
      success: true,
      task: {
        languageName: 'TypeScript',
        title: 'Generated task',
        description: 'This is a long enough generated description.',
        hint: 'This is a long enough generated hint.',
        starterCode: 'const count = 0; // enough characters',
        referenceSolution: 'const [count, setCount] = useState(0);',
        difficulty: 'medium',
        tags: ['logic'],
      },
    });
    expect(mockedGenerateTaskActionImpl).toHaveBeenCalledWith('React hooks', 'captcha-token', {
      aiMentorRole: 'Senior Mentor',
      languageName: 'TypeScript',
      aiContentLanguage: 'English',
      codeFileExtension: 'ts',
    });
  });

  it('returns an error state when topic is missing', async () => {
    const formData = new FormData();
    formData.set('captchaToken', 'captcha-token');
    formData.set('languageName', 'TypeScript');

    const result = await generateTaskAction({ success: false, error: null }, formData);

    expect(result).toEqual({
      success: false,
      error: 'Please enter a topic first',
    });
    expect(mockedGenerateTaskActionImpl).not.toHaveBeenCalled();
  });

  it('returns an error state when generation throws', async () => {
    mockedGenerateTaskActionImpl.mockRejectedValueOnce(new Error('rate limited'));

    const formData = new FormData();
    formData.set('captchaToken', 'captcha-token');
    formData.set('topic', 'React hooks');
    formData.set('languageName', 'TypeScript');

    const result = await generateTaskAction({ success: false, error: null }, formData);

    expect(result).toEqual({
      success: false,
      error: 'rate limited',
    });
  });
});
