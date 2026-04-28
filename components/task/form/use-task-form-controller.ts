'use client';

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { createTaskAction, generateTaskAction } from '@/app/actions';
import { TASK_SCHEMA, type TaskFormValues } from '@/app/actions-lib/schemas';
import { inferLanguageRuntime, inferLanguageSuggestion } from '@/lib/language-utils';
import { DEFAULT_TASK_FORM_VALUES } from './task-form-defaults';

type SubmitIntent = 'save' | 'generate';

type UseTaskFormControllerOptions = {
  closeModal: () => void;
};

export function useTaskFormController({
  closeModal,
}: UseTaskFormControllerOptions) {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [lastSubmittedAction, setLastSubmittedAction] = useState<SubmitIntent | null>(null);

  const [createState, createFormAction, isCreating] = useActionState(createTaskAction, {
    success: false,
    error: null,
  });
  const [generateState, generateFormAction, isGenerating] = useActionState(generateTaskAction, {
    success: false,
    error: null,
  });

  const {
    register,
    reset,
    control,
    setValue,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(TASK_SCHEMA),
    defaultValues: DEFAULT_TASK_FORM_VALUES,
  });

  const turnstileRef = useRef<TurnstileInstance>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saveSubmitButtonRef = useRef<HTMLButtonElement>(null);
  const generateSubmitButtonRef = useRef<HTMLButtonElement>(null);
  const allowNativeSubmitIntentRef = useRef<SubmitIntent | null>(null);
  const lastAutoSuggestedLanguageRef = useRef<string | null>(null);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }, []);

  const resetLocalState = useCallback(() => {
    setLastSubmittedAction(null);
    setTopic('');
    setTopicError(null);
    setCaptchaToken(null);
    lastAutoSuggestedLanguageRef.current = null;
    clearErrors();
    reset(DEFAULT_TASK_FORM_VALUES);
    turnstileRef.current?.reset();
  }, [clearErrors, reset]);

  const handleCreateSuccess = useCallback((slug: string) => {
    closeModal();
    resetLocalState();
    router.push(`/tasks/${slug}`);
    router.refresh();
  }, [closeModal, resetLocalState, router]);

  const handleGenerateSuccess = useCallback((task: TaskFormValues) => {
    clearErrors();
    reset(task);
    setTopic('');
    setTopicError(null);
    setCaptchaToken(null);
    lastAutoSuggestedLanguageRef.current = null;
    turnstileRef.current?.reset();
  }, [clearErrors, reset]);

  useEffect(() => {
    if (createState.success && createState.slug) {
      const slug = createState.slug;
      const timeoutId = window.setTimeout(() => {
        handleCreateSuccess(slug);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    if (createState.error) {
      const timeoutId = window.setTimeout(() => {
        resetCaptcha();
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [createState, handleCreateSuccess, resetCaptcha]);

  useEffect(() => {
    if (generateState.success && generateState.task) {
      const task = generateState.task;
      const timeoutId = window.setTimeout(() => {
        handleGenerateSuccess(task);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    if (generateState.error) {
      const timeoutId = window.setTimeout(() => {
        resetCaptcha();
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [generateState, handleGenerateSuccess, resetCaptcha]);

  const submitWithIntent = useCallback(async (intent: SubmitIntent) => {
    setLastSubmittedAction(null);
    clearErrors('root');

    if (intent === 'generate' && !topic.trim()) {
      setTopicError('Please enter a topic first');
      return;
    }

    if (!captchaToken) {
      setError('root', { message: 'Please verify you are human' });
      return;
    }

    const isValid = intent === 'generate' ? await trigger('languageName') : await trigger();
    if (!isValid) {
      return;
    }

    if (intent === 'generate') {
      setTopicError(null);
    }

    setLastSubmittedAction(intent);
    allowNativeSubmitIntentRef.current = intent;

    const submitButtonRef =
      intent === 'generate' ? generateSubmitButtonRef.current : saveSubmitButtonRef.current;

    formRef.current?.requestSubmit(submitButtonRef ?? undefined);
  }, [captchaToken, clearErrors, setError, topic, trigger]);

  const handleClose = useCallback(() => {
    closeModal();
    resetLocalState();
  }, [closeModal, resetLocalState]);

  const handleFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.dataset.intent as SubmitIntent | undefined;

    if (intent && allowNativeSubmitIntentRef.current === intent) {
      allowNativeSubmitIntentRef.current = null;
      return;
    }

    event.preventDefault();
    void submitWithIntent(intent === 'generate' ? 'generate' : 'save');
  }, [submitWithIntent]);

  const handleTopicChange = useCallback((value: string) => {
    setTopic(value);
    setTopicError(null);
  }, []);

  const languageName = useWatch({ control, name: 'languageName' });
  const languageLabel = languageName || 'task';
  const languageRuntime = inferLanguageRuntime(languageName ?? '');
  const suggestedLanguage = inferLanguageSuggestion(topic);

  useEffect(() => {
    if (!suggestedLanguage) {
      return;
    }

    const currentLanguage = languageName?.trim() ?? '';
    const shouldApplySuggestion =
      currentLanguage.length === 0 || currentLanguage === lastAutoSuggestedLanguageRef.current;

    if (!shouldApplySuggestion) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setValue('languageName', suggestedLanguage, {
        shouldDirty: true,
        shouldValidate: true,
      });
      clearErrors('languageName');
      lastAutoSuggestedLanguageRef.current = suggestedLanguage;
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [clearErrors, languageName, setValue, suggestedLanguage]);

  const formErrorMessage =
    errors.root?.message ??
    (!isCreating && !isGenerating
      ? lastSubmittedAction === 'save'
        ? createState.error
        : lastSubmittedAction === 'generate'
          ? generateState.error
          : null
      : null) ??
    null;

  return {
    captchaToken,
    createFormAction,
    errors,
    formErrorMessage,
    formRef,
    generateFormAction,
    generateSubmitButtonRef,
    handleCaptchaExpire: resetCaptcha,
    handleCaptchaSuccess: setCaptchaToken,
    handleClose,
    handleFormSubmit,
    handleTopicChange,
    hasCaptcha: Boolean(captchaToken),
    isCreating,
    isGenerating,
    languageLabel,
    languageRuntimeExt: languageRuntime.ext,
    register,
    saveSubmitButtonRef,
    title: `Create ${languageLabel} task`,
    topic,
    topicError,
    turnstileRef,
  };
}
