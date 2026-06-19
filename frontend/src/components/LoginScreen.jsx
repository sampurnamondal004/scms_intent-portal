import React, { useMemo, useState } from 'react';

function makeCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function LoginScreen({ onSignIn }) {
  const [captcha, setCaptcha] = useState(() => makeCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const captchaLetters = useMemo(() => captcha.split(''), [captcha]);

  function refreshCaptcha() {
    setCaptcha(makeCaptcha());
    setCaptchaInput('');
    setError('');
  }

  function submitLogin(event) {
    event.preventDefault();
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setCaptcha(makeCaptcha());
      setCaptchaInput('');
      setError('Captcha does not match');
      return;
    }
    onSignIn();
  }

  return (
    <main className="scms-login-bg grid min-h-screen place-items-center px-4">
      <section className="grid w-full max-w-[620px] overflow-hidden rounded-2xl bg-white/80 shadow-2xl backdrop-blur md:grid-cols-2">
        <form
          className="space-y-4 border-r border-slate-200 p-10"
          onSubmit={submitLogin}
        >
          <div className="grid h-12 w-12 place-items-center rounded bg-[#e7f0ef] text-2xl">SC</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-700">Sign in</h1>
            <p className="text-sm text-slate-500">
              to access <span className="font-semibold text-[#152f91]">SCMS</span>
            </p>
          </div>
          <div className="flex gap-8 text-xs text-slate-600">
            <label className="flex items-center gap-2"><input defaultChecked name="mode" type="radio" /> Password Based</label>
            <label className="flex items-center gap-2"><input name="mode" type="radio" /> OTP Based</label>
          </div>
          <input className="scms-input rounded-full" defaultValue="TRP_RDD_2301" />
          <input className="scms-input rounded-full" defaultValue="password" type="password" />
          <div className="grid grid-cols-[138px_1fr] gap-3">
            <button
              className="captcha-box h-12 rounded border border-slate-300 bg-slate-100 text-xl font-black italic text-[#152f91]"
              type="button"
              onClick={refreshCaptcha}
              title="Refresh captcha"
            >
              {captchaLetters.map((letter, index) => (
                <span className={index % 2 ? 'translate-y-0.5 rotate-3' : '-translate-y-0.5 -rotate-3'} key={`${letter}-${index}`}>
                  {letter}
                </span>
              ))}
            </button>
            <input
              className="scms-input"
              placeholder="Enter captcha"
              value={captchaInput}
              onChange={(event) => {
                setCaptchaInput(event.target.value);
                setError('');
              }}
            />
          </div>
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {error}
            </div>
          )}
          <button className="w-full rounded bg-[#2f5cc8] px-4 py-2.5 text-sm font-bold text-white" type="submit">
            Sign in
          </button>
        </form>

        <div className="grid place-items-center p-10 text-center">
          <div>
            <div className="mx-auto mb-5 grid h-28 w-28 place-items-center rounded-full border-[14px] border-[#cba990] bg-[#d7dfe1] text-3xl font-bold text-[#5f9ea0]">
              CFG
            </div>
            <h2 className="text-lg font-bold text-slate-600">Configuration</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Configure all Parameters like Store, Employee, Material etc first.
            </p>
            <button className="mt-4 rounded-full border border-[#8ca3c7] px-4 py-2 text-xs font-semibold text-[#456aa5]" type="button">
              Know more
            </button>
          </div>
        </div>
      </section>
      {/* <footer className="fixed bottom-8 text-xs text-slate-500">
        Last Updated on 18 june 2026, Tuesday. NIC Tripura. All Rights Reserved. Govt. Of India
      </footer> */}
    </main>
  );
}
