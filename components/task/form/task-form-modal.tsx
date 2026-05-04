'use client';

import type { LearningConfig } from '@/lib/learning-config';
import Modal from '@/components/ui/modal';
import { TaskFormFields } from './task-form-fields';
import { TaskFormFooter } from './task-form-footer';
import { useTaskFormController } from './use-task-form-controller';

type TaskFormModalProps = {
  config: Pick<LearningConfig, 'aiMentorRole' | 'aiContentLanguage'>;
  closeModal: () => void;
  isAuthenticated: boolean | null;
  open: boolean;
};

export function TaskFormModal({
  config,
  closeModal,
  isAuthenticated,
  open,
}: TaskFormModalProps) {
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
    <form
      ref={formRef}
      action={createFormAction}
      onSubmit={handleFormSubmit}
    >
      <input type="hidden" name="captchaToken" value={captchaToken ?? ''} />
      <input type="hidden" name="aiMentorRole" value={config.aiMentorRole} />
      <input type="hidden" name="aiContentLanguage" value={config.aiContentLanguage} />
      <button ref={saveSubmitButtonRef} type="submit" data-intent="save" hidden />
      <button
        ref={generateSubmitButtonRef}
        type="submit"
        data-intent="generate"
        formAction={generateFormAction}
        hidden
      />
      <Modal
        open={open}
        title={title}
        onClose={handleClose}
        footer={
          <TaskFormFooter
            hasCaptcha={hasCaptcha}
            isAuthenticated={isAuthenticated}
            isCreating={isCreating}
            isGenerating={isGenerating}
            onClose={handleClose}
            onSaveClick={handleSaveClick}
          />
        }
      >
        <TaskFormFields
          errors={errors}
          formErrorMessage={formErrorMessage}
          isAuthenticated={isAuthenticated}
          isGenerating={isGenerating}
          languageLabel={languageLabel}
          languageRuntimeExt={languageRuntimeExt}
          onCaptchaExpire={handleCaptchaExpire}
          onCaptchaSuccess={handleCaptchaSuccess}
          onGenerateClick={handleGenerateClick}
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
