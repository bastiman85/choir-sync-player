import { Song } from "@/types/song";
import TrackControls from "./player/TrackControls";
import Scrubber from "./player/Scrubber";
import LyricsDisplay from "./player/LyricsDisplay";
import ChapterMarkers from "./player/ChapterMarkers";
import PlayerControls from "./player/PlayerControls";
import { useAudioManager } from "@/hooks/useAudioManager";

interface PlayerProps {
  song: Song;
}

const Player = ({ song }: PlayerProps) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volumes,
    mutedTracks,
    autoRestartSong,
    autoRestartChapter,
    setAutoRestartSong,
    setAutoRestartChapter,
    togglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
  } = useAudioManager(song);

  const handleChapterClick = (time: number) => {
    handleSeek([time]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{song.title}</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className={`grid grid-cols-1 ${song.chapters?.length ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-6`}>
          <div className={`${song.chapters?.length ? 'md:col-span-2' : 'md:col-span-2'} space-y-4`}>
            {song.tracks.map((track) => (
              <TrackControls
                key={track.id}
                track={track}
                volume={volumes[track.id]}
                isMuted={mutedTracks[track.id]}
                onVolumeChange={(value) => handleVolumeChange(track.id, value)}
                onMuteToggle={() => handleMuteToggle(track.id)}
              />
            ))}
          </div>
          {song.chapters?.length > 0 && (
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium mb-2">Chapters</h3>
              <ChapterMarkers
                chapters={song.chapters}
                onChapterClick={handleChapterClick}
                currentTime={currentTime}
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <Scrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        </div>

        <PlayerControls
          isPlaying={isPlaying}
          autoRestartSong={autoRestartSong}
          autoRestartChapter={autoRestartChapter}
          onPlayPauseClick={togglePlayPause}
          onAutoRestartSongChange={(checked) => {
            setAutoRestartSong(checked);
            if (checked) setAutoRestartChapter(false);
          }}
          onAutoRestartChapterChange={(checked) => {
            setAutoRestartChapter(checked);
            if (checked) setAutoRestartSong(false);
          }}
        />

        <LyricsDisplay 
          currentTime={currentTime} 
          lyrics={song.lyrics} 
          htmlContent={song.htmlContent}
        />
      </div>
    </div>
  );
};

export default Player;