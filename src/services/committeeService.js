// Service für die Verwaltung von Komitees
class CommitteeService {
  constructor() {
    this.committees = JSON.parse(localStorage.getItem('committees') || '[]');
    this.listeners = [];
    
    // Initialisiere mit Mock-Daten, falls keine Komitees vorhanden sind
    if (this.committees.length === 0) {
      this.initializeDefaultCommittees();
    }
  }

  // Event Listener für Änderungen
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.committees));
  }

  // Speichert Komitees im localStorage
  saveCommittees() {
    localStorage.setItem('committees', JSON.stringify(this.committees));
    this.notifyListeners();
  }

  // Initialisiert Standard-Komitees
  initializeDefaultCommittees() {
    const defaultCommittees = [
      {
        id: 1,
        name: 'Deko-Komitee',
        description: 'Verantwortlich für die gesamte Dekoration des Abiballs',
        icon: '🎨',
        memberCount: 12,
        isJoined: false,
        isOpen: true,
        leader: { name: 'Anna Schmidt', avatar: '/avatars/anna.jpg' },
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        projects: [
          {
            id: 101,
            title: 'Ballsaal Dekoration',
            progress: 75,
            status: 'active',
            memberCount: 8,
            deadline: '2024-06-15'
          },
          {
            id: 102,
            title: 'Tischdekoration',
            progress: 30,
            status: 'planning',
            memberCount: 4,
            deadline: '2024-05-20'
          }
        ],
        surveys: [
          {
            id: 201,
            title: 'Farbschema für Ballsaal',
            isActive: true,
            projectId: 101
          }
        ],
        members: [
          { id: 1, name: 'Anna Schmidt', role: 'Leitung', avatar: '/avatars/anna.jpg' },
          { id: 2, name: 'Max Müller', role: 'Mitglied', avatar: '/avatars/max.jpg' }
        ]
      },
      {
        id: 2,
        name: 'Finanz-Komitee',
        description: 'Budgetplanung und Kostenüberwachung für alle Abi-Aktivitäten',
        icon: '💰',
        memberCount: 8,
        isJoined: false,
        isOpen: false,
        leader: { name: 'Tom Weber', avatar: '/avatars/tom.jpg' },
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        projects: [
          {
            id: 103,
            title: 'Budget Abiball',
            progress: 90,
            status: 'active',
            memberCount: 6,
            deadline: '2024-04-30'
          }
        ],
        surveys: [],
        members: [
          { id: 3, name: 'Tom Weber', role: 'Leitung', avatar: '/avatars/tom.jpg' }
        ]
      },
      {
        id: 3,
        name: 'Technik-Komitee',
        description: 'Sound, Licht und technische Ausstattung',
        icon: '🔧',
        memberCount: 6,
        isJoined: false,
        isOpen: true,
        leader: { name: 'Lisa Klein', avatar: '/avatars/lisa.jpg' },
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        projects: [
          {
            id: 104,
            title: 'Sound-System Setup',
            progress: 100,
            status: 'completed',
            memberCount: 4,
            deadline: '2024-03-15'
          }
        ],
        surveys: [],
        members: [
          { id: 4, name: 'Lisa Klein', role: 'Leitung', avatar: '/avatars/lisa.jpg' }
        ]
      }
    ];
    
    this.committees = defaultCommittees;
    this.saveCommittees();
  }

  // Erstellt ein neues Komitee
  createCommittee(name, description, icon, createdBy, createdByName) {
    const newCommittee = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || '📋',
      memberCount: 1,
      isJoined: false,
      isOpen: true,
      leader: { 
        name: createdByName, 
        avatar: '/avatars/default.jpg',
        userId: createdBy
      },
      createdBy,
      createdAt: new Date().toISOString(),
      projects: [],
      surveys: [],
      members: [
        { 
          id: createdBy, 
          name: createdByName, 
          role: 'Leitung', 
          avatar: '/avatars/default.jpg' 
        }
      ]
    };

    this.committees.push(newCommittee);
    this.saveCommittees();
    return newCommittee;
  }

  // Holt alle Komitees
  getAllCommittees() {
    return this.committees;
  }

  // Holt ein Komitee nach ID
  getCommitteeById(id) {
    return this.committees.find(committee => committee.id === id);
  }

  // Aktualisiert ein Komitee
  updateCommittee(id, updates) {
    const index = this.committees.findIndex(committee => committee.id === id);
    if (index !== -1) {
      this.committees[index] = { ...this.committees[index], ...updates };
      this.saveCommittees();
      return this.committees[index];
    }
    return null;
  }

  // Löscht ein Komitee
  deleteCommittee(id) {
    const index = this.committees.findIndex(committee => committee.id === id);
    if (index !== -1) {
      const deletedCommittee = this.committees.splice(index, 1)[0];
      this.saveCommittees();
      return deletedCommittee;
    }
    return null;
  }

  // Fügt ein Mitglied zu einem Komitee hinzu
  addMemberToCommittee(committeeId, userId, userName) {
    const committee = this.getCommitteeById(committeeId);
    if (committee) {
      // Prüfe, ob Benutzer bereits Mitglied ist
      const existingMember = committee.members.find(member => member.id === userId);
      if (!existingMember) {
        committee.members.push({
          id: userId,
          name: userName,
          role: 'Mitglied',
          avatar: '/avatars/default.jpg',
          joinedAt: new Date().toISOString()
        });
        committee.memberCount = committee.members.length;
        this.saveCommittees();
        return true;
      }
    }
    return false;
  }

  // Entfernt ein Mitglied aus einem Komitee
  removeMemberFromCommittee(committeeId, userId) {
    const committee = this.getCommitteeById(committeeId);
    if (committee) {
      const initialLength = committee.members.length;
      committee.members = committee.members.filter(member => member.id !== userId);
      if (committee.members.length < initialLength) {
        committee.memberCount = committee.members.length;
        this.saveCommittees();
        return true;
      }
    }
    return false;
  }

  // Holt Komitees, in denen ein Benutzer Mitglied ist
  getCommitteesForUser(userId) {
    return this.committees.filter(committee => 
      committee.members.some(member => member.id === userId)
    );
  }

  // Holt Komitees, die ein Benutzer leitet
  getCommitteesLedByUser(userId) {
    return this.committees.filter(committee => 
      committee.leader.userId === userId
    );
  }

  // Statistiken
  getCommitteeStats() {
    const total = this.committees.length;
    const open = this.committees.filter(c => c.isOpen).length;
    const closed = this.committees.filter(c => !c.isOpen).length;
    const totalMembers = this.committees.reduce((sum, c) => sum + c.memberCount, 0);

    return {
      total,
      open,
      closed,
      totalMembers,
      averageMembers: total > 0 ? Math.round(totalMembers / total) : 0
    };
  }
}

// Singleton-Instanz
const committeeService = new CommitteeService();
export default committeeService;