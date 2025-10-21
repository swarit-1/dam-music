import { Audio, AVPlaybackStatus } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentAudioUrl: string | null = null;

  /**
   * Initialize audio mode for the app
   */
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  /**
   * Play an audio clip from URL
   * @param url - URL of the audio file
   * @param loop - Whether to loop the audio
   */
  async playSound(url: string, loop: boolean = true): Promise<void> {
    try {
      // If same audio is already playing, don't reload
      if (this.currentAudioUrl === url && this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          return;
        }
      }

      // Unload previous sound if exists
      await this.unloadSound();

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: loop, volume: 1.0 },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      this.currentAudioUrl = url;
    } catch (error) {
      console.error('Error playing sound:', error);
      throw error;
    }
  }

  /**
   * Pause the currently playing sound
   */
  async pauseSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  }

  /**
   * Resume the currently paused sound
   */
  async resumeSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.playAsync();
      }
    } catch (error) {
      console.error('Error resuming sound:', error);
    }
  }

  /**
   * Stop and unload the current sound
   */
  async unloadSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentAudioUrl = null;
      }
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  /**
   * Get current playback status
   */
  async getStatus(): Promise<AVPlaybackStatus | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting status:', error);
      return null;
    }
  }

  /**
   * Callback for playback status updates
   */
  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      // Handle error
      if (status.error) {
        console.error(`Playback error: ${status.error}`);
      }
    } else {
      // Handle loaded status
      if (status.didJustFinish && !status.isLooping) {
        // Audio finished playing
        console.log('Audio finished playing');
      }
    }
  };

  /**
   * Cleanup - should be called when component unmounts
   */
  async cleanup(): Promise<void> {
    await this.unloadSound();
  }
}

// Export singleton instance
export const audioService = new AudioService();
