import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Film,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { formatJam, formatRupiah, formatTanggalPendek } from '../utils/format';

const GENRE_OPTIONS = ['Semua', 'Action', 'Drama', 'Sci-Fi', 'Horor', 'Animasi'];

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Program' },
  { value: 'now_showing', label: 'Now Showing' },
  { value: 'coming_soon', label: 'Coming Soon' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Terbaru Ditambahkan' },
  { value: 'judul', label: 'Judul (A - Z)' },
  { value: '-judul', label: 'Judul (Z - A)' },
  { value: '-durasi', label: 'Durasi Terpanjang' },
  { value: 'durasi', label: 'Durasi Terpendek' },
  { value: 'ratingUsia', label: 'Klasifikasi Usia' },
];

export default function MoviesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('now_showing');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const limit = 8;

  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showtimesByMovie, setShowtimesByMovie] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeMovieModal, setActiveMovieModal] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {
        page,
        limit,
        sort: sortBy,
      };
      if (selectedGenre !== 'Semua') {
        params.genre = selectedGenre;
      }
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const [moviesRes, showtimesRes] = await Promise.all([
        apiRequest('/movies', { params }),
        apiRequest('/showtimes', {
          params: { sort: 'waktuTayang', limit: 50 },
        }),
      ]);

      setMovies(moviesRes.data || []);
      setTotal(moviesRes.total || 0);
      setTotalPages(Math.max(1, moviesRes.totalPages || 1));

      const grouped = {};
      (showtimesRes.data || []).forEach((st) => {
        const mId =
          st.movieId && typeof st.movieId === 'object' ? st.movieId._id : st.movieId;
        if (!mId) return;
        if (!grouped[mId]) grouped[mId] = [];
        grouped[mId].push(st);
      });
      setShowtimesByMovie(grouped);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat katalog film dari peladen.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, selectedGenre, selectedStatus, debouncedSearch]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  const handleStatusChange = (statusVal) => {
    setSelectedStatus(statusVal);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const list = [];
    for (let i = 1; i <= totalPages; i += 1) {
      list.push(i);
    }
    return list;
  }, [totalPages]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-14">
      <section className="border-b border-sand pb-6 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-velvet font-semibold">
            Program Kurasi Layar Lebar
          </span>
          <h1 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Katalog Film & Jadwal Tayang
          </h1>
          <p className="mt-1.5 text-sm text-muted max-w-2xl">
            Pilih jam pertunjukan pada kartu film untuk membuka ruang pemilihan kursi studio secara langsung.
          </p>
        </div>

        <div className="inline-flex p-1 rounded bg-white border border-sand self-start md:self-auto">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                selectedStatus === opt.value
                  ? 'bg-velvet text-white'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul film (misal: Dune, Sore, Bukit Duri)..."
              className="w-full pl-10 pr-9 py-2.5 rounded bg-white border border-sand text-sm text-ink placeholder:text-muted/65 focus:outline-none focus:border-velvet transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white border border-sand rounded px-3 py-2 sm:w-64">
            <SlidersHorizontal className="w-4 h-4 text-brass shrink-0" />
            <select
              aria-label="Urutkan film"
              value={sortBy}
              onChange={handleSortChange}
              className="w-full bg-transparent text-sm text-ink font-medium focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {GENRE_OPTIONS.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreChange(genre)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                    active
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-muted border-sand hover:border-ink hover:text-ink'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>

          <span className="hidden md:inline-block font-mono text-xs text-muted shrink-0">
            Menampilkan {movies.length} dari {total} film
          </span>
        </div>
      </section>

      {errorMsg && (
        <div className="mb-6 p-4 rounded bg-velvet-soft border border-velvet/30 text-velvet text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-sand rounded-lg overflow-hidden animate-pulse"
            >
              <div className="aspect-[2/3] bg-sand/60" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-sand/70 rounded w-3/4" />
                <div className="h-3 bg-sand/60 rounded w-1/2" />
                <div className="h-8 bg-sand/50 rounded w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-white border border-sand rounded-lg p-12 text-center">
          <Film className="w-10 h-10 text-muted mx-auto mb-3 stroke-[1.5]" />
          <h2 className="font-display font-bold text-lg text-ink">
            Tidak Ada Film yang Cocok
          </h2>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto">
            Coba sesuaikan kata kunci pencarian, kategori genre, atau filter status penayangan.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setSelectedGenre('Semua');
              setSelectedStatus('');
              setPage(1);
            }}
            className="mt-4 px-4 py-2 rounded bg-velvet text-white text-xs font-semibold hover:bg-velvet-hover transition-colors"
          >
            Atur Ulang Semua Filter
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {movies.map((movie) => {
            const movieShowtimes = showtimesByMovie[movie._id] || [];
            const studioGroups = movieShowtimes.reduce((acc, st) => {
              const namaStudio = st.studio?.nama || 'Studio';
              if (!acc[namaStudio]) acc[namaStudio] = [];
              acc[namaStudio].push(st);
              return acc;
            }, {});

            return (
              <article
                key={movie._id}
                className="bg-white border border-sand rounded-lg overflow-hidden shadow-editorial flex flex-col justify-between group hover:border-brass/60 transition-colors"
              >
                <div>
                  <div className="relative aspect-[2/3] bg-obsidian overflow-hidden border-b border-sand">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={`Poster ${movie.judul}`}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : null}

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-obsidian/90 text-white border border-white/15">
                        {movie.ratingUsia}
                      </span>
                      <span
                        className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                          movie.status === 'coming_soon'
                            ? 'bg-brass text-white'
                            : 'bg-velvet text-white'
                        }`}
                      >
                        {movie.status === 'coming_soon' ? 'Segera' : 'Tayang'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveMovieModal(movie)}
                      aria-label={`Detail sinopsis ${movie.judul}`}
                      className="absolute bottom-2.5 right-2.5 p-1.5 rounded bg-obsidian/85 text-zinc-200 hover:text-white border border-white/15 text-xs inline-flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Detail</span>
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
                      <span className="font-semibold text-brass uppercase tracking-wider truncate">
                        {movie.genre}
                      </span>
                      <span className="font-mono inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {movie.durasi}m
                      </span>
                    </div>

                    <h2 className="mt-1 font-display font-extrabold text-sm sm:text-base text-ink line-clamp-2 leading-snug">
                      {movie.judul}
                    </h2>

                    {movie.detailProduksi?.sutradara && (
                      <p className="mt-1 text-[11px] sm:text-xs text-muted truncate">
                        Sutradara: <span className="text-ink">{movie.detailProduksi.sutradara}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-3.5 sm:px-4 pb-4 pt-2 border-t border-sand/70 bg-ivory/40">
                  {Object.keys(studioGroups).length === 0 ? (
                    <p className="text-[11px] font-mono text-muted py-1.5">
                      Jadwal studio belum tersedia
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {Object.entries(studioGroups)
                        .slice(0, 2)
                        .map(([namaStudio, listSt]) => (
                          <div key={namaStudio}>
                            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mb-1">
                              <span className="font-semibold text-ink truncate">
                                {namaStudio}
                              </span>
                              <span className="font-mono text-muted">
                                {formatRupiah(listSt[0].harga)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {listSt.slice(0, 3).map((st) => (
                                <Link
                                  key={st._id}
                                  to={`/showtimes/${st._id}/seats`}
                                  title={`${formatTanggalPendek(st.waktuTayang)} · ${formatJam(
                                    st.waktuTayang
                                  )} WIB`}
                                  className="font-mono text-[11px] font-semibold px-2 py-1 rounded bg-white border border-sand text-ink hover:bg-velvet hover:text-white hover:border-velvet transition-colors"
                                >
                                  {formatJam(st.waktuTayang)}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && totalPages > 1 && (
        <nav
          aria-label="Navigasi halaman katalog"
          className="mt-10 pt-6 border-t border-sand flex items-center justify-between gap-4"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-white border border-sand text-xs sm:text-sm font-semibold text-ink hover:border-velvet disabled:opacity-45 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1.5">
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`w-9 h-9 rounded font-mono text-xs font-bold border transition-colors ${
                  num === page
                    ? 'bg-velvet text-white border-velvet'
                    : 'bg-white text-ink border-sand hover:border-ink'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-white border border-sand text-xs sm:text-sm font-semibold text-ink hover:border-velvet disabled:opacity-45 disabled:pointer-events-none"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}

      {activeMovieModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-sand rounded-lg max-w-xl w-full max-h-[88vh] overflow-y-auto shadow-ticket">
            <div className="p-5 sm:p-6 border-b border-sand flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-velvet text-white font-semibold">
                    {activeMovieModal.ratingUsia}
                  </span>
                  <span className="text-brass font-semibold uppercase">
                    {activeMovieModal.genre}
                  </span>
                  <span className="text-muted">{activeMovieModal.durasi} menit</span>
                </div>
                <h3 className="mt-2 font-display font-extrabold text-xl sm:text-2xl text-ink">
                  {activeMovieModal.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveMovieModal(null)}
                className="p-1.5 rounded border border-sand text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                  Sinopsis Cerita
                </h4>
                <p className="text-sm text-ink leading-relaxed">
                  {activeMovieModal.sinopsis}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5 rounded bg-ivory border border-sand text-xs">
                <div>
                  <span className="text-muted block">Sutradara</span>
                  <span className="font-semibold text-ink">
                    {activeMovieModal.detailProduksi?.sutradara || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Bahasa</span>
                  <span className="font-semibold text-ink">
                    {activeMovieModal.detailProduksi?.bahasa || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Tahun Rilis</span>
                  <span className="font-mono font-semibold text-ink">
                    {activeMovieModal.detailProduksi?.tahunRilis || '-'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted mb-2.5">
                  Pilih Sesi Pertunjukan
                </h4>
                {(showtimesByMovie[activeMovieModal._id] || []).length === 0 ? (
                  <p className="text-xs text-muted">
                    Belum ada sesi jadwal tayang untuk film ini.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(showtimesByMovie[activeMovieModal._id] || []).map((st) => {
                      const sisa =
                        (st.studio?.kapasitas || 48) - (st.bookedSeats?.length || 0);
                      return (
                        <Link
                          key={st._id}
                          to={`/showtimes/${st._id}/seats`}
                          onClick={() => setActiveMovieModal(null)}
                          className="p-3 rounded border border-sand hover:border-velvet bg-ivory/40 hover:bg-velvet-soft/40 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-ink">
                              {st.studio?.nama} ({st.studio?.tipe})
                            </p>
                            <p className="font-mono text-[11px] text-muted mt-0.5">
                              {formatTanggalPendek(st.waktuTayang)} ·{' '}
                              {formatJam(st.waktuTayang)} WIB
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-velvet block">
                              {formatRupiah(st.harga)}
                            </span>
                            <span className="font-mono text-[10px] text-muted">
                              Sisa {sisa} kursi
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
