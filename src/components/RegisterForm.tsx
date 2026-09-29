import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, Loader2, CheckCircle2, HelpCircle } from 'lucide-react';
import { FirebaseSetupGuide } from './FirebaseSetupGuide.tsx';

interface Props {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { registerWithEmail, loginWithGoogle, authError, authErrorCode, clearAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!name.trim()) {
      setLocalError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!email.trim()) {
      setLocalError('กรุณากรอกอีเมล');
      return;
    }

    if (password.length < 6) {
      setLocalError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmail(email, password, name);
    } catch {
      // Handled via context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // Handled via context
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const displayError = localError || authError;
  const isConfigError =
    authErrorCode === 'auth/configuration-not-found' ||
    authErrorCode === 'auth/operation-not-allowed' ||
    authErrorCode === 'auth/unauthorized-domain' ||
    (displayError ? displayError.includes('configuration-not-found') || displayError.includes('Firebase Console') : false);

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Firebase Setup Guide Banner when config error is detected */}
      {(isConfigError || showManualGuide) && (
        <FirebaseSetupGuide
          errorCode={authErrorCode || (displayError?.includes('configuration-not-found') ? 'auth/configuration-not-found' : null)}
          onRetry={() => {
            clearAuthError();
            setLocalError(null);
            setShowManualGuide(false);
          }}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            สมัครสมาชิกใหม่
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            สร้างบัญชีผู้ใช้และบันทึกข้อมูลลง Firestore อัตโนมัติ
          </p>
          <button
            type="button"
            onClick={() => setShowManualGuide(!showManualGuide)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{showManualGuide ? 'ซ่อนคู่มือตั้งค่า Firebase' : 'ดูวิธีเปิดใช้งาน Authentication ใน Firebase Console'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {displayError && !isConfigError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">สมัครสมาชิกไม่สำเร็จ</p>
              <p className="mt-0.5">{displayError}</p>
            </div>
            <button
              onClick={() => {
                setLocalError(null);
                clearAuthError();
              }}
              className="text-rose-400 hover:text-rose-600 font-bold ml-1 text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Google Quick Signup */}
        <button
          id="google-register-btn"
          type="button"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading || isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
          ) : (
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
          )}
          <span>สมัครด้วย Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 uppercase tracking-wider font-medium">
              หรือกรอกข้อมูลสมัครสมาชิก
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700">
              ชื่อ - นามสกุล
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="สมชาย ใจดี"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700">
              อีเมล
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="somchai@example.com"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700">
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-300 py-2.5 pr-10 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700">
              ยืนยันรหัสผ่านอีกครั้ง
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังสร้างบัญชีและบันทึกลง Firestore...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>ยืนยันการสมัครสมาชิก</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Login */}
        <div className="mt-6 text-center text-xs text-slate-600">
          มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
          <button
            id="switch-to-login-btn"
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};
