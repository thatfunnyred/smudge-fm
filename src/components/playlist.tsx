import "../styles/playlist-style.css"
import { addSongToPlaylist, editPlaylistName, getUserSavedSongs, removePlaylist, removeSongFromPlaylist } from "../utils/firebase";
import { formatDuration, removeExtension } from "../utils/utils";

export interface PlaylistProps {
    playlistData?: any
    playlistKey?: number
    onClose?: any
}

export default function PlaylistPopUp({playlistData, playlistKey, onClose} : PlaylistProps) {
    if(!playlistData || playlistKey == null) {
        onClose();
        return;
    }

    const handlePlaylistDelete = () => {
        removePlaylist(playlistKey);

        onClose();
    };

    const handlePlaylistSave = () => {
        const playlistNameInput = document.getElementById("playlist-name-input") as HTMLInputElement;
        const playlistNameValue = playlistNameInput.value;
        
        if(playlistNameValue != "") {
            playlistData.name = playlistNameValue;
            
            editPlaylistName(playlistData);
        }

        onClose();
    }

    const handleSongUpload = (event: any) => {
        const fileUploadDisplay = document.getElementById("playlist-add-song-file-display");
        
        const songFile = event.target.files[0];
        const fileName = songFile.name ? removeExtension(songFile.name) : "No file chosen";
        
        if (fileUploadDisplay) fileUploadDisplay.textContent = fileName;
        
        let durationInSeconds: number = 0;
        if (songFile) {
            const objectUrl = URL.createObjectURL(songFile);
            const audio = new Audio(objectUrl);

            audio.addEventListener('loadedmetadata', function() {
            durationInSeconds = Math.floor(audio.duration);

            const songData = {name: fileName, duration: durationInSeconds, file: songFile}

            addSongToPlaylist(playlistData, songData);
            
            URL.revokeObjectURL(objectUrl);
            });
        }
    }

    const handleSongDelete= (song: string) => {
        removeSongFromPlaylist(playlistData, song);
    }

    return (
        <div id="background-blur">
            <div id="playlist-container">
                <h1 id="playlist-title">EDIT PLAYLIST</h1>
                <h1 id="playlist-sub-title">{playlistData.songIds.length + " songs ·"}</h1>
                <button id="playlist-close-btn" onClick={onClose}>X</button>

                <div id="playlist-input-field">
                    <label id="playlist-name-label" htmlFor="playlist-name-input">playlist name</label>
                    <input type="text" id="playlist-name-input" placeholder={playlistData.name}></input>
                </div>

                <div id="playlist-separator">
                    <h1 id="playlist-separator-title">SONGS</h1>
                    <h1 id="playlist-separator-info">{playlistData.songIds.length} total</h1>
                </div>

                <label className="playlist-add-song-btn">
                    <input type="file" id="file-upload-hidden" onChange={handleSongUpload} />
                    <span className="upload-icon">+</span> Add Songs
                </label>
                <span id="playlist-add-song-file-display">No file chosen</span>

                <div id="playlist-songs-container">
                    {playlistData.songIds.map((songId: string) => {
                        const savedSongs = getUserSavedSongs();
                        const song: any = savedSongs.find((song: any) => song.id === songId);

                        if (!song) return null;

                        return (
                            <div className="playlist-song-item" key={songId}>
                                <div className="playlist-song-info-container">
                                    <h1 className="playlist-song-title">{song.name.length > 20
                                        ? song.name.slice(0, 20) + "..."
                                        : song.name}</h1>
                                    <p className="playlist-song-length">{formatDuration(song.duration)}</p>
                                </div>

                                <div className="playlist-delete-song" onClick={() => handleSongDelete(song)}>-</div>
                            </div>
                        );
                    })}
                </div>

                <div id="playlist-btn-container">
                    <button id="playlist-delete-btn" onClick={handlePlaylistDelete}>DELETE</button>
                    <button id="playlist-save-btn" onClick={handlePlaylistSave}>SAVE</button>
                </div>
            </div>
        </div>
    );
}