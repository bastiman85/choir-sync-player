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
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">{song.title}</h2>
      
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg">
        <div className={`grid grid-cols-1 ${hasChapters ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div className={`${hasChapters ? 'md:col-span-2' : 'md:col-span-2'} space-y-3 md:mt-[30px]`}>
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
            <div className="md:col-span-1 md:block">
              <h3 className="text-sm font-medium mb-2">Hoppa direkt</h3>
              <div className="md:block hidden">
                <ChapterMarkers
                  chapters={song.chapters}
                  onChapterClick={handleChapterClick}
                  currentTime={currentTime}
                />
              </div>
              <div className="md:hidden">
                <details className="group">
                  <summary className="list-none flex items-center justify-between cursor-pointer border rounded-md p-2 hover:bg-gray-50">
                    <span>Visa kapitel</span>
                    <svg 
                      className="w-5 h-5 transition-transform group-open:rotate-180" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2">
                    <ChapterMarkers
                      chapters={song.chapters}
                      onChapterClick={handleChapterClick}
                      currentTime={currentTime}
                    />
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>

        <div className="my-4">
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