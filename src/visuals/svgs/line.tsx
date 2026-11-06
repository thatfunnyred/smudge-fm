export interface LineProps {
    id?: string;
    className?: string;
    color?: string;
    children?: React.ReactNode;
}

export default function Line({ id = "line", className = "line", color = "#faf6ec", children }: LineProps) {
    return ( 
      <div id={id} className={className}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 24" width="400" height="24" role="img" aria-label="Rough hand-drawn line">
            <defs>
                <filter id="rough" x="-5%" y="-60%" width="110%" height="220%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="warp"/>
                <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" result="wobbly"/>
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="grain"/>
                <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.5 0 0 0 -0.6" result="speckle"/>
                <feComposite in="wobbly" in2="speckle" operator="in"/>
                </filter>
            </defs>

            <g fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#rough)">
                <path d="M6 13 L60 11 L118 14.5 L176 11.5 L238 14 L300 11 L360 13.5 L394 12" stroke="#faf6ec" strokeWidth="7"/>
                <path d="M10 12 L90 13.5 L170 10.5 L250 13 L330 11.5 L392 13" stroke={color} strokeWidth="3" opacity="0.7"/>
            </g>
        </svg>
        {children}
      </div>
    );
}
