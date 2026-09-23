import React, { useState, useEffect, useRef, useCallback } from 'react';
import { messageService } from '../services/api';

interface Contact {
  id: number;
  full_name: string;
  role: string;
  username: string;
}

interface Conversation {
  user_id: number;
  full_name: string;
  role: string;
  last_message: string | null;
  last_message_at: string | null;
  last_message_is_mine: boolean;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  is_mine: boolean;
}

const ROLE_BADGE: Record<string, string> = {
  Administrator: 'bg-emerald-100 text-emerald-800',
  'Project Manager': 'bg-purple-100 text-purple-800',
  Supervisor: 'bg-blue-100 text-blue-800',
};

function initials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const Messages: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_LEN = 2000;

  // ── Data fetchers ────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch {}
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await messageService.getContacts();
      setContacts(data);
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (userId: number) => {
    try {
      const data = await messageService.getMessages(userId);
      setMessages(data);
      // Mark as read
      await messageService.markAsRead(userId).catch(() => {});
      // Refresh conversations to update unread badge
      fetchConversations();
    } catch {}
  }, [fetchConversations]);

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, [fetchConversations, fetchContacts]);

  // ── Select conversation ───────────────────────────────────
  useEffect(() => {
    if (selectedUserId !== null) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, fetchMessages]);

  // ── Polling: messages every 10s ───────────────────────────
  useEffect(() => {
    if (selectedUserId === null) return;
    const id = setInterval(() => fetchMessages(selectedUserId), 10000);
    return () => clearInterval(id);
  }, [selectedUserId, fetchMessages]);

  // ── Polling: conversations every 30s ─────────────────────
  useEffect(() => {
    const id = setInterval(fetchConversations, 30000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  // ── Scroll to bottom on new messages ─────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = async () => {
    const content = draft.trim();
    setSendError('');
    if (!content) { setSendError('Message cannot be empty.'); return; }
    if (content.length > MAX_LEN) { setSendError(`Message exceeds ${MAX_LEN} characters.`); return; }
    if (!selectedUserId) return;
    setSending(true);
    try {
      await messageService.sendMessage(selectedUserId, content);
      setDraft('');
      fetchMessages(selectedUserId);
      fetchConversations();
    } catch (err: any) {
      setSendError(err?.response?.data?.detail || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Build contact list merging conversations + all contacts
  const contactsWithStatus: (Conversation & { hasMessages: boolean })[] = contacts.map(c => {
    const conv = conversations.find(v => v.user_id === c.id);
    return conv
      ? { ...conv, hasMessages: true }
      : {
          user_id: c.id,
          full_name: c.full_name,
          role: c.role,
          last_message: null,
          last_message_at: null,
          last_message_is_mine: false,
          unread_count: 0,
          hasMessages: false,
        };
  });

  // Sort: conversations with messages first (by recency), then others alphabetically
  contactsWithStatus.sort((a, b) => {
    if (a.hasMessages && b.hasMessages)
      return (b.last_message_at || '') > (a.last_message_at || '') ? 1 : -1;
    if (a.hasMessages) return -1;
    if (b.hasMessages) return 1;
    return a.full_name.localeCompare(b.full_name);
  });

  const selectedContact = contactsWithStatus.find(c => c.user_id === selectedUserId);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ── Left: Contact / Conversation list ── */}
      <aside
        className="w-72 bg-white border-r border-slate-200 flex flex-col"
        style={{ minHeight: 0 }}
      >
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-widest">
            Internal Messages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Direct communication</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactsWithStatus.length === 0 && (
            <p className="text-xs text-slate-400 p-5">Loading contacts…</p>
          )}
          {contactsWithStatus.map(c => {
            const isActive = c.user_id === selectedUserId;
            return (
              <button
                key={c.user_id}
                onClick={() => setSelectedUserId(c.user_id)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-slate-100 transition ${
                  isActive ? 'bg-blue-50 border-l-4 border-l-blue-700' : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    c.role === 'Administrator'
                      ? 'bg-emerald-600'
                      : c.role === 'Project Manager'
                      ? 'bg-purple-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {initials(c.full_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {c.full_name}
                    </span>
                    {c.unread_count > 0 && (
                      <span className="ml-1 flex-shrink-0 h-5 min-w-[20px] px-1 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      ROLE_BADGE[c.role] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.role}
                  </span>
                  {c.last_message ? (
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {c.last_message_is_mine ? (
                        <span className="text-slate-400">You: </span>
                      ) : null}
                      {c.last_message}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1 italic">No messages yet</p>
                  )}
                </div>

                {c.last_message_at && (
                  <span className="flex-shrink-0 text-[10px] text-slate-400 mt-0.5">
                    {formatTime(c.last_message_at)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Center: Thread ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  selectedContact.role === 'Administrator'
                    ? 'bg-emerald-600'
                    : selectedContact.role === 'Project Manager'
                    ? 'bg-purple-600'
                    : 'bg-blue-600'
                }`}
              >
                {initials(selectedContact.full_name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedContact.full_name}</p>
                <p className="text-xs text-slate-500">{selectedContact.role}</p>
              </div>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {messages.length === 0 && (
                <div className="text-center mt-16">
                  <p className="text-sm text-slate-400 font-medium">No messages yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start a conversation with {selectedContact.full_name}.
                  </p>
                </div>
              )}
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex ${m.is_mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[68%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                      m.is_mine
                        ? 'bg-blue-700 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-xs'
                    }`}
                  >
                    {!m.is_mine && (
                      <p className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                        {m.sender_name}
                      </p>
                    )}
                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.content}</p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        m.is_mine ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {formatMessageTime(m.created_at)}
                      {m.is_mine && (
                        <span className="ml-1">{m.is_read ? '✓✓' : '✓'}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
              {sendError && (
                <p className="text-xs text-red-600 mb-2">{sendError}</p>
              )}
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    rows={2}
                    maxLength={MAX_LEN}
                    value={draft}
                    onChange={e => { setDraft(e.target.value); setSendError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    className="w-full resize-none px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5 text-right">
                    {draft.length}/{MAX_LEN}
                  </p>
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  className="mb-5 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40"
                >
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">Internal Communication</p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">
              Select a contact on the left to open a conversation. All messages are
              for internal operational use only.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
