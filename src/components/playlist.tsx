import "../styles/playlist-style.css"
import { editPlaylistName, removePlaylist } from "../utils/firebase";

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

                <div id="playlist-add-song-btn"> + add songs </div>

                <div id="playlist-btn-container">
                    <button id="playlist-delete-btn" onClick={handlePlaylistDelete}>DELETE</button>
                    <button id="playlist-save-btn" onClick={handlePlaylistSave}>SAVE</button>
                </div>
            </div>
        </div>
    );
}