'use client';

import React from 'react';
import { X, Sparkles, Star, Zap } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { t, isRTL } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Premium Icon Circle */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />
            <Star className="w-10 h-10 text-emerald-600 fill-emerald-600 animate-pulse" />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            {t('premium_feature') || 'Premium Feature'}
          </h2>
          <p className="text-slate-500 text-sm font-semibold leading-relaxed">
            {t('premium_feature_desc_modal') || 'This AI-powered feature requires a premium subscription. Upgrade your plan to unlock unlimited generations and save time!'}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              // Redirect to web pricing plans / pricing modal (landing page pricing section)
              window.location.href = '/#pricing';
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-emerald-250/30 cursor-pointer"
          >
            <Zap size={18} className="text-amber-300 animate-pulse" />
            <span>{t('upgrade_plan') || 'Upgrade Plan'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all cursor-pointer text-center"
          >
            {t('maybe_later') || 'Maybe Later'}
          </button>
        </div>

      </div>
    </div>
  );
}
