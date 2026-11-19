'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Scale,
  Sparkles,
  Bookmark,
  Calendar,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { VALIDATED_LAWS, CORE_STATUTE_TOPICS } from '@/lib/data/mock-vade-mecum';
import type { LawReference, LawArticle } from '@/types/vade-mecum';

interface StatuteCardProps {
  law: LawReference;
  btnLabel: string;
}

function StatuteCard({ law, btnLabel }: StatuteCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-[#C89543]/40 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#082A52]/10 text-[#082A52] border border-[#082A52]/20">
            {law.categoryLabel}
          </span>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {law.publicationDate}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#082A52] transition-colors">
          {law.officialNumber}
        </h3>
        <h4 className="text-xs font-medium text-slate-600 mt-0.5">
          {law.title}
        </h4>

        <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-3 leading-relaxed">
          {law.summary}
        </p>

        <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-medium">
          {law.compilationVersion}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]" title={law.urn}>
          {law.urn}
        </span>
        <a
          href={law.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#082A52] hover:bg-[#082A52]/5 transition-all"
        >
          <span>{btnLabel}</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#C89543]" />
        </a>
      </div>
    </div>
  );
}

interface ArticleCardProps {
  art: LawArticle;
  isCopied: boolean;
  onCopy: () => void;
  btnCopyLabel: string;
  copiedLabel: string;
  btnSourceLabel: string;
}

function ArticleCard({
  art,
  isCopied,
  onCopy,
  btnCopyLabel,
  copiedLabel,
  btnSourceLabel,
}: ArticleCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-[#C89543]/40 transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C89543]/15 text-[#8C6218] border border-[#C89543]/30">
            <Bookmark className="w-3 h-3 text-[#C89543]" />
            <span>{art.topicTag}</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            {art.lawNumber}
          </span>
        </div>

        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <span className="text-[#082A52] font-mono">{art.articleNumber}</span>
          <span>—</span>
          <span>{art.title}</span>
        </h3>

        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          {art.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:border-[#C89543] text-slate-700 hover:text-[#082A52] transition-all shadow-2xs"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">{copiedLabel}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#C89543]" />
              <span>{btnCopyLabel}</span>
            </>
          )}
        </button>

        <a
          href={art.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#082A52] hover:underline"
        >
          <span>{btnSourceLabel}</span>
          <ExternalLink className="w-3 h-3 text-[#C89543]" />
        </a>
      </div>
    </div>
  );
}

export default function VadeMecumPage() {
  const { t } = useI18n();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'STATUTES' | 'ARTICLES'>('STATUTES');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { key: 'ALL', label: t.vadeMecum.filterAll },
    { key: 'BENEFICIOS', label: t.vadeMecum.categoryBeneficios },
    { key: 'CUSTEIO', label: t.vadeMecum.categoryCusteio },
    { key: 'ASSISTENCIA', label: t.vadeMecum.categoryAssistencia },
    { key: 'REGULAMENTO', label: t.vadeMecum.categoryRegulamento },
    { key: 'CONSTITUICAO', label: t.vadeMecum.categoryConstituicao },
    { key: 'ADVOCACIA', label: t.vadeMecum.categoryAdvocacia },
  ];

  const filteredLaws = VALIDATED_LAWS.filter((law) => {
    const term = search.toLowerCase();
    const matchesSearch =
      law.title.toLowerCase().includes(term) ||
      law.officialNumber.toLowerCase().includes(term) ||
      law.summary.toLowerCase().includes(term) ||
      law.slug.includes(term);

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    return law.category === selectedCategory;
  });

  const filteredArticles = CORE_STATUTE_TOPICS.filter((art) => {
    const term = search.toLowerCase();
    return (
      art.articleNumber.toLowerCase().includes(term) ||
      art.title.toLowerCase().includes(term) ||
      art.topicTag.toLowerCase().includes(term) ||
      art.lawNumber.toLowerCase().includes(term) ||
      art.content.toLowerCase().includes(term)
    );
  });

  const handleCopyCitation = async (art: LawArticle) => {
    const citation = `${art.articleNumber} da ${art.lawNumber} (${art.title}) — Conforme legislação federal vigente.`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(citation);
        setCopiedId(art.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch {
      // Clipboard unavailable in non-secure or restricted frame
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#082A52] text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5 text-[#C89543]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#082A52] tracking-tight">
                {t.vadeMecum.title}
              </h1>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t.vadeMecum.badgeVerified}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.vadeMecum.subtitle}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#C89543]" />
          <span>{t.vadeMecum.badgeUpcoming}</span>
        </div>
      </div>

      {/* Roadmap Notice Box */}
      <div className="bg-gradient-to-r from-[#082A52]/5 via-[#FDF8ED] to-white border border-[#C89543]/30 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C89543]/20 text-[#8C6218] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scale className="w-4 h-4 text-[#C89543]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-900">
                {t.vadeMecum.roadmapNoticeTitle}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6218] bg-[#C89543]/20 px-2 py-0.5 rounded-full">
                Próximo Release
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {t.vadeMecum.roadmapNoticeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Tabs Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t.vadeMecum.searchPlaceholder}
            placeholder={t.vadeMecum.searchPlaceholder}
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#C89543] focus:ring-1 focus:ring-[#C89543] outline-hidden text-slate-800 transition-all font-medium"
          />
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('STATUTES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'STATUTES'
                ? 'bg-white text-[#082A52] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.vadeMecum.statutesTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ARTICLES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ARTICLES'
                ? 'bg-white text-[#082A52] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.vadeMecum.quickArticlesTab}
          </button>
        </div>
      </div>

      {/* Category Filter Pills (When on Statutes tab) */}
      {activeTab === 'STATUTES' && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c.key
                  ? 'bg-[#082A52] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab 1: Primary Statutes Cards */}
      {activeTab === 'STATUTES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLaws.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">{t.vadeMecum.noResultsFound}</p>
            </div>
          ) : (
            filteredLaws.map((law) => (
              <StatuteCard
                key={law.id}
                law={law}
                btnLabel={t.vadeMecum.btnOfficialSource}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 2: Quick Articles & Topics Reference */}
      {activeTab === 'ARTICLES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">{t.vadeMecum.noResultsFound}</p>
            </div>
          ) : (
            filteredArticles.map((art) => (
              <ArticleCard
                key={art.id}
                art={art}
                isCopied={copiedId === art.id}
                onCopy={() => handleCopyCitation(art)}
                btnCopyLabel={t.vadeMecum.btnCopyCitation}
                copiedLabel={t.vadeMecum.citationCopied}
                btnSourceLabel={t.vadeMecum.btnOfficialSource}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
