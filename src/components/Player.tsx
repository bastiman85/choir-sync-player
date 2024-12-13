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
    activeVoicePart,
  } = useAudioManager(song);

  const handleChapterClick = (time: number) => {
    handleSeek([time]);
  };

  const hasChapters = Boolean(song.chapters?.length);

  return (
    <div className="px-0 sm:p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 px-3 sm:px-0">{song.title}</h2>
      
      <div className="bg-[#1a1d21] text-white rounded-lg overflow-hidden">
        <div className={`grid grid-cols-1 ${hasChapters ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 p-3 sm:p-4`}>
          <div className={`${hasChapters ? 'md:col-span-2' : 'md:col-span-2'} space-y-3`}>
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
          {hasChapters && (
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium mb-2 text-gray-300">Hoppa direkt</h3>
              <ChapterMarkers
                chapters={song.chapters}
                onChapterClick={handleChapterClick}
                currentTime={currentTime}
              />
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 pb-4">
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
          hasChapters={hasChapters}
        />

        <LyricsDisplay 
          currentTime={currentTime} 
          lyrics={song.lyrics} 
          htmlContent={song.htmlContent}
          activeVoicePart={activeVoicePart}
        />
      </div>
    </div>
  );
};

export default Player;