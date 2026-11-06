import "../styles/playlist-style.css"
import { removePlaylist } from "../utils/firebase";

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

    return (
        <div id="background-blur">
            <div id="playlist-container">
                <h1 id="playlist-title">EDIT PLAYLIST</h1>
                <h1 id="playlist-sub-title">{playlistData.songIds.length + " songs ·"}</h1>
                <button id="playlist-close-btn" onClick={onClose}>X</button>

                <div id="playlist-input-field">
                    <label id="playlist-name-label" htmlFor="playlist-name-input">playlist name</label>
                    <input type="test" id="playlist-name-input" value={playlistData.name}></input>
                </div>

                <div id="playlist-btn-container">
                    <button id="playlist-delete-btn" onClick={handlePlaylistDelete}>DELETE</button>
                    <button id="playlist-save-btn">SAVE</button>
                </div>
            </div>
        </div>
    );
}