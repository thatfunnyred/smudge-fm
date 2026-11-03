

export interface ControlsProps{
    id?: string;
    className?: string;
    OnClick?: () => void;
}

function Play({ id = "play-btn", className = "play-btn", OnClick }: ControlsProps) {
    return ( 
      <div id={id} className={className} onClick={OnClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="84" height="84" role="img" aria-label="Play">
            <defs>
                <filter id="crayon-blob">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
                </filter>
            </defs>
            <g filter="url(#crayon-blob)">
                <path transform="translate(5 5)" fill="#1a1815" d="M44 3C64 1 83 18 82 42C81 66 62 83 40 81C18 79 2 62 3 40C4 18 24 5 44 3Z"/>
                <path fill="#d53e0f" d="M44 3C64 1 83 18 82 42C81 66 62 83 40 81C18 79 2 62 3 40C4 18 24 5 44 3Z"/>
                <path transform="translate(26 26) scale(1.333)" fill="#faf6ec" d="M7 4l13 8-13 8z"/>
            </g>
        </svg>
      </div>
    );
}

function Pause({ id = "pause-btn", className = "pause-btn", OnClick }: ControlsProps) {
    return ( 
      <div id={id} className={className} onClick={OnClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="84" height="84" role="img" aria-label="Pause">
            <defs>
                <filter id="crayon-blob">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>
                </filter>
            </defs>
            <g filter="url(#crayon-blob)">
                <path transform="translate(5 5)" fill="#1a1815" d="M44 3C64 1 83 18 82 42C81 66 62 83 40 81C18 79 2 62 3 40C4 18 24 5 44 3Z"/>
                <path fill="#d53e0f" d="M44 3C64 1 83 18 82 42C81 66 62 83 40 81C18 79 2 62 3 40C4 18 24 5 44 3Z"/>
                <path transform="translate(26 26) scale(1.333)" d="M8 5v14M16 5v14" fill="none" stroke="#faf6ec" strokeWidth="3.5" strokeLinecap="round"/>
            </g>
        </svg>
      </div>
    );
}

function Next({ id = "next-btn", className = "next-btn", OnClick }: ControlsProps) {
    return ( 
      <div id={id} className={className} onClick={OnClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" role="img" aria-label="Next">
            <defs>
                <filter id="crayon-icon">
                <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="3" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1"/>
                </filter>
            </defs>
            <g filter="url(#crayon-icon)" fillOpacity="0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 5v14M5 5l9 7-9 7z"/>
            </g>
        </svg>
      </div>
    );
}

function Previous({ id = "previous-btn", className = "previous-btn", OnClick }: ControlsProps) {
    return ( 
      <div id={id} className={className} onClick={OnClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" role="img" aria-label="Previous">
            <defs>
                <filter id="crayon-icon">
                <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="3" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1"/>
                </filter>
            </defs>
            <g filter="url(#crayon-icon)" fillOpacity="0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 5v14M19 5l-9 7 9 7z"/>
            </g>
        </svg>
      </div>
    );
}

function Like({ id = "like-btn", className = "like-btn", OnClick }: ControlsProps) {
    return ( 
      <div id={id} className={className} onClick={OnClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" role="img" aria-label="Like" style={{ color: "#d53e0f" }}>
            <defs>
                <filter id="crayon-icon">
                <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="3" result="n"/>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="1"/>
                </filter>
            </defs>
            <g filter="url(#crayon-icon)" fill="currentColor" fillOpacity="0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>
            </g>
        </svg>
      </div>
    );
}

function Mode({ id = "mode-btn", className = "mode-btn", OnClick }: ControlsProps) {
    return ( 
      <div id={id} className={className} onClick={OnClick}>
        
      </div>
    );
}

export { Play, Pause, Next, Previous, Like, Mode };
