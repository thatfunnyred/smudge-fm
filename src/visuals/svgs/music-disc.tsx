export interface MusicDiscProps{
  id?: string;
  className?: string;
}

export default function MusicDisc({ id = "music-disc", className = "music-disc" }: MusicDiscProps) {
    return ( 
      <div id={id} className={className}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" role="img" aria-label="Crayon vinyl record with an orange label">
          <defs>
            <filter id="crayon">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
            </filter>
          </defs>
          <g filter="url(#crayon)">
            <circle cx="150" cy="150" r="144" fill="#1a1815"/>
            <circle cx="150" cy="150" r="118" fill="none" stroke="#5e0006" strokeWidth="4" strokeDasharray="90 14 40 10"/>
            <circle cx="150" cy="150" r="96" fill="none" stroke="#9b0f06" strokeWidth="4" strokeDasharray="60 12 110 8"/>
            <circle cx="150" cy="150" r="76" fill="none" stroke="#5e0006" strokeWidth="4" strokeDasharray="120 16"/>
            <path d="M60 90a110 110 0 0 1 70 -48" fill="none" stroke="#faf6ec" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="150" cy="150" r="52" fill="#d53e0f"/>
            <path d="M150 124l7 16h17l-14 10l5 17l-15-10l-15 10l5-17l-14-10h17z" fill="#ffe100"/>
            <circle cx="150" cy="150" r="7" fill="#faf6ec"/>
          </g>
        </svg>
      </div>
    );
}
