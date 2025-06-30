"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect, useRef, useState } from "react";
import { setTheme, toggleTheme } from "../redux/sliceses/themeSlice";

export default function ThemeEffect() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();

  // İlk açılışta localStorage'dan temayı Redux'a yükle
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      dispatch(setTheme(stored));
    }
  }, [dispatch]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  return null;
}

function getDefaultPosition() {
  if (typeof window !== "undefined") {
    if (window.innerWidth >= 1024) {
      // Desktop: top left
      return { x: 24, y: 48 };
    } else {
      // Mobile/tablet: bottom right
      return { x: window.innerWidth - 80, y: window.innerHeight - 120 };
    }
  }
  return { x: 24, y: 48 };
}

export function ThemeFAB() {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const dispatch = useDispatch();
  const [position, setPosition] = useState(getDefaultPosition());
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // Load position from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-fab-pos");
      if (saved) {
        try {
          const pos = JSON.parse(saved);
          if (typeof pos.x === "number" && typeof pos.y === "number") {
            setPosition(pos);
          }
        } catch {}
      }
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-fab-pos", JSON.stringify(position));
    }
  }, [position]);

  // Drag logic
  function onMouseDown(e: React.MouseEvent) {
    setDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }
  function onMouseMove(e: MouseEvent) {
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 56, e.clientX - offset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 56, e.clientY - offset.current.y)),
    });
  }
  function onMouseUp() {
    setDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }
  // Touch events for mobile
  function onTouchStart(e: React.TouchEvent) {
    setDragging(true);
    const touch = e.touches[0];
    offset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
  }
  function onTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 56, touch.clientX - offset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 56, touch.clientY - offset.current.y)),
    });
  }
  function onTouchEnd() {
    setDragging(false);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  }

  return (
    <button
      onClick={() => !dragging && dispatch(toggleTheme())}
      aria-label="Tema değiştir"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 50,
        width: 56,
        height: 56,
        borderRadius: 9999,
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
        border: theme === "dark" ? "1px solid #334155" : "1px solid #e5e7eb",
        background: theme === "dark" ? "#1e293b" : "#fff",
        color: theme === "dark" ? "#fde047" : "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.2s, color 0.2s",
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: 28 }}>{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
} 