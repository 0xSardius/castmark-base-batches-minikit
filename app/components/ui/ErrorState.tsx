// components/ui/ErrorState.tsx
import { FiAlertTriangle } from "react-icons/fi";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FiAlertTriangle size={32} className="text-red-500 mb-2" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
