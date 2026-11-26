import React, { useCallback, useEffect, useState } from 'react';
import {
  Film,
  CalendarClock,
  Ticket,
  Users,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  formatJam,
  formatRupiah,
  formatTanggalLengkap,
  toDatetimeLocalInput,
} from '../utils/format';

const EMPTY_MOVIE_FORM = {
  judul: '',
  sinopsis: '',
  genre: 'Drama',
  durasi: 120,
  ratingUsia: '13+',
  posterUrl: '',
  status: 'now_showing',
  sutradara: '',
  bahasa: 'Indonesia',
  tahunRilis: 2026,
};

const EMPTY_SHOWTIME_FORM = {
  movieId: '',
  waktuTayang: '',
  harga: 50000,
  studioNama: 'Studio 1',
  studioTipe: 'Reguler',
  studioKapasitas: 48,
};

const STUDIO_PRESETS = [
  { nama: 'Studio 1', tipe: 'Reguler', kapasitas: 48 },
  { nama: 'Studio 2 Premiere', tipe: 'Premiere', kapasitas: 48 },
  { nama: 'Studio 3 IMAX', tipe: 'IMAX', kapasitas: 48 },
];

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');

  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieForm, setMovieForm] = useState(EMPTY_MOVIE_FORM);

  const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
  const [editingShowtimeId, setEditingShowtimeId] = useState(null);
  const [showtimeForm, setShowtimeForm] = useState(EMPTY_SHOWTIME_FORM);

  const [saving, setSaving] = useState(false);

  const notifySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const loadAllAdminData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [mRes, sRes, bRes, uRes] = await Promise.all([
        apiRequest('/movies', { params: { limit: 50, sort: '-createdAt' } }),
        apiRequest('/showtimes', { params: { limit: 50, sort: 'waktuTayang' } }),
        apiRequest('/bookings', { params: { limit: 50, sort: '-createdAt' } }),
        apiRequest('/users', { params: { limit: 50 } }),
      ]);
      setMovies(mRes.data || []);
      setShowtimes(sRes.data || []);
      setBookings(bRes.data || []);
      setUsers(uRes.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat data panel pengelola.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const openAddMovie = () => {
    setEditingMovieId(null);
    setMovieForm(EMPTY_MOVIE_FORM);
    setMovieModalOpen(true);
  };

  const openEditMovie = (m) => {
    setEditingMovieId(m._id);
    setMovieForm({
      judul: m.judul || '',
      sinopsis: m.sinopsis || '',
      genre: m.genre || 'Drama',
      durasi: m.durasi || 120,
      ratingUsia: m.ratingUsia || '13+',
      posterUrl: m.posterUrl || '',
      status: m.status || 'now_showing',
      sutradara: m.detailProduksi?.sutradara || '',
      bahasa: m.detailProduksi?.bahasa || 'Indonesia',
      tahunRilis: m.detailProduksi?.tahunRilis || 2026,
    });
    setMovieModalOpen(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        judul: movieForm.judul.trim(),
        sinopsis: movieForm.sinopsis.trim(),
        genre: movieForm.genre,
        durasi: Number(movieForm.durasi),
        ratingUsia: movieForm.ratingUsia,
        posterUrl: movieForm.posterUrl.trim(),
        status: movieForm.status,
        detailProduksi: {
          sutradara: movieForm.sutradara.trim(),
          bahasa: movieForm.bahasa.trim(),
          tahunRilis: Number(movieForm.tahunRilis) || 2026,
        },
      };

      if (editingMovieId) {
        await apiRequest(`/movies/${editingMovieId}`, {
          method: 'PUT',
          body: payload,
        });
        notifySuccess('Data film berhasil diperbarui.');
      } else {
        await apiRequest('/movies', {
          method: 'POST',
          body: payload,
        });
        notifySuccess('Film baru berhasil ditambahkan ke katalog.');
      }

      setMovieModalOpen(false);
      await loadAllAdminData();
    } catch (err) {
      setErrorMsg(
        err.detail ? `${err.message}: ${err.detail.join(', ')}` : err.message
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovie = async (movie) => {
    if (!window.confirm(`Hapus film "${movie.judul}" dari basis data?`)) return;
    setErrorMsg('');
    try {
      await apiRequest(`/movies/${movie._id}`, { method: 'DELETE' });
      notifySuccess(`Film "${movie.judul}" berhasil dihapus.`);
      await loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menghapus film.');
    }
  };

  const openAddShowtime = () => {
    setEditingShowtimeId(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0);

    setShowtimeForm({
      ...EMPTY_SHOWTIME_FORM,
      movieId: movies[0]?._id || '',
      waktuTayang: toDatetimeLocalInput(tomorrow.toISOString()),
    });
    setShowtimeModalOpen(true);
  };

  const openEditShowtime = (st) => {
    const mId =
      st.movieId && typeof st.movieId === 'object' ? st.movieId._id : st.movieId;
    setEditingShowtimeId(st._id);
    setShowtimeForm({
      movieId: mId || '',
      waktuTayang: toDatetimeLocalInput(st.waktuTayang),
      harga: st.harga || 50000,
      studioNama: st.studio?.nama || 'Studio 1',
      studioTipe: st.studio?.tipe || 'Reguler',
      studioKapasitas: st.studio?.kapasitas || 48,
    });
    setShowtimeModalOpen(true);
  };

  const handleSaveShowtime = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        movieId: showtimeForm.movieId,
        waktuTayang: new Date(showtimeForm.waktuTayang).toISOString(),
        harga: Number(showtimeForm.harga),
        studio: {
          nama: showtimeForm.studioNama.trim(),
          tipe: showtimeForm.studioTipe.trim(),
          kapasitas: Number(showtimeForm.studioKapasitas) || 48,
        },
      };

      if (editingShowtimeId) {
        await apiRequest(`/showtimes/${editingShowtimeId}`, {
          method: 'PUT',
          body: payload,
        });
        notifySuccess('Jadwal tayang berhasil diperbarui.');
      } else {
        await apiRequest('/showtimes', {
          method: 'POST',
          body: payload,
        });
        notifySuccess('Jadwal tayang baru berhasil ditambahkan.');
      }

      setShowtimeModalOpen(false);
      await loadAllAdminData();
    } catch (err) {
      setErrorMsg(
        err.detail ? `${err.message}: ${err.detail.join(', ')}` : err.message
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShowtime = async (st) => {
    if (!window.confirm('Hapus sesi jadwal tayang ini secara permanen?')) return;
    setErrorMsg('');
    try {
      await apiRequest(`/showtimes/${st._id}`, { method: 'DELETE' });
      notifySuccess('Jadwal tayang berhasil dihapus.');
      await loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menghapus jadwal tayang.');
    }
  };

  const handleDeleteBooking = async (b) => {
    if (
      !window.confirm(
        `Hapus permanen transaksi ${b.bookingCode}? Kursi aktif akan ikut dilepas.`
      )
    ) {
      return;
    }
    setErrorMsg('');
    try {
      await apiRequest(`/bookings/${b._id}`, { method: 'DELETE' });
      notifySuccess(`Transaksi ${b.bookingCode} berhasil dihapus.`);
      await loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menghapus transaksi.');
    }
  };

  const handleToggleRole = async (u) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    setErrorMsg('');
    try {
      await apiRequest(`/users/${u._id}/role`, {
        method: 'PATCH',
        body: { role: nextRole },
      });
      notifySuccess(`Peran pengguna ${u.username} diubah menjadi ${nextRole}.`);
      await loadAllAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memperbarui peran pengguna.');
    }
  };

  const TABS = [
    { id: 'movies', label: 'Kelola Film', count: movies.length, icon: Film },
    {
      id: 'showtimes',
      label: 'Kelola Jadwal Tayang',
      count: showtimes.length,
      icon: CalendarClock,
    },
    {
      id: 'bookings',
      label: 'Semua Transaksi',
      count: bookings.length,
      icon: Ticket,
    },
    { id: 'users', label: 'Kelola Pengguna', count: users.length, icon: Users },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-14">
      <section className="border-b border-sand pb-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-velvet font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Ruang Kendali RBAC Admin</span>
          </span>
          <h1 className="mt-1 font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            Panel Manajemen Bioskop
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kelola katalog film, jadwal auditorium, seluruh transaksi tiket penonton, serta hak akses akun.
          </p>
        </div>

        {activeTab === 'movies' && (
          <button
            type="button"
            onClick={openAddMovie}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-velvet hover:bg-velvet-hover text-white text-xs sm:text-sm font-semibold self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Film Baru</span>
          </button>
        )}

        {activeTab === 'showtimes' && (
          <button
            type="button"
            onClick={openAddShowtime}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-velvet hover:bg-velvet-hover text-white text-xs sm:text-sm font-semibold self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Studio</span>
          </button>
        )}
      </section>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsg('');
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded border text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-obsidian text-white border-obsidian'
                  : 'bg-white text-muted border-sand hover:text-ink'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                  active ? 'bg-velvet text-white' : 'bg-ivory text-ink'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded bg-velvet-soft border border-velvet/30 text-velvet text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-sand rounded-lg p-12 text-center text-sm text-muted">
          Memuat data manajemen CinemaTix...
        </div>
      ) : (
        <>
          {activeTab === 'movies' && (
            <div className="bg-white border border-sand rounded-lg overflow-hidden shadow-editorial">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ivory border-b border-sand text-[11px] font-mono uppercase tracking-wider text-muted">
                    <tr>
                      <th className="py-3.5 px-4">Judul Film</th>
                      <th className="py-3.5 px-4">Genre</th>
                      <th className="py-3.5 px-4">Durasi / Usia</th>
                      <th className="py-3.5 px-4">Sutradara</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {movies.map((m) => (
                      <tr key={m._id} className="hover:bg-ivory/40">
                        <td className="py-3.5 px-4 font-display font-bold text-ink">
                          {m.judul}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-brass uppercase">
                          {m.genre}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {m.durasi}m · {m.ratingUsia}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted">
                          {m.detailProduksi?.sutradara || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                              m.status === 'now_showing'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-brass-soft text-brass border border-brass/30'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openEditMovie(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-sand text-xs font-semibold text-ink hover:border-ink"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMovie(m)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-velvet/30 text-xs font-semibold text-velvet hover:bg-velvet hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'showtimes' && (
            <div className="bg-white border border-sand rounded-lg overflow-hidden shadow-editorial">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ivory border-b border-sand text-[11px] font-mono uppercase tracking-wider text-muted">
                    <tr>
                      <th className="py-3.5 px-4">Film</th>
                      <th className="py-3.5 px-4">Studio</th>
                      <th className="py-3.5 px-4">Waktu Tayang</th>
                      <th className="py-3.5 px-4">Harga</th>
                      <th className="py-3.5 px-4">Terisi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {showtimes.map((st) => {
                      const m =
                        st.movieId && typeof st.movieId === 'object'
                          ? st.movieId
                          : null;
                      return (
                        <tr key={st._id} className="hover:bg-ivory/40">
                          <td className="py-3.5 px-4 font-display font-bold text-ink">
                            {m?.judul || 'Film Dihapus'}
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span className="font-semibold text-ink">
                              {st.studio?.nama}
                            </span>{' '}
                            <span className="text-muted">({st.studio?.tipe})</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {formatTanggalLengkap(st.waktuTayang)} ·{' '}
                            {formatJam(st.waktuTayang)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold">
                            {formatRupiah(st.harga)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            {st.bookedSeats?.length || 0}/{st.studio?.kapasitas || 48}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditShowtime(st)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-sand text-xs font-semibold text-ink hover:border-ink"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteShowtime(st)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-velvet/30 text-xs font-semibold text-velvet hover:bg-velvet hover:text-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white border border-sand rounded-lg overflow-hidden shadow-editorial">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ivory border-b border-sand text-[11px] font-mono uppercase tracking-wider text-muted">
                    <tr>
                      <th className="py-3.5 px-4">Kode Tiket</th>
                      <th className="py-3.5 px-4">Penonton</th>
                      <th className="py-3.5 px-4">Film & Studio</th>
                      <th className="py-3.5 px-4">Kursi</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {bookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-xs text-muted"
                        >
                          Belum ada transaksi pemesanan tiket tercatat.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const st =
                          b.showtimeId && typeof b.showtimeId === 'object'
                            ? b.showtimeId
                            : null;
                        const m =
                          st?.movieId && typeof st.movieId === 'object'
                            ? st.movieId
                            : null;
                        const pemesan =
                          b.userId && typeof b.userId === 'object'
                            ? b.userId
                            : null;

                        return (
                          <tr key={b._id} className="hover:bg-ivory/40">
                            <td className="py-3.5 px-4 font-mono text-xs font-bold text-ink">
                              {b.bookingCode}
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              <span className="font-semibold text-ink block">
                                {pemesan?.username || '-'}
                              </span>
                              <span className="text-muted">
                                {pemesan?.email || ''}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs">
                              <span className="font-semibold text-ink block">
                                {m?.judul || '-'}
                              </span>
                              <span className="text-muted">
                                {st?.studio?.nama || '-'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-velvet">
                              {(b.seats || []).join(', ')}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs font-semibold">
                              {formatRupiah(b.totalPrice)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                                  b.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-zinc-100 text-zinc-600 border border-zinc-300'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-velvet/30 text-xs font-semibold text-velvet hover:bg-velvet hover:text-white"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white border border-sand rounded-lg overflow-hidden shadow-editorial">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ivory border-b border-sand text-[11px] font-mono uppercase tracking-wider text-muted">
                    <tr>
                      <th className="py-3.5 px-4">Username</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Peran Aktif</th>
                      <th className="py-3.5 px-4">Terdaftar Pada</th>
                      <th className="py-3.5 px-4 text-right">Ubah Hak Akses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {users.map((u) => {
                      const isSelf =
                        String(u._id) === String(currentUser?.id || currentUser?._id);
                      return (
                        <tr key={u._id} className="hover:bg-ivory/40">
                          <td className="py-3.5 px-4 font-semibold text-ink">
                            {u.username}{' '}
                            {isSelf && (
                              <span className="font-mono text-[10px] text-muted">
                                (Anda)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-mono uppercase text-[11px] px-2 py-0.5 rounded font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-velvet text-white'
                                  : 'bg-ivory text-ink border border-sand'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted">
                            {formatTanggalLengkap(u.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => handleToggleRole(u)}
                              className="px-3 py-1.5 rounded border border-sand text-xs font-semibold text-ink hover:border-velvet hover:text-velvet disabled:opacity-40 disabled:pointer-events-none"
                            >
                              Jadikan {u.role === 'admin' ? 'User' : 'Admin'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {movieModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-sand rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-ticket">
            <div className="flex items-center justify-between pb-4 border-b border-sand">
              <h2 className="font-display font-extrabold text-lg text-ink">
                {editingMovieId ? 'Perbarui Data Film' : 'Tambah Film Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setMovieModalOpen(false)}
                className="text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="mt-4 space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Judul Film
                </label>
                <input
                  type="text"
                  required
                  value={movieForm.judul}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, judul: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Genre
                  </label>
                  <select
                    value={movieForm.genre}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, genre: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-sand bg-white focus:outline-none focus:border-velvet"
                  >
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Horor">Horor</option>
                    <option value="Animasi">Animasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movieForm.durasi}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, durasi: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-sand font-mono focus:outline-none focus:border-velvet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Rating Usia
                  </label>
                  <select
                    value={movieForm.ratingUsia}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, ratingUsia: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-sand bg-white focus:outline-none focus:border-velvet"
                  >
                    <option value="SU">SU</option>
                    <option value="13+">13+</option>
                    <option value="17+">17+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Status Penayangan
                  </label>
                  <select
                    value={movieForm.status}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-sand bg-white focus:outline-none focus:border-velvet"
                  >
                    <option value="now_showing">now_showing</option>
                    <option value="coming_soon">coming_soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  URL Poster Gambar
                </label>
                <input
                  type="url"
                  value={movieForm.posterUrl}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, posterUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Sutradara
                  </label>
                  <input
                    type="text"
                    value={movieForm.sutradara}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, sutradara: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Bahasa
                  </label>
                  <input
                    type="text"
                    value={movieForm.bahasa}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, bahasa: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Tahun Rilis
                  </label>
                  <input
                    type="number"
                    value={movieForm.tahunRilis}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, tahunRilis: e.target.value })
                    }
                    className="w-full px-2.5 py-2 rounded border border-sand font-mono focus:outline-none focus:border-velvet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Sinopsis Lengkap
                </label>
                <textarea
                  rows={3}
                  required
                  value={movieForm.sinopsis}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, sinopsis: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovieModalOpen(false)}
                  className="px-4 py-2 rounded border border-sand text-xs font-semibold text-ink"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-velvet hover:bg-velvet-hover text-white text-xs font-semibold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Film'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showtimeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-sand rounded-lg max-w-md w-full p-6 shadow-ticket">
            <div className="flex items-center justify-between pb-4 border-b border-sand">
              <h2 className="font-display font-extrabold text-lg text-ink">
                {editingShowtimeId ? 'Edit Jadwal Tayang' : 'Tambah Jadwal Studio'}
              </h2>
              <button
                type="button"
                onClick={() => setShowtimeModalOpen(false)}
                className="text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShowtime} className="mt-4 space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Pilih Film
                </label>
                <select
                  required
                  value={showtimeForm.movieId}
                  onChange={(e) =>
                    setShowtimeForm({ ...showtimeForm, movieId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-sand bg-white focus:outline-none focus:border-velvet"
                >
                  <option value="" disabled>
                    -- Pilih Judul Film --
                  </option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.judul} ({m.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted mb-1">
                  Preset Auditorium Studio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STUDIO_PRESETS.map((preset) => (
                    <button
                      key={preset.nama}
                      type="button"
                      onClick={() =>
                        setShowtimeForm({
                          ...showtimeForm,
                          studioNama: preset.nama,
                          studioTipe: preset.tipe,
                          studioKapasitas: preset.kapasitas,
                        })
                      }
                      className={`py-2 px-2 rounded border text-xs font-semibold ${
                        showtimeForm.studioNama === preset.nama
                          ? 'bg-obsidian text-white border-obsidian'
                          : 'bg-ivory text-ink border-sand'
                      }`}
                    >
                      {preset.tipe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Nama Studio
                  </label>
                  <input
                    type="text"
                    required
                    value={showtimeForm.studioNama}
                    onChange={(e) =>
                      setShowtimeForm({
                        ...showtimeForm,
                        studioNama: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Tipe Studio
                  </label>
                  <input
                    type="text"
                    required
                    value={showtimeForm.studioTipe}
                    onChange={(e) =>
                      setShowtimeForm({
                        ...showtimeForm,
                        studioTipe: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-sand focus:outline-none focus:border-velvet"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Waktu Tayang
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={showtimeForm.waktuTayang}
                    onChange={(e) =>
                      setShowtimeForm({
                        ...showtimeForm,
                        waktuTayang: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-sand font-mono text-xs focus:outline-none focus:border-velvet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted mb-1">
                    Harga Tiket (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={showtimeForm.harga}
                    onChange={(e) =>
                      setShowtimeForm({ ...showtimeForm, harga: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-sand font-mono focus:outline-none focus:border-velvet"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowtimeModalOpen(false)}
                  className="px-4 py-2 rounded border border-sand text-xs font-semibold text-ink"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-velvet hover:bg-velvet-hover text-white text-xs font-semibold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
