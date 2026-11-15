import React from 'react';
import { ClientFullForm } from '@/components/client-form/client-full-form';
import type { ClientFullRegistrationInput } from '@/lib/schemas/client-schema';

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Sample mock data for client details when in development / offline mode
const MOCK_CLIENT: Partial<ClientFullRegistrationInput> = {
  fullName: 'Maria Francisca da Silva',
  cpf: '12345678909',
  rg: '2.456.789',
  birthDate: '1968-04-12',
  maritalStatus: 'MARRIED',
  profession: 'Agricultora',
  motherName: 'Francisca Maria de Jesus',
  fatherName: 'Manoel da Silva',
  postalCode: '58397-000',
  street: 'Sítio Riacho do Meio',
  streetNumber: 'S/N',
  neighborhood: 'Zona Rural',
  city: 'Areia',
  state: 'PB',
  mobilePhone: '(83) 98765-4321',
  phone: '(83) 99123-4567',
  email: 'maria.francisca@exemplo.com',
  benefitType: 'Rural Special Segurate Retirement',
  specialCategories: ['RURAL'],
  physicalFileLocation: 'Cabinet B - Drawer 03 - Folder 2026-042',
  notes: 'Client brought ITR 2023, waiting for declaration of rural syndicate and INCRA certificate.',
};

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { id } = await params;

  return (
    <div className="py-2">
      <ClientFullForm
        clientId={id}
        initialData={MOCK_CLIENT}
      />
    </div>
  );
}
