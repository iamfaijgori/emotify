import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addFavouriteAPI, removeFavouriteAPI, getFavouritesAPI } from "../api/musicAPI";

// Simple in-memory cache so every heart icon doesn't re-fetch favourites
let favouritesCache = null;
let listeners = [];

function notifyListeners() {
  listeners.forEach((fn) => fn(favouritesCache));
}

export function useFavouritesCache() {
  const [favs, setFavs] = useState(favouritesCache || []);

  useEffect(() => {
    if (favouritesCache === null) {
      getFavouritesAPI()
        .then((res) => {
          favouritesCache = res.data.favourites || [];
          notifyListeners();
        })
        .catch(() => { favouritesCache = []; notifyListeners(); });
    }

    const listener = (val) => setFavs(val || []);
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  }, []);

  return favs;
}

export default function HeartButton({ song, size = 16 }) {
  const favs = useFavouritesCache();
  const isFav = favs.some((f) => f.id === song.id);

  const toggle = async (e) => {
    e.stopPropagation();
    try {
      if (isFav) {
        await removeFavouriteAPI(song.id);
        favouritesCache = favouritesCache.filter((f) => f.id !== song.id);
        toast.success("Removed from favourites");
      } else {
        await addFavouriteAPI(song);
        favouritesCache = [...(favouritesCache || []), song];
        toast.success("Added to favourites ❤️");
      }
      notifyListeners();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <span
      onClick={toggle}
      style={{
        fontSize: `${size}px`, cursor: "pointer",
        color: isFav ? "#FF6584" : "#555",
        transition: "all 0.2s ease",
        flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {isFav ? "❤️" : "🤍"}
    </span>
  );
}