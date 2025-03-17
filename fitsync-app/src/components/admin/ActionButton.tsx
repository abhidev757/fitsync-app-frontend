import { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'view' | 'Block' | 'Unblock';
}

const ActionButton = ({ variant, children, ...props }: ActionButtonProps) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'view':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Block':
        return 'bg-green-500 hover:bg-green-600';
      case 'Unblock':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <button
      className={`px-4 py-1 text-white text-sm font-medium rounded ${getButtonStyles()}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton;