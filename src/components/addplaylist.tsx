import "../styles/add-playlist-style.css"
import { addPlaylist } from "../utils/firebase";

export interface AddPlaylistProps {
    onClose?: any
}

export default function AddPlaylistPopUp({onClose} : AddPlaylistProps) {

    const handleSubmit = () => {
        const playlistNameInput = document.getElementById("add-playlist-name-input") as HTMLInputElement;

        if(!playlistNameInput) return;

        const playlistName = playlistNameInput.value;
        
        if(playlistNameInput.value == "") return;

        addPlaylist(playlistName);

        onClose();
    };

    return (
        <div id="background-blur">
            <div id="add-playlist-container">
                <h1 id="add-playlist-title">Add another mood</h1>
                <h1 id="add-playlist-sub-title">some info about the playlist</h1>

                <button id="add-playlist-close-btn" onClick={onClose}>X</button>

                <label id="add-playlist-name-label" htmlFor="add-playlist-name-input">playlist title</label>
                <input type="text" id="add-playlist-name-input" placeholder="cool playlist..."></input>

                <button id="add-playlist-save-btn" onClick={handleSubmit}>SAVE PLAYLIST</button>
            </div>
        </div>
    );
}