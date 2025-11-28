"use client";

import { useLocale } from 'next-intl';
import { useState } from 'react';
import { Languages } from 'lucide-react';
import { LV, GB } from 'country-flag-icons/react/3x2';

const languages = [
  { code: 'lv', name: 'Latviešu', flag: LV },
  { code: 'en', name: 'English', flag: GB },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];
  const CurrentFlag = currentLanguage.flag;

  const switchLanguage = (newLocale: string) => {
    const newPath = `/${newLocale}`;
    
    window.location.href = newPath;
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-700 hover:bg-zinc-900"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <Languages className="h-4 w-4 text-zinc-400" />
        <CurrentFlag className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 z-20 w-48 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg">
            <ul className="py-2">
              {languages.map((lang) => {
                const Flag = lang.flag;
                const isActive = lang.code === locale;
                return (
                  <li key={lang.code}>
                    <button
                      type="button"
                      onClick={() => switchLanguage(lang.code)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100'
                      }`}
                    >
                      <Flag className="h-4 w-4" />
                      <span>{lang.name}</span>
                      {isActive && (
                        <span className="ml-auto text-xs text-zinc-500">✓</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

