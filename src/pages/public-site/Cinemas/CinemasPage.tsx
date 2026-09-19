import React, { useState, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  Sparkles,
  Filter,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMovieStore } from "@/store/movieStore";
import { theaterService } from "@/services/theaterService";
import { getApiErrorMessage } from "@/services/apiClient";
import { DateSelector, DateItem } from "./components/DateSelector";
import { ShowtimeFilters } from "./components/ShowtimeFilters";
import { ShowtimeResults } from "./components/ShowtimeResults";
import { ShowtimeSkeleton } from "./components/ShowtimeSkeleton";
import { ShowtimeEmptyState } from "./components/ShowtimeEmptyState";

interface CinemaLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export const CinemasPage: React.FC = () => {
  const { movies, showtimes, loading, fetchCatalog } = useMovieStore();

  const [allTheaters, setAllTheaters] = useState<CinemaLocation[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<CinemaLocation | null>(null);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeframe, setTimeframe] = useState<"TODAY" | "THIS_WEEK">("TODAY");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("ALL");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Derive cinemas from showtimes as fallback
  const derivedCinemas = Array.from(
    new Map(
      showtimes.map((st) => [
        st.cinemaId,
        {
          id: st.cinemaId,
          name: st.cinemaName,
          address: "Central Cinema Hub",
          phone: "+855 23 999 888",
        },
      ]),
    ).values(),
  );

  const cinemasList = allTheaters.length > 0 ? allTheaters : derivedCinemas;

  // Initialize data from API
  const loadData = async () => {
    setFetchError(null);
    try {
      await fetchCatalog();
      const theaterData = await theaterService.list().catch(() => []);
      if (theaterData && theaterData.length > 0) {
        const mapped: CinemaLocation[] = theaterData.map((t) => ({
          id: `c-${t.id}`,
          name: t.name,
          address: t.address || "Main Cinema Complex",
          phone: t.phone || "+855 23 999 888",
        }));
        setAllTheaters(mapped);
      }
    } catch (err) {
      setFetchError(getApiErrorMessage(err, "showtimes"));
    }
  };

  useEffect(() => {
    void loadData();
  }, [fetchCatalog]);

  // Set default cinema once loaded
  useEffect(() => {
    if (!selectedCinema && cinemasList.length > 0) {
      setSelectedCinema(cinemasList[0]);
    }
  }, [cinemasList, selectedCinema]);

  // Generate date list with ONLY dates that have movies/showtimes for the selected cinema
  const [dateList, setDateList] = useState<DateItem[]>([]);

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;

    // Extract unique dates for showtimes at the selected cinema
    const cinemaShowtimes = showtimes.filter(
      (st) => !selectedCinema || st.cinemaId === selectedCinema.id,
    );

    const uniqueDates = Array.from(
      new Set(cinemaShowtimes.map((st) => st.date)),
    )
      .filter(Boolean)
      .sort();

    let list: DateItem[] = [];

    if (uniqueDates.length > 0) {
      list = uniqueDates.map((dateStr) => {
        const parts = dateStr.split("-").map(Number);
        const d =
          parts.length === 3
            ? new Date(parts[0], parts[1] - 1, parts[2])
            : new Date();
        return {
          dateStr,
          dayName: days[d.getDay()],
          dayNum: String(d.getDate()),
          monthName: months[d.getMonth()],
          isToday: dateStr === todayStr,
          hasShowtimes: true,
        };
      });
    } else {
      // Fallback: if no showtimes exist for this cinema, show today as placeholder
      const d = new Date();
      list = [
        {
          dateStr: todayStr,
          dayName: days[d.getDay()],
          dayNum: String(d.getDate()),
          monthName: months[d.getMonth()],
          isToday: true,
          hasShowtimes: false,
        },
      ];
    }

    setDateList(list);

