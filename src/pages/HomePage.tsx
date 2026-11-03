import MusicDisc from "../visuals/svgs/music-disc";
import "../styles/home-style.css";
import Line from "../visuals/svgs/line";
import { Like, Mode, Next, Pause, Play, Previous } from "../visuals/svgs/controls";
import { useEffect } from "react";

export default function HomePage() {

    let isPlaying: boolean = false;
    let isLiked: boolean = false;

    const handlePlayPause = () => {
        isPlaying = !isPlaying;
        const playBtn = document.getElementById("play-btn");
        const pauseBtn = document.getElementById("pause-btn");

        const musicDisc = document.getElementById("music-disc");

        if (isPlaying) {
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

    useEffect(() => {
        let dt: number = 0;

        setInterval(() => {
            if (isPlaying) {
                dt += 0.1;
                const currentTime = document.getElementById("current-time");
                const linePath = document.getElementById("line-path");

                if (currentTime) {
                    const minutes = Math.floor(dt / 60);
                    const seconds = Math.floor(dt % 60);
                    currentTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                    linePath?.setAttribute("style", `width: ${dt / 103 * 100}%`);
                }
            }
        }, 100);
    }, []);

    return (
        <div className="home-page">
            <div id="navigation-bar">
                <h1 id="drawer-btn">{">"}</h1>
                <h1 id="title-btn">Smudge FM</h1>
                <h1 id="info-btn">...</h1>
            </div>
            
            <MusicDisc/>

            <h1 id="song-title">Some Song</h1>
            <h3 id="artist-name">Some Artist</h3>

            <Line>
                <p id="current-time">0:17</p>
                <Line id="line-path" color="var(--track-color)"> </Line>
                <p id="total-time">1:43</p>
            </Line>

            <div id="song-controls">
                <Mode />
                <Previous />
                <Play OnClick={handlePlayPause} />
                <Pause className="hidden pause-btn" OnClick={handlePlayPause} />
                <Next />
                <Like OnClick={handleLike} />
            </div>

            <div id="track-list">
                <h1 id="track-list-title">UP NEXT</h1>

                <div id="track-items">
                    <div className="track-item">
                        <h1 className="track-item-title">Some Song</h1>
                        <h3 className="track-item-artist">Some Artist</h3>
                    </div>
                    <div className="track-item">
                        <h1 className="track-item-title">Some Song</h1>
                        <h3 className="track-item-artist">Some Artist</h3>
                    </div>
                    <div className="track-item">
                        <h1 className="track-item-title">Some Song</h1>
                        <h3 className="track-item-artist">Some Artist</h3>
                    </div>
                    <div className="track-item">
                        <h1 className="track-item-title">Some Song</h1>
                        <h3 className="track-item-artist">Some Artist</h3>
                    </div>
                    <div className="track-item">
                        <h1 className="track-item-title">Some Song</h1>
                        <h3 className="track-item-artist">Some Artist</h3>
                    </div>
                    <div className="track-item">
                        <h1 className="track-item-title">Some Song</h1>
                        <h3 className="track-item-artist">Some Artist</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}