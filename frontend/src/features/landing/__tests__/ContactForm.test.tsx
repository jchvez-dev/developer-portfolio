import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../ContactForm';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders form fields', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactForm />);
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });

  it('shows sending state while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      () => new Promise<Response>((resolve) => { resolvePromise = resolve; }),
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    resolvePromise!(new Response(null, { status: 200 }));
  });

  it('shows success message on successful submit', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 200 }));

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Message sent successfully!')).toBeInTheDocument();
  });

  it('shows validation errors on 422 response', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: ['Name is required'] }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });

  it('shows rate limit error on 429 response', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 429 }),
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Too many requests. Please try again later.')).toBeInTheDocument();
  });

  it('shows generic error on unexpected status', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('shows network error on fetch failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Network error. Please check your connection.')).toBeInTheDocument();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 200 }));

    render(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'John');
    await user.type(screen.getByLabelText('Email'), 'john@test.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(await screen.findByText('Message sent successfully!')).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLInputElement>('Name').value).toBe('');
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe('');
    expect(screen.getByLabelText<HTMLTextAreaElement>('Message').value).toBe('');
  });
});
