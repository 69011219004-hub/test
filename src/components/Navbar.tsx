import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Wallet,
  LogOut,
  Database,
  PlusCircle,
  Download,
} from 'lucide-react';

interface Props {
  onAddNewTransaction?: () => void;
}

export const Navbar: React.FC<Props> = ({ onAddNewTransaction }) => {
  const { currentUser, userProfile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-200">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">
                ระบบจัดการรายรับ-รายจ่าย
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                <Database className="h-3 w-3" /> Firebase Cloud
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              สรุปผลรายเดือน &bull; ภาพวิเคราะห์ข้อมูล &bull; ซิงค์อัตโนมัติบนคลาวด์
            </p>
          </div>
        </div>

        {/* User / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Download Source Code ZIP Button */}
          <a
            href="/income-expense-app.zip"
            download="income-expense-app.zip"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition cursor-pointer shadow-2xs"
            title="ดาวน์โหลดไฟล์ ZIP ซอร์สโค้ดทั้งหมด"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">ดาวน์โหลด ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </a>

          {currentUser ? (
            <>
              {onAddNewTransaction && (
                <button
                  type="button"
                  onClick={onAddNewTransaction}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>บันทึกรายการ</span>
                </button>
              )}

              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google Profile'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-500/20 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-2 ring-indigo-500/20">
                    {(userProfile?.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}

                <div className="hidden text-left md:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {userProfile?.displayName || currentUser.displayName || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {currentUser.email}
                  </p>
                </div>

                <button
                  id="navbar-logout-btn"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">ออก</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ระบบพร้อมใช้งาน</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
