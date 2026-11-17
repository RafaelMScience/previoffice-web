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
  const [selectedDoc, setSelectedDoc] = useState<'both' | 'procuracao' | 'contrato'>('both');

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
