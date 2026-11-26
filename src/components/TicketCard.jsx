import React from 'react';
import { Calendar, Clock, MapPin, Armchair, Ban, CheckCircle2 } from 'lucide-react';
import DeterministicQR from './DeterministicQR';
import { formatJam, formatRupiah, formatTanggalLengkap } from '../utils/format';

export default function TicketCard({ booking, onRequestCancel }) {
  const showtime =
    booking?.showtimeId && typeof booking.showtimeId === 'object'
      ? booking.showtimeId
      : null;
  const movie =
    showtime?.movieId && typeof showtime.movieId === 'object'
      ? showtime.movieId
      : null;

  const isCancelled = booking.status === 'cancelled';
  const judulFilm = movie?.judul || 'Tayangan Sinema';
  const ratingUsia = movie?.ratingUsia || '13+';
  const genre = movie?.genre || 'Sinema';
  const namaStudio = showtime?.studio?.nama || 'Studio Utama';
  const tipeStudio = showtime?.studio?.tipe || 'Reguler';
  const waktuTayang = showtime?.waktuTayang || booking.createdAt;
  const statusBayar = isCancelled
    ? 'Dibatalkan'
    : booking.pembayaran?.status || 'Lunas';

  return (
    <article
      className={`relative bg-white border border-sand rounded-lg shadow-ticket overflow-hidden transition-opacity ${
        isCancelled ? 'opacity-80' : ''
      }`}
    >
      <div
        className={`h-1.5 w-full ${
          isCancelled ? 'bg-zinc-400' : 'bg-velvet'
        }`}
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-brass-soft text-brass border border-brass/25 font-semibold">
                {namaStudio} · {tipeStudio}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-ivory border border-sand text-ink">
                {ratingUsia}
              </span>
              <span className="text-xs text-muted">{genre}</span>
            </div>
            <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-snug">
              {judulFilm}
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold shrink-0 border ${
              isCancelled
                ? 'bg-zinc-100 text-zinc-600 border-zinc-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isCancelled ? (
              <Ban className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{statusBayar}</span>
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-sand/70">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brass" />
              <span>Tanggal</span>
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {formatTanggalLengkap(waktuTayang)}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brass" />
              <span>Jam Tayang</span>
            </p>
            <p className="mt-1 font-mono font-semibold text-sm text-ink">
              {formatJam(waktuTayang)} WIB
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-[11px] uppercase tracking-wider text-muted flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brass" />
              <span>Metode</span>
            </p>
            <p className="mt-1 text-xs font-medium text-ink">
              {booking.pembayaran?.metode || 'Simulasi Internal'}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded bg-ivory border border-sand flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted flex items-center gap-1">
              <Armchair className="w-3.5 h-3.5 text-velvet" />
              <span>Nomor Kursi ({booking.seats?.length || 0})</span>
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(booking.seats || []).map((seat) => (
                <span
                  key={seat}
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border ${
                    isCancelled
                      ? 'bg-zinc-200/70 text-zinc-500 border-zinc-300 line-through'
                      : 'bg-velvet text-white border-velvet-hover'
                  }`}
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-muted block">
              Total Bayar
            </span>
            <span className="font-mono font-bold text-base sm:text-lg text-ink">
              {formatRupiah(booking.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-between px-2">
        <div
          aria-hidden="true"
          className="w-5 h-5 rounded-full bg-ivory border border-sand -ml-4 shrink-0"
        />
        <div className="w-full border-t-2 border-dashed border-sand mx-1" />
        <div
          aria-hidden="true"
          className="w-5 h-5 rounded-full bg-ivory border border-sand -mr-4 shrink-0"
        />
      </div>

      <div className="px-5 sm:px-6 py-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-1.5 bg-white border border-sand rounded shrink-0">
            <DeterministicQR
              value={booking.bookingCode || booking._id}
              size={76}
              dimmed={isCancelled}
            />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted block">
              Kode E-Ticket Resmi
            </span>
            <p className="font-mono font-bold text-sm sm:text-base text-ink tracking-wide mt-0.5">
              {booking.bookingCode}
            </p>
            <p className="text-xs text-muted mt-1">
              {isCancelled
                ? 'Kursi telah dilepaskan kembali ke kuota studio.'
                : 'Tunjukkan kode ini kepada petugas pintu studio.'}
            </p>
          </div>
        </div>

        {!isCancelled && onRequestCancel && (
          <button
            type="button"
            onClick={() => onRequestCancel(booking)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded border border-velvet/35 text-velvet hover:bg-velvet hover:text-white text-xs font-semibold transition-colors self-start sm:self-center shrink-0"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Batalkan Pesanan</span>
          </button>
        )}
      </div>
    </article>
  );
}
