import React from 'react';
import styles from '../adminComponents/styles/styles.module.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.deleteDialogOverlay}>
      <div className={styles.deleteDialogContent}>
        <h3 className={styles.dialogTitle}>{title}</h3>
        <p className={styles.dialogMessage}>{message}</p>
        <div className={styles.dialogActions}>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationDialog;
