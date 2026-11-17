'use client';

import React, { useState } from 'react';
import { X, Printer, FileSignature, CheckCircle, Scale } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { Client } from '@/types/client';

interface LegalContractModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  lawyerName?: string;
  lawyerOab?: string;
  officeName?: string;
}

export function LegalContractModal({
  client,
  isOpen,
  onClose,
  lawyerName = 'Dr. Alexandre Pontes',
  lawyerOab = 'OAB/PB 18.234',
  officeName = 'Alexandre Pontes Advocacia & Consultoria Previdenciária',
}: LegalContractModalProps) {
  const { t } = useI18n();
  const [selectedDoc, setSelectedDoc] = useState<'both' | 'procuracao' | 'contrato' | 'capa'>('both');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fullAddress = [
    client.street,
    client.streetNumber ? `nº ${client.streetNumber}` : 'S/N',
    client.complement,
    client.neighborhood,
    client.city ? `${client.city} - ${client.state || 'PB'}` : '',
    client.postalCode ? `CEP: ${client.postalCode}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Screen only */}
        <div className="print:hidden bg-[#0B192E] text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#C89543] font-semibold text-xs tracking-wider uppercase mb-1">
            <FileSignature className="w-4 h-4" />
            <span>{t.clientDetails.contractModalTitle}</span>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            {t.clientDetails.contractModalSubtitle}
          </p>

          {/* Doc Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDoc('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedDoc === 'both'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {t.clientDetails.docTypeBoth}
            </button>
            <button
              onClick={() => setSelectedDoc('procuracao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedDoc === 'procuracao'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {t.clientDetails.docTypePowerOfAttorney}
            </button>
            <button
              onClick={() => setSelectedDoc('contrato')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedDoc === 'contrato'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {t.clientDetails.docTypeFeeContract}
            </button>
            <button
              onClick={() => setSelectedDoc('capa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedDoc === 'capa'
                  ? 'bg-[#C89543] text-white shadow-xs'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {t.clientDetails.docTypeFolderCover}
            </button>
          </div>
        </div>

        {/* Printable Document Preview Container */}
        <div className="overflow-y-auto p-8 sm:p-12 space-y-12 flex-1 bg-slate-50 text-slate-900 font-serif leading-relaxed text-sm print:p-0 print:bg-white print:overflow-visible">
          {/* Document 1: Procuração Ad Judicia */}
          {(selectedDoc === 'both' || selectedDoc === 'procuracao') && (
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 break-after-page">
              <div className="text-center pb-6 border-b border-slate-200">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                  PROCURAÇÃO &quot;AD JUDICIA ET EXTRA&quot;
                </h2>
                <span className="text-xs text-slate-500 font-sans mt-1 block">
                  Poderes Gerais e Especiais para a Área Previdenciária e Administrativa
                </span>
              </div>

              {/* Outorgante */}
              <div className="mt-6 text-justify space-y-4">
                <p>
                  <strong>OUTORGANTE:</strong>{' '}
                  <span className="uppercase font-bold">{client.fullName}</span>, nacionalidade{' '}
                  {client.nationality || 'brasileira'}, estado civil{' '}
                  {client.maritalStatus || 'não informado'}, profissão{' '}
                  {client.profession || 'do lar/agricultor(a)'}, portador(a) do RG nº{' '}
                  {client.rg || '____________'}, inscrito(a) no CPF/MF sob o nº{' '}
                  <strong>{client.cpf || '_______________'}</strong>, residente e domiciliado(a)
                  em: {fullAddress || 'Endereço residencial completo do segurado'}.
                </p>

                <p>
                  <strong>OUTORGADOS:</strong>{' '}
                  <span className="font-bold">{lawyerName}</span>, advogado inscrito na Ordem dos
                  Advogados do Brasil sob o nº <strong>{lawyerOab}</strong>, integrante da banca{' '}
                  <strong>{officeName}</strong>, com endereço profissional para intimações e
                  notificações na sede do escritório.
                </p>

                <p>
                  <strong>PODERES:</strong> Por este instrumento particular de mandato, o(a)
                  Outorgante confere aos Outorgados amplos poderes da cláusula{' '}
                  <em>&quot;ad judicia et extra&quot;</em>, para o foro em geral, em qualquer Juízo,
                  Instância ou Tribunal, bem como perante quaisquer repartições públicas federais,
                  estaduais e municipais, e especialmente perante o{' '}
                  <strong>Instituto Nacional do Seguro Social - INSS</strong>, Agências da
                  Previdência Social (APS) e Conselho de Recursos da Previdência Social (CRPS),
                  podendo requerer, protocolar, acompanhar benefícios de{' '}
                  <strong>{client.benefitType || 'qualquer espécie previdenciária'}</strong>,
                  interpor recursos, requerer cópias de processos administrativos, ter acesso e
                  gerenciar requerimentos via sistema Meu INSS, prestar declarações, firmar termos,
                  e com poderes especiais para transigir, acordar, firmar compromisso, desistir, dar
                  e receber quitação, receber valores e levantar alvarás/RPVs oriundos de
                  procedimentos administrativos ou judiciais decorrentes do objeto deste mandato.
                </p>

                <div className="pt-12 text-center space-y-2">
                  <p className="font-sans text-xs text-slate-600">
                    {client.city || 'Areia - PB'}, {todayFormatted}.
                  </p>
                  <div className="pt-10 w-72 mx-auto border-t border-slate-900 text-center">
                    <span className="block font-bold text-xs uppercase font-sans">
                      {client.fullName}
                    </span>
                    <span className="block text-[11px] text-slate-500 font-sans">
                      CPF: {client.cpf || '_______________'} (Outorgante)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document 2: Contrato de Honorários Advocatícios */}
          {(selectedDoc === 'both' || selectedDoc === 'contrato') && (
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0">
              <div className="text-center pb-6 border-b border-slate-200">
                <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                  CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS
                </h2>
                <span className="text-xs text-slate-500 font-sans mt-1 block">
                  Regulamento nos Termos da Lei 8.906/94 (Estatuto da OAB) e Código de Ética
                </span>
              </div>

              <div className="mt-6 text-justify space-y-4">
                <p>
                  <strong>CONTRATANTE:</strong>{' '}
                  <span className="uppercase font-bold">{client.fullName}</span>, CPF nº{' '}
                  <strong>{client.cpf || '_______________'}</strong>, RG nº{' '}
                  {client.rg || '____________'}, domiciliado(a) em {fullAddress}.
                </p>

                <p>
                  <strong>CONTRATADO:</strong>{' '}
                  <span className="font-bold">{officeName}</span>, representada por{' '}
                  <strong>{lawyerName}</strong>, {lawyerOab}.
                </p>

                <p>
                  <strong>CLÁUSULA 1ª - DO OBJETO:</strong> O presente instrumento tem como objeto
                  a prestação de serviços jurídicos advocatícios para postulação administrativa
                  e/ou judicial visando a concessão/revisão de benefício previdenciário junto ao
                  INSS ({client.benefitType || 'Benefício Previdenciário/Assistencial'}).
                </p>

                <p>
                  <strong>CLÁUSULA 2ª - DOS HONORÁRIOS (QUOTA LITIS / ÊXITO):</strong> Em
                  remuneração pelos serviços ora pactuados, o(a) CONTRATANTE pagará ao CONTRATADO o
                  percentual de <strong>30% (trinta por cento)</strong> incidente exclusivamente
                  sobre o proveito econômico obtido (valores brutos atrasados e retroativos
                  apurados desde a Data de Entrada do Requerimento - DER até a efetiva implantação),
                  condicionado ao êxito da demanda, não havendo ônus em caso de insucesso.
                </p>

                <p>
                  <strong>CLÁUSULA 3ª - DA VINCULAÇÃO E SIGILO:</strong> O CONTRATADO assume o
                  dever de guardar sigilo profissional inviolável sobre todos os fatos, documentos e
                  senhas do Meu INSS confiados pelo(a) CONTRATANTE, em estrita conformidade com a
                  LGPD (Lei 13.709/18) e o Estatuto da OAB.
                </p>

                <div className="pt-12 text-center space-y-2">
                  <p className="font-sans text-xs text-slate-600">
                    {client.city || 'Areia - PB'}, {todayFormatted}.
                  </p>
                  <div className="pt-10 grid grid-cols-2 gap-8 text-center font-sans">
                    <div className="border-t border-slate-900 pt-2">
                      <span className="block font-bold text-xs uppercase">
                        {client.fullName}
                      </span>
                      <span className="block text-[11px] text-slate-500">CONTRATANTE</span>
                    </div>

                    <div className="border-t border-slate-900 pt-2">
                      <span className="block font-bold text-xs uppercase">{lawyerName}</span>
                      <span className="block text-[11px] text-slate-500">
                        {lawyerOab} - CONTRATADO
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document 3: Capa de Pasta / Ficha Resumo de Atendimento Previdenciário */}
          {selectedDoc === 'capa' && (
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 font-sans">
              {/* Header with Office & OAB */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                    {officeName}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {lawyerName} • {lawyerOab} • Especialista em Direito Previdenciário
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ficha de Controle Interno e Capa de Pasta de Processo Físico
                  </p>
                </div>

                <div className="text-right border-2 border-dashed border-slate-400 p-3 rounded-lg bg-slate-50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.clientDetails.coverPhysicalLocation}
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {client.physicalFileLocation || 'Pasta Geral / Arquivo Principal'}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    ID: {client.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* 1. Identificação do Segurado */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 text-slate-800 border-l-4 border-[#C89543]">
                  1. {t.clientDetails.coverClientData}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 text-xs border border-slate-200 rounded-b-lg">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nome do Cliente</span>
                    <span className="font-bold text-slate-900">{client.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">CPF</span>
                    <span className="font-mono font-bold text-slate-900">{client.cpf || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">RG</span>
                    <span className="font-mono text-slate-900">{client.rg || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Data de Nascimento</span>
                    <span className="text-slate-900">
                      {client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR') : 'Não informada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Estado Civil</span>
                    <span className="text-slate-900">{client.maritalStatus || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Profissão Declarada</span>
                    <span className="text-slate-900">{client.profession || 'Trabalhador(a) Rural'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nome da Mãe</span>
                    <span className="text-slate-900">{client.motherName || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Contato WhatsApp</span>
                    <span className="font-bold text-slate-900">{client.mobilePhone || client.phone || 'Não informado'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Endereço Residencial</span>
                    <span className="text-slate-900">{fullAddress || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Dados do Benefício */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 text-slate-800 border-l-4 border-[#C89543]">
                  2. {t.clientDetails.coverBenefitData}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 text-xs border border-slate-200 rounded-b-lg">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Espécie do Benefício</span>
                    <span className="font-bold text-slate-900">{client.benefitType || 'Aposentadoria por Idade Rural'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Número do Benefício (NB)</span>
                    <span className="font-mono text-slate-900">{client.benefitNumber || 'Em postulação inicial'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total de Visitas Presenciais</span>
                    <span className="font-bold text-slate-900">{client.visitCount} visita(s)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Status do Caso</span>
                    <span className="font-bold text-slate-900">{client.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Atendimento Inicial</span>
                    <span className="text-slate-900">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : todayFormatted}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Último Atendente</span>
                    <span className="text-slate-900">{client.lastAttendantName || lawyerName}</span>
                  </div>
                </div>
              </div>

              {/* 3. Documentação Física e Pendências */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 text-slate-800 border-l-4 border-emerald-500">
                    3. {t.clientDetails.coverDeliveredDocs}
                  </h3>
                  <div className="p-3 text-xs border border-slate-200 rounded-b-lg space-y-1.5 min-h-[90px]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="w-3.5 h-3.5 rounded-sm border border-slate-400 flex items-center justify-center font-bold text-[9px] text-emerald-600">✓</span>
                      <span>Documento Oficial de Identidade (RG/CPF)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="w-3.5 h-3.5 rounded-sm border border-slate-400 flex items-center justify-center font-bold text-[9px] text-emerald-600">✓</span>
                      <span>Comprovante de Residência Atualizado</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="w-3.5 h-3.5 rounded-sm border border-slate-400 flex items-center justify-center font-bold text-[9px] text-emerald-600">✓</span>
                      <span>Procuração e Contrato OAB Assinados</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 text-slate-800 border-l-4 border-amber-500">
                    4. {t.clientDetails.coverPendingDocs}
                  </h3>
                  <div className="p-3 text-xs border border-slate-200 rounded-b-lg space-y-1.5 min-h-[90px]">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="w-3.5 h-3.5 rounded-sm border border-slate-300"></span>
                      <span>Autodeclaração Rural assinada</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="w-3.5 h-3.5 rounded-sm border border-slate-300"></span>
                      <span>Certidão do Sindicato / Notas de Produtor</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="w-3.5 h-3.5 rounded-sm border border-slate-300"></span>
                      <span>Extrato CNIS completo atualizado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Anotações do Advogado (Pautas Manuais) */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 text-slate-800 border-l-4 border-slate-700">
                  5. {t.clientDetails.coverObservations}
                </h3>
                <div className="p-4 border border-slate-200 rounded-b-lg space-y-4">
                  {client.notes && (
                    <p className="text-xs text-slate-700 italic bg-amber-50/50 p-2.5 rounded border border-amber-200/50">
                      &quot;{client.notes}&quot;
                    </p>
                  )}
                  {/* Ruled lines for physical writing */}
                  <div className="space-y-3 pt-2">
                    <div className="border-b border-dashed border-slate-300 h-4"></div>
                    <div className="border-b border-dashed border-slate-300 h-4"></div>
                    <div className="border-b border-dashed border-slate-300 h-4"></div>
                    <div className="border-b border-dashed border-slate-300 h-4"></div>
                  </div>
                </div>
              </div>

              {/* Signature Footer */}
              <div className="mt-8 pt-6 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span>Data da Abertura da Pasta: {todayFormatted}</span>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-slate-900 pb-1"></div>
                  <span className="block mt-1 font-bold text-[11px] text-slate-900 uppercase">
                    {lawyerName} ({lawyerOab})
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {t.clientDetails.coverLawyerSignature}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Screen only */}
        <div className="print:hidden p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Documento formatado para papel A4 com CSS Print vetorial nativo.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t.clientDetails.btnClose}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0B192E] hover:bg-[#142642] rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-[#C89543]" />
              <span>{t.clientDetails.btnPrint}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
