
import * as React from "react";
import { toast as sonnerToast, ToastT, Toast } from "sonner";

export type ToastProps = React.ComponentProps<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export const useToast = () => {
  const toast = (props: ToastT) => {
    sonnerToast(props.title, {
      description: props.description,
      duration: props.duration,
      action: props.action,
      icon: props.icon,
      id: props.id,
      className: props.variant ? `toast-${props.variant}` : '',
    });
  };
  
  return { toast };
};

export const toast = (props: ToastT) => {
  sonnerToast(props.title, {
    description: props.description,
    duration: props.duration,
    action: props.action,
    icon: props.icon,
    id: props.id,
    className: props.variant ? `toast-${props.variant}` : '',
  });
};

interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText?: string;
}

export const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, altText, ...props }, ref) => (
    <button
      ref={ref}
      className={className}
      {...props}
    />
  )
);

ToastAction.displayName = "ToastAction";
