import React, { useEffect, useRef, useState } from "react";
import vidiomuncul from "../assets/vidiomuncul.mp4"; // sesuaikan nama file

const SplashVideo = ({ once = true }) => {
  const videoRef = useRef(null);
  const [open, setOpen] = useState(true);

  // kalau mau muncul sekali saja (tidak muncul lagi setelah refresh/kunjungan berikutnya)
  useEffect(() => {
    if (!once) return;

    const key = "splash_video_seen";
    const seen = localStorage.getItem(key);

    if (seen === "1") {
      setOpen(false);
      return;
    }

    // tandai sudah pernah lihat
    localStorage.setItem(key, "1");
  }, [once]);

  // tutup kalau video selesai
  const handleEnded = () => setOpen(false);

  // opsi: klik di mana saja untuk skip
  const handleSkip = () => setOpen(false);

  // pastikan autoplay (kadang perlu play manual setelah mount)
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // kalau autoplay keblokir, user bisa klik "Lewati"
      }
    };
    tryPlay();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <button
        type="button"
        onClick={handleSkip}
        className="absolute inset-0 cursor-pointer"
        aria-label="Skip intro"
      />

      <video
        ref={videoRef}
        src={vidiomuncul}
        className="h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
      />

      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition"
        >
          Lewati
        </button>
      </div>
    </div>
  );
};

export default SplashVideo;