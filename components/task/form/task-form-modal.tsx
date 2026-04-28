'use client';

import type { RefObject, FormEvent } from 'react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TaskFormValues } from '@/app/actions-lib/schemas';
import type { LearningConfig } from '@/lib/learning-config';
import Modal from '@/components/ui/modal';
import { TaskFormFields } from './task-form-fields';
import { TaskFormFooter } from './task-form-footer';

type TaskFormModalProps = {
  captchaToken: string | null;
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
  createFormAction: (payload: FormData) => void;
  errors: FieldErrors<TaskFormValues>;
  formErrorMessage: string | null;
  formRef: RefObject<HTMLFormElement | null>;
  generateFormAction: (payload: FormData) => void;
  generateSubmitButtonRef: RefObject<HTMLButtonElement | null>;
  handleCaptchaExpire: () => void;
  handleCaptchaSuccess: (token: string) => void;
  handleClose: () => void;
  handleFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleTopicChange: (value: string) => void;
  hasCaptcha: boolean;
  isCreating: boolean;
  isGenerating: boolean;
  languageLabel: string;
  languageRuntimeExt: string;
  open: boolean;
  register: UseFormRegister<TaskFormValues>;
  saveSubmitButtonRef: RefObject<HTMLButtonElement | null>;
  title: string;
  topic: string;
  topicError: string | null;
  turnstileRef: RefObject<TurnstileInstance | null>;
};

export function TaskFormModal({
  captchaToken,
  config,
  createFormAction,
  errors,
  formErrorMessage,
  formRef,
  generateFormAction,
  generateSubmitButtonRef,
  handleCaptchaExpire,
  handleCaptchaSuccess,
  handleClose,
  handleFormSubmit,
  handleTopicChange,
  hasCaptcha,
  isCreating,
  isGenerating,
  languageLabel,
  languageRuntimeExt,
  open,
  register,
  saveSubmitButtonRef,
  title,
  topic,
  topicError,
  turnstileRef,
}: TaskFormModalProps) {
  return (
    <form
      ref={formRef}
      action={createFormAction}
      onSubmit={handleFormSubmit}
    >
      <input type="hidden" name="captchaToken" value={captchaToken ?? ''} />
      <input type="hidden" name="aiMentorRole" value={config.aiMentorRole} />
      <input type="hidden" name="aiContentLanguage" value={config.aiContentLanguage} />
      <Modal
        open={open}
        title={title}
        onClose={handleClose}
        footer={
          <TaskFormFooter
            hasCaptcha={hasCaptcha}
            isCreating={isCreating}
            isGenerating={isGenerating}
            onClose={handleClose}
            saveSubmitButtonRef={saveSubmitButtonRef}
          />
        }
      >
        <TaskFormFields
          errors={errors}
          formErrorMessage={formErrorMessage}
          generateButtonRef={generateSubmitButtonRef}
          generateFormAction={generateFormAction}
          isGenerating={isGenerating}
          languageLabel={languageLabel}
          languageRuntimeExt={languageRuntimeExt}
          onCaptchaExpire={handleCaptchaExpire}
          onCaptchaSuccess={handleCaptchaSuccess}
          onTopicChange={handleTopicChange}
          register={register}
          topic={topic}
          topicError={topicError}
          turnstileRef={turnstileRef}
        />
      </Modal>
    </form>
  );
}
