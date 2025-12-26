import React from 'react';

const ConfirmModal = ({ isVisible, title, message, onConfirm, onCancel, confirmText = '确定', cancelText = '取消' }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button 
            className="modal-cancel-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="modal-confirm-button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;