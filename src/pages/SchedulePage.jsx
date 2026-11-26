import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Search,
  SlidersHorizontal,
  Armchair,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { formatJam, formatRupiah, formatTanggalLengkap } from '../utils/format';

const GENRES = ['Semua', 'Action', 'Drama', 'Sci-Fi', 'Horor', 'Animasi'];
const STUDIOS = ['Semua', 'Studio 1', 'Studio 2 Premiere', 'Studio 3 IMAX'];

export default function SchedulePage() {
  const [judul, setJudul] = useState('');
  const [genre, setGenre] = useState('Semua');
  const [studio, setStudio] = useState('Semua');
  const [sort, setSort] = useState('waktuTayang');
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchShowtimes = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        sort,
        limit: 50,
      };
      if (genre !== 'Semua') params.genre = genre;
      if (studio !== 'Semua') params.studio = studio;
      if (judul.trim()) params.judul = judul.trim();

      const res = await apiRequest('/showtimes', { params });
      setShowtimes(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat jadwal studio.');
    } finally {
      setLoading(false);
    }
  }, [genre, studio, judul, sort]);

  useEffect(() => {
    const t = setTimeout(fetchShowtimes, 250);
    return () => clearTimeout(t);
  }, [fetchShowtimes]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-14">
      <section className="border-b border-sand pb-6 mb-6">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass font-semibold">
          Papan Informasi Auditorium
        </span>
        <h1 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
          Jadwal Lintas Studio
        </h1>
        <p className="mt-1.5 text-sm text-muted max-w-2xl">
          Pantau jam pertunjukan, harga tiket, serta sisa kapasitas kursi secara real-time di Studio 1 Reguler, Studio 2 Premiere, dan Studio 3 IMAX.
        </p>
      </section>

      <section className="bg-white border border-sand rounded-lg p-4 mb-8 space-y-4 shadow-editorial">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Saring jadwal berdasarkan judul film..."
              className="w-full pl-10 pr-3 py-2 rounded border border-sand bg-ivory/40 text-sm focus:outline-none focus:border-velvet"
            />
          </div>

          <select
            value={studio}
            onChange={(e) => setStudio(e.target.value)}
            aria-label="Pilih studio"
            className="px-3 py-2 rounded border border-sand bg-ivory/40 text-sm text-ink focus:outline-none focus:border-velvet"
          >
            {STUDIOS.map((st) => (
              <option key={st} value={st}>
                {st === 'Semua' ? 'Semua Auditorium Studio' : st}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2 rounded border border-sand bg-ivory/40">
            <SlidersHorizontal className="w-4 h-4 text-brass shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Urutkan jadwal"
              className="w-full bg-transparent text-sm text-ink focus:outline-none"
            >
              <option value="waktuTayang">Waktu Tayang Terdekat</option>
              <option value="harga">Harga Tiket Termurah</option>
              <option value="-harga">Harga Tiket Tertinggi</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors ${
                genre === g
                  ? 'bg-velvet text-white border-velvet'
                  : 'bg-ivory text-muted border-sand hover:text-ink'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {errorMsg && (
        <div className="mb-6 p-4 rounded bg-velvet-soft border border-velvet/30 text-velvet text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-white border border-sand animate-pulse"
            />
          ))}
        </div>
      ) : showtimes.length === 0 ? (
        <div className="bg-white border border-sand rounded-lg p-12 text-center">
          <CalendarClock className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
          <h2 className="font-display font-bold text-lg text-ink">
            Tidak Ada Sesi Pertunjukan
          </h2>
          <p className="text-sm text-muted mt-1">
            Belum ada jadwal tayang yang sesuai dengan filter studio atau genre Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {showtimes.map((st) => {
            const movie =
              st.movieId && typeof st.movieId === 'object' ? st.movieId : null;
            const kapasitas = st.studio?.kapasitas || 48;
            const terisi = st.bookedSeats?.length || 0;
            const sisa = Math.max(0, kapasitas - terisi);
            const habis = sisa === 0;

            return (
              <div
                key={st._id}
                className="bg-white border border-sand rounded-lg p-4 sm:p-5 shadow-editorial flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brass/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 sm:w-20 shrink-0 text-center p-2.5 rounded bg-obsidian text-white border border-slateLine">
                    <span className="font-mono font-bold text-base sm:text-lg block leading-none">
                      {formatJam(st.waktuTayang)}
                    </span>
                    <span className="font-mono text-[10px] text-brass uppercase mt-1 block">
                      WIB
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-brass-soft text-brass border border-brass/25">
                        {st.studio?.nama} · {st.studio?.tipe}
                      </span>
                      {movie && (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-ivory border border-sand text-ink">
                          {movie.ratingUsia} · {movie.genre}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-1.5 font-display font-extrabold text-base sm:text-lg text-ink">
                      {movie?.judul || 'Film Tidak Diketahui'}
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      {formatTanggalLengkap(st.waktuTayang)} · Durasi{' '}
                      <span className="font-mono">{movie?.durasi || '-'}m</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-sand/70">
                  <div className="sm:text-right">
                    <span className="font-mono font-bold text-base sm:text-lg text-ink block">
                      {formatRupiah(st.harga)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                      <Armchair className="w-3.5 h-3.5 text-brass" />
                      {habis ? 'Penuh' : `Tersedia ${sisa}/${kapasitas}`}
                    </span>
                  </div>

                  <Link
                    to={`/showtimes/${st._id}/seats`}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded text-xs sm:text-sm font-semibold transition-colors ${
                      habis
                        ? 'bg-zinc-200 text-zinc-500 pointer-events-none'
                        : 'bg-velvet hover:bg-velvet-hover text-white'
                    }`}
                  >
                    <span>{habis ? 'Habis' : 'Pilih Kursi'}</span>
                    {!habis && <ArrowRight className="w-4 h-4" />}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
