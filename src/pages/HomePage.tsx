import MusicDisc from "../visuals/svgs/music-disc";
import "../styles/home-style.css";
import Line from "../visuals/svgs/line";
import { Like, Mode, Next, Pause, Play, Previous } from "../visuals/svgs/controls";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { publish, subscribe } from "../utils/events";
import AddPlaylistPopUp from "../components/addplaylist";
import { addLikedSong, getUserLikedSongs, getUserSavedSongs, logout, removeLikedSong } from "../utils/firebase";
import { fetchAudioFromLocalStorage, formatDuration } from "../utils/utils";
import ConfirmMenuPopUp from "../components/confirmmenu";
import { NavLink } from "react-router-dom";

const PlaylistPopUp = lazy(() => import("../components/playlist"));

export default function HomePage() {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    let trackListRef = useRef<HTMLDivElement>(null);
    let trackItemsRef = useRef<HTMLDivElement>(null);

    const [currentTrack, setCurrentTrack] = useState<any>();
    const [optionMenuOpen, setOptionMenuOpen] = useState<boolean>();
    const lastTrackId = useRef<string | null>(null);

    const handlePlayPause = async (song: any = null) => {
        if(!currentTrack || !audioRef.current) return;

        const track = song != null ? song : currentTrack;

        const newPlaying = !isPlaying;
        setIsPlaying(newPlaying);

        const playBtn = document.getElementById("play-btn");
        const pauseBtn = document.getElementById("pause-btn");

        const musicDisc = document.getElementById("music-disc");

        const base64Audio: any = await fetchAudioFromLocalStorage(track.id);

        if (lastTrackId.current != track.id) {
            audioRef.current.pause();

            audioRef.current.src = base64Audio;
            audioRef.current.load();

            const previousTrackElement: any = document.getElementById(lastTrackId.current ?? "");
            previousTrackElement?.classList.remove("waving");

            lastTrackId.current = track.id;
        }

        const currentTrackElement: any = document.getElementById(track.id);

        if (newPlaying) {
            playBtn?.classList.add("hidden");
            pauseBtn?.classList.remove("hidden");

            musicDisc?.classList.add("spinning");

            audioRef.current.play();
            currentTrackElement?.classList.add("waving");
        }else{
            playBtn?.classList.remove("hidden");
            pauseBtn?.classList.add("hidden");
            
            musicDisc?.classList.remove("spinning");

            audioRef.current.pause();
            currentTrackElement?.classList.remove("waving");
        }

        return null;
    };

    const restartPlayingAudio = async (newSongId: string) => {
        if(!audioRef.current) return;

        const track = getUserSavedSongs().find((track: any) => track.id == newSongId);
        setCurrentTrack(track);

        audioRef.current.pause();

        const playBtn = document.getElementById("play-btn");
        const pauseBtn = document.getElementById("pause-btn");
        const musicDisc = document.getElementById("music-disc");

        const base64Audio: any = await fetchAudioFromLocalStorage(newSongId);

        if (lastTrackId.current != newSongId) {
            audioRef.current.src = base64Audio;
            audioRef.current.load();

            const previousTrackElement: any = document.getElementById(lastTrackId.current ?? "");
            previousTrackElement?.classList.remove("waving");

            lastTrackId.current = newSongId;
        }

        const currentTrackElement: any = document.getElementById(newSongId);

        playBtn?.classList.add("hidden");
        pauseBtn?.classList.remove("hidden");
        musicDisc?.classList.add("spinning");
        audioRef.current.play();
        currentTrackElement?.classList.add("waving");
    }

    const handleLike = () => {
        const isLiked = getUserLikedSongs().includes(currentTrack.id);
        const likeBtn = document.getElementById("like-btn");

        if(isLiked) {
            removeLikedSong(currentTrack.id);
        }else{
            addLikedSong(currentTrack.id);
        }

        likeBtn?.classList.toggle("liked");
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPlaying) return;

            const dt: any = audioRef.current?.currentTime;

            const currentTime = document.getElementById("current-time");
            const linePath = document.getElementById("line-path");

            if (currentTime && linePath) {
                currentTime.textContent = formatDuration(dt);

                linePath.style.width =
                    `${(dt / (audioRef.current?.duration ?? 0)) * 100}%`;
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
    
    const [PLAYLISTS, SETPLAYLISTS] = useState<any[]>([]);
    
    useEffect(() => {
        const assignPlaylists = async (playlists: any[]) => {
            const newPlaylists = [...playlists];
            SETPLAYLISTS(newPlaylists);

            const locallySelectedPlaylist = localStorage.getItem("selected-playlist");
            let playlist = newPlaylists.find((pl: any) => locallySelectedPlaylist == pl.id);
            playlist = playlist ? playlist : (newPlaylists.length > 0 ? newPlaylists[0] : null);

            if(playlist) {
                if(playlist.songIds.length >= 1) {
                    const track: any = getUserSavedSongs().find((song: any) => song.id == playlist.songIds[0]);
                    setCurrentTrack(track);
                    if(isPlaying) restartPlayingAudio(track.id);
                }else{
                    setCurrentTrack(null);
                    if(isPlaying) handlePlayPause();
                }
                
                setSelectedPlaylist(playlist);
            }
        };

        const unsubscribe = subscribe(
            "onplaylistupdate",
            assignPlaylists
        );

        return () => unsubscribe();
    }, [isPlaying]);

    const [playlistData, setPlaylistData] = useState<object | null>(null);
    const [playlistKey, setPlaylistKey] = useState<number>(0);

    const [addingPlaylist, setAddingPlaylist] = useState<boolean>(false);
    
    const handlePlaylistPopUp = (data: object | null, key: number) => {
        setPlaylistKey(key);
        setPlaylistData(data);
    };

    const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

    const handlePlaylistSelect = (playlist: any) => {
        const previousSelectedPlaylist = selectedPlaylist; 
        
        if(previousSelectedPlaylist)
        {
            if(playlist.id == previousSelectedPlaylist.id) return;
            const previousSelectedElement = document.getElementById(previousSelectedPlaylist.id);
            previousSelectedElement?.classList.toggle("selected-playlist");
        }
        
        setSelectedPlaylist(playlist);
        const selectedElement = document.getElementById(playlist.id);
        selectedElement?.classList.toggle("selected-playlist");
        
        localStorage.setItem("selected-playlist", playlist.id);
        publish("onplaylistupdate", PLAYLISTS);
    }

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleSongSelect = async (song: any) => {
        if(!audioRef.current) return;

        if(!currentTrack || currentTrack.id != song.id) setCurrentTrack(song);
        
        if(!isPlaying) handlePlayPause(song);

        if(lastTrackId.current != song.id && isPlaying) {
            restartPlayingAudio(song.id);
        }
    };

    const handleSongEnd = () => {
        const maxSongs = selectedPlaylist.songIds.length;

        let randomSongId = currentTrack.id;
        while(currentTrack.id == randomSongId) {
            const randomInt = generateRandomNumber(0, maxSongs);

            randomSongId = selectedPlaylist.songIds[randomInt];
        }
        
        restartPlayingAudio(randomSongId);
    }

    const generateRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min) + min);
    }

    useEffect(() => {
        const songTitle = document.getElementById("song-title");
        const songDuration = document.getElementById("total-time");
        const likeBtn = document.getElementById("like-btn");

        if(songTitle) songTitle.textContent = currentTrack ? (currentTrack.name.length > 20 ? currentTrack.name.slice(0, 20) + "..." : currentTrack.name) : "NAN";
        if(songDuration) songDuration.textContent = formatDuration(currentTrack ? currentTrack.duration : 0);

        const liked = getUserLikedSongs().includes(currentTrack ? currentTrack.id : "");
        if(liked) {
            likeBtn?.classList.add("liked");
        }else{
            likeBtn?.classList.remove("liked");
        }

    }, [currentTrack]);

    const handlePlaybackChange = (e: any) => {
        if(!audioRef.current) return;

        const currentValue = e.target.value / 100 * audioRef.current.duration;
        
        audioRef.current.currentTime = currentValue;

        const currentTime = document.getElementById("current-time");
        const linePath = document.getElementById("line-path");

            if (currentTime && linePath) {
                currentTime.textContent = formatDuration(currentValue);

                linePath.style.width =
                    `${(currentValue / (audioRef.current?.duration ?? 0)) * 100}%`;
            }
    }

    const handleLineInput = (event: string) => {
        switch (event) {
            case "mouse-down":
                if(isPlaying) audioRef.current?.pause();
                break;
            case "mouse-up":
                if(isPlaying) audioRef.current?.play();
                break;
        }
    }

    const [confirmMenu, setConfirmMenu] = useState<any>();
    const handleLogOut = () => {
        setConfirmMenu({
            title: "LOG OUT?",
            context: "Are you sure you want to log out of your account?",
            onConfirm: async () => {
                await logout();
                setOptionMenuOpen(false);
            },
            confirmBtn: "LOGOUT",
            cancelBtn: "STAY"
        });
    }

    return (
        <div className="home-page">
            {confirmMenu && (
                <Suspense fallback={null}>
                    <ConfirmMenuPopUp deleteTitle={confirmMenu.title} deleteContext={confirmMenu.context} confirmBtn={confirmMenu.confirmBtn} cancelBtn={confirmMenu.cancelBtn} onConfirm={confirmMenu.onConfirm} onClose={() => setConfirmMenu(null)} />
                </Suspense>
            )}

            <audio ref={audioRef} onEnded={handleSongEnd}></audio>
            
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
                            <div className={`playlist-item ${selectedPlaylist && selectedPlaylist.id == playlist.id ? "selected-playlist" : ""}`} id={playlist.id} key={index} onClick={() => handlePlaylistSelect(playlist)}>
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
                <NavLink id="title-btn" to={"/"}>
                    <img src="logo/smudge-fm-logo.svg" alt="Smudge FM" className="site-logo" />
                </NavLink>
                <h1 id="info-btn" onClick={() => setOptionMenuOpen(true)}>...</h1>
            </div>

            {optionMenuOpen && (<div id="options-container">
                <button id="options-close-btn" onClick={() => setOptionMenuOpen(false)}>X</button>
                <div id="profile-btn">PROFILE</div>
                <div id="settings-btn">SETTINGS</div>
                <div id="logout-btn" onClick={handleLogOut}>LOGOUT</div>
            </div>)}
            
            <MusicDisc/>

            <h1 id="song-title">NAN</h1>
            <h3 id="artist-name">Unkown Artist</h3>

            <Line>
                <input 
                    type="range" 
                    id="line-input"
                    min="0" 
                    max="100"
                    step="1"
                    onChange={handlePlaybackChange}
                    onPointerDown={() => handleLineInput("mouse-down")}
                    onPointerUp={() => handleLineInput("mouse-up")}
                    ></input>           
                <p id="current-time">0:00</p>
                <Line id="line-path" color="var(--track-color)"> </Line>
                <p id="total-time">0:00</p>
            </Line>

            <div id="song-controls">
                <Mode OnClick={handleMode} />
                <Previous />
                <Play OnClick={() => handlePlayPause()} />
                <Pause className="hidden pause-btn" OnClick={() => handlePlayPause()} />
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
                    {selectedPlaylist && selectedPlaylist.songIds.map((songId: string) => {
                        const savedSongs = getUserSavedSongs();
                        const song: any = savedSongs.find((song: any) => song.id === songId);

                        if (!song) return null;

                        return (
                            <div className="track-item" id={songId} key={songId} onClick={() => handleSongSelect(song)}>
                                <div className="track-item-cover">
                                    <div className="track-item-line-1"></div>
                                    <div className="track-item-line-2"></div>
                                    <div className="track-item-line-3"></div>
                                </div>

                                <div className="track-item-info-container">
                                    <h1 className="track-item-title">{song.name.length > 20
                                        ? song.name.slice(0, 20) + "..."
                                        : song.name}</h1>
                                    <h3 className="track-item-artist">{song.artist || "Unknown Artist"}</h3>
                                </div>

                                <p className="track-item-length">{formatDuration(song.duration)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}