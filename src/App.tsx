/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginForm } from './components/LoginForm.tsx';
import { RegisterForm } from './components/RegisterForm.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldCheck,
  Database,
  Lock,
  CloudCheck,
  CheckCircle2,
  ArrowRight,
  Wallet,
} from 'lucide-react';

function AppContent() {
  const { currentUser, loading, loginWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isQuickGoogleLoggingIn, setIsQuickGoogleLoggingIn] = useState(false);

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleQuickGoogleSignIn = async () => {
    setIsQuickGoogleLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch {
      // Handled in AuthContext
    } finally {
      setIsQuickGoogleLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {currentUser ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 w-full">
            <Dashboard />
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 w-full">
            {/* Value Proposition Hero & Login Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: App Features & Cloud Sync Pitch */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 mb-3">
                    <CloudCheck className="h-3.5 w-3.5" />
                    <span>Firebase Cloud Storage & Real-time Sync</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    ระบบจัดการรายรับ-รายจ่าย <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
                      สรุปผลรายเดือน & กราฟวิเคราะห์
                    </span>
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                    จัดการเงินของคุณได้อย่างเป็นระเบียบ บันทึกรายรับรายจ่ายแบบเรียลไทม์ พร้อมระบบสรุปผลรายเดือนและกราฟเปรียบเทียบสัดส่วนค่าใช้จ่าย เก็บข้อมูลบน Firebase Cloud ปลอดภัย เข้าถึงได้ทุกที่
                  </p>
                </div>

                {/* Quick Google Login CTA Card */}
                <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/50 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        เข้าสู่ระบบด้วย Gmail (Google Account)
                      </h3>
                      <p className="text-xs text-slate-500">
                        สะดวก รวดเร็ว ปลอดภัย ไม่ต้องจำรหัสผ่านแยก
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickGoogleSignIn}
                    disabled={isQuickGoogleLoggingIn}
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-98 transition cursor-pointer disabled:opacity-60"
                  >
                    {isQuickGoogleLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>กำลังเข้าสู่ระบบผ่าน Google...</span>
                      </>
                    ) : (
                      <>
                        <span>เข้าสู่ระบบทันทีด้วย Gmail</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Feature Highlights Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-2.5">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">สรุปผลยอดเงินรายเดือน</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      คำนวณรายรับ รายจ่าย ยอดคงเหลือ และอัตราการออมสุทธิพร้อมแจ้งเตือนงบประมาณเกินอัตโนมัติ
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 mb-2.5">
                      <PieChart className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">ภาพวิเคราะห์ข้อมูลการเงิน</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      แสดงกราฟเปรียบเทียบกระแสเงินสดตามวัน (Daily Trend) และกราฟโดนัทจำแนกสัดส่วนค่าใช้จ่าย
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-2.5">
                      <Database className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Firebase Firestore Cloud</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      ข้อมูลถูกแยกและปกป้องตามสิทธิ์บัญชีผู้ใช้ (Security Rules) บันทึกและซิงค์ทันทีทุกอุปกรณ์
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-2.5">
                      <Lock className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">ความปลอดภัยมาตรฐานสากล</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      รองรับ Google Sign-In และระบบยืนยันตัวตน Token ทางฝั่ง Node.js Server
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Standard Auth Box (Login / Register / Forgot Password) */}
              <div className="lg:col-span-5">
                {authMode === 'login' ? (
                  <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
                ) : (
                  <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>ระบบบันทึกรายรับ-รายจ่าย คลาวด์ &bull; ขับเคลื่อนด้วย Firebase และ React</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3 text-emerald-500" />
              <span>Cloud Firestore Real-Time</span>
            </span>
            <span className="flex items-center gap-1">
              <CloudCheck className="h-3 w-3 text-indigo-500" />
              <span>Google Identity</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
