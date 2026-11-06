import MusicDisc from "../visuals/svgs/music-disc";
import "../styles/home-style.css";
import Line from "../visuals/svgs/line";
import { Like, Mode, Next, Pause, Play, Previous } from "../visuals/svgs/controls";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { subscribe } from "../utils/events";
import AddPlaylistPopUp from "../components/addplaylist";

const PlaylistPopUp = lazy(() => import("../components/playlist"));

export default function HomePage() {

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    let isLiked: boolean = false;
    let trackListRef = useRef<HTMLDivElement>(null);
    let trackItemsRef = useRef<HTMLDivElement>(null);

    const handlePlayPause = () => {
        const newPlaying = !isPlaying;
        setIsPlaying(newPlaying);

        const playBtn = document.getElementById("play-btn");
        const pauseBtn = document.getElementById("pause-btn");

        const musicDisc = document.getElementById("music-disc");

        if (newPlaying) {
            playBtn?.classList.add("hidden");
            pauseBtn?.classList.remove("hidden");

            musicDisc?.classList.add("spinning");
        }else{
            playBtn?.classList.remove("hidden");
            pauseBtn?.classList.add("hidden");

            musicDisc?.classList.remove("spinning");
        }
    };

    const handleLike = () => {
        isLiked = !isLiked;
        const likeBtn = document.getElementById("like-btn");

        likeBtn?.classList.toggle("liked");
    };

    const dt = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPlaying) return;

            dt.current += 0.1;

            const currentTime = document.getElementById("current-time");
            const linePath = document.getElementById("line-path");

            if (currentTime && linePath) {
                const minutes = Math.floor(dt.current / 60);
                const seconds = Math.floor(dt.current % 60);

                currentTime.textContent =
                    `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

                linePath.style.width =
                    `${(dt.current / 103) * 100}%`;
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const isDragging = useRef(false);
    const lastY = useRef(0);

    const [bottom, setBottom] = useState(0);

    const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        isDragging.current = true;
        lastY.current = e.clientY;
        e.preventDefault();
    };

    const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current || 
            !e.currentTarget.hasPointerCapture(e.pointerId) || 
            !trackListRef.current || 
            !trackItemsRef.current
        ) return;

        const deltaY = e.clientY - lastY.current;
        lastY.current = e.clientY;

        setBottom(prev => Math.min(Math.max(prev - deltaY, -170), 250));

        trackListRef.current.style.transition = `none`;
        trackListRef.current.style.height = `${236 + bottom}px`;
        trackItemsRef.current.style.height = `${180 + Math.abs(bottom)}px`;
    };

    const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        isDragging.current = false;
    };

    const [currentMode, setCurrentMode] = useState(0);
    const modes = ["disc-mode", "lyrics-mode", "cover-mode"];

    const handleMode = () => {
        setCurrentMode((currentMode + 1) % modes.length);
        
        for(let i = 0; i < modes.length; i++) {
            const mode = document.getElementById(modes[i]);
            
            if(i == currentMode) {
                mode?.classList.remove("hidden");
            }else{
                mode?.classList.add("hidden");
            }
        }
    };

    const handlePullTracks = () => {
        if (!trackListRef.current || !trackItemsRef.current) return;

        trackListRef.current.style.transition = `all 0.5s ease`;
        
        let newBottom: number = bottom < 150 ? 250 : -170;
        setBottom(newBottom);

        trackListRef.current.style.height = `${236 + newBottom}px`;
        trackItemsRef.current.style.height = `${180 + Math.abs(newBottom)}px`;
    }

    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleTopDrawer = () => {
        setDrawerOpen(!drawerOpen);
    }

    const TRACKS = [
            {name: "test-song1", artist: "test-artist1", length: "1:00"}, 
            {name: "test-song2", artist: "test-artist2", length: "2:00"}, 
            {name: "test-song3", artist: "test-artist3", length: "3:00"}
        ];
    
    const [PLAYLISTS, SETPLAYLISTS] = useState<any[]>([]);
    
    useEffect(() => {
        const assignPlaylists = (playlists: any[]) => {
            SETPLAYLISTS([...playlists]);
        };

        const unsubscribe = subscribe(
            "onplaylistupdate",
            assignPlaylists
        );

        return () => unsubscribe();
    }, []);

    const [playlistData, setPlaylistData] = useState<object | null>(null);
    const [playlistKey, setPlaylistKey] = useState<number>(0);

    const [addingPlaylist, setAddingPlaylist] = useState<boolean>(false);
    
    const handlePlaylistPopUp = (data: object | null, key: number) => {
        setPlaylistKey(key);
        setPlaylistData(data);
    };

    return (
        <div className="home-page">
            
            {playlistData !== null && (
                <Suspense fallback={null}>
                    <PlaylistPopUp playlistData={playlistData} playlistKey={playlistKey} onClose={() => handlePlaylistPopUp(null, 0)} />
                </Suspense>
            )}
            
            {addingPlaylist && (
                <Suspense fallback={null}>
                    <AddPlaylistPopUp onClose={() => setAddingPlaylist(false)} />
                </Suspense>
            )}

            <div id="navigation-bar">
                <div id="top-drawer" style={{top: `${drawerOpen ?  "-4px" : "-254px"}`}}>
                    <div id="top-drawer-title-container">
                        <h1 id="top-drawer-title">Your playlists</h1>
                        <h1 id="top-drawer-count">{PLAYLISTS.length} playlists</h1>
                    </div>
                    
                    <div id="playlist-items">
                        {PLAYLISTS && PLAYLISTS.map((playlist: any, index: any) => (
                            <div className="playlist-item" key={index}>
                                <div className="playlist-right-container">
                                    <div className="playlist-item-icon"></div>
                                    <div className="playlist-info-container">
                                        <h1 className="playlist-item-name">{playlist.name}</h1>
                                        <h1 className="playlist-item-info">{playlist.songIds.length} {"songs "}</h1>
                                    </div>
                                </div>
                                <div className="playlist-edit-btn" onClick={() => handlePlaylistPopUp(playlist, index)}>···</div>
                            </div>
                        ))}
                        <div id="playlist-add-btn" onClick={() => setAddingPlaylist(true)}>+ Add Playlist</div>
                    </div>
                </div>

                <h1 id="drawer-btn" onClick={handleTopDrawer} style={{top: `${drawerOpen ? "250px" : "0px"}`}}>{drawerOpen ? "<" : ">"}</h1>
                <h1 id="title-btn">Smudge FM</h1>
                <h1 id="info-btn">...</h1>
            </div>
            
            <MusicDisc/>

            <h1 id="song-title">Some Song</h1>
            <h3 id="artist-name">Some Artist</h3>

            <Line>
                <p id="current-time">0:00</p>
                <Line id="line-path" color="var(--track-color)"> </Line>
                <p id="total-time">1:43</p>
            </Line>

            <div id="song-controls">
                <Mode OnClick={handleMode} />
                <Previous />
                <Play OnClick={handlePlayPause} />
                <Pause className="hidden pause-btn" OnClick={handlePlayPause} />
                <Next />
                <Like OnClick={handleLike} />
            </div>

            <div id="track-list" ref={trackListRef}>
                <div 
                    id="track-handle" 
                    style={{ touchAction: "none" }}
                    onPointerDown={onHandlePointerDown}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}
                    >
                        <div id="handle"></div>
                    </div>
                <h1 id="track-list-title">UP NEXT</h1>
                <div id="pull-tracks-btn" onClick={handlePullTracks} style={{rotate: `${bottom > 150 ? 90 : -90}deg`}}>{">"}</div>

                <div id="track-fade-1"></div>
                <div id="track-fade-2"></div>

                <div id="track-items" ref={trackItemsRef}>
                    {TRACKS.map((track, index) => (
                        <div className="track-item" key={index}>
                            <div className="track-item-cover"></div>
                            <div className="track-item-info-container">
                                <h1 className="track-item-title">{track.name}</h1>
                                <h3 className="track-item-artist">{track.artist}</h3>
                            </div>
                            <p className="track-item-length">{track.length}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}