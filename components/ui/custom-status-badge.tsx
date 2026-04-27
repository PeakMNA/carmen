import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export enum BadgeStatus {
  Open = "Open",
  Closed = "Closed",
  Draft = "Draft",
  Sent = "Sent",
  Committed = "Committed",
  Saved = "Saved",
  Voided = "Voided",
  Approved = "Approved",
  Rejected = "Rejected",
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
  OnHold = "OnHold",
  Delayed = "Delayed",
  Partial = "Partial",
  Submitted = "Submitted",
  Accepted = "Accepted",
  SendBack = "SendBack",
  Review = "Review",
  Deleted = "Deleted",
  Received = "Received",
  Active = "Active",
  Inactive = "Inactive",
  BelowMin = "below-min",
  Reorder = "reorder",
  OverMax = "over-max",
  Normal = "normal",
  Posted = "Posted",
  IN = "IN",
  OUT = "OUT",
  // Store Requisition specific statuses
  InProcess = "In Process",
  Complete = "Complete",
  Reject = "Reject",
  Void = "Void",
  Accept = "Accept",
  // Approval workflow stages
  PendingApproval = "Pending Approval",
  ManagerApproval = "Manager Approval",
  HODApproval = "HOD Approval",
  ApprovalRejected = "Approval Rejected",
  ApprovalApproved = "Approval Approved"
}

const statusStyles: Record<string, { bg: string, text: string }> = {
  // Success states
  Approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  Completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  Active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  Accepted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  Posted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  
  // Primary states (using corporate blue)
  InProgress: { bg: 'bg-primary/20 dark:bg-primary/30', text: 'text-primary dark:text-primary-foreground' },
  Submitted: { bg: 'bg-primary/20 dark:bg-primary/30', text: 'text-primary dark:text-primary-foreground' },
  Sent: { bg: 'bg-primary/20 dark:bg-primary/30', text: 'text-primary dark:text-primary-foreground' },
  
  // Draft/Pending states (amber/yellow)
  Open: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300' },
  
  // Warning states  
  Pending: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
  OnHold: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  Review: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  Draft: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  
  // Danger states
  Rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  Cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  Deleted: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  Voided: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  
  // Success states - Closed PO means successful completion
  Closed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  
  // Neutral states
  Inactive: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' },
  
  // Direction states
  IN: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  OUT: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },

  // Special states
  Partial: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
  BelowMin: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  OverMax: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
  Normal: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  
  // Store Requisition states (following PR semantic color patterns)
  'In Process': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300' }, // Active workflow/approval state
  'Complete': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' }, // Success state
  'Reject': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' }, // Error state
  'Void': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' }, // Neutral state
  'Accept': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' }, // Success state
  
  // Approval workflow stages
  'Pending Approval': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' }, // Awaiting approval
  'Manager Approval': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' }, // Manager level
  'HOD Approval': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' }, // Head of Department
  'Approval Rejected': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' }, // Rejected in approval
  'Approval Approved': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' } // Final approval
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles['Normal'];
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        "px-2 py-1 font-medium rounded-full",
        style.bg,
        style.text,
        className
      )}
    >
      {status}
    </Badge>
  );
}
