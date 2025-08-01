export default function WaveSeparatorFlipped() {
  return (
    <div className="bg-teal-600 relative">
      {/* Wave atas */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="w-full h-[100px] rotate-180"
      >
        <path
          fill="#F9FAFB"
          fillOpacity="1"
          className="drop-shadow-[0_4px_12px_rgba(34,197,94,0.4)]"
          d="M0,224L48,197.3C96,171,192,117,288,90.7C384,64,480,64,576,85.3C672,107,768,149,864,176C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Konten opsional di tengah */}
      {/* <div className="text-center py-10">Konten Tengah</div> */}

      {/* Wave bawah */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="w-full h-[100px]"
      >
        <path
          fill="#F9FAFB"
          fillOpacity="1"
          className="drop-shadow-[0_4px_12px_rgba(34,197,94,0.4)]"
          d="M0,224L48,197.3C96,171,192,117,288,90.7C384,64,480,64,576,85.3C672,107,768,149,864,176C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}
