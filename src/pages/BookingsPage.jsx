import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Ticket,
  CheckCircle2,
  AlertCircle,
  X,
  Film,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import TicketCard from '../components/TicketCard';

const STATUS_TABS = [
  { value: '', label: 'Semua Tiket' },
  { value: 'confirmed', label: 'Tiket Aktif' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function BookingsPage() {
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [flashCode, setFlashCode] = useState(
    () => location.state?.newBookingCode || ''
  );

  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        sort: '-createdAt',
        limit: 50,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await apiRequest('/bookings', { params });
      setBookings(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat daftar e-ticket Anda.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    setErrorMsg('');
    try {
      await apiRequest(`/bookings/${bookingToCancel._id}/status`, {
        method: 'PATCH',
        body: { status: 'cancelled' },
      });
      setBookingToCancel(null);
      await fetchMyBookings();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membatalkan pesanan tiket.');
      setBookingToCancel(null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-14">
      <section className="border-b border-sand pb-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-velvet font-semibold">
            Arsip Dompet Sinema
          </span>
          <h1 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Tiket Saya & Riwayat Pesanan
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Tunjukkan kode e-ticket dan matriks QR saat memasuki auditorium studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded bg-white border border-sand">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setStatusFilter(t.value)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  statusFilter === t.value
                    ? 'bg-velvet text-white'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchMyBookings}
            aria-label="Muat ulang tiket"
            className="p-2.5 rounded bg-white border border-sand text-muted hover:text-ink"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {flashCode && (
        <div
          role="status"
          className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">E-Ticket Berhasil Diterbitkan</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Kode tiket <span className="font-mono font-bold">{flashCode}</span>{' '}
                telah tercatat lunas dan kursi Anda telah dikunci.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFlashCode('')}
            className="text-emerald-700 hover:text-emerald-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded bg-velvet-soft border border-velvet/30 text-velvet text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 rounded-lg bg-white border border-sand animate-pulse"
            />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-sand rounded-lg p-12 text-center">
          <Ticket className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
          <h2 className="font-display font-bold text-lg text-ink">
            Belum Ada E-Ticket
          </h2>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto">
            Anda belum memiliki tiket pada kategori ini. Jelajahi katalog film untuk memilih kursi pertunjukan.
          </p>
          <Link
            to="/movies"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded bg-velvet hover:bg-velvet-hover text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            <Film className="w-4 h-4" />
            <span>Telusuri Film Sedang Tayang</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <TicketCard
              key={booking._id}
              booking={booking}
              onRequestCancel={(b) => setBookingToCancel(b)}
            />
          ))}
        </div>
      )}

      {bookingToCancel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-sand rounded-lg max-w-md w-full p-6 shadow-ticket">
            <h3 className="font-display font-extrabold text-lg text-ink">
              Batalkan E-Ticket Ini?
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Pesanan dengan kode{' '}
              <span className="font-mono font-semibold text-ink">
                {bookingToCancel.bookingCode}
              </span>{' '}
              untuk kursi{' '}
              <span className="font-mono font-semibold text-velvet">
                {(bookingToCancel.seats || []).join(', ')}
              </span>{' '}
              akan diubah menjadi dibatalkan dan kursi akan dilepaskan kembali ke publik.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setBookingToCancel(null)}
                className="px-4 py-2 rounded border border-sand text-xs sm:text-sm font-semibold text-ink hover:bg-ivory"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded bg-velvet hover:bg-velvet-hover text-white text-xs sm:text-sm font-semibold disabled:opacity-60"
              >
                {cancelling ? 'Membatalkan...' : 'Ya, Batalkan Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
