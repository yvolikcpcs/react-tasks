'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { LearningConfig } from '@/lib/learning-config';
import { TaskFormModal } from './form/task-form-modal';
import { useTaskFormController } from './form/use-task-form-controller';

type TaskFormProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
  isGuest: boolean;
};

export default function TaskForm({ config, isGuest }: TaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    captchaToken,
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
    register,
    saveSubmitButtonRef,
    title,
    topic,
    topicError,
    turnstileRef,
  } = useTaskFormController({
    closeModal: () => setOpen(false),
  });

  const handleOpenModal = () => {
    if (isGuest) {
      router.push('/auth');
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>

      {open && (
        <TaskFormModal
          captchaToken={captchaToken}
          config={config}
          createFormAction={createFormAction}
          errors={errors}
          formErrorMessage={formErrorMessage}
          formRef={formRef}
          generateFormAction={generateFormAction}
          generateSubmitButtonRef={generateSubmitButtonRef}
          handleCaptchaExpire={handleCaptchaExpire}
          handleCaptchaSuccess={handleCaptchaSuccess}
          handleClose={handleClose}
          handleFormSubmit={handleFormSubmit}
          handleTopicChange={handleTopicChange}
          hasCaptcha={hasCaptcha}
          isCreating={isCreating}
          isGenerating={isGenerating}
          languageLabel={languageLabel}
          languageRuntimeExt={languageRuntimeExt}
          open={open}
          register={register}
          saveSubmitButtonRef={saveSubmitButtonRef}
          title={title}
          topic={topic}
          topicError={topicError}
          turnstileRef={turnstileRef}
        />
      )}
    </>
  );
}
