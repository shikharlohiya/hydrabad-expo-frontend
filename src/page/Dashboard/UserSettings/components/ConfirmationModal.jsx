import React from 'react';
import Modal from './Modal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="text-center">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onConfirm} disabled={isLoading} className="flex-1 bg-red-600 text-white font-medium py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50">{isLoading ? "Deleting..." : "Delete"}</button>
        <button onClick={onClose} disabled={isLoading} className="flex-1 bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
      </div>
    </div>
  </Modal>
);

export default ConfirmationModal;