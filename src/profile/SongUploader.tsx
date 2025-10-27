import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";

interface SongUploaderProps {
    onUploadComplete?: (songData: any) => void;
}

export const SongUploader: React.FC<SongUploaderProps> = ({
    onUploadComplete,
}) => {
    const [uploading, setUploading] = useState(false);

    const handlePickSong = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "audio/*",
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            setUploading(true);

            // TODO: Implement actual upload logic to your backend
            // For now, just simulate an upload
            setTimeout(() => {
                const songData = {
                    uri: result.assets[0].uri,
                    name: result.assets[0].name,
                    size: result.assets[0].size,
                };

                Alert.alert("Success", "Song uploaded successfully!");
                onUploadComplete?.(songData);
                setUploading(false);
            }, 2000);
        } catch (error) {
            Alert.alert("Error", "Failed to pick song");
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload Your Music</Text>
            <TouchableOpacity
                style={[
                    styles.uploadButton,
                    uploading && styles.uploadButtonDisabled,
                ]}
                onPress={handlePickSong}
                disabled={uploading}
            >
                <Text style={styles.uploadButtonText}>
                    {uploading ? "Uploading..." : "+ Add Song Sample"}
                </Text>
            </TouchableOpacity>
            <Text style={styles.supportedFormats}>
                Supported formats: MP3, WAV, M4A
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    uploadButton: {
        backgroundColor: "#007AFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    uploadButtonDisabled: {
        backgroundColor: "#ccc",
    },
    uploadButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    supportedFormats: {
        marginTop: 10,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
});
