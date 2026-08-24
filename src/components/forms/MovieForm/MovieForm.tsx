import React, { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';

export interface MovieFormProps {
  initialMovie?: Movie | null;
  onSubmit: (data: Omit<Movie, 'id' | 'slug'>) => void;
  onCancel: () => void;
}

export const MovieForm: React.FC<MovieFormProps> = ({
  initialMovie,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [rating, setRating] = useState('8.5');
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [releaseDate, setReleaseDate] = useState('2026-08-20');
  const [genres, setGenres] = useState('Action, Sci-Fi');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [status, setStatus] = useState<Movie['status']>('NOW_SHOWING');
  const [price, setPrice] = useState('14.0');

  useEffect(() => {
    if (initialMovie) {
      setTitle(initialMovie.title);
      setDescription(initialMovie.description);
      setPosterUrl(initialMovie.posterUrl);
      setBackdropUrl(initialMovie.backdropUrl);
      setTrailerUrl(initialMovie.trailerUrl || '');
      setRating(String(initialMovie.rating));
      setDurationMinutes(String(initialMovie.durationMinutes));
      setReleaseDate(initialMovie.releaseDate);
      setGenres(initialMovie.genres.join(', '));
      setDirector(initialMovie.director);
      setCast(initialMovie.cast.join(', '));
      setStatus(initialMovie.status);
      setPrice(String(initialMovie.price));
    }
  }, [initialMovie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl,
      rating: parseFloat(rating) || 8.0,
      voteCount: initialMovie ? initialMovie.voteCount : 100,
      durationMinutes: parseInt(durationMinutes, 10) || 120,
      releaseDate,
      genres: genres.split(',').map((g) => g.trim()).filter(Boolean),
      director: director || 'Director Name',
      cast: cast.split(',').map((c) => c.trim()).filter(Boolean),
      status,
      price: parseFloat(price) || 12.0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Movie Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Inception"
          required
        />
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Movie['status'])}
            className="w-full bg-[#1e1e22] text-white text-sm rounded-lg border border-white/10 px-3.5 py-2.5 outline-none focus:border-[#E50914]"
          >
            <option value="NOW_SHOWING">Now Showing</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="FEATURED">Featured</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          Synopsis / Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Movie synopsis..."
          className="w-full bg-[#1e1e22] text-white text-sm rounded-lg border border-white/10 px-3.5 py-2.5 outline-none focus:border-[#E50914] placeholder:text-gray-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Rating (1 - 10)"
          type="number"
          step="0.1"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
        />
        <Input
          label="Duration (Minutes)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
        />
        <Input
          label="Base Price ($)"
          type="number"
          step="0.5"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Genres (comma separated)"
          value={genres}
          onChange={(e) => setGenres(e.target.value)}
          placeholder="Action, Sci-Fi, Adventure"
          required
        />
        <Input
          label="Release Date"
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Director"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          placeholder="Christopher Nolan"
        />
        <Input
          label="Cast (comma separated)"
          value={cast}
          onChange={(e) => setCast(e.target.value)}
          placeholder="Actor 1, Actor 2, Actor 3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Poster Image URL"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          placeholder="https://..."
        />
        <Input
          label="Backdrop Image URL"
          value={backdropUrl}
          onChange={(e) => setBackdropUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Input
        label="Trailer Embed URL (YouTube)"
        value={trailerUrl}
        onChange={(e) => setTrailerUrl(e.target.value)}
        placeholder="https://www.youtube.com/embed/..."
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-6 py-2 bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider"
        >
          {initialMovie ? 'Update Movie' : 'Save Movie'}
        </Button>
      </div>
    </form>
  );
};