    // Auto-select first date with showtimes if current selectedDate is not in the list
    if (
      list.length > 0 &&
      (!selectedDate || !list.some((item) => item.dateStr === selectedDate))
    ) {
      setSelectedDate(list[0].dateStr);
    }
  }, [showtimes, selectedCinema]);

  // Actions
  const handleSelectCinema = (cinema: CinemaLocation) => {
    setSelectedCinema(cinema);
    setLocationDropdownOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedFormat("ALL");
    setSelectedTimeFilter("ALL");
  };

  const handleTimeframeChange = (nextTimeframe: "TODAY" | "THIS_WEEK") => {
    setTimeframe(nextTimeframe);
    if (nextTimeframe === "TODAY" && dateList[0]) {
      setSelectedDate(dateList[0].dateStr);
    }
  };

  // Filter Showtimes
  const filteredShowtimes = showtimes.filter((st) => {
    // 1. Matches selected cinema
    if (selectedCinema && st.cinemaId !== selectedCinema.id) return false;

    // 2. Matches date
    if (st.date !== selectedDate) return false;

    // 3. Matches format filter
    if (selectedFormat !== "ALL") {
      const fmt = (st.format || "2D").toUpperCase();
      if (selectedFormat === "IMAX" && fmt !== "IMAX") return false;
      if (selectedFormat === "DOLBY" && fmt !== "DOLBY" && fmt !== "DOLBY ATMOS") return false;
      if (selectedFormat === "VIP" && fmt !== "VIP") return false;
      if (selectedFormat === "3D" && fmt !== "3D") return false;
      if (selectedFormat === "2D" && fmt !== "2D" && fmt !== "STANDARD") return false;
    }

    // 4. Matches time filter
    if (selectedTimeFilter !== "ALL") {
      let hour = 12;
      if (st.time && st.time.includes(":")) {
        hour = parseInt(st.time.split(":")[0], 10);
      }
      if (Number.isNaN(hour)) hour = 12;

      if (selectedTimeFilter === "MORNING" && hour >= 12) return false;
      if (selectedTimeFilter === "AFTERNOON" && (hour < 12 || hour >= 17)) return false;
      if (selectedTimeFilter === "EVENING" && hour < 17) return false;
    }

    return true;
  });

  // Group showtimes by Movie
  const showtimesByMovie: Record<string, typeof filteredShowtimes> = {};
  filteredShowtimes.forEach((st) => {
    if (!showtimesByMovie[st.movieId]) {
      showtimesByMovie[st.movieId] = [];
    }
    showtimesByMovie[st.movieId].push(st);
  });

  // Check next available date with showtimes
  const tomorrowItem = dateList.find((d) => d.hasShowtimes && d.dateStr > selectedDate);
  const tomorrowDateStr = tomorrowItem ? tomorrowItem.dateStr : undefined;

  const hasAnyShowtimeForCinemaAndDate = showtimes.some(
    (st) => (!selectedCinema || st.cinemaId === selectedCinema.id) && st.date === selectedDate,
  );

  const activeFiltersCount = (selectedFormat !== "ALL" ? 1 : 0) + (selectedTimeFilter !== "ALL" ? 1 : 0);

  return (
    <div className="pb-24 bg-background min-h-screen text-foreground selection:bg-[#E50914]">
      {/* Glassmorphic Hero Section */}
      <section className="relative w-full py-10 sm:py-14 overflow-hidden border-b border-border bg-gradient-to-b from-muted/70 to-transparent dark:from-zinc-900 dark:to-transparent">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80"
            alt="Cinema Background"
            className="w-full h-full object-cover object-center opacity-10 filter grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                SHOWTIMES & TICKETS
              </span>
            </div>

            {/* Cinema Location Title Selector */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-3 text-3xl sm:text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tight text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded-lg cursor-pointer group"
              >
                <span>{selectedCinema ? selectedCinema.name : "Select Cinema"}</span>
                <ChevronDown className="w-7 h-7 sm:w-8 sm:h-8 text-[#E50914] group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>

              <AnimatePresence>
                {locationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setLocationDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-3 w-80 sm:w-96 rounded-2xl bg-popover border border-border p-2 shadow-2xl z-30 origin-top-left"
                    >
                      <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border mb-1 flex items-center justify-between">
                        <span>Choose Cinema Location</span>
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      {cinemasList.map((cinema) => (
                        <button
                          key={cinema.id}
                          type="button"
                          onClick={() => handleSelectCinema(cinema)}
                          className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-0.5 hover:bg-muted cursor-pointer ${
                            selectedCinema?.id === cinema.id
                              ? "bg-[#E50914]/10 text-foreground border border-[#E50914]/30"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-sm font-bold text-foreground">
                            {cinema.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {cinema.address}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Address */}
            {selectedCinema && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 text-[#E50914] shrink-0" />
                <span className="font-semibold">{selectedCinema.address}</span>
                {selectedCinema.phone && (
                  <>
                    <span>•</span>
                    <span>{selectedCinema.phone}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Timeframe Toggle */}
          <div className="flex bg-muted/80 border border-border p-1 rounded-xl shadow-inner max-w-xs shrink-0 self-start md:self-end relative overflow-hidden">
            <button
              type="button"
              onClick={() => handleTimeframeChange("TODAY")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative z-10 cursor-pointer ${
                timeframe === "TODAY" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {timeframe === "TODAY" && (
                <motion.div
                  layoutId="activeTimeframe"
                  className="absolute inset-0 bg-[#E50914] rounded-lg shadow-md shadow-[#E50914]/30 z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">Today</span>
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange("THIS_WEEK")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative z-10 cursor-pointer ${
                timeframe === "THIS_WEEK" ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {timeframe === "THIS_WEEK" && (
                <motion.div
                  layoutId="activeTimeframe"
                  className="absolute inset-0 bg-[#E50914] rounded-lg shadow-md shadow-[#E50914]/30 z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">This Week</span>
            </button>
          </div>
        </div>
      </section>

      {/* Date Picker Carousel */}
      <DateSelector
        dateList={dateList}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      {/* Main Content Layout */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Mobile Filter Trigger Bar */}
        <div className="lg:hidden flex items-center justify-between mb-4 bg-card border border-border rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#E50914]" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-[#E50914] hover:underline uppercase"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="px-3 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              {mobileFilterOpen ? "Hide" : "Filter"}
            </button>
          </div>
        </div>

        {/* Mobile Filter Collapsible */}
        {mobileFilterOpen && (
          <div className="lg:hidden mb-6">
            <ShowtimeFilters
              selectedFormat={selectedFormat}
              selectedTimeFilter={selectedTimeFilter}
              onSelectFormat={(fmt) => {
                setSelectedFormat(fmt);
                setMobileFilterOpen(false);
              }}
              onSelectTimeFilter={(tf) => {
                setSelectedTimeFilter(tf);
                setMobileFilterOpen(false);
              }}
              onClearFilters={() => {
                handleClearFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        )}

        {/* Desktop 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <ShowtimeFilters
              selectedFormat={selectedFormat}
              selectedTimeFilter={selectedTimeFilter}
              onSelectFormat={setSelectedFormat}
              onSelectTimeFilter={setSelectedTimeFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results Area */}
          <div className="w-full flex-1">
            {loading ? (
              <ShowtimeSkeleton />
            ) : fetchError ? (
              <ShowtimeEmptyState
                type="ERROR"
                cinemaName={selectedCinema?.name || "Cinema"}
                selectedDate={selectedDate}
                errorMessage={fetchError}
                onResetFilters={handleClearFilters}
                onRetry={loadData}
              />
            ) : Object.keys(showtimesByMovie).length > 0 ? (
              <ShowtimeResults
                showtimesByMovie={showtimesByMovie}
                movies={movies}
              />
            ) : !hasAnyShowtimeForCinemaAndDate ? (
              <ShowtimeEmptyState
                type="NO_SHOWTIMES"
                cinemaName={selectedCinema?.name || "Selected Cinema"}
                selectedDate={selectedDate}
                tomorrowDateStr={tomorrowDateStr}
                onResetFilters={handleClearFilters}
                onSelectTomorrow={(nextDate) => setSelectedDate(nextDate)}
              />
            ) : (
              <ShowtimeEmptyState
                type="FILTER_EMPTY"
                cinemaName={selectedCinema?.name || "Selected Cinema"}
                selectedDate={selectedDate}
                onResetFilters={handleClearFilters}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
