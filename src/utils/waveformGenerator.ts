/**
 * Generate waveform data for visualization
 * This simulates audio analysis - in a production app, you'd analyze actual audio files
 */

export interface WaveformOptions {
    samples?: number; // Number of bars to generate
    smoothing?: number; // How smooth the waveform should be (0-1)
    minAmplitude?: number; // Minimum bar height (0-1)
    maxAmplitude?: number; // Maximum bar height (0-1)
}

/**
 * Generate a realistic-looking waveform pattern
 * Uses a combination of sine waves and randomness for natural variation
 */
export function generateWaveform(options: WaveformOptions = {}): number[] {
    const {
        samples = 80,
        smoothing = 0.7,
        minAmplitude = 0.1,
        maxAmplitude = 1.0,
    } = options;

    const waveform: number[] = [];
    
    for (let i = 0; i < samples; i++) {
        // Create base wave pattern using sine waves at different frequencies
        const t = i / samples;
        const wave1 = Math.sin(t * Math.PI * 2 * 2) * 0.3; // Low frequency
        const wave2 = Math.sin(t * Math.PI * 2 * 5) * 0.2; // Mid frequency
        const wave3 = Math.sin(t * Math.PI * 2 * 8) * 0.15; // High frequency
        
        // Add some randomness for natural variation
        const random = (Math.random() - 0.5) * (1 - smoothing);
        
        // Combine waves and add envelope for natural dynamics
        let amplitude = 0.4 + wave1 + wave2 + wave3 + random;
        
        // Create an envelope that's quieter at start/end
        const envelope = Math.sin(t * Math.PI);
        amplitude *= envelope * 0.7 + 0.3;
        
        // Normalize to range
        amplitude = Math.max(minAmplitude, Math.min(maxAmplitude, amplitude));
        
        waveform.push(amplitude);
    }

    // Apply smoothing pass
    if (smoothing > 0) {
        return smoothWaveform(waveform, smoothing);
    }

    return waveform;
}

/**
 * Apply moving average smoothing to waveform data
 */
function smoothWaveform(data: number[], factor: number): number[] {
    const windowSize = Math.max(1, Math.floor(factor * 5));
    const smoothed: number[] = [];

    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;

        for (let j = -windowSize; j <= windowSize; j++) {
            const index = i + j;
            if (index >= 0 && index < data.length) {
                sum += data[index];
                count++;
            }
        }

        smoothed.push(sum / count);
    }

    return smoothed;
}

/**
 * Generate different waveform patterns for variety
 */
export function generateWaveformPattern(
    patternType: 'smooth' | 'energetic' | 'dynamic' | 'mellow',
    samples: number = 80
): number[] {
    switch (patternType) {
        case 'smooth':
            return generateWaveform({
                samples,
                smoothing: 0.9,
                minAmplitude: 0.3,
                maxAmplitude: 0.8,
            });

        case 'energetic':
            return generateWaveform({
                samples,
                smoothing: 0.3,
                minAmplitude: 0.2,
                maxAmplitude: 1.0,
            });

        case 'dynamic':
            return generateWaveform({
                samples,
                smoothing: 0.5,
                minAmplitude: 0.1,
                maxAmplitude: 1.0,
            });

        case 'mellow':
            return generateWaveform({
                samples,
                smoothing: 0.85,
                minAmplitude: 0.2,
                maxAmplitude: 0.6,
            });

        default:
            return generateWaveform({ samples });
    }
}

/**
 * Generate waveform with seed for consistent results per post
 */
export function generateSeededWaveform(seed: string, samples: number = 80): number[] {
    // Simple hash function to convert seed to number
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Use hash to determine pattern type
    const patterns: Array<'smooth' | 'energetic' | 'dynamic' | 'mellow'> = [
        'smooth',
        'energetic',
        'dynamic',
        'mellow',
    ];
    const patternIndex = Math.abs(hash) % patterns.length;

    return generateWaveformPattern(patterns[patternIndex], samples);
}
