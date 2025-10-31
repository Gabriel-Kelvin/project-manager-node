import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import useToastStore from '../../store/toastStore';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          progress: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          progress: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          progress: 'bg-blue-500'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          getToastIcon={getToastIcon}
          getToastStyles={getToastStyles}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove, getToastIcon, getToastStyles }) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  const styles = getToastStyles(toast.type);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Progress bar animation
    if (toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (toast.duration / 100));
          if (newProgress <= 0) {
            clearInterval(interval);
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
    >
      <div
        className={`
          relative p-4 rounded-lg border shadow-lg
          ${styles.bg} ${styles.border}
        `}
      >
        {/* Close button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Toast content */}
        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0">
            {getToastIcon(toast.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.text}`}>
              {toast.message}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {toast.duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30 rounded-b-lg overflow-hidden">
            <div
              className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ToastContainer;
