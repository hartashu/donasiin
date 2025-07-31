// src/components/home/WaveSeparator.tsx

export default function WaveSeparator() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full leading-[0]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
        <path
          fill="#ffffff" // Warna ini harus sama dengan section SETELAHNYA
          fillOpacity="1"
          d="M1440,64L1360,80C1280,96,1120,128,960,117.3C800,107,640,53,480,37.3C320,21,160,43,80,53.3L0,64L0,320L80,320C160,320,320,320,480,320C640,320,800,320,960,320C1120,320,1280,320,1360,320L1440,320Z"
        ></path>
      </svg>
    </div>
  );
}
