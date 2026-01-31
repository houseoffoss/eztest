/**
 * Example: Defect Assignment with Email Notification
 * 
 * This file demonstrates how to integrate email notifications
 * when assigning a defect to a user.
 */

'use client';

import { useState } from 'react';
import { SendEmailDialog } from '@/frontend/reusable-components';

interface AssignDefectWithEmailProps {
  defectId: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  onAssigned?: () => void;
}

export function AssignDefectWithEmail({
  defectId,
  assigneeId,
  assigneeName,
  assigneeEmail,
  onAssigned,
}: AssignDefectWithEmailProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // First, update the defect assignment
  const handleAssignDefect = async () => {
    try {
      const response = await fetch(`/api/defects/${defectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: assigneeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign defect');
      }

      // After successful assignment, show email dialog
      // Check if email service is available first
      const emailStatus = await fetch('/api/email/status');
      const { available } = await emailStatus.json();

      if (available) {
        setEmailDialogOpen(true);
      } else {
        console.log('Email service not configured');
        onAssigned?.();
      }
    } catch (error) {
      console.error('Failed to assign defect:', error);
    }
  };

  // Send the email notification
  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const response = await fetch(
        `/api/defects/${defectId}/send-assignment-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigneeId }),
        }
      );

      if (response.ok) {
        console.log('✅ Email notification sent successfully');
      } else {
        console.error('❌ Failed to send email notification');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSendingEmail(false);
      setEmailDialogOpen(false);
      onAssigned?.();
    }
  };

  // Skip sending email
  const handleSkipEmail = () => {
    setEmailDialogOpen(false);
    onAssigned?.();
  };

  return (
    <>
      <button onClick={handleAssignDefect}>Assign Defect</button>

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleSkipEmail();
        }}
        onConfirm={handleSendEmail}
        loading={sendingEmail}
        title="Send Assignment Notification"
        description="Would you like to notify the assignee via email?"
        recipientName={assigneeName}
        recipientEmail={assigneeEmail}
      />
    </>
  );
}

/**
 * Example: Bulk Defect Assignment with Email Notifications
 */
export function BulkAssignDefectsWithEmail({
  defectIds,
  assigneeId,
  assigneeName,
  assigneeEmail,
  onAssigned,
}: {
  defectIds: string[];
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  onAssigned?: () => void;
}) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleBulkAssign = async () => {
    try {
      const response = await fetch('/api/defects/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defectIds, assignedToId: assigneeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign defects');
      }

      // Check email availability
      const emailStatus = await fetch('/api/email/status');
      const { available } = await emailStatus.json();

      if (available) {
        setEmailDialogOpen(true);
      } else {
        onAssigned?.();
      }
    } catch (error) {
      console.error('Failed to assign defects:', error);
    }
  };

  const handleSendEmails = async () => {
    setSendingEmail(true);
    try {
      // Send email for each defect
      const emailPromises = defectIds.map((defectId) =>
        fetch(`/api/defects/${defectId}/send-assignment-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigneeId }),
        })
      );

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter((r) => r.status === 'fulfilled').length;

      console.log(`✅ Sent ${successful} of ${defectIds.length} email notifications`);
    } catch (error) {
      console.error('Error sending emails:', error);
    } finally {
      setSendingEmail(false);
      setEmailDialogOpen(false);
      onAssigned?.();
    }
  };

  return (
    <>
      <button onClick={handleBulkAssign}>Bulk Assign</button>

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEmailDialogOpen(false);
            onAssigned?.();
          }
        }}
        onConfirm={handleSendEmails}
        loading={sendingEmail}
        title="Send Assignment Notifications"
        description={`Send email notifications for ${defectIds.length} assigned defect(s)?`}
        recipientName={assigneeName}
        recipientEmail={assigneeEmail}
      />
    </>
  );
}
