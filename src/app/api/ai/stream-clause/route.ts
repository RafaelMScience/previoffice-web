import { NextResponse, type NextRequest } from 'next/server';
import { createAiTokenStream } from '@/lib/ai/ai-stream';
import { createClientServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const serverClient = await createClientServer();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para utilizar a assistência de IA.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { benefitSpecies = 'Aposentadoria', quotaLitisPercentage = 30, customPrompt } = body;

    const clauseText = customPrompt
      ? `CLÁUSULA ESPECIAL PERSONALIZADA: Em consonância com a espécie "${benefitSpecies}", ajustam-se as seguintes condições específicas: ${customPrompt}. Os honorários advocatícios ficam pactuados em ${quotaLitisPercentage}% sobre as parcelas vencidas até a data da efetiva implantação do benefício previdenciário, nos termos do art. 22 da Lei 8.906/94 e Código de Ética e Disciplina da OAB.`
      : `CLÁUSULA REMUNERATÓRIA ESPECIAL (${benefitSpecies.toUpperCase()}): O(A) CONTRATANTE pagará à CONTRATADA a título de honorários ad exitum o percentual de ${quotaLitisPercentage}% (trinta por cento) incidentes sobre o montante integral dos valores atrasados e retroativos auferidos judicial ou extrajudicialmente perante o Instituto Nacional do Seguro Social (INSS).`;

    const stream = createAiTokenStream(clauseText, 25);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Falha na transmissão da IA' },
      { status: 500 }
    );
  }
}
