import { FiX, FiAlertTriangle } from "react-icons/fi";

interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmationModal({
  onConfirm,
  onCancel,
  title = "Delete Bookmark",
  message = "Are you sure you want to delete this bookmark? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>

        <div className="flex items-center mb-4 text-red-500">
          <FiAlertTriangle size={24} className="mr-2" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        <p className="mb-6 text-gray-700">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
