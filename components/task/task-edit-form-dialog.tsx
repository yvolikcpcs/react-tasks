'use client';

import type { LearningConfig } from '@/lib/learning-config';
import { TaskFormModal } from './form/task-form-modal';
import { useTaskFormController } from './form/use-task-form-controller';

type TaskEditFormDialogProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
  open: boolean;
  closeModal: () => void;
};

export default function TaskEditFormDialog({
  config,
  open,
  closeModal,
}: TaskEditFormDialogProps) {
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
    handleGenerateClick,
    handleSaveClick,
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
    closeModal,
  });

  return (
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
      handleGenerateClick={handleGenerateClick}
      handleSaveClick={handleSaveClick}
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
  );
}
