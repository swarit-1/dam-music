import SwiftUI

// MARK: - Data Model for Each Collaborator Profile
struct Collaborator: Identifiable {
    let id = UUID()
    let name: String
    let role: String
    let bio: String
    let image: String
}

// MARK: - Main View
struct ContentView: View {
    // Sample list of collaborators displayed in the app
    @State private var collaborators = [
        Collaborator(name: "Lena Kim", role: "UX Designer", bio: "I love building intuitive interfaces and motion-driven experiences.", image: "person1"),
        Collaborator(name: "Marcus Lee", role: "Backend Engineer", bio: "Go, Rust, and coffee. Building fast, scalable APIs.", image: "person2"),
        Collaborator(name: "Nina Alvarez", role: "Music Producer", bio: "Looking for vocalists & visual artists for an ambient EP.", image: "person3")
    ]
    
    // Tracks the current profile index being viewed
    @State private var currentIndex = 0
    
    var body: some View {
        ZStack {
            // MARK: - Background Gradient
            LinearGradient(colors: [.purple.opacity(0.3), .blue.opacity(0.3)],
                           startPoint: .topLeading,
                           endPoint: .bottomTrailing)
                .ignoresSafeArea()
            
            VStack {
                // MARK: - App Title
                Text("CollabMatch")
                    .font(.largeTitle.bold())
                    .foregroundColor(.white)
                    .shadow(radius: 3)
                    .padding(.top, 60)
                
                Spacer()
                
                // MARK: - Main Card Display
                // Shows the current collaborator card or "no more" message
                if currentIndex < collaborators.count {
                    collaboratorCard(for: collaborators[currentIndex])
                        .transition(.asymmetric(insertion: .scale, removal: .opacity))
                } else {
                    Text("🎉 No more collaborators nearby!")
                        .font(.title2)
                        .foregroundColor(.white.opacity(0.8))
                        .padding()
                }
                
                Spacer()
                
                // MARK: - Interaction Buttons (Skip / Match)
                HStack(spacing: 50) {
                    Button(action: skipCollaborator) {
                        Image(systemName: "xmark.circle.fill")
                            .resizable()
                            .frame(width: 60, height: 60)
                            .foregroundColor(.red.opacity(0.8))
                    }
                    
                    Button(action: matchCollaborator) {
                        Image(systemName: "heart.circle.fill")
                            .resizable()
                            .frame(width: 60, height: 60)
                            .foregroundColor(.green.opacity(0.8))
                    }
                }
                .padding(.bottom, 60)
            }
            .animation(.easeInOut, value: currentIndex)
        }
    }
    
    // MARK: - collaboratorCard(for:)
    /// Builds a visually styled card displaying a collaborator's profile info.
    /// - Parameter collab: A `Collaborator` object to display.
    /// - Returns: A SwiftUI view representing the collaborator card.
    func collaboratorCard(for collab: Collaborator) -> some View {
        VStack(spacing: 12) {
            Image(collab.image)
                .resizable()
                .scaledToFill()
                .frame(width: 300, height: 300)
                .clipped()
                .cornerRadius(20)
            
            Text(collab.name)
                .font(.title2.bold())
            
            Text(collab.role)
                .font(.headline)
                .foregroundColor(.secondary)
            
            Text(collab.bio)
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding()
        .background(.ultraThinMaterial)  // Adds a glassy blur effect
        .cornerRadius(25)
        .shadow(radius: 8)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 20)
    }
    
    // MARK: - skipCollaborator()
    /// Moves to the next collaborator in the list without matching.
    /// Called when the user presses the "X" button.
    func skipCollaborator() {
        if currentIndex < collaborators.count - 1 {
            currentIndex += 1
        }
    }
    
    // MARK: - matchCollaborator()
    /// Moves to the next collaborator after a successful match.
    /// Called when the user presses the "Heart" button.
    func matchCollaborator() {
        if currentIndex < collaborators.count - 1 {
            currentIndex += 1
        }
    }
}

// MARK: - Preview
#Preview {
    ContentView()
}
