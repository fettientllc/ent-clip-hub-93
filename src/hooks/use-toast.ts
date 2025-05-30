
// Re-export the toast functionality from the implementation file
import { useToast, toast } from "./use-toast-impl";
export { useToast, toast };
export type { ToastProps, ToastActionElement } from "@/components/ui/toast";
