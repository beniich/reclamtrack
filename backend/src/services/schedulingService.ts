import prisma from '../lib/prisma.js';

interface TeamScore {
    teamId: string;
    team: any;
    score: number;
    reasons: string[];
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Scheduling profiles for A/B testing
const SCORING_PROFILES = {
    balanced: {
        skillMatch: 40,
        availability: 30,
        distance: { veryClose: 20, close: 15, acceptable: 10, far: 5 },
        workload: { free: 10, light: 7, medium: 4, heavy: 0 },
        urgencyBonus: 10
    },
    proximity: {
        skillMatch: 30,
        availability: 25,
        distance: { veryClose: 30, close: 20, acceptable: 12, far: 5 },
        workload: { free: 10, light: 7, medium: 4, heavy: 0 },
        urgencyBonus: 10
    },
    skills: {
        skillMatch: 50,
        availability: 25,
        distance: { veryClose: 20, close: 15, acceptable: 10, far: 5 },
        workload: { free: 15, light: 10, medium: 5, heavy: 0 },
        urgencyBonus: 10
    },
    workload: {
        skillMatch: 35,
        availability: 25,
        distance: { veryClose: 20, close: 15, acceptable: 10, far: 5 },
        workload: { free: 20, light: 15, medium: 8, heavy: 0 },
        urgencyBonus: 10
    }
};

type ScoringProfile = keyof typeof SCORING_PROFILES;

/**
 * Auto-assign a complaint to the best available team
 * Algorithm considers: skills, availability, distance, and workload
 */
export const autoAssignComplaint = async (complaintId: string): Promise<string | null> => {
    try {
        // Get the active profile from env or default to 'balanced'
        const profileName = (process.env.SCORING_PROFILE as ScoringProfile) || 'balanced';
        const scoring = SCORING_PROFILES[profileName] || SCORING_PROFILES.balanced;

        console.log(`Using scheduling profile: ${profileName.toUpperCase()}`);

        // Get the complaint
        const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
        if (!complaint) {
            throw new Error('Complaint not found');
        }

        // Get all active teams
        const teams = await prisma.team.findMany({ where: { organizationId: complaint.organizationId } });
        if (teams.length === 0) {
            console.log('No active teams available');
            return null;
        }

        // Calculate scores for each team
        const teamScores: TeamScore[] = [];

        for (const team of teams) {
            const reasons: string[] = [];
            let score = 0;

            // 1. SKILLS MATCHING
            const categoryMap: Record<string, string[]> = {
                water: ['plumbing', 'water', 'maintenance'],
                electricity: ['electrical', 'electricity', 'maintenance'],
                roads: ['construction', 'roads', 'maintenance'],
                waste: ['sanitation', 'waste', 'maintenance'],
                lighting: ['electrical', 'lighting', 'maintenance'],
                sewage: ['plumbing', 'sanitation', 'maintenance'],
                parks: ['maintenance', 'gardening'],
                noise: ['inspection', 'maintenance'],
                other: ['general', 'maintenance']
            };

            const requiredSkills = categoryMap[complaint.category] || ['general'];
            const teamSpecializations = team.specialization?.toLowerCase().split(',').map(s => s.trim()) || [];

            const matchingSkills = requiredSkills.filter(skill =>
                teamSpecializations.some(spec => spec.includes(skill))
            );

            if (matchingSkills.length > 0) {
                const skillScore = (matchingSkills.length / requiredSkills.length) * scoring.skillMatch;
                score += skillScore;
                reasons.push(`Compétences correspondantes: ${matchingSkills.join(', ')} (+${skillScore.toFixed(0)} pts)`);
            } else {
                // Penalty for no matching skills (half the max skill score)
                const penalty = scoring.skillMatch / 2;
                score -= penalty;
                reasons.push(`Pas de compétences spécialisées (-${penalty} pts)`);
            }

            // 2. AVAILABILITY
            const currentHour = new Date().getHours();
            const isWorkingHours = currentHour >= 8 && currentHour < 18;

            if (isWorkingHours) {
                score += scoring.availability;
                reasons.push(`Équipe disponible (heures de travail) (+${scoring.availability} pts)`);
            } else {
                const offHoursScore = Math.round(scoring.availability / 3);
                score += offHoursScore;
                reasons.push(`Hors heures normales (+${offHoursScore} pts)`);
            }

            // 3. GEOGRAPHIC DISTANCE
            if (complaint.location && (complaint.location as any).latitude) {
                const loc = complaint.location as any;
                const teamLoc = (team as any).baseLocation;
                let distanceScore = 0;
                if (teamLoc) {
                    const distance = calculateDistance(
                        loc.latitude,
                        loc.longitude,
                        teamLoc.latitude || 0,
                        teamLoc.longitude || 0
                    );
                    if (distance < 5) {
                        distanceScore = scoring.distance.veryClose;
                        reasons.push(`Très proche (${distance.toFixed(1)}km) (+${distanceScore} pts)`);
                    } else if (distance < 15) {
                        distanceScore = scoring.distance.close;
                        reasons.push(`Proximité moyenne (${distance.toFixed(1)}km) (+${distanceScore} pts)`);
                    } else if (distance < 30) {
                        distanceScore = scoring.distance.acceptable;
                        reasons.push(`Distance acceptable (${distance.toFixed(1)}km) (+${distanceScore} pts)`);
                    } else {
                        distanceScore = scoring.distance.far;
                        reasons.push(`Loin (${distance.toFixed(1)}km) (+${distanceScore} pts)`);
                    }
                } else {
                    distanceScore = Math.round(scoring.distance.acceptable);
                    reasons.push(`Pas de données d'équipe (+${distanceScore} pts)`);
                }
                score += distanceScore;
            } else {
                // No location data - give partial points
                const noLocScore = Math.round(scoring.distance.acceptable);
                score += noLocScore;
                reasons.push(`Pas de données de localisation (+${noLocScore} pts)`);
            }

            // 4. WORKLOAD
            const activeComplaints = await prisma.complaint.count({
                where: {
                    assignedTeamId: team.id,
                    status: { in: ['nouvelle', 'en_cours'] as any }
                }
            });

            let workloadScore = 0;
            if (activeComplaints === 0) {
                workloadScore = scoring.workload.free;
                reasons.push(`Aucune tâche active (+${workloadScore} pts)`);
            } else if (activeComplaints <= 3) {
                workloadScore = scoring.workload.light;
                reasons.push(`Charge légère (${activeComplaints} tâches) (+${workloadScore} pts)`);
            } else if (activeComplaints <= 7) {
                workloadScore = scoring.workload.medium;
                reasons.push(`Charge moyenne (${activeComplaints} tâches) (+${workloadScore} pts)`);
            } else {
                workloadScore = scoring.workload.heavy;
                reasons.push(`Charge élevée (${activeComplaints} tâches) (+${workloadScore} pts)`);
            }
            score += workloadScore;

            // 5. PRIORITY BOOST
            if (complaint.priority === 'urgent') {
                if (activeComplaints <= 3) {
                    score += scoring.urgencyBonus;
                    reasons.push(`Bonus urgence - équipe disponible (+${scoring.urgencyBonus} pts)`);
                }
            }

            teamScores.push({
                teamId: team.id,
                team: team,
                score,
                reasons
            });
        }

        // Sort teams by score (highest first)
        teamScores.sort((a, b) => b.score - a.score);

        // Log the scoring for debugging
        console.log('\n=== AUTO-SCHEDULING RESULTS ===');
        console.log(`Complaint: ${complaint.title} (${complaint.category}, ${complaint.priority})`);
        teamScores.forEach((ts, index) => {
            console.log(`\n${index + 1}. ${ts.team.name} - Score: ${ts.score}`);
            ts.reasons.forEach(reason => console.log(`   - ${reason}`));
        });

        // Select the best team
        const bestTeam = teamScores[0];
        if (bestTeam && bestTeam.score > 0) {
            // Update the complaint with the assigned team
            await prisma.complaint.update({
                where: { id: complaintId },
                data: {
                    assignedTeamId: bestTeam.teamId,
                    status: 'en_cours' as any,
                    assignedAt: new Date()
                }
            });

            console.log(`\n✅ Assigned to: ${bestTeam.team.name} (Score: ${bestTeam.score})`);
            console.log('================================\n');

            return bestTeam.teamId;
        }

        console.log('❌ No suitable team found (all scores ≤ 0)');
        return null;

    } catch (error) {
        console.error('Error in auto-scheduling:', error);
        throw error;
    }
};

// Placeholder for future scheduling logic
export const scheduleAssignment = async (assignmentId: string) => {
    console.log(`Scheduling assignment: ${assignmentId}`);
    // This can be extended for shift-based scheduling
};
