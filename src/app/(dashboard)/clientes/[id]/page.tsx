import React from 'react';
import { ClientDetailsView } from '@/components/client-details/client-details-view';
import { getClientProfile } from '@/lib/data/mock-clients';

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;
  const { client, attendances, caseUpdates } = getClientProfile(id);

  return (
    <div className="py-2">
      <ClientDetailsView
        initialClient={client}
        initialAttendances={attendances}
        initialCaseUpdates={caseUpdates}
      />
    </div>
  );
}
