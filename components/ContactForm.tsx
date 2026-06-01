'use client';

import { FormEvent, useState } from 'react';

const SUPPORT_EMAIL = 'helloluminai@gmail.com';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage) {
      setError('Please fill in all fields.');
      return;
    }

    const body = `From: ${trimmedName}\nEmail: ${trimmedEmail}\n\n${trimmedMessage}`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(trimmedSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  const fieldClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#006c51] focus:ring-1 focus:ring-[#006c51]/30 transition-all';

  return (
    <form onSubmit={handleSubmit} className='space-y-5' noValidate>
      {error && (
        <p className='text-sm font-medium text-red-500' role='alert'>
          {error}
        </p>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='contact-name'
            className='text-xs font-bold text-slate-500 uppercase tracking-wider'
          >
            Name
          </label>
          <input
            id='contact-name'
            name='name'
            type='text'
            autoComplete='name'
            placeholder='Your name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor='contact-email'
            className='text-xs font-bold text-slate-500 uppercase tracking-wider'
          >
            Email
          </label>
          <input
            id='contact-email'
            name='email'
            type='email'
            autoComplete='email'
            placeholder='you@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='contact-subject'
          className='text-xs font-bold text-slate-500 uppercase tracking-wider'
        >
          Subject
        </label>
        <input
          id='contact-subject'
          name='subject'
          type='text'
          placeholder='e.g. Help with lesson plans'
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor='contact-message'
          className='text-xs font-bold text-slate-500 uppercase tracking-wider'
        >
          Message
        </label>
        <textarea
          id='contact-message'
          name='message'
          rows={5}
          placeholder='How can we help?'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} min-h-[120px] resize-y`}
        />
      </div>

      <button
        type='submit'
        className='inline-flex items-center justify-center px-7 py-3 rounded-xl bg-[#006c51] text-white text-sm font-bold hover:bg-[#00523e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c51] focus-visible:ring-offset-2'
      >
        Send message
      </button>
    </form>
  );
}
