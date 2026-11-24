import { ErrorView } from '@/components/ui/error-view';

export const metadata = {
  title: 'Página Não Encontrada | PreviOffice',
  description: 'O recurso ou página solicitada não foi encontrada no sistema.',
};

export default function NotFound() {
  return <ErrorView statusCode={404} />;
}
