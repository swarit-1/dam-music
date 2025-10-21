import { User, Post, ScoredPost } from '../types';

/**
 * Calculate match score between a user and a post
 *
 * Scoring breakdown:
 * - 50% Genre match (exact match in user's genres)
 * - 30% Role compatibility (user's role matches roles_needed)
 * - 20% Skill overlap (intersection of user skills and post tags)
 *
 * @param user - The current user
 * @param post - The post to score
 * @returns Score between 0 and 1
 */
export function calculateScore(user: User, post: Post): number {
  // Genre score: 1.0 if post genre matches any of user's genres
  const genreScore = user.genres.includes(post.genre) ? 1.0 : 0.0;

  // Role match: 1.0 if any of user's roles are in roles_needed
  const roleMatch = post.roles_needed.some(role => user.role.includes(role)) ? 1.0 : 0.0;

  // Skill overlap: percentage of post tags that match user skills
  const matchingSkills = post.tags.filter(tag => user.skills.includes(tag));
  const skillOverlap = post.tags.length > 0
    ? matchingSkills.length / post.tags.length
    : 0.0;

  // Weighted score
  const score = (0.5 * genreScore) + (0.3 * roleMatch) + (0.2 * skillOverlap);

  return score;
}

/**
 * Rank posts by match score and recency
 *
 * @param user - The current user
 * @param posts - Array of posts to rank
 * @returns Sorted array of posts with scores
 */
export function rankPosts(user: User, posts: Post[]): ScoredPost[] {
  // Calculate scores for all posts
  const scoredPosts: ScoredPost[] = posts.map(post => ({
    ...post,
    score: calculateScore(user, post)
  }));

  // Sort by score (descending) then by recency (descending)
  scoredPosts.sort((a, b) => {
    // First compare scores
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // If scores are equal, sort by recency
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return scoredPosts;
}

/**
 * Fetch and rank posts for a user's feed
 * In production, this would call a backend API
 *
 * @param user - The current user
 * @param posts - All available posts
 * @param limit - Maximum number of posts to return
 * @returns Ranked posts for the user's feed
 */
export function getFeedForUser(user: User, posts: Post[], limit: number = 20): ScoredPost[] {
  const rankedPosts = rankPosts(user, posts);
  return rankedPosts.slice(0, limit);
}
