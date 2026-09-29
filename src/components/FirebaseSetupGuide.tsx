import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { FIREBASE_PROJECT_INFO } from '../lib/firebase.ts';

interface Props {
  errorCode?: string | null;
  onRetry?: () => void;
}

export const FirebaseSetupGuide: React.FC<Props> = ({ errorCode, onRetry }) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const isConfigNotFound = errorCode === 'auth/configuration-not-found';
  const isOperationNotAllowed = errorCode === 'auth/operation-not-allowed';
  const isUnauthorizedDomain = errorCode === 'auth/unauthorized-domain';

  return (
    <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-b from-rose-50/90 via-white to-amber-50/50 p-5 shadow-md">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-rose-200/80 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-rose-950">
              {isConfigNotFound
                ? 'ยังไม่ได้เปิดใช้งาน Authentication ใน Firebase Console'
                : isOperationNotAllowed
                ? 'วิธีลงชื่อเข้าใช้ (Email/Google) ยังไม่ถูกเปิดใช้งาน'
                : isUnauthorizedDomain
                ? 'โดเมนของเว็บไซต์นี้ยังไม่ได้รับอนุญาตใน Firebase'
                : 'คำแนะนำการตั้งค่า Firebase Authentication'}
            </h3>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-rose-800">
              {errorCode || 'Setup Required'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            สาเหตุที่กดสมัครสมาชิกหรือกดสมัครด้วย Google ไม่ได้ เนื่องจากโปรเจกต์{' '}
            <strong className="text-indigo-700 font-mono font-bold">{FIREBASE_PROJECT_INFO.projectId}</strong>{' '}
            ใน Firebase Console เพิ่งถูกสร้างขึ้น และยังไม่ได้กดปุ่ม <strong>"Get started" (เริ่มต้นใช้งาน)</strong> หรือเปิดใช้งาน Sign-in Provider
          </p>
        </div>
      </div>

      {/* Steps to Fix */}
      <div className="mt-4 space-y-3">
        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>วิธีแก้ไขใน Firebase Console (ทำตาม 3 ขั้นตอน ใช้เวลาประมาณ 1 นาที):</span>
        </p>

        {/* Step 1 */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            1
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-900">เปิดหน้า Authentication ใน Firebase Console ของคุณ</p>
            <p className="mt-0.5 text-slate-500">
              คลิกปุ่มด้านล่างเพื่อเปิดหน้าจัดการระบบล็อกอินของโปรเจกต์ <span className="font-mono text-indigo-600">{FIREBASE_PROJECT_INFO.projectId}</span>
            </p>
            <a
              href={FIREBASE_PROJECT_INFO.consoleUrls.auth}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white shadow-2xs transition hover:bg-indigo-700 active:scale-98"
            >
              <span>เปิดหน้า Firebase Authentication</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            2
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-900">กดปุ่ม "Get started" (เริ่มต้นใช้งาน)</p>
            <p className="mt-0.5 text-slate-600 leading-relaxed">
              เมื่อเปิดหน้าเว็บ Firebase จะมีปุ่มสีน้ำเงินเขียนว่า <strong>"Get started"</strong> (หรือ เริ่มต้นใช้งาน) ให้คลิก 1 ครั้งเพื่อเปิดระบบยืนยันตัวตน
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
            3
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-900">เปิดใช้งาน Email/Password และ Google ในแท็บ "Sign-in method"</p>
            <div className="mt-2 space-y-1.5 text-slate-600">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>คลิก <strong>Email/Password</strong> &gt; เปิดสวิตช์ <strong>Enable</strong> &gt; กด <strong>Save (บันทึก)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>คลิก <strong>Google</strong> &gt; เปิดสวิตช์ <strong>Enable</strong> &gt; เลือกอีเมล Support email &gt; กด <strong>Save (บันทึก)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 (Authorized Domains) */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-2xs">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
            4
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-bold text-amber-950">
                (สำหรับ Google Sign-In) เพิ่มโดเมนใน Authorized domains
              </p>
            </div>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              ไปที่แท็บ <strong>Settings</strong> &gt; <strong>Authorized domains</strong> &gt; กดปุ่ม <strong>Add domain</strong> แล้ววางโดเมนของแอปนี้:
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded-md border border-amber-300 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-800 select-all">
                {currentHostname || 'localhost'}
              </code>
              <button
                type="button"
                onClick={copyDomain}
                className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-amber-700 active:scale-95 cursor-pointer"
              >
                {copiedDomain ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>คัดลอกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>คัดลอกโดเมนนี้</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Retry Action */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rose-200/80 pt-3">
        <p className="text-[11px] text-slate-500">
          เมื่อเปิดใช้งานใน Firebase Console ครบแล้ว สามารถกดลองสมัครสมาชิกใหม่อีกครั้งได้ทันที
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
            <span>ลองใหม่อีกครั้ง</span>
          </button>
        )}
      </div>
    </div>
  );
};
