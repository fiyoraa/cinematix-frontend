import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Ticket,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatJam, formatRupiah, formatTanggalLengkap } from '../utils/format';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const LEFT_COLS = [1, 2, 3, 4];
const RIGHT_COLS = [5, 6, 7, 8];

export default function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [conflictAlert, setConflictAlert] = useState('');

  const fetchShowtimeDetail = useCallback(
    async (keepValidSelections = false) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await apiRequest(`/showtimes/${id}`);
        setShowtime(data);
        const bookedSet = new Set(
          (data.bookedSeats || []).map((s) => String(s).trim().toUpperCase())
        );
        if (keepValidSelections) {
          setSelectedSeats((prev) => prev.filter((s) => !bookedSet.has(s)));
        } else {
          setSelectedSeats([]);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Gagal memuat detail jadwal dan denah kursi.');
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchShowtimeDetail(false);
  }, [fetchShowtimeDetail]);

  const bookedSeatSet = useMemo(() => {
    return new Set(
      (showtime?.bookedSeats || []).map((s) => String(s).trim().toUpperCase())
    );
  }, [showtime]);

  const toggleSeat = (seatCode) => {
    if (bookedSeatSet.has(seatCode) || submitting) return;
    setConflictAlert('');
    setErrorMsg('');
    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) {
        return prev.filter((s) => s !== seatCode);
      }
      return [...prev, seatCode].sort();
    });
  };

  const hargaSatuan = showtime?.harga || 0;
  const totalHarga = hargaSatuan * selectedSeats.length;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMsg('Pilih minimal 1 kursi pada denah auditorium terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setConflictAlert('');

    try {
      const createdBooking = await apiRequest('/bookings', {
        method: 'POST',
        body: {
          showtimeId: id,
          seats: selectedSeats,
        },
      });

      navigate('/bookings', {
        state: {
          newBookingCode: createdBooking.bookingCode,
          newSeats: createdBooking.seats,
        },
      });
    } catch (err) {
      if (err.status === 409) {
        setConflictAlert(
          `${err.message}. Denah kursi telah diperbarui otomatis—silakan pilih kursi lain yang masih tersedia.`
        );
        await fetchShowtimeDetail(true);
      } else if (err.status === 401) {
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setErrorMsg(err.message || 'Gagal memproses pemesanan tiket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const movie =
    showtime?.movieId && typeof showtime.movieId === 'object'
      ? showtime.movieId
      : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-obsidian text-white pb-40 lg:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Film</span>
          </Link>

          <button
            type="button"
            onClick={() => fetchShowtimeDetail(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-charcoal border border-slateLine text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Kursi</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-8 h-[480px] rounded-lg bg-charcoal border border-slateLine" />
            <div className="lg:col-span-4 h-[380px] rounded-lg bg-charcoal border border-slateLine" />
          </div>
        ) : !showtime ? (
          <div className="bg-charcoal border border-slateLine rounded-lg p-10 text-center">
            <AlertCircle className="w-10 h-10 text-velvet mx-auto mb-3" />
            <h1 className="font-display font-bold text-xl text-white">
              Jadwal Tayang Tidak Ditemukan
            </h1>
            <p className="text-sm text-zinc-400 mt-1">{errorMsg}</p>
            <Link
              to="/movies"
              className="mt-5 inline-block px-4 py-2 rounded bg-velvet text-white text-xs font-semibold"
            >
              Lihat Film Lainnya
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <section className="lg:col-span-8 bg-charcoal border border-slateLine rounded-lg p-5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slateLine">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-brass/20 text-brass border border-brass/40 font-semibold">
                      {showtime.studio?.nama} · {showtime.studio?.tipe}
                    </span>
                    {movie?.ratingUsia && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-obsidian border border-slateLine text-zinc-300">
                        {movie.ratingUsia}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-2 font-display font-extrabold text-xl sm:text-2xl text-white">
                    {movie?.judul || 'Pertunjukan Sinema'}
                  </h1>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-zinc-400">
                  <p className="text-white font-semibold">
                    {formatJam(showtime.waktuTayang)} WIB
                  </p>
                  <p>{formatTanggalLengkap(showtime.waktuTayang)}</p>
                </div>
              </div>

              {conflictAlert && (
                <div
                  role="alert"
                  className="mt-5 p-4 rounded bg-velvet/25 border border-velvet text-zinc-100 text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-brass mt-0.5 shrink-0" />
                  <span>{conflictAlert}</span>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-5 p-4 rounded bg-velvet/25 border border-velvet text-zinc-100 text-xs sm:text-sm flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-brass mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-8 mb-10 text-center">
                <svg
                  viewBox="0 0 520 56"
                  className="w-full max-w-lg mx-auto overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="screenBeam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E5E0D8" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#1A1C24" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 28 34 Q 260 4 492 34 L 512 54 Q 260 26 8 54 Z"
                    fill="url(#screenBeam)"
                  />
                  <path
                    d="M 28 34 Q 260 4 492 34"
                    fill="none"
                    stroke="#E5E0D8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400 block -mt-1">
                  Layar Utama Auditorium
                </span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="min-w-[340px] max-w-xl mx-auto space-y-2.5">
                  {ROWS.map((row) => (
                    <div
                      key={row}
                      className="flex items-center justify-center gap-2 sm:gap-3"
                    >
                      <span className="w-5 font-mono text-xs font-bold text-zinc-500 text-center">
                        {row}
                      </span>

                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {LEFT_COLS.map((col) => {
                          const code = `${row}${col}`;
                          const isBooked = bookedSeatSet.has(code);
                          const isSelected = selectedSeats.includes(code);

                          return (
                            <button
                              key={code}
                              type="button"
                              disabled={isBooked}
                              onClick={() => toggleSeat(code)}
                              aria-label={`Kursi ${code} ${
                                isBooked
                                  ? 'sudah terisi'
                                  : isSelected
                                  ? 'dipilih'
                                  : 'tersedia'
                              }`}
                              className={`w-9 h-9 sm:w-11 sm:h-10 rounded-t-md rounded-b-sm font-mono text-[11px] sm:text-xs font-semibold border transition-all flex items-center justify-center ${
                                isBooked
                                  ? 'bg-obsidian/60 border-slateLine/60 text-zinc-600 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-velvet border-red-400/60 text-white ring-2 ring-velvet/40 -translate-y-0.5'
                                  : 'bg-obsidian border-slateLine text-zinc-200 hover:border-brass hover:text-white'
                              }`}
                            >
                              {code}
                            </button>
                          );
                        })}
                      </div>

                      <div
                        aria-hidden="true"
                        className="w-4 sm:w-8 flex items-center justify-center"
                      >
                        <span className="w-px h-5 bg-slateLine/60 block" />
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {RIGHT_COLS.map((col) => {
                          const code = `${row}${col}`;
                          const isBooked = bookedSeatSet.has(code);
                          const isSelected = selectedSeats.includes(code);

                          return (
                            <button
                              key={code}
                              type="button"
                              disabled={isBooked}
                              onClick={() => toggleSeat(code)}
                              aria-label={`Kursi ${code} ${
                                isBooked
                                  ? 'sudah terisi'
                                  : isSelected
                                  ? 'dipilih'
                                  : 'tersedia'
                              }`}
                              className={`w-9 h-9 sm:w-11 sm:h-10 rounded-t-md rounded-b-sm font-mono text-[11px] sm:text-xs font-semibold border transition-all flex items-center justify-center ${
                                isBooked
                                  ? 'bg-obsidian/60 border-slateLine/60 text-zinc-600 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-velvet border-red-400/60 text-white ring-2 ring-velvet/40 -translate-y-0.5'
                                  : 'bg-obsidian border-slateLine text-zinc-200 hover:border-brass hover:text-white'
                              }`}
                            >
                              {code}
                            </button>
                          );
                        })}
                      </div>

                      <span className="w-5 font-mono text-xs font-bold text-zinc-500 text-center">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slateLine flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-t bg-obsidian border border-slateLine inline-block" />
                  <span>Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-t bg-velvet border border-red-400/60 inline-block" />
                  <span>Dipilih</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-t bg-obsidian/60 border border-slateLine/60 inline-block" />
                  <span className="text-zinc-500">Sudah Terisi</span>
                </div>
              </div>
            </section>

            <aside className="lg:col-span-4 bg-white text-ink border border-sand rounded-lg p-6 shadow-ticket">
              <div className="border-b border-sand pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-velvet font-semibold">
                  Ringkasan Pemesanan
                </span>
                <h2 className="mt-1 font-display font-extrabold text-xl text-ink">
                  {movie?.judul || 'Pertunjukan'}
                </h2>
                <div className="mt-3 space-y-1.5 text-xs text-muted">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brass shrink-0" />
                    <span className="text-ink font-medium">
                      {showtime.studio?.nama} ({showtime.studio?.tipe})
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brass shrink-0" />
                    <span>{formatTanggalLengkap(showtime.waktuTayang)}</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-brass shrink-0" />
                    <span>{formatJam(showtime.waktuTayang)} WIB</span>
                  </p>
                </div>
              </div>

              <div className="py-5 border-b border-sand space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted uppercase tracking-wider font-semibold">
                    Kursi Dipilih ({selectedSeats.length})
                  </span>
                  <span className="font-mono text-muted">
                    @ {formatRupiah(hargaSatuan)}
                  </span>
                </div>

                {selectedSeats.length === 0 ? (
                  <p className="text-xs text-muted italic py-2">
                    Ketuk nomor kursi pada denah studio untuk memilih tempat duduk.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeats.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSeat(s)}
                        title="Klik untuk membatalkan kursi ini"
                        className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-velvet text-white hover:bg-velvet-hover transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="py-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Metode Pembayaran</span>
                  <span className="font-medium text-ink">Simulasi Internal</span>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-sm font-bold text-ink">Total Pembayaran</span>
                  <span className="font-mono font-extrabold text-2xl text-velvet">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting || selectedSeats.length === 0}
                onClick={handleCheckout}
                className="hidden lg:inline-flex w-full py-3.5 px-4 rounded bg-velvet hover:bg-velvet-hover disabled:opacity-45 disabled:pointer-events-none text-white text-sm font-semibold items-center justify-center gap-2 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Memproses E-Ticket...'
                    : isAuthenticated
                    ? 'Konfirmasi & Terbitkan Tiket'
                    : 'Masuk untuk Konfirmasi Kursi'}
                </span>
              </button>

              <div className="mt-4 flex items-start gap-2 text-[11px] text-muted">
                <ShieldCheck className="w-4 h-4 text-brass shrink-0 mt-0.5" />
                <span>
                  Kursi dikunci langsung di basis data saat konfirmasi dan menghasilkan kode e-ticket instan.
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>

      {showtime && (
        <div className="lg:hidden fixed bottom-14 md:bottom-0 inset-x-0 z-30 bg-charcoal/95 backdrop-blur-md border-t border-slateLine px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-zinc-400 truncate">
                {selectedSeats.length > 0
                  ? `Kursi: ${selectedSeats.join(', ')}`
                  : 'Belum ada kursi dipilih'}
              </p>
              <p className="font-mono font-bold text-base text-white">
                {formatRupiah(totalHarga)}
              </p>
            </div>
            <button
              type="button"
              disabled={submitting || selectedSeats.length === 0}
              onClick={handleCheckout}
              className="px-4 py-2.5 rounded bg-velvet hover:bg-velvet-hover disabled:opacity-45 text-white text-xs sm:text-sm font-semibold shrink-0"
            >
              {submitting
                ? 'Memproses...'
                : isAuthenticated
                ? 'Konfirmasi & Terbitkan Tiket'
                : 'Masuk & Pesan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
