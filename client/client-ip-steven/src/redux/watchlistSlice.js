import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../lib/http";

// Async thunks for API calls
export const fetchWatchlist = createAsyncThunk(
  "watchlist/fetchWatchlist",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/watchlist?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch watchlist"
      );
    }
  }
);

export const updateWatchlistStatus = createAsyncThunk(
  "watchlist/updateStatus",
  async ({ watchlistId, status }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `/watchlist/${watchlistId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      return { watchlistId, status };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  "watchlist/remove",
  async (watchlistId, { rejectWithValue }) => {
    try {
      await axios.delete(`/watchlist/${watchlistId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return watchlistId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from watchlist"
      );
    }
  }
);

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Toggle status locally for immediate UI feedback
    toggleStatus: (state, action) => {
      const { watchlistId, newStatus } = action.payload;
      const item = state.items.find((item) => item.id === watchlistId);
      if (item) {
        item.status = newStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        const watchlistData =
          action.payload.data?.watchlist ||
          action.payload.data ||
          action.payload.watchlist ||
          [];
        state.items = watchlistData;
        const paginationData = action.payload.data?.pagination ||
          action.payload.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: watchlistData.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        state.pagination = paginationData;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      // Update status
      .addCase(updateWatchlistStatus.fulfilled, (state, action) => {
        const { watchlistId, status } = action.payload;
        const item = state.items.find((item) => item.id === watchlistId);
        if (item) {
          item.status = status;
        }
      })
      .addCase(updateWatchlistStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove from watchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setCurrentPage, clearError, toggleStatus } =
  watchlistSlice.actions;
export default watchlistSlice.reducer;
