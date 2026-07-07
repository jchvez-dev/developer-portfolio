import { useState, type FormEvent } from 'react';
import { Section } from '../../components/ui/Section';
import { Button } from '../../components/ui/Button';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-500 dark:bg-gray-900 focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none';

export const ContactForm = () => {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrors([]);

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '', honeypot: '' });
      } else if (res.status === 422) {
        const data = await res.json();
        setErrors(data.message ?? ['Validation error']);
        setStatus('error');
      } else if (res.status === 429) {
        setErrors(['Too many requests. Please try again later.']);
        setStatus('error');
      } else {
        setErrors(['Something went wrong. Please try again.']);
        setStatus('error');
      }
    } catch {
      setErrors(['Network error. Please check your connection.']);
      setStatus('error');
    }
  };

  return (
    <Section id="contact" title="Contact" description="Have a question or want to work together? Send me a message.">
      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4">
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <input
            tabIndex={-1}
            autoComplete="off"
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange('honeypot')}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange('name')}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange('email')}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={handleChange('subject')}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange('message')}
            className={inputClass}
          />
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
            Message sent successfully!
          </div>
        )}

        <Button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Section>
  );
};
